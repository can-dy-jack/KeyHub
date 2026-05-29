<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { darkTheme, NConfigProvider, NMessageProvider } from "naive-ui";
import AppSidebar from "./components/AppSidebar.vue";
import AppTopBar from "./components/AppTopBar.vue";
import KeyDetail from "./components/KeyDetail.vue";
import NodeEditorModal from "./components/NodeEditorModal.vue";
import ConfigEditorModal from "./components/ConfigEditorModal.vue";
import DeleteConfirmModal from "./components/DeleteConfirmModal.vue";
import { useDataConfig } from "./composables/useDataConfig.js";
import { useTheme } from "./composables/useTheme.js";
import { useLocale } from "./composables/useLocale.js";

// --- 主题 ---
const { themeMode, isDark, themeOverrides, setThemeMode } = useTheme();

// --- 国际化 ---
const { t } = useI18n();
const { setLocale, naiveLocale, naiveDateLocale } = useLocale();

// --- 数据 ---
const {
  groups,
  lastError,
  lastSaveMessage,
  settingsPath,
  loadConfig,
  saveConfig,
  importConfigText,
  exportConfigText,
  findNode,
  firstItem,
  getParentGroupId,
  addRootNode,
  addChildGroup,
  updateNode,
  deleteNode,
  buildNodeFromForm,
} = useDataConfig();

// --- 侧边栏 ---
const sidebarCollapsed = ref(false);

// --- 选择 & 导航 ---
const selectedItemId = ref(null);
const dataVersion = ref(0);
const selectedItem = computed(() => {
  void dataVersion.value;
  return findNode(selectedItemId.value);
});

const flatItems = computed(() => {
  const items = [];
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === "item") items.push(node);
      if (node.children) walk(node.children);
    }
  }
  walk(groups.value);
  return items;
});

const currentItemIndex = computed(() => {
  if (!selectedItemId.value) return -1;
  return flatItems.value.findIndex((item) => item.id === selectedItemId.value);
});

function navigateToPrev() {
  if (currentItemIndex.value > 0) {
    selectedItemId.value = flatItems.value[currentItemIndex.value - 1].id;
  }
}

function navigateToNext() {
  if (currentItemIndex.value < flatItems.value.length - 1) {
    selectedItemId.value = flatItems.value[currentItemIndex.value + 1].id;
  }
}

// --- 顶部栏信息 ---
const totalItems = computed(() => flatItems.value.length);
const activeItems = computed(() => flatItems.value.filter((i) => i.switch).length);
const shellTitle = computed(() => t("app.keysCount", { count: totalItems.value }));
const shellSubtitle = computed(() => t("app.availableCount", { count: activeItems.value }));

// --- 节点编辑器 ---
const nodeEditorOpen = ref(false);
const nodeEditorMode = ref("create");
const nodeEditorKind = ref("subGroup");
const nodeEditorTargetId = ref(null);
const nodeEditorTitle = ref("");
const nodeEditorNode = ref(null);

function openNodeEditor({ mode, kind, title, targetId = null, parentId = null, node = null }) {
  nodeEditorMode.value = mode;
  nodeEditorKind.value = kind;
  nodeEditorTargetId.value = targetId;
  nodeEditorTitle.value = title;
  nodeEditorNode.value = node;
  nodeEditorOpen.value = true;
}

function closeNodeEditor() {
  nodeEditorOpen.value = false;
}

function handleNodeEditorSave(formData) {
  const existingNode = nodeEditorMode.value === "edit" && nodeEditorTargetId.value ? findNode(nodeEditorTargetId.value) : null;
  const nextNode = buildNodeFromForm(formData, existingNode);
  const targetGroupId = formData.targetGroupId || null;

  if (nodeEditorMode.value === "edit") {
    const currentParentId = getParentGroupId(nextNode.id);
    if (targetGroupId !== currentParentId) {
      deleteNode(nextNode.id);
      if (targetGroupId) {
        addChildGroup(targetGroupId, nextNode);
      } else {
        addRootNode(nextNode);
      }
    } else {
      updateNode(nextNode);
    }
    if (selectedItemId.value === nextNode.id) {
      selectedItemId.value = nextNode.id;
    }
  } else {
    if (targetGroupId) {
      addChildGroup(targetGroupId, nextNode);
    } else {
      addRootNode(nextNode);
    }
  }

  if (nextNode.type === "item") {
    selectedItemId.value = nextNode.id;
  }

  saveConfig();
  closeNodeEditor();
}

function openCreateRootGroup() {
  openNodeEditor({ mode: "create", kind: "subGroup", title: t("actions.addGroup") });
}

function openCreateChildGroup(parentGroupId) {
  openNodeEditor({ mode: "create", kind: "subGroup", title: t("actions.addChildGroup"), parentId: parentGroupId });
}

function openCreateChildItem(parentGroupId) {
  openNodeEditor({ mode: "create", kind: "item", title: t("actions.addItem"), parentId: parentGroupId });
}

function openCreateItem(targetId = selectedItemId.value) {
  const parentId = targetId ? getParentGroupId(targetId) : null;
  openNodeEditor({ mode: "create", kind: "item", title: t("actions.addItem"), parentId });
}

function openEditNode(nodeId) {
  const node = findNode(nodeId);
  if (!node) return;
  openNodeEditor({
    mode: "edit",
    kind: node.type,
    title: node.type === "subGroup" ? t("actions.editGroup") : t("actions.editItem"),
    targetId: node.id,
    parentId: getParentGroupId(node.id),
    node,
  });
}

// --- 删除 ---
const deleteConfirmOpen = ref(false);
const deleteTarget = ref(null);

function requestDelete(nodeId) {
  const node = findNode(nodeId);
  if (!node) return;
  deleteTarget.value = { id: nodeId, name: node.name, type: node.type };
  deleteConfirmOpen.value = true;
}

function confirmDelete() {
  if (!deleteTarget.value) return;
  const { id } = deleteTarget.value;
  deleteNode(id);
  if (selectedItemId.value === id) refreshSelection();
  saveConfig();
  deleteConfirmOpen.value = false;
  deleteTarget.value = null;
}

function cancelDelete() {
  deleteConfirmOpen.value = false;
  deleteTarget.value = null;
}

// --- 侧边栏操作 ---
function handleSidebarAction(payload) {
  const nodeId = payload?.nodeId;
  if (payload?.type === "edit") { openEditNode(nodeId); return; }
  if (payload?.type === "add-child-item") { openCreateChildItem(nodeId); return; }
  if (payload?.type === "add-child-group") { openCreateChildGroup(nodeId); return; }
  if (payload?.type === "delete") { requestDelete(nodeId); }
}

// --- 配置编辑器 ---
const configEditorOpen = ref(false);
const configDraftError = ref("");
const importInput = ref(null);

function openConfigEditor() {
  configDraftError.value = "";
  configEditorOpen.value = true;
}

function closeConfigEditor() {
  configEditorOpen.value = false;
}

function handleConfigSave(content) {
  try {
    importConfigText(content);
    configDraftError.value = "";
    refreshSelection();
    configEditorOpen.value = false;
  } catch (error) {
    configDraftError.value = error instanceof Error ? error.message : String(error);
  }
}

function triggerImport() {
  importInput.value?.click();
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const text = await file.text();
    handleConfigSave(text);
  } catch (error) {
    configDraftError.value = error instanceof Error ? error.message : String(error);
  }
}

// --- 详情操作 ---
function copyValue(value) {
  const text = Array.isArray(value) ? value.join("\n") : String(value ?? "");
  navigator.clipboard?.writeText(text).catch(() => {
    window.prompt(t("app.copyPrompt"), text);
  });
}

function revealValue(value) {
  window.prompt(t("app.revealPrompt"), Array.isArray(value) ? value.join("\n") : String(value ?? ""));
}

function handleSelect(id) { selectedItemId.value = id; }

function handleUpdateItemData({ id, balance_data, usage_data }) {
  const node = findNode(id);
  if (!node) return;
  if (balance_data !== undefined) node.balance_data = balance_data;
  if (usage_data !== undefined) node.usage_data = usage_data;
  dataVersion.value++;
  saveConfig();
}

function handleDetailAddItem() { openCreateItem(selectedItemId.value); }
function handleDetailEditItem() { if (selectedItemId.value) openEditNode(selectedItemId.value); }
function handleDetailDeleteItem() { requestDelete(selectedItemId.value); }

function refreshSelection() {
  selectedItemId.value = firstItem()?.id ?? null;
}

// --- 生命周期 ---
onMounted(async () => {
  await loadConfig();
  refreshSelection();
});
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="themeOverrides" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <n-message-provider>
    <div class="app-shell">
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :groups="groups"
        :selected-id="selectedItemId"
        @select="handleSelect"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
        @add-group="openCreateRootGroup"
        @node-action="handleSidebarAction"
      />

      <div class="panes">
        <AppTopBar
          :collapsed="sidebarCollapsed"
          :title="shellTitle"
          :subtitle="shellSubtitle"
          :theme-mode="themeMode"
          @toggle="sidebarCollapsed = !sidebarCollapsed"
          @open-config="openConfigEditor"
          @update-theme="setThemeMode"
        />

        <div class="pane key-detail-pane">
          <NodeEditorModal
            v-if="nodeEditorOpen"
            :visible="nodeEditorOpen"
            :mode="nodeEditorMode"
            :kind="nodeEditorKind"
            :target-id="nodeEditorTargetId"
            :title="nodeEditorTitle"
            :node="nodeEditorNode"
            :groups="groups"
            :settings-path="settingsPath"
            @close="closeNodeEditor"
            @save="handleNodeEditorSave"
          />

          <KeyDetail
            v-else
            :item="selectedItem"
            :has-prev="currentItemIndex > 0"
            :has-next="currentItemIndex < flatItems.length - 1"
            @add-item="handleDetailAddItem"
            @edit-item="handleDetailEditItem"
            @delete-item="handleDetailDeleteItem"
            @copy-field="copyValue"
            @reveal-field="revealValue"
            @update-item-data="handleUpdateItemData"
            @prev-item="navigateToPrev"
            @next-item="navigateToNext"
          />
        </div>
      </div>

      <ConfigEditorModal
        :visible="configEditorOpen"
        :content="exportConfigText()"
        :error="configDraftError"
        :status-message="lastSaveMessage || lastError"
        :settings-path="settingsPath"
        @close="closeConfigEditor"
        @save="handleConfigSave"
        @import-file="triggerImport"
        @refresh="openConfigEditor"
      />

      <DeleteConfirmModal
        :visible="deleteConfirmOpen"
        :target="deleteTarget"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />

      <input
        ref="importInput"
        class="hidden-input"
        type="file"
        accept="application/json,.json"
        @change="handleImportFile"
      />
    </div>
    </n-message-provider>
  </n-config-provider>
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
  --scrollbar-thumb: rgba(0, 0, 0, 0.16);
  --scrollbar-thumb-hover: rgba(0, 0, 0, 0.28);
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
}

.n-config-provider {
  height: 100%;
}

* {
  box-sizing: border-box;
}

body {
  overflow: hidden;
}

button,
input,
textarea,
select {
  font: inherit;
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
  background: rgba(255, 255, 255, 0.18);
}

/* --- shared modal styles --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(16, 16, 18, 0.28);
  backdrop-filter: blur(16px);
}

.modal-card {
  width: min(720px, 100%);
  max-height: min(88vh, 900px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid var(--divider);
  background: rgba(250, 250, 252, 0.78);
}

.modal-card-wide {
  width: min(920px, 100%);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px 14px;
  border-bottom: 1px solid var(--divider);
}

.modal-header h2 {
  margin: 2px 0 4px;
  font-size: 18px;
  color: var(--text-primary);
}

.modal-header p,
.modal-kicker {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.modal-kicker {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 700;
}

.status-note,
.error-note {
  margin: 0 24px 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-note {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid var(--divider);
}

.error-note {
  color: #c5302a;
  background: rgba(197, 48, 42, 0.08);
  border: 1px solid rgba(197, 48, 42, 0.22);
}

.icon-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

/* --- dark theme overrides --- */
html[data-theme="dark"] {
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
  --scrollbar-thumb: rgba(255, 255, 255, 0.18);
  --scrollbar-thumb-hover: rgba(255, 255, 255, 0.32);
  --accent-soft: rgba(240, 180, 0, 0.3);
}

html[data-theme="dark"] .key-detail-pane {
  background: rgba(40, 40, 42, 0.25);
}

html[data-theme="dark"] .modal-card {
  background: rgba(32, 32, 34, 0.82);
}

html[data-theme="dark"] .icon-close {
  color: var(--text-primary);
}

/* ===== Custom Scrollbar ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--scrollbar-thumb);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

</style>
