<script setup>
import { NButton } from "naive-ui";

defineProps({
  visible: { type: Boolean, default: false },
  target: { type: Object, default: null },
});

defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal-card" style="width: min(400px, 100%)">
      <header class="modal-header">
        <div>
          <div class="modal-kicker">确认删除</div>
          <h2>确定要删除「{{ target?.name }}」吗？</h2>
          <p v-if="target?.type === 'subGroup'">该分组下的所有子分组和条目都将被删除。</p>
          <p v-else>删除后将无法恢复，请确认操作。</p>
        </div>
      </header>
      <div class="modal-footer" style="padding: 0 24px 22px">
        <n-button secondary size="small" @click="$emit('cancel')">取消</n-button>
        <n-button type="error" size="small" @click="$emit('confirm')">确认删除</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
