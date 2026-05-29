<script setup>
import { ref } from "vue";
import SidebarRow from "./SidebarRow.vue";
import SideButton from "./SideButton.vue";
import { useWindowDrag } from "../composables/useWindowDrag.js";

defineProps({
    collapsed: { type: Boolean, required: true },
    groups: { type: Array, required: true },
    selectedId: { type: String, default: null },
});

defineEmits(["select", "toggle"]);

const expanded = ref({ llm: true, cloud: true });
function toggleExpand(id) {
    expanded.value[id] = !expanded.value[id];
}

const { startWindowDrag } = useWindowDrag();
</script>

<template>
    <aside class="sidebar" :class="{ collapsed }">
        <div class="sidebar-header" data-tauri-drag-region @mousedown="startWindowDrag">
            <SideButton :collapsed="collapsed" @toggle="$emit('toggle')" />
        </div>
        <div class="sidebar-info">
            <img class="app-logo" src="/app-icon.png" alt="KeyHub Logo" />
            <div class="app-meta">
                <div class="app-title">KeyHub</div>
                <div class="app-version">v0.1.0</div>
            </div>
        </div>
        <div class="sidebar-content">
            <SidebarRow v-for="node in groups" :key="node.id" :node="node" :selected-id="selectedId" :expanded="expanded"
            @select="(id) => $emit('select', id)" @toggle="toggleExpand" />
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
    background: var(--sidebar-bg);
    border-right: 1px solid var(--divider);
    transition: width 220ms ease, flex-basis 220ms ease, padding 220ms ease, opacity 160ms ease;
}

.sidebar.collapsed {
    flex-basis: 0;
    width: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
}

.sidebar::-webkit-scrollbar {
    width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.12);
}

@media (max-width: 980px) {
    .sidebar {
        flex-basis: 210px;
        width: 210px;
    }
}

@media (prefers-color-scheme: dark) {
    .sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.16);
    }
}
.sidebar-header {
    padding: 3px 10px;
    display: flex;
    justify-content: flex-end;
}
.sidebar-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 8px 0;
}

.sidebar-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px 8px 18px;
    min-height: 48px;
}
.app-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    /* background: #fff; */
    /* box-shadow: 0 2px 8px rgba(0,0,0,0.07); */
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
