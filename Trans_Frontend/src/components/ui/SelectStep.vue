<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">选择要处理的文件</h2>
      <p class="text-gray-600">请选择您要处理的文件，只有选中的文件会进入处理阶段</p>
    </div>

    <FilePickerTree
      :file-tree="fileTree"
      v-model="selectedFiles"
      :expanded-folders="expandedFolders"
      @toggle-folder="$emit('toggle-folder', $event)"
      @select-all="$emit('select-all')"
      @deselect-all="$emit('deselect-all')"
    />

    <div class="flex justify-center space-x-4 mt-6">
      <button @click="$emit('back')" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">返回预览</button>
      <button @click="$emit('start')" :disabled="selectedFiles.length === 0 || isProcessing" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="!isProcessing">开始处理选中文件</span>
        <span v-else class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          正在处理...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FilePickerTree from './FilePickerTree.vue'

const props = defineProps({
  fileTree: { type: Array, default: () => [] },
  expandedFolders: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] }, // 改为 modelValue 以支持 v-model
  isProcessing: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'toggle-folder', 'select-all', 'deselect-all', 'back', 'start'])

// 计算属性来处理 v-model
const selectedFiles = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>


