<script setup>
import { Folder, File } from './index.js'
import { computed } from 'vue'

const props = defineProps({
  elements: {
    type: Array,
    required: true
  },
  selectedFile: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-file'])

const isSelected = (file) => {
  if (!props.selectedFile || !file) return false
  
  // 处理不同的文件对象结构
  const selectedPath = props.selectedFile.webkitRelativePath || props.selectedFile.relativePath || props.selectedFile.name
  const filePath = file.webkitRelativePath || file.relativePath || file.name
  
  return selectedPath === filePath
}

const handleSelect = (file) => {
  emit('select-file', file)
}
</script>

<template>
  <template v-for="item in elements" :key="item.id">
    <Folder
      v-if="item.type === 'folder'"
      :id="item.id"
      :name="item.name"
      :is-selectable="true"
    >
      <FileTreeRecursive
        v-if="item.children && item.children.length"
        :elements="item.children"
        :selected-file="selectedFile"
        @select-file="handleSelect"
      />
    </Folder>
    <File
      v-else
      :id="item.id"
      :name="item.name"
      :is-select="isSelected(item.file)"
      @click="handleSelect(item.file)"
    />
  </template>
</template>