<template>
  <div class="file-tree-node">
    <div 
      class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors"
      :class="[
        { 'font-medium': item.type === 'folder' },
        { 'bg-blue-100 border border-blue-300': isSelected },
        { 'hover:bg-gray-100': !isSelected }
      ]"
      :style="{ paddingLeft: `${level * 16 + 12}px` }"
      @click="handleClick"
    >
      <div 
        class="w-6 h-6 rounded flex items-center justify-center"
        :class="[
          item.type === 'folder' ? 'bg-green-100' : 'bg-blue-100',
          { 'bg-blue-200': isSelected && item.type === 'file' }
        ]"
      >
        <svg 
          v-if="item.type === 'folder'"
          class="w-4 h-4 text-green-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>
        <svg 
          v-else
          class="w-4 h-4 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-900 truncate">{{ item.name }}</p>
        <p v-if="item.type === 'file'" class="text-xs text-gray-500">{{ getFileType(item.file) }}</p>
      </div>
      
      <svg 
        v-if="item.type === 'folder'"
        class="w-4 h-4 text-gray-400 transition-transform"
        :class="{ 'rotate-90': isExpanded }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  isExpanded: {
    type: Boolean,
    default: true
  },
  selectedFile: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-file', 'toggle-expanded'])

// 计算当前文件是否被选中
const isSelected = computed(() => {
  if (!props.selectedFile || props.item.type !== 'file') return false
  
  const currentFileId = props.item.file?.webkitRelativePath || props.item.file?.name || props.item.file?.relativePath
  const selectedFileId = props.selectedFile?.webkitRelativePath || props.selectedFile?.name
  
  return currentFileId === selectedFileId
})

const handleClick = () => {
  if (props.item.type === 'file') {
    emit('select-file', props.item.file)
  } else {
    emit('toggle-expanded', props.item.id)
  }
}

const getFileType = (file) => {
  if (!file || !file.name) return '未知'
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension || '未知'
}
</script>

<style scoped>
.file-tree-node {
  width: 100%;
}
</style> 