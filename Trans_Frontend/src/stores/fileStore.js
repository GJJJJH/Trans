import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFileStore = defineStore('file', () => {
  // 状态
  const uploadedFiles = ref([])
  
  // 支持的文件类型
  const supportedExtensions = ['.json', '.rvdata2', '.ini', '.zip']
  const supportedMimeTypes = [
    'application/json',
    'text/plain',
    'application/octet-stream',
    'application/zip',
    'application/x-zip-compressed'
  ]
  
  // 禁止的文件类型
  const blockedExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs']

  // 计算属性
  const fileCount = computed(() => uploadedFiles.value.length)
  const totalSize = computed(() => 
    uploadedFiles.value.reduce((total, file) => total + file.size, 0)
  )

  // 方法
  const addFiles = (files) => {
    if (!Array.isArray(files)) {
      console.warn('⚠️ addFiles 接收到的不是数组:', files)
      return []
    }
    
    // 直接添加所有文件，不进行过滤，因为文件处理已经在 FileProcessor 中完成
    uploadedFiles.value.push(...files)
    
    return files
  }

  const removeFile = (fileId) => {
    const index = uploadedFiles.value.findIndex(file => file.id === fileId)
    if (index > -1) {
      uploadedFiles.value.splice(index, 1)
    }
  }

  const clearFiles = () => {
    console.trace('clearFiles 调用堆栈')
    uploadedFiles.value = []
  }

  const isValidFile = (file) => {
    // 健壮性检查：确保 file 和 file.name 存在
    if (!file || !file.name) {
      console.warn('⚠️ 发现无效文件对象:', file)
      return false
    }
    
    // 检查文件扩展名
    const fileName = file.name.toLowerCase()
    
    // 检查是否是被禁止的文件类型
    const isBlocked = blockedExtensions.some(ext => 
      fileName.endsWith(ext)
    )
    if (isBlocked) return false
    
    // 检查是否有有效的扩展名
    const hasValidExtension = supportedExtensions.some(ext => 
      fileName.endsWith(ext)
    )
    
    // 检查 MIME 类型
    const hasValidMimeType = supportedMimeTypes.includes(file.type) || 
                            file.type === '' // 某些文件可能没有 MIME 类型
    
    return hasValidExtension || hasValidMimeType
  }
  
  const isBlockedFile = (file) => {
    if (!file || !file.name) return false
    const fileName = file.name.toLowerCase()
    return blockedExtensions.some(ext => fileName.endsWith(ext))
  }
  
  const getFileType = (file) => {
    if (!file || !file.name) return 'Unknown'
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.json')) return 'JSON'
    if (fileName.endsWith('.rvdata2')) return 'RPG Maker Data'
    if (fileName.endsWith('.ini')) return 'INI Configuration'
    if (fileName.endsWith('.zip')) return 'ZIP Archive'
    if (fileName.endsWith('.exe')) return 'Executable'
    return file.type || 'Unknown'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // 状态
    uploadedFiles,
    
    // 计算属性
    fileCount,
    totalSize,
    
    // 方法
    addFiles,
    removeFile,
    clearFiles,
    isValidFile,
    isBlockedFile,
    getFileType,
    formatFileSize,
    supportedExtensions,
    blockedExtensions
  }
}) 