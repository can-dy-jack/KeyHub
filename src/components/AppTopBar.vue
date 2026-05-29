<script setup>
import { computed, h, onMounted, ref } from "vue";
import { NButton, NDropdown } from "naive-ui";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Monitor, Moon, Pin, Settings2, Sun } from "@lucide/vue";
import { useWindowDrag } from "../composables/useWindowDrag.js";
import SideButton from "./SideButton.vue";

const props = defineProps({
  collapsed: { type: Boolean, required: true },
  title: { type: String, default: "KeyHub" },
  subtitle: { type: String, default: "" },
  themeMode: { type: String, default: "system" },
});

const emit = defineEmits(["toggle", "open-config", "update-theme"]);

const { startWindowDrag } = useWindowDrag();

const alwaysOnTop = ref(false);
const isWindowStateReady = ref(false);
const isTogglingAlwaysOnTop = ref(false);
const windowControlUnavailable = ref(false);

const pinButtonTitle = computed(() => {
  if (!isWindowStateReady.value) return "读取窗口状态中";
  if (windowControlUnavailable.value) return "当前环境不支持窗口置顶";
  return alwaysOnTop.value ? "取消窗口置顶" : "将窗口置顶";
});

async function syncAlwaysOnTopState() {
  try {
    alwaysOnTop.value = await getCurrentWindow().isAlwaysOnTop();
    windowControlUnavailable.value = false;
  } catch {
    windowControlUnavailable.value = true;
  } finally {
    isWindowStateReady.value = true;
  }
}

async function toggleAlwaysOnTop() {
  if (
    !isWindowStateReady.value ||
    isTogglingAlwaysOnTop.value ||
    windowControlUnavailable.value
  ) {
    return;
  }

  const nextState = !alwaysOnTop.value;
  isTogglingAlwaysOnTop.value = true;

  try {
    await getCurrentWindow().setAlwaysOnTop(nextState);
    alwaysOnTop.value = nextState;
  } catch {
    windowControlUnavailable.value = true;
  } finally {
    isTogglingAlwaysOnTop.value = false;
  }
}

function renderIcon(icon) {
  return () => h(icon, { size: 14 });
}

const themeOptions = [
  { label: "跟随系统", key: "system", icon: renderIcon(Monitor) },
  { label: "浅色", key: "light", icon: renderIcon(Sun) },
  { label: "深色", key: "dark", icon: renderIcon(Moon) },
];

function handleThemeSelect(key) {
  emit("update-theme", key);
}

onMounted(() => {
  syncAlwaysOnTopState();
});
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

    <div class="toolbar-right no-drag">
      <n-dropdown trigger="click" :options="themeOptions" @select="handleThemeSelect">
        <n-button
          quaternary
          size="small"
          aria-label="主题设置"
          title="主题设置"
        >
          <template #icon>
            <Monitor :size="14" />
          </template>
        </n-button>
      </n-dropdown>
      <n-button
        quaternary
        size="small"
        aria-label="配置管理"
        title="配置管理"
        @click="$emit('open-config')"
      >
        <template #icon>
          <Settings2 :size="14" />
        </template>
      </n-button>
      <n-button
        quaternary
        size="small"
        :type="alwaysOnTop ? 'warning' : 'default'"
        :disabled="!isWindowStateReady || isTogglingAlwaysOnTop || windowControlUnavailable"
        :aria-label="pinButtonTitle"
        :title="pinButtonTitle"
        @click="toggleAlwaysOnTop"
      >
        <template #icon>
          <Pin :size="14" :stroke-width="2.1" />
        </template>
      </n-button>
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
.toolbar-left  {
  padding-left: 68px;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
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

</style>

<style>
html[data-theme="dark"] .search {
  background: rgba(255, 255, 255, 0.08);
}
html[data-theme="dark"] .search:focus-within {
  background: rgba(255, 255, 255, 0.12);
}
</style>
