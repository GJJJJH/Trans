<template>
  <div :class="cn('w-full', $props.class)">
    <div class="mb-4 flex gap-2">
      <button
        class="px-3 py-1 rounded border text-sm"
        :class="mode === 'file' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'"
        @click="mode = 'file'"
      >上传文件</button>
      <button
        class="px-3 py-1 rounded border text-sm"
        :class="mode === 'folder' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'"
        @click="mode = 'folder'"
      >上传文件夹</button>
    </div>
    <div
      class="group/file relative block w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-300 p-10 hover:border-gray-400 transition-colors"
      @click="handleClick"
      @dragover.prevent="handleEnter"
      @dragleave="handleLeave"
      @drop.prevent="handleDrop"
      @mouseover="handleEnter"
      @mouseleave="handleLeave"
    >
      <input
        v-if="mode === 'file'"
        ref="fileInputRef"
        type="file"
        multiple
        accept=".zip,.json"
        class="hidden"
        @change="onFileChange"
      />
      <input
        v-else
        ref="fileInputRef"
        type="file"
        multiple
        webkitdirectory
        directory
        accept=".zip,.json"
        class="hidden"
        @change="onFileChange"
      />
      <!-- 其余内容不变 -->
      <div class="pointer-events-none absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 20px 20px;"></div>
      </div>
      <div class="flex flex-col items-center justify-center">
        <p class="relative z-20 font-sans text-base font-bold text-neutral-700 dark:text-neutral-300">上传文件</p>
        <p class="relative z-20 mt-2 font-sans text-base font-normal text-neutral-400 dark:text-neutral-400">
          拖拽文件、压缩包或文件夹到此处或点击上传
        </p>
        <div class="relative mx-auto mt-10 w-full max-w-xl">
          <div v-if="files.length > 0" class="mb-4 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                已上传 {{ files.length }} 个文件
              </span>
            </div>
            <button @click="clearFiles" class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">清空列表</button>
          </div>
          <div v-if="files.length > 0" class="max-h-96 overflow-y-auto pr-2 border border-gray-200 rounded-lg p-4">
            <div class="space-y-2">
              <div v-for="(file, index) in files" :key="index" class="flex items-center space-x-2 text-sm text-gray-700">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span class="truncate">{{ file.name }}</span>
                <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
              </div>
            </div>
          </div>
          <template v-if="!files.length">
            <div class="relative z-40 mx-auto mt-4 flex h-32 w-full max-w-32 items-center justify-center rounded-md bg-white shadow-[0px_10px_50px_rgba(0,0,0,0.1)] group-hover/file:shadow-2xl dark:bg-neutral-900 transition-all duration-300" :class="isActive ? 'transform translate-x-5 -translate-y-5 opacity-90' : ''">
              <svg class="w-8 h-8 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <div class="absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-32 items-center justify-center rounded-md border border-dashed border-sky-400 bg-transparent transition-opacity" :class="{ 'opacity-100': isActive, 'opacity-0': !isActive }"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { cn } from "@/lib/utils";
import { ref } from "vue";
const props = defineProps({
  class: { type: null, required: false },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(["onChange"]);
const fileInputRef = ref(null);
const files = ref([]);
const isActive = ref(false);
const mode = ref('file');
function handleFileChange(newFiles) {
  files.value = [...files.value, ...newFiles];
  emit("onChange", files.value);
}
function onFileChange(e) {
  const input = e.target;
  if (!input.files) return;
  handleFileChange(Array.from(input.files));
}
function handleClick() {
  if (!props.disabled) {
    fileInputRef.value?.click();
  }
}
function handleEnter() {
  if (!props.disabled) {
    isActive.value = true;
  }
}
function handleLeave() {
  isActive.value = false;
}
function clearFiles() {
  files.value = [];
  emit("onChange", files.value);
}
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<style scoped>
.group-hover\/file\:shadow-2xl:hover {
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.25);
}

.transition-opacity {
  transition: opacity 0.3s ease;
}
</style>
