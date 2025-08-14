<template>
    <div class="file-management-container">
        <!-- 顶部导航 -->
        <div class="top-navigation">
            <div class="nav-container">
                <div class="nav-content">
                    <div class="nav-left">
                        <h1 class="nav-title">文件管理与文本提取</h1>
                    </div>
                    <button @click="goBack" class="back-button">
                        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        返回上传
                    </button>
                </div>
            </div>
        </div>

        <!-- 主要内容 -->
        <div class="main-content">
            <div class="stats-card">
                <div class="stats-header">
                    <svg class="stats-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                        </path>
                    </svg>
                    <h3 class="stats-title">整体统计</h3>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-icon-container stat-icon-blue">
                            <svg class="stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                        </div>
                        <p class="stat-number">{{ getDataFileCount() }}</p>
                        <p class="stat-label">总文件数</p>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon-container stat-icon-green">
                            <svg class="stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z">
                                </path>
                            </svg>
                        </div>
                        <p class="stat-number">{{ getFolderCount() }}</p>
                        <p class="stat-label">文件夹数</p>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon-container stat-icon-purple">
                            <svg class="stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                        </div>
                        <p class="stat-number">{{ translationEntries.length }}</p>
                        <p class="stat-label">可翻译文本</p>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon-container stat-icon-orange">
                            <svg class="stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4">
                                </path>
                            </svg>
                        </div>
                        <p class="stat-number">{{ formatFileSize(getTotalSize()) }}</p>
                        <p class="stat-label">总大小</p>
                    </div>
                </div>
            </div>

            <div class="content-grid">
                <!-- 左侧：文件结构 -->
                <div class="file-tree-panel">
                    <div class="file-tree-card">
                        <div class="file-tree-header">
                            <h2 class="file-tree-title">文件结构</h2>
                            <p class="file-tree-description">查看 /data/ 目录下的 JSON 文件结构</p>
                        </div>

                        <!-- 文件树 -->
                        <div class="file-tree-container">
                            <Tree v-if="fileTreeElements.length > 0" :elements="fileTreeElements"
                                :initial-selected-id="selectedFileId" :initial-expanded-items="expandedItems"
                                @select-item="handleTreeSelect" @expand="handleTreeExpand">
                                <FileTreeRecursive :elements="fileTreeElements" :selected-file="selectedFile"
                                    @select-file="handleFileSelect" />
                            </Tree>

                            <div v-else class="empty-state">
                                <div class="empty-icon">
                                    <svg class="empty-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z">
                                        </path>
                                    </svg>
                                </div>
                                <p class="empty-text">暂无文件</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧：文件详情和文本提取结果 -->
                <div class="file-details-panel">
                    <!-- 加载状态 -->
                    <div v-if="isLoading" class="loading-state">
                        <div class="loading-content">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">正在加载数据...</p>
                        </div>
                    </div>

                    <!-- 文件详情和文本提取结果 -->
                    <div v-if="selectedFile" class="file-details-container">
                        <!-- 文件详情 -->
                        <div class="file-details-card">
                            <h2 class="file-details-title">文件详情</h2>
                            <p class="file-details-description">显示选中文件的详细信息</p>

                            <div class="file-details-content">
                                <div class="file-info-grid">
                                    <div class="file-info-item">
                                        <label class="file-info-label">文件名</label>
                                        <p class="file-info-value">{{ selectedFile.name }}</p>
                                    </div>
                                    <div class="file-info-item">
                                        <label class="file-info-label">类型</label>
                                        <p class="file-info-value">{{ getFileType(selectedFile) }}</p>
                                    </div>
                                    <div class="file-info-item">
                                        <label class="file-info-label">大小</label>
                                        <p class="file-info-value">{{ formatFileSize(selectedFile.size) }}</p>
                                    </div>
                                </div>

                                <div v-if="selectedFile.webkitRelativePath" class="file-path-container">
                                    <label class="file-info-label">文件路径</label>
                                    <p class="file-path-value">{{ selectedFile.webkitRelativePath }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- 文本提取结果 -->
                        <div class="text-extraction-card">
                            <div class="text-extraction-header">
                                <h2 class="text-extraction-title">文本提取结果</h2>
                                <p class="text-extraction-description">显示选中文件中提取的可翻译文本</p>
                            </div>

                            <div v-if="selectedFileEntries.length > 0" class="text-extraction-content">
                                <div class="text-extraction-summary">
                                    <span class="text-count">共提取到 {{ selectedFileEntries.length }} 条文本</span>
                                    <button @click="exportFileEntries" class="export-button">
                                        导出为CSV
                                    </button>
                                </div>

                                <div class="text-entries-table-container">
                                    <table class="text-entries-table">
                                        <thead>
                                            <tr>
                                                <th class="table-header-index">#</th>
                                                <th class="table-header-type">类型</th>
                                                <th class="table-header-original">原文</th>
                                                <th class="table-header-translated">翻译</th>
                                                <th class="table-header-path">路径</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(entry, index) in selectedFileEntries" :key="entry.id || index"
                                                class="table-row">
                                                <td class="table-cell-index">{{ index + 1 }}</td>
                                                <td class="table-cell-type">
                                                    <span class="type-badge">{{ entry.context?.type || '未知' }}</span>
                                                </td>
                                                <td class="table-cell-original">{{ entry.original }}</td>
                                                <td class="table-cell-translated">{{ entry.translated || '待翻译' }}</td>
                                                <td class="table-cell-path">
                                                    <span v-if="entry.context?.path" class="path-text">{{ entry.context.path }}</span>
                                                    <span v-else class="path-empty">-</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div v-else class="text-extraction-empty">
                                <div class="text-extraction-empty-content">
                                    <div class="text-extraction-empty-icon">
                                        <svg class="text-extraction-empty-icon-svg" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                            </path>
                                        </svg>
                                    </div>
                                    <p class="text-extraction-empty-text">该文件中未找到可翻译的文本</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 加载中或未选择文件时的提示 -->
                    <div v-else class="loading-placeholder">
                        <div class="loading-placeholder-content">
                            <div class="loading-placeholder-spinner"></div>
                            <p class="loading-placeholder-text">正在加载文件信息...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 提示模态框 -->
    <AlertModal :is-visible="showAlert" :type="alertType" :title="alertTitle" :message="alertMessage"
        @close="closeAlert" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFileStore } from '../stores/fileStore'
import fileApi from '../api/fileApi'
import { Tree, Folder, File } from '../components/ui/file-tree'
import AlertModal from '../components/ui/AlertModal.vue'
import FileTreeRecursive from '../components/ui/file-tree/FileTreeRecursive.vue'

const router = useRouter()
const fileStore = useFileStore()

// 响应式数据
const selectedFile = ref(null)
const selectedFileId = ref('')
const selectedFileEntries = ref([])
const expandedItems = ref([])
const translationEntries = ref([])
const currentSessionId = ref('')
const fileTreeElements = ref([])
const isLoading = ref(false)

// 弹窗相关
const showAlert = ref(false)
const alertType = ref('info')
const alertTitle = ref('')
const alertMessage = ref('')

// 计算属性
const getFileTypeCount = (extension) => {
    if (!fileStore.uploadedFiles || fileStore.uploadedFiles.length === 0) {
        return 0
    }

    return fileStore.uploadedFiles.filter(file => {
        if (!file || !file.name) return false
        const path = file.webkitRelativePath || file.name
        // 检查是否包含 data 目录（支持多种路径格式）
        const isDataFile = path.startsWith('data/') || path.includes('/data/') || path.endsWith('/data')
        return isDataFile && file.name.toLowerCase().endsWith(extension)
    }).length
}

const getOtherFileCount = () => {
    if (!fileStore.uploadedFiles || fileStore.uploadedFiles.length === 0) {
        return 0
    }

    // 只统计包含 data 目录的非 JSON 文件
    return fileStore.uploadedFiles.filter(file => {
        if (!file || !file.name) return false
        const path = file.webkitRelativePath || file.name
        const isDataFile = path.startsWith('data/') || path.includes('/data/') || path.endsWith('/data')
        return isDataFile && !file.name.toLowerCase().endsWith('.json')
    }).length
}

const getFolderCount = () => {
    if (!fileStore.uploadedFiles || fileStore.uploadedFiles.length === 0) {
        return 0
    }

    // 计算包含 data 目录的文件夹数量
    const dataFolders = new Set()
    fileStore.uploadedFiles.forEach(file => {
        if (!file) return
        const path = file.webkitRelativePath || file.name
        const isDataFile = path.startsWith('data/') || path.includes('/data/') || path.endsWith('/data')
        if (isDataFile) {
            // 提取 data 目录的完整路径
            const pathParts = path.split('/')
            const dataIndex = pathParts.findIndex(part => part === 'data')
            if (dataIndex !== -1) {
                const dataPath = pathParts.slice(0, dataIndex + 1).join('/')
                dataFolders.add(dataPath)
            }
        }
    })
    return dataFolders.size
}

const getTotalSize = () => {
    if (!fileStore.uploadedFiles || fileStore.uploadedFiles.length === 0) {
        return 0
    }

    return fileStore.uploadedFiles.reduce((total, file) => {
        if (!file || !file.size) return total
        const path = file.webkitRelativePath || file.name
        const isDataFile = path.startsWith('data/') || path.includes('/data/') || path.endsWith('/data')
        if (isDataFile) {
            return total + file.size
        }
        return total
    }, 0)
}

const getDataFileCount = () => {
    if (!fileStore.uploadedFiles || fileStore.uploadedFiles.length === 0) {
        return 0
    }

    return fileStore.uploadedFiles.filter(file => {
        if (!file) return false
        const path = file.webkitRelativePath || file.name
        const isDataFile = path.startsWith('data/') || path.includes('/data/') || path.endsWith('/data')
        return isDataFile
    }).length
}

// 方法
const selectFile = async (file) => {

    if (!file) {
        return
    }

    // 使用 nextTick 确保响应式更新
    await nextTick()
    // 尝试不同的赋值方式
    selectedFile.value = file
    await nextTick()

    // 如果直接赋值失败，尝试使用 Object.assign
    if (!selectedFile.value) {
        selectedFile.value = Object.assign({}, file)
        await nextTick()
    }

    // 如果还是失败，尝试使用 JSON 序列化
    if (!selectedFile.value) {
        selectedFile.value = JSON.parse(JSON.stringify(file))
        await nextTick()
    }

    selectedFileId.value = file.webkitRelativePath || file.name || 'unknown'

    // 获取该文件的文本提取结果
    // 尝试多种可能的文件路径匹配
    const possiblePaths = [
        file.webkitRelativePath,
        file.relativePath,
        file.name,
        `data/${file.name}`,
        file.relativePath || file.webkitRelativePath
    ].filter(Boolean)

    selectedFileEntries.value = translationEntries.value.filter(entry => {
        const match = possiblePaths.some(path => entry.file === path)
        return match
    })

    // 如果没有找到匹配的条目，尝试更宽松的匹配
    if (selectedFileEntries.value.length === 0) {
        const fileName = file.name || 'unknown'
        selectedFileEntries.value = translationEntries.value.filter(entry => {
            return entry.file && entry.file.includes(fileName)
        })
    }
}

const handleFileSelect = async (file) => {
    if (!file) {
        return
    }

    const currentFileId = file.webkitRelativePath || file.relativePath || file.name || 'unknown'
    const currentSelectedFileId = selectedFile.value ? (selectedFile.value.webkitRelativePath || selectedFile.value.relativePath || selectedFile.value.name) : null

    // 如果点击的是当前已选中的文件，则不做任何操作（保持当前状态）
    if (currentSelectedFileId && currentSelectedFileId === currentFileId) {
        return
    }

    // 选中新文件
    await selectFile(file)
}

const handleTreeSelect = (id) => {
    // 查找对应的文件对象
    for (const item of fileTreeElements.value) {
        if (item.type === 'folder' && item.children) {
            for (const child of item.children) {
                if (child.id === id) {
                    handleFileSelect(child.file)
                    return
                }
            }
        }
    }
}

const handleTreeExpand = (id) => {
  const index = expandedItems.value.indexOf(id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(id)
  }
}

const goBack = () => {
    router.push('/')
}

const exportAllToCSV = async () => {
    if (!currentSessionId.value) {
        showAlertModal('warning', '提示', '没有可导出的数据')
        return
    }

    try {
        const blob = await fileApi.exportTranslations(currentSessionId.value)
        fileApi.downloadCSV(blob, 'all_translations.csv')
    } catch (error) {
        console.error('❌ 导出失败:', error)
        showAlertModal('error', '导出失败', error.message)
    }
}

const exportFileEntries = async () => {
    if (!currentSessionId.value || !selectedFile.value) {
        showAlertModal('warning', '提示', '请先选择文件')
        return
    }

    try {
        const filePath = selectedFile.value.webkitRelativePath || selectedFile.value.name
        const blob = await fileApi.exportTranslations(currentSessionId.value, filePath)
        const filename = `${filePath.replace(/[^a-zA-Z0-9]/g, '_')}_translations.csv`
        fileApi.downloadCSV(blob, filename)
    } catch (error) {
        console.error('❌ 导出失败:', error)
        showAlertModal('error', '导出失败', error.message)
    }
}


const getFileType = (file) => {
    if (!file || !file.name) return '未知'
    const extension = file.name.split('.').pop()?.toLowerCase()
    return extension || '未知'
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

// 加载数据
const loadData = async () => {
    if (!currentSessionId.value) {
        return
    }

    isLoading.value = true

    try {

        const response = await fileApi.getFileList(currentSessionId.value)

        if (response.success) {
            const { files, fileTree, translationEntries: entries } = response.data
            // 更新数据
            fileTreeElements.value = fileTree || []
            translationEntries.value = entries || []


                  // 自动选择第一个文件
      if (fileTreeElements.value.length > 0 && fileTreeElements.value[0].children && fileTreeElements.value[0].children.length > 0) {
        const firstFile = fileTreeElements.value[0].children[0]
        await selectFile(firstFile.file)
      }

            // 模拟文件对象，用于兼容现有的store
            const mockFiles = (files || []).map(file => ({
                name: file.name,
                size: file.size,
                webkitRelativePath: file.relativePath,
                id: file.relativePath
            }))

            fileStore.clearFiles()
            fileStore.addFiles(mockFiles)

            // 自动展开所有 data 文件夹
            expandedItems.value = fileTreeElements.value.map(folder => folder.id)

        } else {
            console.error('❌ 后端返回失败:', response)
            showAlertModal('error', '加载失败', response.message || '未知错误')
        }
    } catch (error) {
        console.error('❌ 加载数据失败:', error)
        showAlertModal('error', '加载失败', error.message)
    } finally {
        isLoading.value = false
    }
}

// 生命周期
onMounted(async () => {

    try {
        // 从localStorage获取会话ID
        const sessionId = localStorage.getItem('currentSessionId')

        if (sessionId) {
            currentSessionId.value = sessionId
            await loadData()
        } else {
            router.push('/')
        }
    } catch (error) {
        showAlertModal('error', '页面加载失败', error.message)
    }
})

// 清理会话
const cleanupSession = async () => {
    if (currentSessionId.value) {
        try {
            await fileApi.cleanupSession(currentSessionId.value)
            localStorage.removeItem('currentSessionId')
            localStorage.removeItem('processingResult')
        } catch (error) {
            console.error('❌ 清理会话失败:', error)
        }
    }
}

// 页面卸载时清理会话
onUnmounted(() => {
    cleanupSession()
})
</script>

<style scoped>
.file-management-container {
    min-height: 100vh;
}

.top-navigation {
    background-color: #ffffff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid #e5e7eb;
}

.nav-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
}

@media (min-width: 640px) {
    .nav-container {
        padding: 0 1.5rem;
    }
}

@media (min-width: 1024px) {
    .nav-container {
        padding: 0 2rem;
    }
}

.nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
}

.nav-left {
    display: flex;
    align-items: center;
}

.nav-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
}

.back-button {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem;
    color: #374151;
    background-color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.back-button:hover {
    background-color: #f9fafb;
}

.back-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.back-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
}

.main-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

@media (min-width: 640px) {
    .main-content {
        padding: 2rem 1.5rem;
    }
}

@media (min-width: 1024px) {
    .main-content {
        padding: 2rem;
    }
}

.stats-card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
}

.stats-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.stats-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #6b7280;
    margin-right: 0.5rem;
}

.stats-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
}

.stats-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

@media (min-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.stat-item {
    text-align: center;
}

.stat-icon-container {
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 auto 0.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-icon-blue {
    background-color: #dbeafe;
}

.stat-icon-green {
    background-color: #dcfce7;
}

.stat-icon-purple {
    background-color: #f3e8ff;
}

.stat-icon-orange {
    background-color: #fed7aa;
}

.stat-icon-svg {
    width: 1.5rem;
    height: 1.5rem;
}

.stat-icon-blue .stat-icon-svg {
    color: #2563eb;
}

.stat-icon-green .stat-icon-svg {
    color: #16a34a;
}

.stat-icon-purple .stat-icon-svg {
    color: #9333ea;
}

.stat-icon-orange .stat-icon-svg {
    color: #ea580c;
}

.stat-number {
    font-size: 1.2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.75rem;
    color: #6b7280;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr 2fr;
        gap: 2rem;
    }
}

.file-tree-panel {
    grid-column: 1;
}

.file-tree-card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
    height: 800px;
    display: flex;
    flex-direction: column;
}

.file-tree-header {
    flex-shrink: 0;
}

.file-tree-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
}

.file-tree-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
}

.file-tree-container {
    flex: 1;
    overflow: hidden;
}

.empty-state {
    text-align: center;
    padding: 2rem 0;
}

.empty-icon {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    background-color: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon-svg {
    width: 2rem;
    height: 2rem;
    color: #9ca3af;
}

.empty-text {
    color: #6b7280;
}

.file-details-panel {
    grid-column: 2;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16rem;
}

.loading-content {
    text-align: center;
}

.loading-spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

.loading-text {
    color: #6b7280;
}

.file-details-container {
    height: 800px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-details-card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    padding: 1rem;
    flex-shrink: 0;
}

.file-details-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
}

.file-details-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
}

.file-details-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.file-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.file-info-item {
    display: flex;
    flex-direction: column;
}

.file-info-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
}

.file-info-value {
    font-size: 0.875rem;
    color: #111827;
}

.file-path-container {
    display: flex;
    flex-direction: column;
}

.file-path-value {
    font-size: 0.875rem;
    color: #111827;
    background-color: #f9fafb;
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
}

.text-extraction-card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.text-extraction-header {
    flex-shrink: 0;
}

.text-extraction-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
}

.text-extraction-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
}

.text-extraction-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.text-extraction-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.text-count {
    font-size: 0.875rem;
    color: #6b7280;
}

.export-button {
    font-size: 0.875rem;
    color: #2563eb;
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
}

.export-button:hover {
    color: #1d4ed8;
    background-color: #eff6ff;
}

.text-entries-table-container {
    flex: 1;
    overflow-y: auto;
    max-height: 490px;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: #ffffff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.text-entries-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.table-header-index,
.table-header-type,
.table-header-original,
.table-header-translated,
.table-header-path {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 0.625rem 0.5rem;
    text-align: center;
    font-weight: 600;
    color: #475569;
    border-bottom: 2px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 10;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table-header-index {
    width: 3rem;
}

.table-header-type {
    width: 5rem;
}

.table-header-original {
    width: 35%;
}

.table-header-translated {
    width: 35%;
}

.table-header-path {
    width: 20%;
}

.table-row {
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
}

.table-row:hover {
    background-color: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-cell-index,
.table-cell-type,
.table-cell-original,
.table-cell-translated,
.table-cell-path {
    padding: 0.5rem 0.5rem;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
}

.table-cell-index {
    text-align: center;
    font-weight: 600;
    color: #64748b;
    background-color: #f8fafc;
    font-size: 0.8rem;
}

.table-cell-type {
    text-align: center;
}

.type-badge {
    display: inline-block;
    padding: 0.2rem 0.4rem;
    background-color: #79aff6;
    color: #ffffff;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(124, 58, 237, 0.2);
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.table-cell-original,
.table-cell-translated {
    max-width: 0;
    word-wrap: break-word;
    white-space: pre-wrap;
    line-height: 1.5;
}

.table-cell-original {
    color: #1e293b;
    font-weight: 500;
    font-size: 0.85rem;
}

.table-cell-translated {
    color: #64748b;
    font-style: italic;
    font-size: 0.85rem;
}

.table-cell-path {
    font-size: 0.7rem;
    color: #64748b;
    max-width: 0;
    word-wrap: break-word;
}

.path-text {
    display: inline-block;
    background-color: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    border: 1px solid #e2e8f0;
    color: #475569;
}

.path-empty {
    color: #cbd5e1;
    font-style: italic;
}

.text-extraction-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-extraction-empty-content {
    text-align: center;
}

.text-extraction-empty-icon {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    background-color: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-extraction-empty-icon-svg {
    width: 2rem;
    height: 2rem;
    color: #9ca3af;
}

.text-extraction-empty-text {
    color: #6b7280;
}

.loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16rem;
}

.loading-placeholder-content {
    text-align: center;
}

.loading-placeholder-spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

.loading-placeholder-text {
    color: #6b7280;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>