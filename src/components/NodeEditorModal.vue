<script setup>
import { computed, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NCollapse, NCollapseItem, NInput, NSwitch, NTreeSelect } from "naive-ui";
import { useDataConfig, resolveProviderIcon } from "../composables/useDataConfig.js";
import { buildTreeOptions, createEmptyNodeForm, fieldToArray } from "../utils/helpers.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: "create" },
  kind: { type: String, default: "subGroup" },
  targetId: { type: String, default: null },
  parentId: { type: String, default: null },
  title: { type: String, default: "" },
  node: { type: Object, default: null },
  groups: { type: Array, default: () => [] },
  settingsPath: { type: String, default: "" },
});

const emit = defineEmits(["close", "save"]);

const { t } = useI18n();
const { findNode, getParentGroupId } = useDataConfig();

const form = reactive(createEmptyNodeForm());

// ---- 图标：跟随供应商自动填充 ----
let lastAutoIcon = "";

watch(() => form.provider, (prov) => {
  if (!prov || form.kind !== "item") return;
  const autoIcon = resolveProviderIcon(prov, form.website);
  if (!form.icon || form.icon === lastAutoIcon) {
    form.icon = autoIcon;
    lastAutoIcon = autoIcon;
  }
});

// 头像预览
const avatarPreview = computed(() => {
  if (form.icon) return { type: "image", src: form.icon };
  const name = form.name || (props.node?.name ?? "");
  const provider = form.provider || (props.node?.provider ?? "");
  const label = provider || name || "?";
  return { type: "letter", letter: label.charAt(0).toUpperCase() };
});

function populateForm() {
  Object.assign(form, createEmptyNodeForm(props.kind));

  if (props.node) {
    form.kind = props.node.type;
    form.name = props.node.name ?? "";
    form.icon = props.node.icon ?? "";
    form.targetGroupId = getParentGroupId(props.node.id) ?? null;
    lastAutoIcon = form.icon;

    if (props.node.type === "item") {
      form.description = props.node.description ?? "";
      form.provider = props.node.provider ?? "";
      form.website = props.node.website ?? "";
      form.api_keys = fieldToArray(props.node.api_keys);
      form.api_urls = fieldToArray(props.node.api_urls);
      form.models = fieldToArray(props.node.models);
      form.switch = props.node.switch ?? true;
      // 高级配置
      form.balance_url = props.node.balance_url ?? "";
      form.balance_amount_path = props.node.balance_amount_path ?? "";
      form.balance_unit_path = props.node.balance_unit_path ?? "";
      form.usage_url = props.node.usage_url ?? "";
      form.usage_path = props.node.usage_path ?? "";
    }
  } else if (props.parentId) {
    // 创建模式：预填父分组
    form.targetGroupId = props.parentId;
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

function normalizeIconPath(icon) {
  if (!icon) return icon;
  // 已经是绝对路径或完整 URL，不处理
  if (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/") || icon.startsWith("data:")) {
    return icon;
  }
  // 相对路径：自动补上 /provider/
  return `/provider/${icon}`;
}

function onSubmit() {
  const data = { ...form };
  data.icon = normalizeIconPath(data.icon);
  emit("save", data);
}
</script>

<template>
  <div v-if="visible" class="editor-pane">
    <div class="editor-scroll">
      <div class="editor-header">
        <div>
          <div class="modal-kicker">{{ $t('editor.kicker') }}</div>
          <h2>{{ title }}</h2>
          <p v-if="mode === 'edit'">{{ t('editor.willWriteTo', { path: settingsPath }) }}</p>
        </div>
      </div>

      <form class="editor-form" @submit.prevent="onSubmit">
        <!-- 图标预览 + 输入（顶部，名称上面） -->
        <div class="icon-preview-row">
          <div class="icon-preview">
            <img v-if="avatarPreview.type === 'image'" class="icon-preview-img" :src="avatarPreview.src" :alt="form.name || 'icon'" />
            <span v-else class="icon-preview-letter">{{ avatarPreview.letter }}</span>
          </div>
          <label class="form-field icon-field">
            <span>{{ $t('editor.icon') }}</span>
            <n-input v-model:value="form.icon" :placeholder="$t('editor.iconPlaceholder')" />
          </label>
        </div>

        <div class="form-grid">
          <!-- 名称 + 状态开关（同行） -->
          <label class="form-field" :class="{ 'full-width': form.kind !== 'item' }">
            <span>{{ $t('editor.name') }}</span>
            <n-input v-model:value="form.name" required />
          </label>
          <label v-if="form.kind === 'item'" class="form-field form-field-switch">
            <span>{{ $t('editor.active') }}</span>
            <n-switch v-model:value="form.switch" />
          </label>

          <label class="form-field full-width">
            <span>{{ $t('editor.targetGroup') }}</span>
            <n-tree-select
              v-model:value="form.targetGroupId"
              :options="treeSelectOptions"
              :placeholder="$t('editor.rootPlaceholder')"
              clearable
              :default-expand-all="true"
            />
          </label>

          <template v-if="form.kind === 'item'">
            <label class="form-field full-width">
              <span>{{ $t('editor.provider') }}</span>
              <n-input v-model:value="form.provider" required />
            </label>

            <label class="form-field full-width">
              <span>{{ $t('editor.websiteOptional') }}</span>
              <n-input v-model:value="form.website" :placeholder="$t('editor.websitePlaceholder')" />
            </label>

            <label class="form-field full-width">
              <span>{{ $t('editor.description') }}</span>
              <n-input v-model:value="form.description" type="textarea" rows="3" :placeholder="$t('editor.descriptionPlaceholder')" />
            </label>

            <label class="form-field full-width">
              <span>{{ $t('editor.apiKeys') }}</span>
              <div v-for="(_, idx) in form.api_keys" :key="idx" class="multi-input-row">
                <n-input v-model:value="form.api_keys[idx]" :placeholder="$t('editor.apiKeyPlaceholder')" />
                <n-button
                  v-if="form.api_keys.length > 1"
                  text
                  size="tiny"
                  type="error"
                  @click="form.api_keys.splice(idx, 1)"
                >✕</n-button>
              </div>
              <n-button dashed size="tiny" @click="form.api_keys.push('')">{{ $t('editor.addField') }}</n-button>
            </label>

            <label class="form-field full-width">
              <span>{{ $t('editor.apiUrls') }}</span>
              <div v-for="(_, idx) in form.api_urls" :key="idx" class="multi-input-row">
                <n-input v-model:value="form.api_urls[idx]" :placeholder="$t('editor.apiUrlPlaceholder')" />
                <n-button
                  v-if="form.api_urls.length > 1"
                  text
                  size="tiny"
                  type="error"
                  @click="form.api_urls.splice(idx, 1)"
                >✕</n-button>
              </div>
              <n-button dashed size="tiny" @click="form.api_urls.push('')">{{ $t('editor.addField') }}</n-button>
            </label>

            <label class="form-field full-width">
              <span>{{ $t('editor.models') }}</span>
              <div v-for="(_, idx) in form.models" :key="idx" class="multi-input-row">
                <n-input v-model:value="form.models[idx]" :placeholder="$t('editor.modelPlaceholder')" />
                <n-button
                  v-if="form.models.length > 1"
                  text
                  size="tiny"
                  type="error"
                  @click="form.models.splice(idx, 1)"
                >✕</n-button>
              </div>
              <n-button dashed size="tiny" @click="form.models.push('')">{{ $t('editor.addField') }}</n-button>
            </label>

            <!-- 高级配置（可收起，默认收起） -->
            <div class="advanced-section full-width">
              <n-collapse :default-expanded-names="[]">
                <n-collapse-item :title="$t('editor.advanced')" name="advanced">
                  <p class="path-note">{{ $t('editor.pathNote') }}</p>

                  <div class="advanced-grid">
                  <div class="advanced-group">
                    <label class="form-field full-width">
                      <span>{{ $t('editor.balanceUrl') }}</span>
                      <n-input v-model:value="form.balance_url" :placeholder="$t('editor.balanceUrlPlaceholder')" />
                    </label>

                    <label class="form-field">
                      <span>{{ $t('editor.balanceAmountPath') }}</span>
                      <n-input v-model:value="form.balance_amount_path" :placeholder="$t('editor.balanceAmountPathPlaceholder')" />
                    </label>

                    <label class="form-field">
                      <span>{{ $t('editor.balanceUnitPath') }}</span>
                      <n-input v-model:value="form.balance_unit_path" :placeholder="$t('editor.balanceUnitPathPlaceholder')" />
                    </label>
                  </div>

                  <div class="advanced-group">
                    <label class="form-field full-width">
                      <span>{{ $t('editor.usageUrl') }}</span>
                      <n-input v-model:value="form.usage_url" :placeholder="$t('editor.usageUrlPlaceholder')" />
                    </label>

                    <label class="form-field full-width">
                      <span>{{ $t('editor.usagePath') }}</span>
                      <n-input v-model:value="form.usage_path" :placeholder="$t('editor.usagePathPlaceholder')" />
                    </label>
                  </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </div>
          </template>
        </div>
      </form>
    </div>
    <div class="editor-footer">
      <n-button secondary size="small" @click="$emit('close')">{{ $t('editor.cancel') }}</n-button>
      <n-button type="primary" size="small" @click="onSubmit">{{ $t('editor.save') }}</n-button>
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

/* 图标预览（顶部） */
.icon-preview-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--divider);
}

.icon-preview {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.icon-preview-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
}

.icon-preview-letter {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.icon-field {
  flex: 1;
  min-width: 0;
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

.form-field-switch {
  justify-content: flex-end;
  align-items: flex-start;
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

/* ---- 高级配置 ---- */
.advanced-section {
  margin-top: 4px;
  width: 100%;
  grid-column: 1 / -1;
}

.advanced-section .path-note {
  margin: 0 0 14px;
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.advanced-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.advanced-group {
  padding: 14px;
  border-left: 3px solid var(--divider);
  border-radius: 0 8px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.advanced-group + .advanced-group {
  margin-top: 8px;
}
</style>

<style>
html[data-theme="dark"] .editor-footer {
  background: rgba(40, 40, 42, 0.6);
}
</style>
