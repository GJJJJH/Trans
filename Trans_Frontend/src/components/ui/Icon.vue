<template>
  <svg 
    :class="iconClass"
    :style="{ width: size + 'px', height: size + 'px' }"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path v-if="name === 'lucide:folder'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
    <path v-else-if="name === 'lucide:folder-open'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
    <path v-else-if="name === 'lucide:file'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 16
  },
  class: {
    type: String,
    default: ''
  }
})

const iconClass = computed(() => {
  return `text-gray-600 ${props.class}`
})
</script> 