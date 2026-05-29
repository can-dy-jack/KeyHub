<script setup>
import { computed, reactive, watch } from "vue";
import { NButton, NInput, NSwitch, NTreeSelect } from "naive-ui";
import { useDataConfig } from "../composables/useDataConfig.js";
import { buildTreeOptions, createEmptyNodeForm, fieldToArray } from "../utils/helpers.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: "create" },
  kind: { type: String, default: "subGroup" },
  targetId: { type: String, default: null },
  title: { type: String, default: "" },
  node: { type: Object, default: null },
  groups: { type: Array, default: () => [] },
  settingsPath: { type: String, default: "" },
});

const emit = defineEmits(["close", "save"]);

const { findNode, getParentGroupId } = useDataConfig();

const form = reactive(createEmptyNodeForm());

function populateForm() {
  Object.assign(form, createEmptyNodeForm(props.kind));

  if (props.node) {
    form.kind = props.node.type;
    form.name = props.node.name ?? "";
    form.icon = props.node.icon ?? "";
    form.targetGroupId = getParentGroupId(props.node.id) ?? null;

    if (props.node.type === "item") {
      form.description = props.node.description ?? "";
      form.provider = props.node.provider ?? "";
      form.website = props.node.website ?? "";
      form.api_keys = fieldToArray(props.node.api_keys);
      form.api_urls = fieldToArray(props.node.api_urls);
      form.models = fieldToArray(props.node.models);
      form.switch = props.node.switch ?? true;
    }
  }
}

watch(() => props.visible, (v) => {
  if (v) populateForm();
}, { immediate: true });

const treeSelectOptions = computed(() => {
  if (props.mode === "edit" && props.kind === "subGroup" && props.targetId) {
    const excludeIds = new Set([props.targetId]);
    function collectDescendants(nodeId) {
      const node = findNode(nodeId);
      if (node?.type === "subGroup" && node.children) {
        for (const child of node.children) {
          if (child.type === "subGroup") {
            excludeIds.add(child.id);
            collectDescendants(child.id);
          }
        }
      }
    }
    collectDescendants(props.targetId);
    return buildTreeOptions(props.groups, excludeIds);
  }
  return buildTreeOptions(props.groups);
});

function onSubmit() {
  emit("save", { ...form });
}
</script>

<template>
  <div v-if="visible" class="editor-pane">
    <div class="editor-scroll">
      <div class="editor-header">
        <div>
          <div class="modal-kicker">数据管理</div>
          <h2>{{ title }}</h2>
          <p v-if="mode === 'edit'">编辑后将直接写入 {{ settingsPath }}</p>
        </div>
      </div>

      <form class="editor-form" @submit.prevent="onSubmit">
        <div class="form-grid">
          <label class="form-field">
            <span>名称</span>
            <n-input v-model:value="form.name" required />
          </label>

          <label v-if="form.kind === 'subGroup'" class="form-field">
            <span>图标</span>
            <n-input v-model:value="form.icon" placeholder="可选 emoji 或符号" />
          </label>

          <label class="form-field full-width">
            <span>目标分组</span>
            <n-tree-select
              v-model:value="form.targetGroupId"
              :options="treeSelectOptions"
              placeholder="根目录"
              clearable
              :default-expand-all="true"
            />
          </label>

          <template v-if="form.kind === 'item'">
            <label class="form-field full-width">
              <span>Provider</span>
              <n-input v-model:value="form.provider" required />
            </label>

            <label class="form-field full-width">
              <span>Website (可选)</span>
              <n-input v-model:value="form.website" placeholder="https://example.com" />
            </label>

            <label class="form-field full-width">
              <span>Description</span>
              <n-input v-model:value="form.description" type="textarea" rows="3" placeholder="条目说明" />
            </label>

            <label class="form-field full-width">
              <span>API Keys</span>
              <div v-for="(_, idx) in form.api_keys" :key="idx" class="multi-input-row">
                <n-input v-model:value="form.api_keys[idx]" placeholder="请输入 key" />
                <n-button
                  v-if="form.api_keys.length > 1"
                  text
                  size="tiny"
                  type="error"
                  @click="form.api_keys.splice(idx, 1)"
                >✕</n-button>
              </div>
              <n-button dashed size="tiny" @click="form.api_keys.push('')">+ 添加</n-button>
            </label>

            <label class="form-field full-width">
              <span>API URLs</span>
              <div v-for="(_, idx) in form.api_urls" :key="idx" class="multi-input-row">
                <n-input v-model:value="form.api_urls[idx]" placeholder="请输入 url" />
                <n-button
                  v-if="form.api_urls.length > 1"
                  text
                  size="tiny"
                  type="error"
                  @click="form.api_urls.splice(idx, 1)"
                >✕</n-button>
              </div>
              <n-button dashed size="tiny" @click="form.api_urls.push('')">+ 添加</n-button>
            </label>

            <label class="form-field full-width">
              <span>Models</span>
              <div v-for="(_, idx) in form.models" :key="idx" class="multi-input-row">
                <n-input v-model:value="form.models[idx]" placeholder="请输入 model" />
                <n-button
                  v-if="form.models.length > 1"
                  text
                  size="tiny"
                  type="error"
                  @click="form.models.splice(idx, 1)"
                >✕</n-button>
              </div>
              <n-button dashed size="tiny" @click="form.models.push('')">+ 添加</n-button>
            </label>

            <label class="form-field">
              <span>Active</span>
              <n-switch v-model:value="form.switch" />
            </label>
          </template>
        </div>
      </form>
    </div>
    <div class="editor-footer">
      <n-button secondary size="small" @click="$emit('close')">取消</n-button>
      <n-button type="primary" size="small" @click="onSubmit">保存</n-button>
    </div>
  </div>
</template>

<style scoped>
.editor-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 32px 16px;
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 8px 16px;
  border-top: 1px solid var(--divider);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
}

.editor-header {
  margin-bottom: 14px;
}

.editor-header h2 {
  margin: 2px 0 4px;
  font-size: 24px;
  color: var(--text-primary);
}

.editor-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.editor-form {
  padding: 18px 0 24px;
  overflow: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field span {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.form-field textarea {
  resize: vertical;
  line-height: 1.45;
}

.multi-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.multi-input-row + .multi-input-row {
  margin-top: 6px;
}

.multi-input-row + .n-button {
  margin-top: 6px;
}
</style>

<style>
html[data-theme="dark"] .editor-footer {
  background: rgba(40, 40, 42, 0.6);
}
</style>
