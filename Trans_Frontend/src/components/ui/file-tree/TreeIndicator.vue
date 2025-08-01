<template>
  <div
    :dir="direction"
    class="absolute left-3 h-full w-px rounded-md bg-gray-300 py-3 duration-300 ease-in-out hover:bg-gray-400 rtl:right-3"
  />
</template>

<script setup>
import { TREE_CONTEXT_SYMBOL } from "./index";
import { inject } from "vue";

const treeContext = inject(TREE_CONTEXT_SYMBOL);
if (!treeContext) {
  throw new Error("[TreeIndicator] must be used inside <Tree>");
}

const { direction } = treeContext;
</script>
