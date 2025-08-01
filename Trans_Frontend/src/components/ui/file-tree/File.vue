<template>
  <button
    ref="fileRef"
    type="button"
    :disabled="!isSelectable"
    :class="[
      cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm duration-200 ease-in-out rtl:pl-2 rtl:pr-0',
        isSelected && isSelectable ? 'bg-blue-50 text-blue-700' : '',
        isSelectable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-50',
        $props.class,
      ),
    ]"
    :dir="direction"
    @click="onClickHandler"
  >
    <Icon :name="fileIcon" size="16" :class="isSelected ? 'text-blue-600' : 'text-gray-500'" />
    <span class="select-none truncate">{{ name }}</span>
  </button>
</template>

<script setup>
import { cn } from "@/lib/utils";
import { TREE_CONTEXT_SYMBOL } from "./index";
import { inject, computed, toRefs } from "vue";
import Icon from "../Icon.vue";

const emit = defineEmits(['click']);

const props = defineProps({
  class: { type: null, required: false },
  id: { type: String, required: true },
  name: { type: String, required: true },
  isSelectable: { type: Boolean, required: false, default: true },
  isSelect: { type: Boolean, required: false },
});

const { id, name, isSelectable, isSelect } = toRefs(props);

const treeContext = inject(TREE_CONTEXT_SYMBOL);
if (!treeContext) {
  throw new Error("[File] must be used inside <Tree>");
}

const { selectedId, selectItem, direction, fileIcon } = treeContext;

const isSelected = computed(() => {
  return isSelect.value || selectedId.value === id.value;
});

function onClickHandler() {
  if (!isSelectable.value) return;
  
  // 只发射点击事件，不调用 selectItem
  // selectItem(id.value); // 注释掉这行，避免双重事件触发
  
  // 发射点击事件
  emit('click');
}
</script>
