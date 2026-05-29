<script setup>
import { computed } from "vue";
import ViewIcon from "../icons/View.vue";
import CopyIcon from "../icons/Copy.vue";

const props = defineProps({
  item: { type: Object, default: null },
});

function toArr(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

const apiKeys = computed(() => toArr(props.item?.api_keys));
const apiUrls = computed(() => toArr(props.item?.api_urls));
const models = computed(() => toArr(props.item?.models));
</script>

<template>
  <div v-if="item" class="detail">
    <div class="detail-scroll">
      <div class="header">
        <div class="meta-line">{{ item.provider }}</div>
        <h1 class="title">{{ item.name }}</h1>
        <div class="badges">
          <span class="badge" :class="`badge-${item.status}`">
            <span class="badge-dot" />
            {{ item.status }}
          </span>
        </div>
      </div>

      <section v-if="item.description" class="field">
        <p class="value note">{{ item.description }}</p>
      </section>

      <section v-if="apiUrls.length" class="field">
        <label>API URL{{ apiUrls.length > 1 ? "s" : "" }}</label>
        <div v-for="(u, i) in apiUrls" :key="i" class="value mono row-line">
          <span>{{ u }}</span>
          <button class="ghost-btn icon-text" type="button">
            <CopyIcon :size="12" />
            <span>Copy</span>
          </button>
        </div>
      </section>

      <section v-if="apiKeys.length" class="field">
        <label>API Key{{ apiKeys.length > 1 ? "s" : "" }}</label>
        <div v-for="(k, i) in apiKeys" :key="i" class="value mono row-line">
          <span>{{ k }}</span>
          <button class="ghost-btn icon-text" type="button">
            <CopyIcon :size="12" />
            <span>Copy</span>
          </button>
          <button class="ghost-btn icon-text" type="button">
            <ViewIcon :size="12" />
            <span>Reveal</span>
          </button>
        </div>
      </section>

      <section v-if="models.length" class="field">
        <label>Models</label>
        <div class="chips">
          <span v-for="(m, i) in models" :key="i" class="chip">{{ m }}</span>
        </div>
      </section>

      <section class="field actions">
        <button class="primary-btn" type="button">Test Connection</button>
        <button class="ghost-btn" type="button">Edit</button>
        <button class="ghost-btn danger" type="button">Delete</button>
      </section>
    </div>
  </div>

  <div v-else class="empty">
    <div class="empty-mark">⌘</div>
    <p>No Item Selected</p>
  </div>
</template>

<style scoped>
.detail {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 32px 48px 48px;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
}

.detail-scroll::-webkit-scrollbar {
  width: 10px;
}

.detail-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.14);
}

.header {
  margin-bottom: 24px;
}

.meta-line {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.title {
  margin: 0 0 12px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.1);
  color: var(--text-secondary);
  text-transform: capitalize;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.badge-active {
  background: rgba(52, 199, 89, 0.18);
  color: #1d7d3a;
}

.badge-inactive {
  background: rgba(142, 142, 147, 0.22);
  color: #5b5b60;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.value {
  font-size: 13px;
  color: var(--text-primary);
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--divider);
}

.value + .value {
  margin-top: 6px;
}

.mono {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
}

.row-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-line > span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-primary);
  border: 1px solid var(--divider);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.primary-btn,
.ghost-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--divider-strong);
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-primary);
  transition: background-color 120ms ease, filter 120ms ease;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.95);
}

.ghost-btn.danger {
  color: #c5302a;
}

.primary-btn {
  background: var(--accent);
  border-color: transparent;
  color: #1d1300;
}

.primary-btn:hover {
  filter: brightness(0.96);
}

.empty {
  flex: 1;
  display: grid;
  place-items: center;
  color: var(--text-tertiary);
  font-size: 13px;
  gap: 12px;
}

.empty-mark {
  font-size: 42px;
  opacity: 0.4;
}

@media (prefers-color-scheme: dark) {
  .value,
  .chip {
    background: rgba(255, 255, 255, 0.04);
  }
  .primary-btn,
  .ghost-btn {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }
  .ghost-btn:hover {
    background: rgba(255, 255, 255, 0.14);
  }
  .primary-btn {
    background: var(--accent);
    color: #1d1300;
  }
  .badge-active {
    color: #6dd494;
  }
  .badge-inactive {
    color: #b8b8be;
  }
  .ghost-btn.danger {
    color: #ff6961;
  }
}
</style>
