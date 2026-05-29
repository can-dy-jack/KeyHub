<script setup>
import { useWindowDrag } from "../composables/useWindowDrag.js";
import SidebarIcon from "../icons/Sidebar.vue";
import SideButton from "./SideButton.vue";
import SearchIcon from "../icons/Search.vue";
import AddIcon from "../icons/Add.vue";

defineProps({
  collapsed: { type: Boolean, required: true },
  title: { type: String, default: "KeyHub" },
  subtitle: { type: String, default: "" },
});

defineEmits(["toggle"]);

const { startWindowDrag } = useWindowDrag();
</script>

<template>
  <header class="toolbar" data-tauri-drag-region @mousedown="startWindowDrag">
    <div class="toolbar-left" v-if="collapsed">
      <SideButton :collapsed="collapsed" @toggle="$emit('toggle')" />
    </div>

    <div class="toolbar-center">
      <span class="title">{{ title }}</span>
      <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  margin-left: auto;
}

.toolbar-center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}


.search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  min-width: 180px;
  transition: background-color 120ms ease;
}

.search:focus-within {
  background: rgba(0, 0, 0, 0.08);
}

.search-icon {
  flex: 0 0 auto;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font: inherit;
  font-size: 12px;
  color: var(--text-primary);
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.no-drag {
  -webkit-app-region: no-drag;
}

@media (prefers-color-scheme: dark) {
  .search {
    background: rgba(255, 255, 255, 0.08);
  }
  .search:focus-within {
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>
