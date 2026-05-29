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
      :title="$t('sidebar.addGroup')"
      :aria-label="$t('sidebar.addGroup')"
      @click="$emit('add-group')"
    >
      <template #icon>
        <Plus :size="15" />
      </template>
    </n-button>
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
  gap: 2px;
}
</style>
