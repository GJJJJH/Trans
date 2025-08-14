<template>
  <div class="min-h-screen w-full bg-white py-12">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          游戏文件上传
        </h1>
        <p class="text-lg text-gray-600">
          支持上传游戏文件、压缩包或文件夹进行汉化处理
        </p>
      </div>

      <!-- 步骤指示器（组件） -->
      <StepIndicator :steps="['上传文件', '预览确认', '选择并处理']" :current="currentStep" />

      <!-- 文件上传区域（组件） -->
      <UploadStep v-if="currentStep === 1" :is-processing="isProcessing" @upload="handleFileUpload" />

      <!-- 文件预览区域（组件） -->
      <PreviewStep 
        v-if="currentStep === 2"
        @back="goBackToUpload"
        @confirm="confirmAndProcess"
      >
        <template #files>
          <div class="space-y-3">
            <FilePreviewCard
              v-for="file in previewFiles"
              :key="file.name"
              :file="file"
              :is-expanded="expandedFiles.includes(file.name)"
              @toggle-preview="toggleFilePreview"
              @copy-content="copyFileContent"
            />
          </div>
        </template>
        <template #summary>
          <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ estimatedTranslationCount }}</div>
                <div class="text-sm text-gray-600">可翻译文本</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ previewFiles.length }}</div>
                <div class="text-sm text-gray-600">JSON文件</div>
              </div>
          </div>
        </template>
      </PreviewStep>
      

      <!-- 文件选择步骤（组件） -->
      <SelectStep
        v-if="currentStep === 3"
        :file-tree="fileTree"
        :expanded-folders="expandedFolders"
        v-model="selectedFiles"
        :is-processing="isProcessing"
        @toggle-folder="toggleFolder"
        @select-all="selectAllFiles"
        @deselect-all="deselectAllFiles"
        @back="goBackToPreview"
        @start="startProcessing"
      />


    </div>

    <!-- 提示模态框 -->
    <AlertModal
      :is-visible="showAlert"
      :type="alertType"
      :title="alertTitle"
      :message="alertMessage"
      @close="closeAlert"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFileStore } from '../stores/fileStore'
import fileApi from '../api/fileApi'
import FileUpload from '../components/ui/file-upload/FileUpload.vue'
import AlertModal from '../components/ui/AlertModal.vue'

import FilePickerTree from '../components/ui/FilePickerTree.vue'
import StepIndicator from '../components/ui/StepIndicator.vue'
import UploadStep from '../components/ui/UploadStep.vue'
import PreviewStep from '../components/ui/PreviewStep.vue'
import SelectStep from '../components/ui/SelectStep.vue'
import FilePreviewCard from '../components/ui/FilePreviewCard.vue'

const router = useRouter()
const fileStore = useFileStore()

// 响应式数据
const currentStep = ref(1) // 1: 上传, 2: 预览, 3: 文件选择
const isProcessing = ref(false)
const currentSessionId = ref('')
const previewFiles = ref([])
const estimatedTranslationCount = ref(0)
const expandedFiles = ref([]) // 存储已展开的文件
const selectedFiles = ref([]) // 存储选中的文件ID
const expandedFolders = ref([]) // 存储展开的文件夹
const fileTree = ref([]) // 存储文件树结构

// 弹窗相关
const showAlert = ref(false)
const alertType = ref('info')
const alertTitle = ref('')
const alertMessage = ref('')

// 文件上传处理
const handleFileUpload = async (files) => {
  if (files.length === 0) {
    return
  }

  isProcessing.value = true

  try {
    // 分析文件，获取预览信息
    const previewResult = await fileApi.analyzeFiles(files)
    
    if (previewResult.success) {
      previewFiles.value = previewResult.files || files
      estimatedTranslationCount.value = previewResult.estimatedCount || Math.floor(files.length * 10) // 默认估算
      
      // 将文件添加到store中
      fileStore.clearFiles()
      fileStore.addFiles(files)
      
      // 如果有部分文件分析失败，显示警告
      if (previewResult.hasErrors) {
        showAlertModal('warning', '部分文件分析失败', previewResult.errorMessage || '部分文件无法分析，但可以继续处理。')
      }
      
      // 进入预览步骤
      currentStep.value = 2
    } else {
      throw new Error(previewResult.message || '文件分析失败')
    }
    
  } catch (error) {
    console.error('文件分析失败:', error)
    showAlertModal('error', '分析失败', error.message || '文件分析失败，请检查文件格式是否正确。')
  } finally {
    isProcessing.value = false
  }
}

// 确认并进入文件选择步骤
const confirmAndProcess = () => {
  // 构建文件树结构
  buildFileTree()
  
  // 默认展开所有文件夹
  expandedFolders.value = fileTree.value.map(folder => folder.id)
  
  // 默认选中所有有翻译条目的文件
  selectedFiles.value = fileTree.value.flatMap(folder => 
    folder.children.map(file => file.id)
  )
  
  // 进入文件选择步骤
  currentStep.value = 3
}

// 构建文件树结构
const buildFileTree = () => {
  const tree = []
  const folderMap = new Map()
  
  // 从预览文件中构建树结构
  previewFiles.value.forEach(file => {
    if (file.estimatedEntries && file.estimatedEntries > 0) {
      // 创建文件夹结构
      const folderName = 'data'
      let folder = folderMap.get(folderName)
      
      if (!folder) {
        folder = {
          id: folderName,
          name: folderName,
          children: []
        }
        folderMap.set(folderName, folder)
        tree.push(folder)
      }
      
      // 添加文件到文件夹
      folder.children.push({
        id: file.name,
        name: file.name,
        file: file
      })
    }
  })
  
  fileTree.value = tree
}

// 切换文件夹展开/收起
const toggleFolder = (folderId) => {
  const index = expandedFolders.value.indexOf(folderId)
  if (index > -1) {
    expandedFolders.value.splice(index, 1)
  } else {
    expandedFolders.value.push(folderId)
  }
}

// 全选文件
const selectAllFiles = () => {
  selectedFiles.value = fileTree.value.flatMap(folder => 
    folder.children.map(file => file.id)
  )
}

// 取消全选
const deselectAllFiles = () => {
  selectedFiles.value = []
}

// 获取文件预估条目数
const getFileEstimatedEntries = (fileId) => {
  for (const folder of fileTree.value) {
    const file = folder.children.find(f => f.id === fileId)
    if (file) {
      return file.file.estimatedEntries || 0
    }
  }
  return 0
}

// 获取总文件数
const getTotalFiles = () => {
  return fileTree.value.reduce((total, folder) => total + folder.children.length, 0)
}

// 获取选中文件的总条目数
const getTotalSelectedEntries = () => {
  return selectedFiles.value.reduce((total, fileId) => {
    return total + getFileEstimatedEntries(fileId)
  }, 0)
}

// 返回预览步骤
const goBackToPreview = () => {
  currentStep.value = 2
  selectedFiles.value = []
  expandedFolders.value = []
}

// 开始处理选中的文件
const startProcessing = async () => {
  if (selectedFiles.value.length === 0) {
    showAlertModal('warning', '提示', '请至少选择一个文件进行处理')
    return
  }
  
  isProcessing.value = true

  try {
    // 获取选中的文件
    const selectedFileObjects = []
    for (const folder of fileTree.value) {
      for (const file of folder.children) {
        if (selectedFiles.value.includes(file.id)) {
          // 从原始文件数组中获取完整的文件对象
          const originalFile = fileStore.uploadedFiles.find(f => f.name === file.name)
          if (originalFile) {
            selectedFileObjects.push(originalFile)
          }
        }
      }
    }
    
    // 开始实际处理
    const result = await fileApi.uploadAndProcess(selectedFileObjects)
    
    // 保存会话ID
    currentSessionId.value = result.sessionId
    
    // 保存处理结果到localStorage
    localStorage.setItem('currentSessionId', result.sessionId)
    localStorage.setItem('processingResult', JSON.stringify(result.result))
    
    // 直接跳转到文件管理页面
    router.push('/file-management')
    
  } catch (error) {
    console.error('文件处理失败:', error)
    showAlertModal('error', '处理失败', error.message || '文件处理失败，请检查文件格式是否正确。')
  } finally {
    isProcessing.value = false
  }
}

// 返回上传步骤
const goBackToUpload = () => {
  currentStep.value = 1
  previewFiles.value = []
  estimatedTranslationCount.value = 0
  expandedFiles.value = [] // 清理展开的文件状态
  selectedFiles.value = []
  expandedFolders.value = []
  fileTree.value = []
  fileStore.clearFiles()
}

// 显示提示模态框
const showAlertModal = (type, title, message) => {
  alertType.value = type
  alertTitle.value = title
  alertMessage.value = message
  showAlert.value = true
}

// 关闭提示模态框
const closeAlert = () => {
  showAlert.value = false
}

// 切换文件预览展开/收起
const toggleFilePreview = async (fileName) => {
  const index = expandedFiles.value.indexOf(fileName)
  if (index > -1) {
    // 收起
    expandedFiles.value.splice(index, 1)
  } else {
    // 展开
    expandedFiles.value.push(fileName)
    // 加载文件内容
    await loadFileContent(fileName)
  }
}

// 加载文件内容
const loadFileContent = async (fileName) => {
  try {
    // 从原始文件数组中获取文件
    const originalFiles = fileStore.uploadedFiles
    const file = originalFiles.find(f => f.name === fileName)
    
    if (file && !file.fileContent) {
      // 读取文件内容
      const content = await readFileAsText(file)
      
      // 更新预览文件中的内容
      const previewFile = previewFiles.value.find(f => f.name === fileName)
      if (previewFile) {
        previewFile.fileContent = content
      }
    }
  } catch (error) {
    console.error('加载文件内容失败:', error)
  }
}

// 读取文件为文本
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

// 复制文件内容
const copyFileContent = async (file) => {
  try {
    if (file.fileContent) {
      await navigator.clipboard.writeText(file.fileContent)
      showAlertModal('success', '复制成功', '文件内容已复制到剪贴板')
    }
  } catch (error) {
    console.error('复制失败:', error)
    showAlertModal('error', '复制失败', '无法复制文件内容')
  }
}













</script>

<style scoped>
/* 代码容器样式 */
.code-container {
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d1117 100%);
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: hidden;
}

.code-wrapper {
  display: flex;
  min-height: 200px;
  max-height: 320px;
  align-items: flex-start;
}

/* 行号样式 */
.line-numbers {
  display: flex;
  flex-direction: column;
  background: #1f2937;
  border-right: 1px solid #374151;
  padding: 1rem 0.75rem;
  min-width: 3rem;
  text-align: right;
  user-select: none;
  flex-shrink: 0;
}

.line-number {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  color: #6b7280;
  padding: 0 0.25rem;
  height: 1.6em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  white-space: nowrap;
}

/* 代码内容区域 */
.code-content-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
}

.code-lines {
  padding: 1rem 0;
  min-height: 200px;
  max-height: 320px;
}

.code-line {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  padding: 0 1rem;
  color: #e1e4e8;
  white-space: pre;
  min-height: 1.6em;
  display: flex;
  align-items: center;
}

/* 滚动条样式 */
.code-content-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content-wrapper::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 4px;
}

.code-content-wrapper::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.code-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* 语法高亮样式 */
.code-line :deep(.text-blue-400) {
  color: #60a5fa;
  font-weight: 500;
}

.code-line :deep(.text-green-400) {
  color: #34d399;
}

.code-line :deep(.text-yellow-400) {
  color: #fbbf24;
}

.code-line :deep(.text-purple-400) {
  color: #a78bfa;
}

.code-line :deep(.text-gray-400) {
  color: #9ca3af;
}

/* 选中文本样式 */
.code-line ::selection {
  background: #3b82f6;
  color: #ffffff;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.code-container {
  animation: fadeIn 0.3s ease-out;
}

/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .line-numbers {
    min-width: 2.5rem;
    padding: 1rem 0.5rem;
  }
  
  .line-number {
    font-size: 0.7rem;
  }
  
  .code-content {
    font-size: 0.7rem;
    padding: 1rem 0.75rem;
  }
}
</style> 