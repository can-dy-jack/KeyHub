import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { invoke } from "@tauri-apps/api/core";

const PROVIDER_ICON_FILES = {
  agents: "agents.svg",
  anthropic: "anthropic.svg",
  deepseek: "deepseek.svg",
  doubao: "doubao.svg",
  gemini: "gemini.svg",
  glm: "glm.svg",
  grok: "grok.svg",
  huggingface: "huggingface.svg",
  hunyuan: "hunyuan.svg",
  kimi: "kimi.svg",
  llama: "llama.svg",
  minimax: "minimax.svg",
  mimo: "mimo.png",
  modelscope: "modelscope.svg",
  nvidia: "nvidia.svg",
  openai: "openai.svg",
  openrouter: "openrouter.svg",
  qwen: "qwen.svg",
  wenxin: "wenxin.svg",
};

const PROVIDER_KEYWORDS = [
  ["openai", "openai"],
  ["anthropic", "anthropic"],
  ["claude", "anthropic"],
  ["gemini", "gemini"],
  ["google", "gemini"],
  ["deepseek", "deepseek"],
  ["openrouter", "openrouter"],
  ["qwen", "qwen"],
  ["hunyuan", "hunyuan"],
  ["wenxin", "wenxin"],
  ["doubao", "doubao"],
  ["grok", "grok"],
  ["llama", "llama"],
  ["minimax", "minimax"],
  ["kimi", "kimi"],
  ["modelscope", "modelscope"],
  ["huggingface", "huggingface"],
  ["glm", "glm"],
  ["nvidia", "nvidia"],
  ["agent", "agents"],
  ["mimo", "mimo"],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function normalizeProviderName(provider) {
  return String(provider || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function resolveProviderIcon(provider, website) {
  const normalizedProvider = normalizeProviderName(provider);
  if (normalizedProvider) {
    if (PROVIDER_ICON_FILES[normalizedProvider]) {
      return `/provider/${PROVIDER_ICON_FILES[normalizedProvider]}`;
    }

    for (const [keyword, providerKey] of PROVIDER_KEYWORDS) {
      if (normalizedProvider.includes(keyword) && PROVIDER_ICON_FILES[providerKey]) {
        return `/provider/${PROVIDER_ICON_FILES[providerKey]}`;
      }
    }
  }

  return "";
}

function hashStringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

export function providerAvatar(provider) {
  const name = String(provider || "").trim();
  const letter = name ? name.charAt(0).toUpperCase() : "?";
  const hue = hashStringToHue(name);
  return { letter, color: `hsl(${hue}, 55%, 45%)` };
}

function normalizeNode(node) {
  if (!node || typeof node !== "object") {
    return null;
  }

  if (node.type === "subGroup") {
    return {
      type: "subGroup",
      id: String(node.id || makeId("group")),
      name: String(node.name || "Untitled Group"),
      icon: node.icon || "",
      children: Array.isArray(node.children) ? node.children.map(normalizeNode).filter(Boolean) : [],
    };
  }

  if (node.type === "item") {
    const website = String(node.website || "").trim();
    return {
      type: "item",
      id: String(node.id || makeId("item")),
      name: String(node.name || "Untitled Item"),
      description: String(node.description || ""),
      website,
      api_keys: node.api_keys ?? "",
      api_urls: node.api_urls ?? "",
      models: node.models ?? [],
      switch: node.switch !== false,
      provider: String(node.provider || "Unknown"),
      icon: resolveProviderIcon(node.provider, website),
      // 高级配置
      balance_url: node.balance_url || "",
      balance_amount_path: node.balance_amount_path || "",
      balance_unit_path: node.balance_unit_path || "",
      usage_url: node.usage_url || "",
      usage_path: node.usage_path || "",
      usage_week_path: node.usage_week_path || "",
      balance_data: node.balance_data ?? null,
      usage_data: node.usage_data ?? null,
    };
  }

  return null;
}

function normalizeConfig(rawConfig) {
  const source = Array.isArray(rawConfig?.groups)
    ? rawConfig.groups
    : Array.isArray(rawConfig)
      ? rawConfig
      : [];

  return {
    groups: source.map(normalizeNode).filter(Boolean),
  };
}

function stringifyConfig(config) {
  return `${JSON.stringify(config, null, 2)}\n`;
}

// 获取到的余额/用量数据不再写入配置文件（改由 data.json 独立保存历史），
// 这里在序列化前剔除这些运行时字段。
function stripRuntimeData(nodes) {
  return nodes
    .map((node) => {
      if (!node || typeof node !== "object") return node;
      if (node.type === "subGroup") {
        return { ...node, children: stripRuntimeData(node.children ?? []) };
      }
      const { balance_data, usage_data, ...rest } = node;
      return rest;
    });
}

function readLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseListField(value) {
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean);
    if (!items.length) return [];
    return items.length === 1 ? items[0] : items;
  }
  const lines = readLines(value);
  if (!lines.length) {
    return [];
  }
  if (lines.length === 1) {
    return lines[0];
  }
  return lines;
}

function findNodeLocation(nodes, id, parentNode = null) {
  if (!id) {
    return null;
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === id) {
      return { node, collection: nodes, index, parentNode };
    }

    if (node.type === "subGroup") {
      const childLocation = findNodeLocation(node.children, id, node);
      if (childLocation) {
        return childLocation;
      }
    }
  }

  return null;
}

function firstItem(nodes) {
  for (const node of nodes) {
    if (node.type === "item") {
      return node;
    }

    if (node.type === "subGroup") {
      const hit = firstItem(node.children);
      if (hit) {
        return hit;
      }
    }
  }

  return null;
}

function downloadJson(filename, payload) {
  const blob = new Blob([stringifyConfig(payload)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useDataConfig() {
  const config = ref({ groups: [] });
  const settingsPath = ref("~/.config/keyhub/settings.json");
  const loading = ref(true);
  const lastError = ref("");
  const lastSaveMessage = ref("");

  const { t } = useI18n();

  const groups = computed(() => config.value.groups);

  function setConfig(rawConfig) {
    config.value = normalizeConfig(rawConfig);
  }

  function exportConfigText() {
    return stringifyConfig({ ...config.value, groups: stripRuntimeData(config.value.groups) });
  }

  function exportNodeText(nodeId) {
    const location = findNodeLocation(config.value.groups, nodeId);
    if (!location) {
      return null;
    }

    return stringifyConfig(location.node);
  }

  async function loadConfig() {
    loading.value = true;

    try {
      try {
        settingsPath.value = await invoke("settings_path_string");
      } catch {
        settingsPath.value = "~/.config/keyhub/settings.json";
      }

      const text = await invoke("read_settings");
      setConfig(JSON.parse(text));
      lastError.value = "";
      lastSaveMessage.value = t("status.loaded");
      return config.value;
    } catch (error) {
      setConfig({ groups: [] });
      lastError.value = error instanceof Error ? error.message : String(error);
      lastSaveMessage.value = t("status.emptyConfig");

      await saveConfig();
      return config.value;
    } finally {
      loading.value = false;
    }
  }

  async function saveConfig() {
    const text = exportConfigText();
    await invoke("write_settings", { contents: text });
    lastSaveMessage.value = t("status.saved", { path: settingsPath.value });
    return text;
  }

  async function importConfigText(text) {
    setConfig(JSON.parse(text));
    await saveConfig();
    return config.value;
  }

  function addRootNode(node) {
    config.value.groups.push(clone(node));
    return node;
  }

  function addChildGroup(parentGroupId, node) {
    const location = findNodeLocation(config.value.groups, parentGroupId);
    if (!location || location.node.type !== "subGroup") {
      throw new Error("Parent group not found");
    }

    location.node.children.push(clone(node));
    return node;
  }

  function addSiblingNode(targetId, node) {
    const location = findNodeLocation(config.value.groups, targetId);
    if (!location) {
      return addRootNode(node);
    }

    location.collection.splice(location.index + 1, 0, clone(node));
    return node;
  }

  function updateNode(node) {
    const location = findNodeLocation(config.value.groups, node.id);
    if (!location) {
      throw new Error("Node not found");
    }

    location.collection.splice(location.index, 1, clone(node));
    return node;
  }

  function deleteNode(nodeId) {
    const location = findNodeLocation(config.value.groups, nodeId);
    if (!location) {
      return null;
    }

    const [removed] = location.collection.splice(location.index, 1);
    return { removed, location };
  }

  function buildNodeFromForm(form, existingNode = null) {
    if (form.kind === "subGroup") {
      const nextNode = {
        type: "subGroup",
        id: existingNode?.id || makeId("group"),
        name: form.name.trim(),
        icon: form.icon.trim(),
        children: existingNode?.type === "subGroup" ? clone(existingNode.children) : [],
      };

      if (!nextNode.icon) {
        delete nextNode.icon;
      }

      return nextNode;
    }

    const nextNode = {
      type: "item",
      id: existingNode?.id || makeId("item"),
      name: form.name.trim(),
      description: form.description.trim(),
      provider: form.provider.trim(),
      website: String(form.website || "").trim(),
      api_keys: parseListField(form.api_keys),
      api_urls: parseListField(form.api_urls),
      models: parseListField(form.models),
      switch: form.switch !== false,
      icon: (form.icon && (form.icon.startsWith("http://") || form.icon.startsWith("https://") || form.icon.startsWith("data:")))
        ? form.icon.trim()
        : resolveProviderIcon(form.provider, form.website),
      // 高级配置
      balance_url: String(form.balance_url || "").trim(),
      balance_amount_path: String(form.balance_amount_path || "").trim(),
      balance_unit_path: String(form.balance_unit_path || "").trim(),
      usage_url: String(form.usage_url || "").trim(),
      usage_path: String(form.usage_path || "").trim(),
      usage_week_path: String(form.usage_week_path || "").trim(),
      // 保留已获取的数据
      balance_data: existingNode?.balance_data ?? null,
      usage_data: existingNode?.usage_data ?? null,
    };

    if (!nextNode.website) delete nextNode.website;
    if (!nextNode.icon) delete nextNode.icon;
    if (!nextNode.balance_url) delete nextNode.balance_url;
    if (!nextNode.balance_amount_path) delete nextNode.balance_amount_path;
    if (!nextNode.balance_unit_path) delete nextNode.balance_unit_path;
    if (!nextNode.usage_url) delete nextNode.usage_url;
    if (!nextNode.usage_path) delete nextNode.usage_path;
    if (!nextNode.usage_week_path) delete nextNode.usage_week_path;
    if (!nextNode.balance_data) delete nextNode.balance_data;
    if (!nextNode.usage_data) delete nextNode.usage_data;

    return nextNode;
  }

  return {
    config,
    groups,
    loading,
    lastError,
    lastSaveMessage,
    settingsPath,
    loadConfig,
    saveConfig,
    importConfigText,
    exportConfigText,
    exportNodeText,
    findNodeLocation: (nodeId) => findNodeLocation(config.value.groups, nodeId),
    findNode: (nodeId) => findNodeLocation(config.value.groups, nodeId)?.node ?? null,
    firstItem: () => firstItem(config.value.groups),
    getAllGroups(nodes) {
      const result = [];
      function walk(list, depth) {
        for (const node of list) {
          if (node.type === "subGroup") {
            result.push({ id: node.id, name: node.name, depth });
            if (node.children && node.children.length) {
              walk(node.children, depth + 1);
            }
          }
        }
      }
      walk(nodes ?? config.value.groups, 0);
      return result;
    },
    getParentGroupId(nodeId) {
      const location = findNodeLocation(config.value.groups, nodeId);
      if (!location || location.parentNode?.type !== "subGroup") {
        return null;
      }

      return location.parentNode.id;
    },
    addRootNode,
    addChildGroup,
    addSiblingNode,
    updateNode,
    deleteNode,
    buildNodeFromForm,
    resolveProviderIcon,
    downloadNode(nodeId) {
      const location = findNodeLocation(config.value.groups, nodeId);
      if (!location) {
        return;
      }

      downloadJson(`${location.node.name || nodeId}.json`, location.node);
    },
    downloadConfig() {
      downloadJson("settings.json", config.value);
    },
  };
}
