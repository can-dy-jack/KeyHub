<script setup>
import { computed } from "vue";
import { NButton } from "naive-ui";
import ViewIcon from "../icons/View.vue";
import CopyIcon from "../icons/Copy.vue";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "@lucide/vue";
import { providerAvatar } from "../composables/useDataConfig.js";

const props = defineProps({
  item: { type: Object, default: null },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
});

defineEmits(["add-item", "edit-item", "delete-item", "copy-field", "reveal-field", "prev-item", "next-item"]);

function toArr(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

const apiKeys = computed(() => toArr(props.item?.api_keys));
const apiUrls = computed(() => toArr(props.item?.api_urls));
const models = computed(() => toArr(props.item?.models));
const avatar = computed(() => providerAvatar(props.item?.provider));
</script>

<template>
  <div class="detail">
    <div v-if="item" class="detail-scroll">
      <div class="header">
        <div class="icon-hero">
          <img v-if="item.icon" class="icon-image" :src="item.icon" :alt="item.provider || item.name" />
          <span v-else class="provider-avatar-hero" :style="{ background: avatar.color }">{{ avatar.letter }}</span>
        </div>
        <div class="meta-line">{{ item.provider }}</div>
        <h1 class="title">{{ item.name }}</h1>
        <div class="badges">
          <span class="badge" :class="`badge-${item.switch ? 'active' : 'inactive'}`">
            <span class="badge-dot" />
            {{ item.switch ? 'active' : 'inactive' }}
          </span>
        </div>
      </div>

      <section v-if="item.description" class="field">
        <p class="value note">{{ item.description }}</p>
      </section>

      <section v-if="item.website" class="field">
        <label>Website</label>
        <div class="value mono row-line">
          <a class="link" :href="item.website" target="_blank" rel="noreferrer">{{ item.website }}</a>
          <n-button text size="tiny" @click="$emit('copy-field', item.website)">
            <template #icon>
              <CopyIcon :size="12" />
            </template>
            Copy
          </n-button>
        </div>
      </section>

      <section v-if="apiUrls.length" class="field">
        <label>API URL{{ apiUrls.length > 1 ? "s" : "" }}</label>
        <div v-for="(u, i) in apiUrls" :key="i" class="value mono row-line">
          <span>{{ u }}</span>
          <n-button text size="tiny" @click="$emit('copy-field', u)">
            <template #icon>
              <CopyIcon :size="12" />
            </template>
            Copy
          </n-button>
        </div>
      </section>

      <section v-if="apiKeys.length" class="field">
        <label>API Key{{ apiKeys.length > 1 ? "s" : "" }}</label>
        <div v-for="(k, i) in apiKeys" :key="i" class="value mono row-line">
          <span>{{ k }}</span>
          <n-button text size="tiny" @click="$emit('copy-field', k)">
            <template #icon>
              <CopyIcon :size="12" />
            </template>
            Copy
          </n-button>
          <n-button text size="tiny" @click="$emit('reveal-field', k)">
            <template #icon>
              <ViewIcon :size="12" />
            </template>
            Reveal
          </n-button>
        </div>
      </section>

      <section v-if="models.length" class="field">
        <label>Models</label>
        <div class="chips">
          <span v-for="(m, i) in models" :key="i" class="chip">{{ m }}</span>
        </div>
      </section>
    </div>

    <div v-else class="empty">
      <div class="empty-mark">⌘</div>
      <p>No Item Selected</p>
      <n-button type="primary" size="small" @click="$emit('add-item')">
        <template #icon>
          <Plus :size="13" />
        </template>
        Add Item
      </n-button>
    </div>

    <div v-if="item" class="detail-footer">
      <div class="footer-nav">
        <n-button quaternary size="small" :disabled="!hasPrev" @click="$emit('prev-item')">
          <template #icon>
            <ChevronLeft :size="16" />
          </template>
        </n-button>
        <n-button quaternary size="small" :disabled="!hasNext" @click="$emit('next-item')">
          <template #icon>
            <ChevronRight :size="16" />
          </template>
        </n-button>
      </div>
      <div class="footer-actions">
        <n-button type="primary" size="small" @click="$emit('add-item')">
          <template #icon>
            <Plus :size="13" />
          </template>
          Add Item
        </n-button>
        <n-button secondary size="small" @click="$emit('edit-item')">
          <template #icon>
            <Pencil :size="13" />
          </template>
          Edit
        </n-button>
        <n-button secondary size="small" type="error" @click="$emit('delete-item')">
          <template #icon>
            <Trash2 :size="13" />
          </template>
          Delete
        </n-button>
      </div>
    </div>
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
  padding: 20px 32px 16px;
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
  margin-bottom: 16px;
}

.icon-hero {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.icon-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.provider-avatar-hero {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
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
  margin-bottom: 12px;
}

.field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.value {
  font-size: 13px;
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--divider);
}

.value + .value {
  margin-top: 4px;
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

.link {
  flex: 1;
  min-width: 0;
  color: var(--text-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link:hover {
  text-decoration: underline;
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

/* Footer bar — fixed at bottom */
.detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid var(--divider);
  flex-shrink: 0;
}

.footer-nav {
  display: flex;
  gap: 4px;
}

.footer-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 13px;
  gap: 12px;
}

.empty-mark {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: var(--text-tertiary);
  font-size: 24px;
}

</style>

<style>
html[data-theme="dark"] .badge-active {
  color: #6dd494;
}
html[data-theme="dark"] .badge-inactive {
  color: #b8b8be;
}
</style>
