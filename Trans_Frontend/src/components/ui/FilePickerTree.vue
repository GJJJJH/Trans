<template>
    <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">可处理的文件</h3>
            <div class="flex items-center space-x-4">
                <button @click="$emit('select-all')" class="text-sm text-blue-600 hover:text-blue-800 transition-colors">全选</button>
                <button @click="$emit('deselect-all')" class="text-sm text-gray-600 hover:text-gray-800 transition-colors">取消全选</button>
            </div>
        </div>

        <div class="space-y-2">
            <div v-for="folder in fileTree" :key="folder.id" class="border border-gray-200 rounded-lg overflow-hidden">
                <div class="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center">
                        <svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                        <span class="font-medium text-gray-700">{{ folder.name }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">{{ folder.children.length }} 个文件</span>
                        <button @click="$emit('toggle-folder', folder.id)" class="text-gray-500 hover:text-gray-700 transition-colors">
                            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedFolders.includes(folder.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div v-if="expandedFolders.includes(folder.id)" class="p-2">
                    <div v-for="file in folder.children" :key="file.id" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div class="flex items-center">
                            <input type="checkbox" :id="file.id" :value="file.id" v-model="selected" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label :for="file.id" class="ml-3 flex items-center cursor-pointer">
                                <svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span class="text-sm text-gray-700">{{ file.name }}</span>
                            </label>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-xs text-gray-500">{{ formatFileSize(file.file.size) }}</span>
                            <span class="text-xs text-blue-600">预估 {{ getFileEstimatedEntries(file.id) }} 条</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">已选择 {{ modelValue.length }} 个文件，预估 {{ totalSelectedEntries }} 条翻译条目</span>
                <span class="text-gray-500">共 {{ totalFiles }} 个文件</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    fileTree: { type: Array, required: true },
    expandedFolders: { type: Array, required: true },
    modelValue: { type: Array, required: true }
})

const emit = defineEmits(['update:modelValue', 'select-all', 'deselect-all', 'toggle-folder'])

const selected = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const totalFiles = computed(() => props.fileTree.reduce((t, f) => t + f.children.length, 0))

const totalSelectedEntries = computed(() => {
    return selected.value.reduce((total, fileId) => total + getFileEstimatedEntries(fileId), 0)
})

const getFileEstimatedEntries = (fileId) => {
    for (const folder of props.fileTree) {
        const file = folder.children.find(f => f.id === fileId)
        if (file) return file.file.estimatedEntries || 0
    }
    return 0
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>


