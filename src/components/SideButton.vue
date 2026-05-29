<script setup>
import { NButton } from "naive-ui";
import { Plus } from "@lucide/vue";
import SidebarIcon from "../icons/Sidebar.vue";

defineProps({
  collapsed: { type: Boolean, default: false },
  showAdd: { type: Boolean, default: false },
});

defineEmits(["toggle", "add-group"]);
</script>

<template>
  <div class="box">
    <n-button
      v-if="showAdd"
      quaternary
      size="small"
      title="新增分组"
      aria-label="新增分组"
      @click="$emit('add-group')"
    >
      <template #icon>
        <Plus :size="15" />
      </template>
    </n-button>
    <n-button
      quaternary
      size="small"
      :title="collapsed ? 'Show Sidebar' : 'Hide Sidebar'"
      :aria-label="collapsed ? 'Show Sidebar' : 'Hide Sidebar'"
      @click="$emit('toggle')"
    >
      <template #icon>
        <SidebarIcon :size="18" />
      </template>
    </n-button>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>
