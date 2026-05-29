<script setup>
import Folder from "../icons/Folder.vue";
import SideButton from "./SideButton.vue";
import KeyIcon from "../icons/Key.vue";

defineProps({
  node: { type: Object, required: true },
  selectedId: { type: String, default: null },
  expanded: { type: Object, required: true },
  depth: { type: Number, default: 0 },
});

defineEmits(["select", "toggle"]);

function statusDot(status) {
  if (status === "active") return "ok";
  if (status === "inactive") return "off";
  return "warn";
}
</script>

<template>
  <div class="row-wrap">
    
    <!-- subGroup -->
    <div
      v-if="node.type === 'subGroup'"
      class="row group-row"
      :style="{ paddingLeft: 6 + depth * 14 + 'px' }"
      @click="$emit('toggle', node.id)"
    >
      <span class="chev" :class="{ open: expanded[node.id] }">
        <Folder :size="16" />
      </span>
      <span v-if="node.icon" class="icon">{{ node.icon }}</span>
      <span class="name group-name">{{ node.name }}</span>
      <span class="count">{{ node.children?.length ?? 0 }}</span>
    </div>

    <div v-if="node.type === 'subGroup' && expanded[node.id]" class="children">
      <SidebarRow
        v-for="c in node.children"
        :key="c.id"
        :node="c"
        :selected-id="selectedId"
        :expanded="expanded"
        :depth="depth + 1"
        @select="(id) => $emit('select', id)"
        @toggle="(id) => $emit('toggle', id)"
      />
    </div>

    <!-- item -->
    <div
      v-else-if="node.type === 'item'"
      class="row item-row"
      :class="{ selected: selectedId === node.id }"
      :style="{ paddingLeft: 6 + depth * 14 + 'px' }"
      @click="$emit('select', node.id)"
    >
      <span class="chev placeholder" />
      <span class="provider-badge">
        <KeyIcon :size="13" />
      </span>
      <span class="item-text">
        <span class="name">{{ node.name }}</span>
        <span class="provider">{{ node.provider }}</span>
      </span>
      <span class="status-dot" :class="statusDot(node.status)" />
    </div>
  </div>
</template>

<style scoped>
.row-wrap {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  margin: 1px 4px;
  border-radius: 6px;
  cursor: default;
  user-select: none;
  color: var(--text-primary);
  transition: background-color 100ms ease;
}

.group-row {
  height: 26px;
  font-weight: 600;
}

.group-row:hover {
  background: var(--row-hover);
}

.item-row {
  height: 40px;
}

.item-row:hover:not(.selected) {
  background: var(--row-hover);
}

.item-row.selected {
  background: var(--accent-soft);
}

.chev {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  font-size: 9px;
  display: grid;
  place-items: center;
  transition: transform 140ms ease;
}

.chev.open {
  transform: rotate(90deg);
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
  font-size: 12px;
  letter-spacing: 0.01em;
  color: var(--text-secondary);
  text-transform: none;
}

.count {
  font-size: 11px;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.provider-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-secondary);
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

@media (prefers-color-scheme: dark) {
  .provider-badge {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
