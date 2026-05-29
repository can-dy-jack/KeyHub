import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

const VALID_KINDS = ["balance_data", "usage_data"];

function emptyStore() {
  return { version: 1, items: {} };
}

function normalizeStore(raw) {
  const items = raw && typeof raw.items === "object" && raw.items !== null ? raw.items : {};
  const normalized = {};

  for (const [id, bucket] of Object.entries(items)) {
    if (!bucket || typeof bucket !== "object") continue;
    const entry = {};
    for (const kind of VALID_KINDS) {
      if (Array.isArray(bucket[kind])) {
        entry[kind] = bucket[kind].filter((record) => record && typeof record === "object");
      }
    }
    normalized[id] = entry;
  }

  return { version: 1, items: normalized };
}

function stringifyStore(store) {
  return `${JSON.stringify(store, null, 2)}\n`;
}

export function useDataStore() {
  const store = ref(emptyStore());
  const dataStorePath = ref("~/.config/keyhub/data.json");

  async function loadDataStore() {
    try {
      dataStorePath.value = await invoke("data_path_string");
    } catch {
      dataStorePath.value = "~/.config/keyhub/data.json";
    }

    try {
      const text = await invoke("read_data");
      store.value = normalizeStore(JSON.parse(text));
    } catch {
      store.value = emptyStore();
    }

    return store.value;
  }

  async function saveDataStore() {
    await invoke("write_data", { contents: stringifyStore(store.value) });
    return store.value;
  }

  async function appendRecord(itemId, kind, record) {
    if (!itemId || !VALID_KINDS.includes(kind) || !record) return;

    const items = store.value.items;
    if (!items[itemId]) {
      items[itemId] = {};
    }
    if (!Array.isArray(items[itemId][kind])) {
      items[itemId][kind] = [];
    }

    items[itemId][kind].push(record);
    await saveDataStore();
  }

  function getHistory(itemId, kind) {
    return store.value.items?.[itemId]?.[kind] ?? [];
  }

  function getLatest(itemId, kind) {
    const history = getHistory(itemId, kind);
    return history.length ? history[history.length - 1] : null;
  }

  return {
    store,
    dataStorePath,
    loadDataStore,
    saveDataStore,
    appendRecord,
    getHistory,
    getLatest,
  };
}
