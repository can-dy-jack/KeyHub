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
          <div class="modal-kicker">{{ $t('deleteConfirm.kicker') }}</div>
          <h2>{{ $t('deleteConfirm.title', { name: target?.name }) }}</h2>
          <p v-if="target?.type === 'subGroup'">{{ $t('deleteConfirm.groupWarning') }}</p>
          <p v-else>{{ $t('deleteConfirm.itemWarning') }}</p>
        </div>
      </header>
      <div class="modal-footer" style="padding: 0 24px 22px">
        <n-button secondary size="small" @click="$emit('cancel')">{{ $t('deleteConfirm.cancel') }}</n-button>
        <n-button type="error" size="small" @click="$emit('confirm')">{{ $t('deleteConfirm.confirm') }}</n-button>
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
