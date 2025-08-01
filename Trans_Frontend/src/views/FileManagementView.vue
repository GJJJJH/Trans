<template>
    <div class="min-h-screen">
        <!-- 顶部导航 -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-semibold text-gray-900">文件管理与文本提取</h1>
                    </div>
                    <button @click="goBack"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        返回上传
                    </button>
                </div>
            </div>
        </div>

        <!-- 主要内容 -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center mb-4">
                    <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                        </path>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900">整体统计</h3>
                </div>
                <p class="text-sm text-gray-600 mb-4">显示 /data/ 目录下的整体统计信息</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                        </div>
                        <p class="text-2xl font-bold text-gray-900">{{ getDataFileCount() }}</p>
                        <p class="text-sm text-gray-500">总文件数</p>
                    </div>

                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z">
                                </path>
                            </svg>
                        </div>
                        <p class="text-2xl font-bold text-gray-900">{{ getFolderCount() }}</p>
                        <p class="text-sm text-gray-500">文件夹数</p>
                    </div>

                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                        </div>
                        <p class="text-2xl font-bold text-gray-900">{{ translationEntries.length }}</p>
                        <p class="text-sm text-gray-500">可翻译文本</p>
                    </div>

                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4">
                                </path>
                            </svg>
                        </div>
                        <p class="text-2xl font-bold text-gray-900">{{ formatFileSize(getTotalSize()) }}</p>
                        <p class="text-sm text-gray-500">总大小</p>
                    </div>
                </div>
            </div>

            <div class="lg:grid lg:grid-cols-3 lg:gap-8 pt-10">
                <!-- 左侧：文件结构 -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-2">文件结构</h2>
                        <p class="text-sm text-gray-600 mb-4">查看 /data/ 目录下的 JSON 文件结构</p>

                        <!-- 文件树 -->
                        <div class="h-[680px]">
                            <Tree v-if="fileTreeElements.length > 0" :elements="fileTreeElements"
                                :initial-selected-id="selectedFileId" :initial-expanded-items="expandedItems"
                                @select-item="handleTreeSelect" @expand="handleTreeExpand">
                                <FileTreeRecursive :elements="fileTreeElements" :selected-file="selectedFile"
                                    @select-file="handleFileSelect" />
                            </Tree>

                            <div v-else class="text-center py-8">
                                <div
                                    class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z">
                                        </path>
                                    </svg>
                                </div>
                                <p class="text-gray-500">暂无文件</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧：文件详情和文本提取结果 -->
                <div class="lg:col-span-2">
                    <!-- 加载状态 -->
                    <div v-if="isLoading" class="flex items-center justify-center h-64">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
                            </div>
                            <p class="text-gray-600">正在加载数据...</p>
                        </div>
                    </div>



                    <!-- 文件详情和文本提取结果 -->
                    <div v-if="selectedFile" class="space-y-6">
                        <!-- 文件详情 -->
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-2">文件详情</h2>
                            <p class="text-sm text-gray-600 mb-4">显示选中文件的详细信息</p>

                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">文件名</label>
                                        <p class="text-sm text-gray-900">{{ selectedFile.name }}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
                                        <p class="text-sm text-gray-900">{{ getFileType(selectedFile) }}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">大小</label>
                                        <p class="text-sm text-gray-900">{{ formatFileSize(selectedFile.size) }}</p>
                                    </div>
                                </div>

                                <div v-if="selectedFile.webkitRelativePath">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">文件路径</label>
                                    <p class="text-sm text-gray-900 bg-gray-50 rounded px-3 py-2">{{
                                        selectedFile.webkitRelativePath }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- 文本提取结果 -->
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-2">文本提取结果</h2>
                            <p class="text-sm text-gray-600 mb-4">显示选中文件中提取的可翻译文本</p>

                            <div v-if="selectedFileEntries.length > 0" class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">共提取到 {{ selectedFileEntries.length }} 条文本</span>
                                    <button @click="exportFileEntries"
                                        class="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors">
                                        导出为CSV
                                    </button>
                                </div>

                                <div class="max-h-96 overflow-y-auto space-y-3">
                                    <div v-for="(entry, index) in selectedFileEntries" :key="entry.id || index"
                                        class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <div class="flex items-center space-x-2 mb-2">
                                                    <span
                                                        class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">#{{
                                                        index + 1 }}</span>
                                                    <span
                                                        class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{{
                                                        entry.context?.type || '未知' }}</span>
                                                </div>
                                                <p class="text-sm font-medium text-gray-900 mb-1">原文:</p>
                                                <p class="text-sm text-gray-700 bg-white p-2 rounded border">{{
                                                    entry.original }}</p>
                                                <p class="text-sm font-medium text-gray-900 mt-2 mb-1">翻译:</p>
                                                <p class="text-sm text-gray-700 bg-white p-2 rounded border">{{
                                                    entry.translated || '待翻译' }}</p>
                                                <div v-if="entry.context?.path" class="mt-2">
                                                    <p class="text-xs text-gray-500">路径: {{ entry.context.path }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="text-center py-8">
                                <div
                                    class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                        </path>
                                    </svg>
                                </div>
                                <p class="text-gray-500">该文件中未找到可翻译的文本</p>
                            </div>
                        </div>
                    </div>

                    <!-- 加载中或未选择文件时的提示 -->
                    <div v-else class="flex items-center justify-center h-64">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p class="text-gray-600">正在加载文件信息...</p>
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
.file-tree-item {
    margin-bottom: 2px;
}

.file-tree-node {
    width: 100%;
}
</style>