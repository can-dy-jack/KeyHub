<script setup>
import { NButton } from "naive-ui";
import SidebarIcon from "../icons/Sidebar.vue";

defineProps({
  collapsed: { type: Boolean, default: false },
});

defineEmits(["toggle"]);
</script>

<template>
  <div class="box">
    <n-button
      quaternary
      size="small"
      :title="collapsed ? $t('sidebar.showSidebar') : $t('sidebar.hideSidebar')"
      :aria-label="collapsed ? $t('sidebar.showSidebar') : $t('sidebar.hideSidebar')"
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
  gap: var(--space-2);
}
</style>
