<script setup>
import { computed, onMounted, ref } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Pin } from "@lucide/vue";
import { useWindowDrag } from "../composables/useWindowDrag.js";
import SideButton from "./SideButton.vue";

defineProps({
  collapsed: { type: Boolean, required: true },
  title: { type: String, default: "KeyHub" },
  subtitle: { type: String, default: "" },
});

defineEmits(["toggle"]);

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
      <button
        class="pin-toggle"
        :class="{ 'pin-toggle-active': alwaysOnTop }"
        type="button"
        :disabled="!isWindowStateReady || isTogglingAlwaysOnTop || windowControlUnavailable"
        :aria-pressed="alwaysOnTop"
        :aria-label="pinButtonTitle"
        :title="pinButtonTitle"
        @click="toggleAlwaysOnTop"
      >
        <Pin :size="14" :stroke-width="2.1" />
      </button>
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

.pin-toggle {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease,
    border-color 120ms ease;
}

.pin-toggle:hover:enabled {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-primary);
}

.pin-toggle:disabled {
  opacity: 0.45;
  cursor: default;
}

.pin-toggle-active {
  background: var(--accent-soft);
  border-color: rgba(240, 180, 0, 0.44);
  color: #8b6500;
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
  .pin-toggle:hover:enabled {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }
  .pin-toggle-active {
    border-color: rgba(240, 180, 0, 0.5);
    color: #f7c53d;
  }
  .search {
    background: rgba(255, 255, 255, 0.08);
  }
  .search:focus-within {
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>
