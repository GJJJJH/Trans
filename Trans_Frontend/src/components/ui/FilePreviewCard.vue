<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- 文件头部信息 -->
    <div class="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center">
        <svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-700">{{ file.name }}</span>
          <span v-if="file.parseError" class="text-xs text-red-500">{{ file.parseError }}</span>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex flex-row items-end space-x-2">
          <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
          <span v-if="file.estimatedEntries" class="text-xs text-blue-600">预估 {{ file.estimatedEntries }} 条</span>
        </div>
        <!-- 展开/收起按钮 -->
        <button 
          @click="$emit('toggle-preview', file.name)"
          class="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>{{ isExpanded ? '收起' : '查看源码' }}</span>
          <svg 
            class="w-3 h-3 ml-1 transition-transform" 
            :class="{ 'rotate-180': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 源代码预览区域 -->
    <CodePreview 
      v-if="isExpanded"
      :file-name="file.name"
      :file-content="file.fileContent"
      @copy="$emit('copy-content', file)"
    />
  </div>
</template>

<script setup>
import CodePreview from './CodePreview.vue'

defineProps({
  file: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-preview', 'copy-content'])

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
