<script setup>
import { computed, h } from "vue";
import { useI18n } from "vue-i18n";
import { NDropdown } from "naive-ui";
import draggable from "vuedraggable";
import { Folder, FolderOpen, FolderPlus, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "@lucide/vue";
import { providerAvatar } from "../composables/useDataConfig.js";

const props = defineProps({
  node: { type: Object, required: true },
  selectedId: { type: String, default: null },
  expanded: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  sortMode: { type: Boolean, default: false },
});

const emit = defineEmits(["select", "toggle", "action", "reorder"]);

const { t } = useI18n();

function statusDot(sw) {
  if (sw === true) return "ok";
  if (sw === false) return "off";
  return "warn";
}

const avatar = computed(() => providerAvatar(props.node.provider));

// --- dropdown ---
function renderIcon(icon) {
  return () => h(icon, { size: 14 });
}

const groupActions = computed(() => [
  { label: t("actions.addItem"), key: "add-child-item", icon: renderIcon(Plus) },
  { label: t("actions.addChildGroup"), key: "add-child-group", icon: renderIcon(FolderPlus) },
  { type: "divider", key: "d1" },
  { label: t("actions.edit"), key: "edit", icon: renderIcon(Pencil) },
  { label: t("actions.delete"), key: "delete", icon: renderIcon(Trash2) },
]);

const itemActions = computed(() => [
  { label: t("actions.edit"), key: "edit", icon: renderIcon(Pencil) },
  { label: t("actions.delete"), key: "delete", icon: renderIcon(Trash2) },
]);

function handleDropdownSelect(key) {
  emit("action", { type: key, nodeId: props.node.id, node: props.node });
}

// --- right-click opens dropdown ---
function onContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const btn = e.currentTarget.querySelector(".more-btn");
  if (btn) btn.click();
}
</script>

<template>
  <div class="row-wrap">
    <!-- Group row -->
    <div
      v-if="node.type === 'subGroup'"
      class="row group-row"
      :style="{ paddingLeft: 4 + depth * 12 + 'px' }"
      @click="$emit('toggle', node.id)"
      @contextmenu="onContextMenu"
    >
      <span v-if="sortMode" class="drag-handle" :title="$t('sidebar.sortMode')" @click.stop>
        <GripVertical :size="14" />
      </span>
      <span class="chev">
        <FolderOpen v-if="expanded[node.id]" :size="16" />
        <Folder v-else :size="16" />
      </span>
      <span v-if="node.icon" class="icon">{{ node.icon }}</span>
      <span class="name group-name">{{ node.name }}</span>
      <span class="count">{{ node.children?.length ?? 0 }}</span>

      <n-dropdown trigger="click" :options="groupActions" @select="handleDropdownSelect">
        <button type="button" class="more-btn" :title="$t('sidebar.moreActions')" @click.stop>
          <MoreHorizontal :size="14" />
        </button>
      </n-dropdown>
    </div>

    <!-- Children -->
    <draggable
      v-if="node.type === 'subGroup' && expanded[node.id]"
      :list="node.children"
      group="sidebar-nodes"
      item-key="id"
      class="children"
      :animation="180"
      :disabled="!sortMode"
      handle=".drag-handle"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      drag-class="drag-active"
      @change="$emit('reorder')"
    >
      <template #item="{ element }">
        <SidebarRow
          :node="element"
          :selected-id="selectedId"
          :expanded="expanded"
          :depth="depth + 1"
          :sort-mode="sortMode"
          @select="(id) => $emit('select', id)"
          @toggle="(id) => $emit('toggle', id)"
          @action="(payload) => $emit('action', payload)"
          @reorder="$emit('reorder')"
        />
      </template>
    </draggable>

    <!-- Item row -->
    <div
      v-else-if="node.type === 'item'"
      class="row item-row"
      :class="{ selected: selectedId === node.id }"
      :style="{ paddingLeft: 4 + depth * 12 + 'px' }"
      @click="$emit('select', node.id)"
      @contextmenu="onContextMenu"
    >
      <span v-if="sortMode" class="drag-handle" :title="$t('sidebar.sortMode')" @click.stop>
        <GripVertical :size="14" />
      </span>
      <!-- <span class="chev placeholder" /> -->
      <span class="provider-badge" :class="`badge-${node.switch ? 'active' : 'inactive'}`">
        <img v-if="node.icon" class="provider-icon" :src="node.icon" :alt="node.provider" />
        <span v-else class="provider-avatar" :style="{ background: avatar.color }">{{ avatar.letter }}</span>
      </span>
      <span class="item-text">
        <span class="name">{{ node.name }}</span>
        <span class="provider">{{ node.provider }}</span>
      </span>
      <span class="status-dot" :class="statusDot(node.switch)" />

      <n-dropdown trigger="click" :options="itemActions" @select="handleDropdownSelect">
        <button type="button" class="more-btn" :title="$t('sidebar.moreActions')" @click.stop>
          <MoreHorizontal :size="14" />
        </button>
      </n-dropdown>
    </div>
  </div>
</template>

<style scoped>
.row-wrap {
  display: flex;
  flex-direction: column;
}

/* 展开的空分组也需保留可放置区域 */
.children {
  min-height: 6px;
}

.row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
  margin: 3px 8px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  color: var(--text-primary);
  transition: background-color 100ms ease;
}

.group-row {
  min-height: 30px;
  font-weight: 600;
}

.group-row:hover {
  background: rgba(255, 255, 255, 0.28);
}

.item-row {
  min-height: 42px;
}

.item-row:hover:not(.selected) {
  background: rgba(255, 255, 255, 0.34);
}

.item-row.selected {
  background: var(--accent-soft);
}

/* --- 拖拽手柄 --- */
.drag-handle {
  width: 16px;
  height: 100%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: var(--text-tertiary);
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:hover {
  color: var(--text-primary);
}

.chev {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  display: grid;
  place-items: center;
  transition: transform 140ms ease;
  gap: 5px;
}

.chev.placeholder {
  visibility: hidden;
}

.icon {
  width: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--accent);
}

.group-name {
  flex: 1;
  font-size: 12.5px;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  padding-left: 5px;
}

.count {
  font-size: 11px;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

/* --- more button (dropdown trigger) --- */
.more-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 120ms ease, background-color 120ms ease, color 120ms ease;
}

.row:hover .more-btn,
.more-btn:hover {
  opacity: 1;
}

.more-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--text-primary);
}

/* --- provider badge --- */
.provider-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.55);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.provider-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  border-radius: 3px;
}

.provider-avatar {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: grid;
  place-items: center;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.badge-active {
  color: #1e8e3e;
}

.badge-inactive {
  color: var(--text-tertiary);
}

.item-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.item-text .name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.item-text .provider {
  font-size: 10px;
  color: var(--text-tertiary);
  line-height: 1.2;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.status-dot.ok {
  background: #34c759;
}

.status-dot.warn {
  background: #ff9f0a;
}

.status-dot.off {
  background: rgba(142, 142, 147, 0.55);
}
</style>

<style>
html[data-theme="dark"] .provider-badge {
  background: rgba(255, 255, 255, 0.08);
}

html[data-theme="dark"] .group-row:hover,
html[data-theme="dark"] .item-row:hover:not(.selected) {
  background: rgba(255, 255, 255, 0.06);
}

html[data-theme="dark"] .more-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
