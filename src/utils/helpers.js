/**
 * Normalize a value into an array of non-empty strings.
 * Used for form fields that accept multi-line or array input.
 */
export function fieldToArray(value) {
  if (value == null) return [""];
  if (Array.isArray(value)) return value.length ? value.map(String) : [""];
  const str = String(value).trim();
  if (!str) return [""];
  return str.split(/\r?\n/).filter(Boolean);
}

/**
 * Create a fresh empty form object for the node editor.
 * @param {'subGroup' | 'item'} kind
 */
export function createEmptyNodeForm(kind = "subGroup") {
  return {
    kind,
    name: "",
    icon: "",
    description: "",
    provider: "",
    website: "",
    api_keys: [""],
    api_urls: [""],
    models: [""],
    switch: true,
    targetGroupId: null,
    // 高级配置
    balance_url: "",
    balance_amount_path: "",
    balance_unit_path: "",
    usage_url: "",
    usage_path: "",
  };
}

/**
 * Resolve a dot-notation JSON path against an object.
 * Supports "data.total_balance" and "data[0].value" forms.
 * Returns undefined if any segment is missing.
 */
export function resolveJsonPath(obj, path) {
  if (obj == null || !path) return undefined;
  const segments = String(path).split(".");
  let current = obj;
  for (const seg of segments) {
    if (current == null) return undefined;
    const bracketMatch = seg.match(/^(.+?)\[(\d+)\]$/);
    if (bracketMatch) {
      current = current[bracketMatch[1]];
      if (current == null) return undefined;
      current = current[parseInt(bracketMatch[2], 10)];
    } else {
      current = current[seg];
    }
  }
  return current;
}

/**
 * Recursively build a tree-select option list from config nodes.
 * Only subGroup nodes become selectable options.
 */
export function buildTreeOptions(nodes, excludeIds = new Set()) {
  const result = [];
  for (const node of nodes) {
    if (node.type === "subGroup" && !excludeIds.has(node.id)) {
      const option = { label: node.name, key: node.id };
      const childOptions = buildTreeOptions(node.children || [], excludeIds);
      if (childOptions.length) option.children = childOptions;
      result.push(option);
    }
  }
  return result;
}
