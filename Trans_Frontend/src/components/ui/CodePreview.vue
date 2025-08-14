<template>
    <div class="bg-gray-900 text-gray-100 rounded-b-lg overflow-hidden">
        <!-- 工具栏 -->
        <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-200">源代码预览</span>
                <span class="px-2 py-1 text-xs bg-blue-600 text-white rounded-md">{{ language }}</span>
            </div>
            <div class="flex items-center space-x-2">
                <button @click="$emit('copy')"
                        class="flex items-center px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复制
                </button>
            </div>
        </div>

        <!-- 代码显示区域 -->
        <div class="relative max-h-80 overflow-hidden">
            <div v-if="fileContent" class="code-container">
                <div class="code-wrapper">
                    <!-- 行号 -->
                    <div class="line-numbers">
                        <div v-for="(line, index) in formattedLines" :key="index" class="line-number">
                            {{ index + 1 }}
                        </div>
                    </div>
                    <!-- 代码内容 -->
                    <div class="code-content-wrapper">
                        <div class="code-lines">
                            <div v-for="(line, idx) in formattedLines" :key="idx" class="code-line">
                                <span v-html="line"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="flex items-center justify-center py-8">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
                    <div class="text-sm text-gray-400">正在加载文件内容...</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    fileName: { type: String, required: true },
    fileContent: { type: String, default: '' }
})

const language = computed(() => {
    const ext = (props.fileName || '').toLowerCase().split('.').pop()
    const languageMap = {
        'json': 'JSON',
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'vue': 'Vue',
        'html': 'HTML',
        'css': 'CSS',
        'xml': 'XML',
        'txt': 'Text',
        'md': 'Markdown'
    }
    return languageMap[ext] || 'Text'
})

const formattedLines = computed(() => {
    const content = props.fileContent || ''
    if (!content) return []
    const ext = (props.fileName || '').toLowerCase().split('.').pop()
    if (ext === 'json') {
        try {
            const parsed = JSON.parse(content)
            const formatted = JSON.stringify(parsed, null, 2)
            return formatted.split('\n').map(line => {
                return line
                    .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
                    .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
                    .replace(/: (\d+)/g, ': <span class="text-yellow-400">$1</span>')
                    .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>')
                    .replace(/([\[\]{},])/g, '<span class="text-gray-400">$1</span>')
            })
        } catch (e) {
            return content.split('\n')
        }
    }
    return content.split('\n')
})
</script>

<style scoped>
.code-container {
    position: relative;
    background: linear-gradient(135deg, #1a1a1a 0%, #0d1117 100%);
    border-radius: 0 0 0.5rem 0.5rem;
    overflow: hidden;
}

.code-wrapper {
    display: flex;
    min-height: 200px;
    max-height: 320px;
    align-items: flex-start;
}

.line-numbers {
    display: flex;
    flex-direction: column;
    background: #1f2937;
    border-right: 1px solid #374151;
    padding: 1rem 0.75rem;
    min-width: 3rem;
    text-align: right;
    user-select: none;
    flex-shrink: 0;
}

.line-number {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.6;
    color: #6b7280;
    padding: 0 0.25rem;
    height: 1.6em;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    white-space: nowrap;
}

.code-content-wrapper {
    flex: 1;
    overflow: auto;
    position: relative;
}

.code-lines {
    padding: 1rem 0;
    min-height: 200px;
    max-height: 320px;
}

.code-line {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.6;
    padding: 0 1rem;
    color: #e1e4e8;
    white-space: pre;
    min-height: 1.6em;
    display: flex;
    align-items: center;
}

.code-content-wrapper::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.code-content-wrapper::-webkit-scrollbar-track {
    background: #2d3748;
    border-radius: 4px;
}

.code-content-wrapper::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 4px;
}

.code-content-wrapper::-webkit-scrollbar-thumb:hover {
    background: #718096;
}

.code-line :deep(.text-blue-400) { color: #60a5fa; font-weight: 500; }
.code-line :deep(.text-green-400) { color: #34d399; }
.code-line :deep(.text-yellow-400) { color: #fbbf24; }
.code-line :deep(.text-purple-400) { color: #a78bfa; }
.code-line :deep(.text-gray-400) { color: #9ca3af; }

@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>


