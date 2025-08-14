<template>
    <div class="flex items-center justify-center mb-10">
        <div v-for="(step, idx) in steps" :key="idx" class="flex items-center">
            <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                     :class="idx + 1 <= current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
                    {{ idx + 1 }}
                </div>
                <div class="text-xs mt-1" :class="idx + 1 <= current ? 'text-blue-600' : 'text-gray-500'">{{ step }}</div>
            </div>
            <div v-if="idx < steps.length - 1" class="w-14 h-0.5"
                 :class="idx + 1 < current ? 'bg-blue-600' : 'bg-gray-200'"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    steps: { type: Array, default: () => ['上传', '预览', '选择'] },
    current: { type: Number, default: 1 }
})
</script>


