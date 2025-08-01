<template>
  <div class="relative h-full overflow-hidden">
    <div
      class="flex cursor-pointer items-center gap-2 rounded-md text-sm transition-all duration-200 hover:bg-gray-100 px-2 py-1.5 border border-transparent hover:border-gray-300"
      :class="[
        cn(
          'flex cursor-pointer items-center gap-2 rounded-md text-sm',
          isSelect && isSelectable ? 'bg-blue-50 text-blue-700' : '',
          !isSelectable ? 'cursor-not-allowed opacity-50' : '',
          $props.class,
        ),
      ]"
      :dir="direction"
      @click="onTriggerClick"
    >
      <Icon v-if="isExpanded" :name="openIcon" size="16" class="text-blue-600" />
      <Icon v-else :name="closeIcon" size="16" class="text-gray-500" />

      <span class="select-none font-medium">{{ name }}</span>
    </div>

    <div v-if="isExpanded" class="relative text-sm">
      <TreeIndicator v-if="name && indicator" aria-hidden="true" />
      <div class="ml-6 flex flex-col gap-1 py-1 rtl:mr-6" :dir="direction">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { cn } from "@/lib/utils";
import { TREE_CONTEXT_SYMBOL } from "./index";
import { inject, computed, toRefs } from "vue";
import Icon from "../Icon.vue";
import TreeIndicator from "./TreeIndicator.vue";

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
  throw new Error("[Folder] must be used inside <Tree>");
}

const {
  expandedItems,
  handleExpand,
  openIcon,
  closeIcon,
  direction,
  indicator,
} = treeContext;

const isExpanded = computed(() => {
  return !!expandedItems.value?.includes(id.value);
});

function onTriggerClick() {
  if (!isSelectable.value) return;
  handleExpand(id.value);
}
</script>
