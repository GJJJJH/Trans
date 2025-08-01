<template>
  <div class="min-h-screen w-full bg-white py-12">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          游戏文件上传
        </h1>
        <p class="text-lg text-gray-600">
          支持上传游戏文件、压缩包或文件夹进行汉化处理
        </p>
      </div>

      <!-- 文件上传区域 -->
      <div class="mb-12">
        <FileUpload 
          @onChange="handleFileUpload"
          class="w-full"
          :disabled="isProcessing"
        />
        
        <!-- 处理状态指示器 -->
        <div v-if="isProcessing" class="mt-4 text-center">
          <div class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            正在处理文件...
          </div>
        </div>
      </div>

      <!-- 处理结果提示 -->
      <div v-if="processingResult" class="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="text-sm text-green-800">{{ processingResult }}</p>
        </div>
      </div>


      <!-- 下一步按钮 -->
      <div v-if="processingResult && currentSessionId" class="mt-12 text-center">
        <button
          @click="handleNextStep"
          class="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg"
        >
          查看文件管理和文本提取结果
          <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </button>
      </div>
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

const router = useRouter()
const fileStore = useFileStore()

// 响应式数据
const isProcessing = ref(false)
const processingResult = ref('')
const currentSessionId = ref('')

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
  processingResult.value = ''

  try {
    
    // 上传所有文件（支持文件夹上传）
    const result = await fileApi.uploadAndProcess(files)
    
    
    // 保存会话ID
    currentSessionId.value = result.sessionId
    
    // 保存处理结果到localStorage
    localStorage.setItem('currentSessionId', result.sessionId)
    localStorage.setItem('processingResult', JSON.stringify(result.result))
    
    // 将文件添加到store中
    fileStore.clearFiles()
    fileStore.addFiles(files)
    // 显示处理结果
    processingResult.value = result.result.message
    
  } catch (error) {
    console.error('❌ 文件处理失败:', error)
    showAlertModal('error', '处理失败', error.message || '文件处理失败，请检查文件格式是否正确。')
  } finally {
    isProcessing.value = false
  }
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

// 跳转到文件管理页面
const handleNextStep = () => {
  if (currentSessionId.value) {
    router.push('/file-management')
  } else {
    showAlertModal('warning', '提示', '请先上传并处理文件')
  }
}

</script> 