<script setup>
import { ref, watch } from "vue";
import { NButton } from "naive-ui";

const props = defineProps({
  visible: { type: Boolean, default: false },
  content: { type: String, default: "" },
  error: { type: String, default: "" },
  statusMessage: { type: String, default: "" },
  settingsPath: { type: String, default: "" },
});

const emit = defineEmits(["close", "save", "import-file", "refresh"]);

const draft = ref("");

watch(() => props.visible, (v) => {
  if (v) draft.value = props.content;
});

function onSave() {
  emit("save", draft.value);
}
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card-wide">
      <header class="modal-header">
        <div>
          <div class="modal-kicker">配置文件</div>
          <h2>settings.json</h2>
          <p>{{ settingsPath }}</p>
        </div>
        <div class="config-actions no-drag">
          <n-button secondary size="small" @click="$emit('import-file')">导入</n-button>
          <n-button secondary size="small" @click="$emit('refresh')">刷新</n-button>
        </div>
      </header>

      <div class="config-note">
        直接编辑 JSON 前请留意解析问题。格式错误时不会写入 settings.json。
      </div>

      <textarea
        v-model="draft"
        class="json-editor"
        spellcheck="false"
        rows="22"
      ></textarea>

      <div v-if="error" class="error-note">{{ error }}</div>
      <div v-else class="status-note">{{ statusMessage }}</div>

      <div class="modal-footer">
        <n-button secondary size="small" @click="$emit('close')">取消</n-button>
        <n-button type="primary" size="small" @click="onSave">保存到配置文件</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-note {
  margin: 0 24px 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid var(--divider);
}

.json-editor {
  margin: 0 24px 12px;
  min-height: 420px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
  resize: vertical;
  line-height: 1.45;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>
