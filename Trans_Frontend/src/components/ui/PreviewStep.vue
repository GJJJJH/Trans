<template>
  <div class="mb-12">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-center mb-4">
        <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-blue-900">文件预览</h3>
      </div>
      <p class="text-blue-800 mb-4">你即将翻译的是这些文本：</p>

      <div class="bg-white rounded-lg border border-blue-200 p-4 mb-4">
        <h4 class="font-medium text-gray-900 mb-3">检测到的文件：</h4>
        <slot name="files" />
      </div>

      <div class="bg-white rounded-lg border border-blue-200 p-4">
        <h4 class="font-medium text-gray-900 mb-3">预估翻译条目：</h4>
        <slot name="summary" />
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="flex justify-center space-x-4 pt-8">
      <button
        @click="$emit('back')"
        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        返回修改
      </button>
      <button
        @click="$emit('confirm')"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        确认并开始处理
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['back', 'confirm'])
</script>


