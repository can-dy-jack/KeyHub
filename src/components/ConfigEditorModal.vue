<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";
import { Check, ChevronRight, Copy, Download, Folder, FolderOpen, RotateCcw, Upload, X } from "@lucide/vue";
import { providerAvatar } from "../composables/useDataConfig.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  content: { type: String, default: "" },
  error: { type: String, default: "" },
  statusMessage: { type: String, default: "" },
  settingsPath: { type: String, default: "" },
  groups: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "save", "import-file", "refresh", "download"]);

const { t } = useI18n();

const draft = ref("");
const activeTab = ref("tree");

watch(() => props.visible, (v) => {
  if (v) {
    draft.value = props.content;
    activeTab.value = "tree";
  }
});

// --- JSON validation ---
const jsonValid = computed(() => {
  if (!draft.value.trim()) return null;
  try {
    JSON.parse(draft.value);
    return true;
  } catch {
    return false;
  }
});

// --- tree expanded state ---
const treeExpanded = ref({});

function toggleTreeExpand(id) {
  treeExpanded.value[id] = !treeExpanded.value[id];
}

// expand all groups by default when modal opens
watch(() => props.visible, (v) => {
  if (v && props.groups.length) {
    const expanded = {};
    function walk(nodes) {
      for (const n of nodes) {
        if (n.type === "subGroup") {
          expanded[n.id] = true;
          if (n.children) walk(n.children);
        }
      }
    }
    walk(props.groups);
    treeExpanded.value = expanded;
  }
});

// --- count items recursively ---
function countItems(nodes) {
  let count = 0;
  for (const n of nodes) {
    if (n.type === "item") count++;
    if (n.type === "subGroup" && n.children) count += countItems(n.children);
  }
  return count;
}

// --- actions ---
function onSave() {
  emit("save", draft.value);
}

function handleDownload() {
  emit("download");
}

// --- keyboard shortcut ---
function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
    e.preventDefault();
    onSave();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});

// --- copy JSON ---
const copied = ref(false);
function copyContent() {
  navigator.clipboard?.writeText(draft.value).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card-wide">
      <!-- Header -->
      <header class="modal-header">
        <div class="header-left">
          <div class="modal-kicker">{{ $t('config.kicker') }}</div>
          <h2>{{ $t('config.title') }}</h2>
          <p class="header-path">{{ settingsPath }}</p>
        </div>
        <div class="header-right">
          <!-- Tab switcher -->
          <div class="tab-bar">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'tree' }"
              @click="activeTab = 'tree'"
            >{{ $t('config.treeView') }}</button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'source' }"
              @click="activeTab = 'source'"
            >{{ $t('config.source') }}</button>
          </div>
          <!-- Actions -->
          <n-button secondary size="small" @click="$emit('import-file')">
            <template #icon><Upload :size="14" /></template>
            {{ $t('config.import') }}
          </n-button>
          <n-button secondary size="small" @click="handleDownload">
            <template #icon><Download :size="14" /></template>
            {{ $t('config.download') }}
          </n-button>
          <n-button secondary size="small" @click="$emit('refresh')">
            <template #icon><RotateCcw :size="14" /></template>
            {{ $t('config.refresh') }}
          </n-button>
          <button class="icon-close" @click="$emit('close')">×</button>
        </div>
      </header>

      <!-- Tab: Tree View -->
      <div v-if="activeTab === 'tree'" class="tab-body tree-body">
        <div v-if="!groups.length" class="tree-empty">
          <p>{{ $t('config.emptyTree') }}</p>
        </div>
        <div v-else class="tree-list">
          <template v-for="node in groups" :key="node.id">
            <!-- Group -->
            <div v-if="node.type === 'subGroup'" class="tree-node">
              <div
                class="tree-group-row"
                :style="{ paddingLeft: 0 + 'px' }"
                @click="toggleTreeExpand(node.id)"
              >
                <span class="tree-chev">
                  <ChevronRight v-if="!treeExpanded[node.id]" :size="14" />
                  <component :is="treeExpanded[node.id] ? FolderOpen : Folder" :size="14" v-else />
                </span>
                <span v-if="node.icon" class="tree-icon-emoji">{{ node.icon }}</span>
                <span class="tree-name">{{ node.name }}</span>
                <span class="tree-badge">{{ node.children?.length ?? 0 }}</span>
              </div>
              <!-- Children -->
              <template v-if="treeExpanded[node.id]">
                <template v-for="child in node.children" :key="child.id">
                  <!-- Nested group -->
                  <div v-if="child.type === 'subGroup'" class="tree-node">
                    <div
                      class="tree-group-row nested"
                      @click="toggleTreeExpand(child.id)"
                    >
                      <span class="tree-chev">
                        <ChevronRight v-if="!treeExpanded[child.id]" :size="14" />
                        <component :is="treeExpanded[child.id] ? FolderOpen : Folder" :size="14" v-else />
                      </span>
                      <span v-if="child.icon" class="tree-icon-emoji">{{ child.icon }}</span>
                      <span class="tree-name">{{ child.name }}</span>
                      <span class="tree-badge">{{ child.children?.length ?? 0 }}</span>
                    </div>
                    <template v-if="treeExpanded[child.id]">
                      <div
                        v-for="item in child.children"
                        :key="item.id"
                        v-show="item.type === 'item'"
                        class="tree-item-row deep-nested"
                      >
                        <ItemRow :item="item" />
                      </div>
                    </template>
                  </div>
                  <!-- Item -->
                  <div v-else class="tree-item-row">
                    <ItemRow :item="child" />
                  </div>
                </template>
              </template>
            </div>
            <!-- Root item -->
            <div v-else class="tree-item-row">
              <ItemRow :item="node" />
            </div>
          </template>
        </div>
      </div>

      <!-- Tab: Source Editor -->
      <div v-if="activeTab === 'source'" class="tab-body source-body">
        <div class="source-toolbar">
          <span class="source-info">
            <span class="source-lines">{{ draft.split('\n').length }} {{ $t('config.lines') }}</span>
            <span v-if="jsonValid === true" class="json-badge valid">
              <Check :size="12" />{{ $t('config.jsonValid') }}
            </span>
            <span v-else-if="jsonValid === false" class="json-badge invalid">
              <X :size="12" />{{ $t('config.jsonInvalid') }}
            </span>
          </span>
          <n-button text size="tiny" @click="copyContent">
            <template #icon><Check v-if="copied" :size="12" color="#22c55e" /><Copy v-else :size="12" /></template>
            {{ copied ? $t('detail.copySuccess') : $t('detail.copy') }}
          </n-button>
        </div>
        <textarea
          v-model="draft"
          class="json-editor"
          spellcheck="false"
          placeholder="{ ... }"
        ></textarea>
      </div>

      <!-- Status -->
      <div v-if="error" class="status-bar error">{{ error }}</div>
      <div v-else-if="statusMessage" class="status-bar success">{{ statusMessage }}</div>

      <!-- Footer -->
      <div class="modal-footer">
        <span class="footer-hint">⌘S / Ctrl+S</span>
        <div class="footer-right">
          <n-button secondary size="small" @click="$emit('close')">{{ $t('config.cancel') }}</n-button>
          <n-button type="primary" size="small" @click="onSave">{{ $t('config.save') }}</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Recursive helper component for item rows -->
<script>
export const ItemRow = {
  props: { item: { type: Object, required: true } },
  setup(props) {
    const avatar = computed(() => providerAvatar(props.item.provider));
    return { avatar };
  },
  template: `
    <span class="tree-chev placeholder"></span>
    <span class="provider-badge-tree" :class="'badge-' + (item.switch ? 'active' : 'inactive')">
      <img v-if="item.icon" class="provider-icon-tree" :src="item.icon" :alt="item.provider" />
      <span v-else class="provider-avatar-tree" :style="{ background: avatar.color }">{{ avatar.letter }}</span>
    </span>
    <span class="tree-name">{{ item.name }}</span>
    <span class="tree-provider-tag">{{ item.provider }}</span>
    <span class="status-dot" :class="item.switch === true ? 'ok' : item.switch === false ? 'off' : 'warn'" />
  `
};
</script>

<style scoped>
/* ===== Header ===== */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-18);
  padding: var(--space-20) var(--space-24) var(--space-14);
  border-bottom: 1px solid var(--divider);
  flex-wrap: wrap;
}

.header-left {
  min-width: 0;
}

.header-left h2 {
  margin: var(--space-2) 0 var(--space-4);
  font-size: 18px;
  color: var(--text-primary);
}

.header-path {
  margin: 0;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 340px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  flex-wrap: wrap;
}

/* ===== Tab bar ===== */
.tab-bar {
  display: flex;
  border-radius: var(--radius-8);
  background: rgba(0, 0, 0, 0.06);
  padding: var(--space-2);
}

.tab-btn {
  border: none;
  background: transparent;
  padding: var(--space-4) var(--space-12);
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-6);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 140ms ease;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
}

/* ===== Tab body shared ===== */
.tab-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* ===== Tree View ===== */
.tree-body {
  padding: var(--space-12) var(--space-24);
}

.tree-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tree-group-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-10);
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  transition: background-color 120ms ease;
}

.tree-group-row:hover {
  background: rgba(0, 0, 0, 0.05);
}

.tree-group-row.nested {
  padding-left: 28px;
}

.tree-chev {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.tree-chev.placeholder {
  visibility: hidden;
}

.tree-icon-emoji {
  width: 18px;
  text-align: center;
  font-size: 13px;
  flex-shrink: 0;
}

.tree-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  padding: var(--space-1) 7px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.06);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.tree-item-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-10);
  font-size: 13px;
  color: var(--text-primary);
}

.tree-item-row.deep-nested {
  padding-left: 48px;
}

.tree-item-row .tree-name {
  font-weight: 500;
}

.tree-provider-tag {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* provider badge in tree */
.provider-badge-tree {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-5);
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.55);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.provider-icon-tree {
  width: 13px;
  height: 13px;
  object-fit: contain;
  border-radius: var(--radius-2);
}

.provider-avatar-tree {
  width: 13px;
  height: 13px;
  border-radius: var(--radius-2);
  display: grid;
  place-items: center;
  font-size: 8px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

/* ===== Source View ===== */
.source-body {
  display: flex;
  flex-direction: column;
  padding: var(--space-12) var(--space-24);
  gap: var(--space-8);
}

.source-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.source-info {
  display: flex;
  align-items: center;
  gap: var(--space-10);
  font-size: 11px;
}

.source-lines {
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.json-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-8);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}

.json-badge.valid {
  background: rgba(52, 199, 89, 0.12);
  color: #1d7d3a;
}

.json-badge.invalid {
  background: rgba(197, 48, 42, 0.1);
  color: #c5302a;
}

.json-editor {
  flex: 1;
  min-height: 380px;
  padding: var(--space-16);
  border: 1px solid var(--divider);
  border-radius: var(--radius-14);
  font-family: ui-monospace, "SF Mono", Menlo, "Cascadia Code", monospace;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.02);
  resize: vertical;
  outline: none;
  tab-size: 2;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.json-editor:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.12);
}

.json-editor::placeholder {
  color: var(--text-tertiary);
}

/* ===== Status bar ===== */
.status-bar {
  margin: 0 var(--space-24);
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-10);
  font-size: 12px;
  line-height: 1.4;
}

.status-bar.error {
  color: #c5302a;
  background: rgba(197, 48, 42, 0.08);
  border: 1px solid rgba(197, 48, 42, 0.18);
}

.status-bar.success {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid var(--divider);
}

/* ===== Footer ===== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-10);
  padding: var(--space-8) var(--space-24) var(--space-16);
  margin-top: var(--space-8);
}

.footer-hint {
  font-size: 11px;
  color: var(--text-tertiary);
}

.footer-right {
  display: flex;
  gap: var(--space-10);
}
</style>

<style>
html[data-theme="dark"] .tab-bar {
  background: rgba(255, 255, 255, 0.08);
}

html[data-theme="dark"] .tab-btn.active {
  background: rgba(255, 255, 255, 0.12);
}

html[data-theme="dark"] .tree-group-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

html[data-theme="dark"] .json-editor {
  background: rgba(255, 255, 255, 0.03);
}

html[data-theme="dark"] .json-editor:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.18);
}

html[data-theme="dark"] .json-badge.valid {
  background: rgba(52, 199, 89, 0.18);
  color: #6dd494;
}

html[data-theme="dark"] .json-badge.invalid {
  background: rgba(255, 105, 97, 0.16);
  color: #ff6961;
}

html[data-theme="dark"] .status-bar.success {
  background: rgba(255, 255, 255, 0.04);
}

html[data-theme="dark"] .status-bar.error {
  background: rgba(255, 105, 97, 0.12);
  border-color: rgba(255, 105, 97, 0.22);
  color: #ff6961;
}

html[data-theme="dark"] .provider-badge-tree {
  background: rgba(255, 255, 255, 0.08);
}
</style>
