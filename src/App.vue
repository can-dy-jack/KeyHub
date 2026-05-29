<script setup>
import { computed, ref } from "vue";
import AppSidebar from "./components/AppSidebar.vue";
import AppTopBar from "./components/AppTopBar.vue";
import KeyDetail from "./components/KeyDetail.vue";
import { dataConfig } from "./data/sampleData.js";

const sidebarCollapsed = ref(false);

function firstItem(nodes) {
  for (const n of nodes) {
    if (n.type === "item") return n;
    if (n.type === "subGroup") {
      const hit = firstItem(n.children);
      if (hit) return hit;
    }
  }
  return null;
}

function findItem(id, nodes = dataConfig.groups) {
  if (!id) return null;
  for (const n of nodes) {
    if (n.type === "item" && n.id === id) return n;
    if (n.type === "subGroup") {
      const hit = findItem(id, n.children);
      if (hit) return hit;
    }
  }
  return null;
}

const selectedItemId = ref(firstItem(dataConfig.groups)?.id ?? null);
const selectedItem = computed(() => findItem(selectedItemId.value));
</script>

<template>
  <div class="app-shell">
    <AppSidebar
        :collapsed="sidebarCollapsed"
        :groups="dataConfig.groups"
        :selected-id="selectedItemId"
        @select="(id) => (selectedItemId = id)"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
      />
    

    <div class="panes">
      <AppTopBar
      :collapsed="sidebarCollapsed"
      :title="selectedItem?.name ?? 'KeyHub'"
      :subtitle="selectedItem?.provider ?? ''"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
      <div class="pane key-detail-pane">
        <KeyDetail :item="selectedItem" />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  font-family: "SF Pro Text", "SF Pro Display", "Helvetica Neue", -apple-system,
    BlinkMacSystemFont, sans-serif;
  color: #1d1d1f;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  --accent: #f0b400;
  --accent-soft: rgba(240, 180, 0, 0.25);
  --divider: rgba(60, 60, 67, 0.14);
  --divider-strong: rgba(60, 60, 67, 0.22);
  --text-primary: #1d1d1f;
  --text-secondary: rgba(60, 60, 67, 0.62);
  --text-tertiary: rgba(60, 60, 67, 0.42);
  --row-hover: rgba(60, 60, 67, 0.07);
  --row-selected: rgba(60, 60, 67, 0.1);
  --window-bg: rgba(246, 246, 246, 0.72);
  --sidebar-bg: rgba(228, 228, 228, 0.55);
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
}

* {
  box-sizing: border-box;
}

body {
  overflow: hidden;
}

.app-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  border-radius: 12px;
  background: var(--window-bg);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
}

.panes {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.pane {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.key-detail-pane {
  flex: 1;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f2f2f4;
    --divider: rgba(255, 255, 255, 0.08);
    --divider-strong: rgba(255, 255, 255, 0.14);
    --text-primary: #f2f2f4;
    --text-secondary: rgba(235, 235, 245, 0.6);
    --text-tertiary: rgba(235, 235, 245, 0.35);
    --row-hover: rgba(255, 255, 255, 0.06);
    --row-selected: rgba(255, 255, 255, 0.09);
    --window-bg: rgba(36, 36, 38, 0.72);
    --sidebar-bg: rgba(28, 28, 30, 0.2);
    --accent-soft: rgba(240, 180, 0, 0.3);
  }

  .app-shell {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.08);
  }

  .key-detail-pane {
    background: rgba(40, 40, 42, 0.35);
  }
}
</style>
