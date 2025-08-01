<template>
  <div :class="cn('size-full', $props.class)">
    <div
      ref="rootRef"
      class="relative h-full overflow-auto px-2"
      :dir="direction"
    >
      <div class="flex flex-col gap-1 py-2">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { cn } from "@/lib/utils";
import { TREE_CONTEXT_SYMBOL } from "./index";
import { toRefs, ref, onMounted, provide } from "vue";

const emit = defineEmits(['select-item', 'expand']);

const props = defineProps({
  class: { type: null, required: false },
  initialSelectedId: { type: String, required: true },
  indicator: { type: Boolean, required: false, default: true },
  elements: { type: Array, required: true },
  initialExpandedItems: { type: Array, required: true },
  openIcon: { type: String, required: false, default: "lucide:folder-open" },
  closeIcon: { type: String, required: false, default: "lucide:folder" },
  fileIcon: { type: String, required: false, default: "lucide:file" },
  direction: { type: String, required: false },
});

const {
  initialSelectedId,
  indicator,
  elements,
  initialExpandedItems,
  openIcon,
  closeIcon,
  fileIcon,
  direction,
} = toRefs(props);

const selectedId = ref(initialSelectedId.value);
const expandedItems = ref(initialExpandedItems.value);

function handleExpand(id) {
  expandedItems.value = expandedItems.value ?? [];
  if (expandedItems.value.includes(id)) {
    // If already expanded, collapse it
    expandedItems.value = expandedItems.value.filter((item) => item !== id);
  } else {
    // Otherwise, expand it
    expandedItems.value.push(id);
  }
  
  // 发射事件
  emit('expand', id);
}

function selectItem(id) {
  selectedId.value = id;
  
  // 发射事件
  emit('select-item', id);
}

function setExpandedItemsFn(items) {
  expandedItems.value = items;
}

provide(TREE_CONTEXT_SYMBOL, {
  selectedId,
  expandedItems,
  indicator: indicator.value,
  openIcon: openIcon.value,
  closeIcon: closeIcon.value,
  fileIcon: fileIcon.value,
  direction: direction.value === "rtl" ? "rtl" : "ltr",
  handleExpand,
  selectItem,
  setExpandedItems: setExpandedItemsFn,
});

function expandSpecificTargetedElements(list, selectId) {
  if (!list || !selectId) return;
  function findParent(current, path = []) {
    const isSelectable = current.isSelectable ?? true;
    const newPath = [...path, current.id];
    if (current.id === selectId) {
      if (isSelectable) {
        expandedItems.value = [...(expandedItems.value ?? []), ...newPath];
      } else {
        // if not selectable, pop the last item (itself)
        newPath.pop();
        expandedItems.value = [...(expandedItems.value ?? []), ...newPath];
      }
      return;
    }
    if (current.children?.length) {
      current.children.forEach((child) => findParent(child, newPath));
    }
  }
  list.forEach((element) => findParent(element));
}

onMounted(() => {
  if (initialSelectedId.value) {
    expandSpecificTargetedElements(elements.value, initialSelectedId.value);
  }
});
</script>
