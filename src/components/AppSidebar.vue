<script setup>
import { ref, onUnmounted, watch, computed, h } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NDropdown } from "naive-ui";
import { ArrowUpDown, Check, ChevronDown, FolderPlus, Plus } from "@lucide/vue";
import draggable from "vuedraggable";
import SidebarRow from "./SidebarRow.vue";
import SideButton from "./SideButton.vue";
import { useWindowDrag } from "../composables/useWindowDrag.js";

const props = defineProps({
    collapsed: { type: Boolean, required: true },
    groups: { type: Array, required: true },
    selectedId: { type: String, default: null },
});

const emit = defineEmits(["select", "toggle", "add-group", "add-item", "node-action", "reorder"]);

const { t } = useI18n();

const expanded = ref({});

// --- 排序模式：默认关闭，开启后才可拖拽 ---
const sortMode = ref(false);

function toggleSort() {
    sortMode.value = !sortMode.value;
}

// --- 新增下拉：在根目录下新增组 / 新增项 ---
function renderIcon(icon) {
    return () => h(icon, { size: 14 });
}

const addOptions = computed(() => [
    { label: t("actions.addGroup"), key: "group", icon: renderIcon(FolderPlus) },
    { label: t("actions.addItem"), key: "item", icon: renderIcon(Plus) },
]);

function handleAddSelect(key) {
    if (key === "group") emit("add-group");
    else if (key === "item") emit("add-item");
}

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
            <SideButton :collapsed="collapsed" @toggle="$emit('toggle')" />
        </div>
        <!-- <div class="sidebar-info">
            <img class="app-logo" src="/app-icon.png" alt="KeyHub Logo" />
            <div class="app-meta">
                <div class="app-title">KeyHub</div>
                <div class="app-version">v0.1.0</div>
            </div>
        </div> -->
        <div v-if="!collapsed" class="sidebar-toolbar">
            <n-dropdown trigger="click" :options="addOptions" @select="handleAddSelect">
                <n-button quaternary size="small" :title="t('sidebar.add')" aria-label="Add"
                    class="toolbar-btn">
                    <template #icon>
                        <Plus :size="15" />
                    </template>
                    {{ t("sidebar.add") }}
                    <template #suffix>
                        <ChevronDown :size="12" />
                    </template>
                </n-button>
            </n-dropdown>
            <n-button :quaternary="!sortMode" :type="sortMode ? 'primary' : 'default'" size="small"
                :title="sortMode ? t('sidebar.sortDone') : t('sidebar.sortMode')"
                :aria-label="sortMode ? t('sidebar.sortDone') : t('sidebar.sortMode')" @click="toggleSort"
                class="toolbar-btn">
                <template #icon>
                    <Check v-if="sortMode" :size="15" />
                    <ArrowUpDown v-else :size="15" />
                </template>
                {{ sortMode ? t('sidebar.sortDone') : t('sidebar.sortMode') }}
            </n-button>
        </div>
        <div class="sidebar-content">
            <draggable :list="groups" group="sidebar-nodes" item-key="id" class="drag-list" :animation="180"
                :disabled="!sortMode" handle=".drag-handle" ghost-class="drag-ghost" chosen-class="drag-chosen"
                drag-class="drag-active" @change="$emit('reorder')">
                <template #item="{ element }">
                    <SidebarRow :node="element" :selected-id="selectedId" :expanded="expanded" :sort-mode="sortMode"
                        @select="(id) => $emit('select', id)" @toggle="toggleExpand"
                        @action="(payload) => $emit('node-action', payload)" @reorder="$emit('reorder')" />
                </template>
            </draggable>
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
    gap: var(--space-1);
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
    border-radius: var(--radius-2);
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
    padding: var(--space-3) var(--space-8) 0 0;
    display: flex;
    justify-content: flex-end;
}

.sidebar-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--space-6) 0 var(--space-10);
}

.drag-list {
    min-height: 100%;
}

.sidebar-info {
    display: flex;
    align-items: center;
    gap: var(--space-10);
    margin: 0 var(--space-12) var(--space-6);
    padding: var(--space-10) var(--space-14);
    min-height: 50px;
    border-radius: var(--radius-14);
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid var(--divider);
}

.sidebar-toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin: 0 var(--space-8) var(--space-6);
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-8);
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid var(--divider);
}

.toolbar-btn {
    flex: 1;
    justify-content: flex-start;
    font-size: 12.5px;
    padding: 0 var(--space-8);
    height: 28px;
}

.app-logo {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-10);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    object-fit: cover;
}

.app-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
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

html[data-theme="dark"] .sidebar-toolbar {
    background: rgba(255, 255, 255, 0.03);
}

/* --- 拖拽中的占位/选中样式（作用于子组件根元素，故非 scoped） --- */

/* 落点占位：高亮空槽，清晰指示将要插入的位置 */
.drag-ghost {
    opacity: 1 !important;
}

.drag-ghost > .row {
    background: var(--accent-soft) !important;
    border: 1px dashed var(--accent);
    border-radius: var(--radius-6);
    min-height: 38px;
}

/* 占位槽内不显示原内容，只保留高亮区域 */
.drag-ghost > .row > * {
    visibility: hidden;
}

/* 正在被拖拽（跟随光标）的元素 */
.drag-active > .row {
    opacity: 0.9;
}

.drag-chosen .row {
    cursor: grabbing;
}
</style>
