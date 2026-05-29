<script setup>
import { ref, onUnmounted, watch } from "vue";
import SidebarRow from "./SidebarRow.vue";
import SideButton from "./SideButton.vue";
import { useWindowDrag } from "../composables/useWindowDrag.js";

const props = defineProps({
    collapsed: { type: Boolean, required: true },
    groups: { type: Array, required: true },
    selectedId: { type: String, default: null },
});

defineEmits(["select", "toggle", "add-group", "node-action"]);

const expanded = ref({});

// auto-expand first subGroup on load
watch(() => props.groups, (groups) => {
    if (groups.length) {
        const firstGroup = groups.find(g => g.type === "subGroup");
        if (firstGroup) {
            expanded.value[firstGroup.id] = true;
        }
    }
}, { immediate: true });

function toggleExpand(id) {
    expanded.value[id] = !expanded.value[id];
}

const { startWindowDrag } = useWindowDrag();

// --- 侧边栏拖拽调整宽度 ---
const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 240;

const sidebarWidth = ref(DEFAULT_WIDTH);
const isResizing = ref(false);

function onResizeMove(e) {
    if (!isResizing.value) return;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
    sidebarWidth.value = newWidth;
}

function stopResize() {
    isResizing.value = false;
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
}

function startResize(e) {
    e.preventDefault();
    isResizing.value = true;
    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", stopResize);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
}

onUnmounted(() => {
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", stopResize);
});
</script>

<template>
    <aside class="sidebar" :class="{ collapsed, resizing: isResizing }"
        :style="collapsed ? {} : { width: sidebarWidth + 'px', flexBasis: sidebarWidth + 'px' }">
        <div class="sidebar-header" data-tauri-drag-region @mousedown="startWindowDrag">
            <SideButton :collapsed="collapsed" :show-add="true" @toggle="$emit('toggle')"
                @add-group="$emit('add-group')" />
        </div>
        <div class="sidebar-info">
            <img class="app-logo" src="/app-icon.png" alt="KeyHub Logo" />
            <div class="app-meta">
                <div class="app-title">KeyHub</div>
                <div class="app-version">v0.1.0</div>
            </div>
        </div>
        <div class="sidebar-content">
            <SidebarRow v-for="node in groups" :key="node.id" :node="node" :selected-id="selectedId"
                :expanded="expanded" @select="(id) => $emit('select', id)" @toggle="toggleExpand"
                @action="(payload) => $emit('node-action', payload)" />
        </div>
        <div v-if="!collapsed" class="resize-handle" @mousedown="startResize">
            <div class="resize-handle-line" />
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    flex: 0 0 240px;
    width: 240px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1px;
    position: relative;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--divider);
    transition: width 220ms ease, flex-basis 220ms ease, padding 220ms ease, opacity 160ms ease;
}

.sidebar.resizing {
    transition: none;
}

.sidebar.collapsed {
    flex-basis: 0;
    width: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
}

/* --- 拖拽调整宽度手柄 --- */
.resize-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 7px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

.resize-handle:hover .resize-handle-line,
.resize-handle:active .resize-handle-line {
    opacity: 1;
}

.resize-handle-line {
    width: 3px;
    height: 36px;
    border-radius: 2px;
    background: var(--divider-strong);
    opacity: 0;
    transition: opacity 160ms ease;
}

@media (max-width: 980px) {
    .sidebar {
        flex-basis: 210px;
        width: 210px;
    }
}

.sidebar-header {
    padding: 3px 8px 0 0;
    display: flex;
    justify-content: flex-end;
}

.sidebar-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 6px 0 10px;
}

.sidebar-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 12px 8px;
    padding: 10px 14px;
    min-height: 50px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid var(--divider);
}

.app-logo {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    object-fit: cover;
}

.app-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.app-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--text-primary);
}

.app-version {
    font-size: 11px;
    color: var(--text-tertiary);
}
</style>

<style>
html[data-theme="dark"] .sidebar-info {
    background: rgba(255, 255, 255, 0.04);
}
</style>
