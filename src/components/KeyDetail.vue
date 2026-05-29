<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NCollapse, NCollapseItem, useMessage } from "naive-ui";
import { Check, ChevronLeft, ChevronRight, Copy, Eye, EyeOff, Pencil, Plus, RefreshCw, Trash2 } from "@lucide/vue";
import { providerAvatar } from "../composables/useDataConfig.js";
import { resolveJsonPath } from "../utils/helpers.js";

const props = defineProps({
  item: { type: Object, default: null },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
});

const emit = defineEmits(["add-item", "edit-item", "delete-item", "prev-item", "next-item", "update-item-data"]);

const { t } = useI18n();
const message = useMessage();

function toArr(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

const apiKeys = computed(() => toArr(props.item?.api_keys));
const apiUrls = computed(() => toArr(props.item?.api_urls));
const models = computed(() => toArr(props.item?.models));
const avatar = computed(() => providerAvatar(props.item?.provider));

const hasAdvancedConfig = computed(() => {
  const item = props.item;
  if (!item) return false;
  return !!(item.balance_url || item.balance_amount_path || item.balance_unit_path || item.usage_url || item.usage_path || item.usage_week_path);
});

// --- copy with feedback ---
const copiedFields = ref(new Set());

function copyValue(value) {
  const text = Array.isArray(value) ? value.join("\n") : String(value ?? "");
  navigator.clipboard?.writeText(text).then(
    () => {
      const key = text;
      copiedFields.value.add(key);
      message.success(t("detail.copySuccess"));
      setTimeout(() => {
        copiedFields.value.delete(key);
      }, 2000);
    },
    () => {
      window.prompt(t("app.copyPrompt"), text);
    },
  );
}

function isCopied(value) {
  const text = Array.isArray(value) ? value.join("\n") : String(value ?? "");
  return copiedFields.value.has(text);
}

// --- key mask / reveal ---
const revealedKeys = ref(new Set());

function maskKey(value) {
  const text = String(value ?? "");
  if (text.length <= 8) return "*".repeat(text.length);
  return text.slice(0, 4) + "*".repeat(text.length - 8) + text.slice(-4);
}

function toggleReveal(key) {
  if (revealedKeys.value.has(key)) {
    revealedKeys.value.delete(key);
  } else {
    revealedKeys.value.add(key);
  }
}

function isRevealed(key) {
  return revealedKeys.value.has(key);
}

// --- fetch balance / usage ---
const fetchingBalance = ref(false);
const fetchingUsage = ref(false);

const authHeaders = computed(() => {
  const token = apiKeys.value[0];
  return token ? { Authorization: `Bearer ${token}` } : {};
});

async function fetchBalanceData() {
  if (!props.item?.balance_url) return;
  fetchingBalance.value = true;
  try {
    const res = await fetch(props.item.balance_url, { headers: authHeaders.value });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const amount = props.item.balance_amount_path
      ? resolveJsonPath(json, props.item.balance_amount_path)
      : json;
    const unit = props.item.balance_unit_path
      ? resolveJsonPath(json, props.item.balance_unit_path)
      : undefined;
    const data = {
      result: amount ?? null,
      unit: unit ?? null,
      fetched_at: new Date().toISOString(),
    };
    emit("update-item-data", { id: props.item.id, balance_data: data });
    message.success(t("detail.fetchBalance") + " ✓");
  } catch (e) {
    message.error(t("detail.fetchError") + ": " + (e.message || String(e)));
  } finally {
    fetchingBalance.value = false;
  }
}

async function fetchUsageData() {
  if (!props.item?.usage_url) return;
  fetchingUsage.value = true;
  try {
    const res = await fetch(props.item.usage_url, { headers: authHeaders.value });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const hourResult = props.item.usage_path
      ? resolveJsonPath(json, props.item.usage_path)
      : json;
    const weekResult = props.item.usage_week_path
      ? resolveJsonPath(json, props.item.usage_week_path)
      : undefined;
    const data = {
      hour_result: hourResult ?? null,
      week_result: weekResult ?? null,
      fetched_at: new Date().toISOString(),
    };
    emit("update-item-data", { id: props.item.id, usage_data: data });
    message.success(t("detail.fetchUsage") + " ✓");
  } catch (e) {
    message.error(t("detail.fetchError") + ": " + (e.message || String(e)));
  } finally {
    fetchingUsage.value = false;
  }
}

function formatFetchedAt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatUsageValue(val) {
  if (val == null) return null;
  return typeof val === "object" ? JSON.stringify(val) : String(val);
}
</script>

<template>
  <div class="detail">
    <div v-if="item" class="detail-scroll">
      <!-- Header — sticky, horizontal layout -->
      <div class="header">
        <div class="header-icon">
          <img v-if="item.icon" class="icon-image" :src="item.icon" :alt="item.provider || item.name" />
          <span v-else class="provider-avatar-hero" :style="{ background: avatar.color }">{{ avatar.letter }}</span>
        </div>

        <div class="header-main">
          <div class="header-title-row">
            <h1 class="title">{{ item.name }}</h1>
            <span v-if="item.provider" class="provider-tab">{{ item.provider }}</span>
            <span class="badge" :class="`badge-${item.switch ? 'active' : 'inactive'}`">
              <span class="badge-dot" />
              {{ item.switch ? $t('detail.statusActive') : $t('detail.statusInactive') }}
            </span>
          </div>

          <div v-if="models.length" class="header-models">
            <span v-for="(m, i) in models" :key="i" class="chip">{{ m }}</span>
          </div>

        </div>
      </div>

      <section v-if="item.description" class="field">
        <p class="description">{{ item.description }}</p>
      </section>

      <!-- Fetch data section -->
      <section v-if="item.balance_url || item.usage_url" class="field">
        <label>{{ $t('detail.balanceData') }}</label>
        <div class="data-display-grid">
          <!-- Balance card -->
          <div v-if="item.balance_url" class="data-card">
            <div class="data-card-label">{{ $t('detail.fetchBalance') }}</div>
            <div v-if="item.balance_data?.result != null" class="data-card-value">
              {{ item.balance_data.result }}{{ item.balance_data.unit ? ' ' + item.balance_data.unit : '' }}
            </div>
            <div v-else class="data-card-value data-card-empty">--</div>
            <div v-if="item.balance_data?.fetched_at" class="data-card-time">
              {{ formatFetchedAt(item.balance_data.fetched_at) }}
            </div>
            <n-button
              class="data-card-fetch-btn"
              text
              size="tiny"
              :loading="fetchingBalance"
              @click="fetchBalanceData"
            >
              <template #icon>
                <RefreshCw :size="12" />
              </template>
              {{ $t('detail.fetchBalance') }}
            </n-button>
          </div>
          <!-- Usage card -->
          <div v-if="item.usage_url" class="data-card">
            <div class="data-card-label">{{ $t('detail.fetchUsage') }}</div>
            <div class="usage-values">
              <div class="usage-row">
                <span class="usage-sub-label">{{ $t('detail.usage5hUsage') }}</span>
                <span v-if="item.usage_data?.hour_result != null" class="data-card-value">
                  {{ formatUsageValue(item.usage_data.hour_result) }}
                </span>
                <span v-else class="data-card-value data-card-empty">--</span>
              </div>
              <div class="usage-row">
                <span class="usage-sub-label">{{ $t('detail.usage1wUsage') }}</span>
                <span v-if="item.usage_data?.week_result != null" class="data-card-value">
                  {{ formatUsageValue(item.usage_data.week_result) }}
                </span>
                <span v-else class="data-card-value data-card-empty">--</span>
              </div>
            </div>
            <div v-if="item.usage_data?.fetched_at" class="data-card-time">
              {{ formatFetchedAt(item.usage_data.fetched_at) }}
            </div>
            <n-button
              class="data-card-fetch-btn"
              text
              size="tiny"
              :loading="fetchingUsage"
              @click="fetchUsageData"
            >
              <template #icon>
                <RefreshCw :size="12" />
              </template>
              {{ $t('detail.fetchUsage') }}
            </n-button>
          </div>
        </div>
      </section>

      <!-- Website -->
      <section v-if="item.website" class="field">
        <label>{{ $t('detail.website') }}</label>
        <div class="value mono row-line">
          <a class="link" :href="item.website" target="_blank" rel="noreferrer">{{ item.website }}</a>
          <n-button text size="tiny" @click="copyValue(item.website)">
            <template #icon>
              <Check v-if="isCopied(item.website)" :size="12" color="#22c55e" />
              <Copy v-else :size="12" />
            </template>
          </n-button>
        </div>
      </section>

      <!-- API URLs -->
      <section v-if="apiUrls.length" class="field">
        <label>{{ apiUrls.length > 1 ? $t('detail.apiUrls') : $t('detail.apiUrl') }}</label>
        <div v-for="(u, i) in apiUrls" :key="i" class="value mono row-line">
          <span>{{ u }}</span>
          <n-button text size="tiny" @click="copyValue(u)">
            <template #icon>
              <Check v-if="isCopied(u)" :size="12" color="#22c55e" />
              <Copy v-else :size="12" />
            </template>
          </n-button>
        </div>
      </section>

      <!-- API Keys -->
      <section v-if="apiKeys.length" class="field">
        <label>{{ apiKeys.length > 1 ? $t('detail.apiKeys') : $t('detail.apiKey') }}</label>
        <div v-for="(k, i) in apiKeys" :key="i" class="value mono row-line">
          <span class="key-text">{{ isRevealed(k) ? k : maskKey(k) }}</span>
          <n-button text size="tiny" @click="copyValue(k)">
            <template #icon>
              <Check v-if="isCopied(k)" :size="12" color="#22c55e" />
              <Copy v-else :size="12" />
            </template>
          </n-button>
          <n-button text size="tiny" @click="toggleReveal(k)">
            <template #icon>
              <EyeOff v-if="isRevealed(k)" :size="12" />
              <Eye v-else :size="12" />
            </template>
          </n-button>
        </div>
      </section>

      <!-- 高级配置 -->
      <section v-if="hasAdvancedConfig" class="field">
        <n-collapse :default-expanded-names="[]">
          <n-collapse-item :title="$t('editor.advanced')" name="advanced">
            <div class="advanced-detail-grid">
              <div v-if="item.balance_url || item.balance_amount_path || item.balance_unit_path" class="advanced-group">
                <template v-if="item.balance_url">
                  <label class="detail-field">
                    <span class="detail-field-label">{{ $t('editor.balanceUrl') }}</span>
                    <span class="value mono">{{ item.balance_url }}</span>
                  </label>
                </template>
                <template v-if="item.balance_amount_path">
                  <label class="detail-field">
                    <span class="detail-field-label">{{ $t('editor.balanceAmountPath') }}</span>
                    <span class="value mono">{{ item.balance_amount_path }}</span>
                  </label>
                </template>
                <template v-if="item.balance_unit_path">
                  <label class="detail-field">
                    <span class="detail-field-label">{{ $t('editor.balanceUnitPath') }}</span>
                    <span class="value mono">{{ item.balance_unit_path }}</span>
                  </label>
                </template>
              </div>
              <div v-if="item.usage_url || item.usage_path || item.usage_week_path" class="advanced-group">
                <template v-if="item.usage_url">
                  <label class="detail-field">
                    <span class="detail-field-label">{{ $t('editor.usageUrl') }}</span>
                    <span class="value mono">{{ item.usage_url }}</span>
                  </label>
                </template>
                <template v-if="item.usage_path">
                  <label class="detail-field">
                    <span class="detail-field-label">{{ $t('editor.usagePath') }}</span>
                    <span class="value mono">{{ item.usage_path }}</span>
                  </label>
                </template>
                <template v-if="item.usage_week_path">
                  <label class="detail-field">
                    <span class="detail-field-label">{{ $t('editor.usageWeekPath') }}</span>
                    <span class="value mono">{{ item.usage_week_path }}</span>
                  </label>
                </template>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </section>
    </div>

    <div v-else class="empty">
      <div class="empty-mark">⌘</div>
      <p>{{ $t('detail.empty') }}</p>
      <n-button type="primary" size="small" @click="$emit('add-item')">
        <template #icon>
          <Plus :size="13" />
        </template>
        {{ $t('detail.addItem') }}
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
          {{ $t('detail.addItem') }}
        </n-button>
        <n-button secondary size="small" @click="$emit('edit-item')">
          <template #icon>
            <Pencil :size="13" />
          </template>
          {{ $t('detail.edit') }}
        </n-button>
        <n-button secondary size="small" type="error" @click="$emit('delete-item')">
          <template #icon>
            <Trash2 :size="13" />
          </template>
          {{ $t('detail.delete') }}
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
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 4px 0 16px;
  margin-bottom: 16px;
}

.header-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.04);
}

.icon-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.provider-avatar-hero {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.header-main {
  flex: 1;
  min-width: 0;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  line-height: 1.2;
}

.provider-tab {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px 6px 0 0;
  background: rgba(240, 180, 0, 0.12);
  color: var(--primary-color, #c99200);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border-bottom: 2px solid var(--primary-color, #f0b400);
}

.header-models {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

/* ---- Fetch button inside data cards ---- */
.data-card-fetch-btn {
  margin-top: 8px;
}

.data-card-empty {
  color: var(--text-tertiary);
  font-weight: 400;
}

/* ---- Usage sub-labels ---- */
.usage-values {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.usage-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.usage-sub-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
  white-space: nowrap;
  min-width: 36px;
}

/* ---- Data display cards ---- */
.data-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.data-card {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--divider);
  background: rgba(0, 0, 0, 0.02);
}

.data-card-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.data-card-value {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.data-card-time {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

.description {
  margin-bottom: 10px;
  border: none;
  padding: 0;
  padding-left: 10px;
  border-left: 2px solid rgba(0, 0, 0, 0.12);
  color: var(--text-secondary);
}

/* ---- Fields ---- */
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

.key-text {
  user-select: text;
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

/* ---- 高级配置 ---- */
.advanced-detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.advanced-group {
  padding: 10px 14px;
  border-left: 3px solid var(--divider);
  border-radius: 0 8px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advanced-group + .advanced-group {
  margin-top: 8px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-field-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
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

/* ---- Footer ---- */
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

/* ---- Empty state ---- */
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
html[data-theme="dark"] .header-icon {
  background: rgba(255, 255, 255, 0.06);
}

html[data-theme="dark"] .data-card {
  background: rgba(255, 255, 255, 0.03);
}
</style>
