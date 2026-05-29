import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const THEME_KEY = "keyhub-theme";

const themeMode = ref(localStorage.getItem(THEME_KEY) || "system");
const systemDark = ref(window.matchMedia("(prefers-color-scheme: dark)").matches);
let themeMediaQuery = null;

const isDark = computed(() => {
  if (themeMode.value === "dark") return true;
  if (themeMode.value === "light") return false;
  return systemDark.value;
});

function onThemeChange(e) {
  systemDark.value = e.matches;
}

function setThemeMode(mode) {
  themeMode.value = mode;
  localStorage.setItem(THEME_KEY, mode);
}

const themeOverrides = computed(() => ({
  common: {
    primaryColor: "#f0b400",
    primaryColorHover: "#e0a800",
    primaryColorPressed: "#c89500",
    borderRadius: "12px",
  },
  Input: { borderRadius: "12px" },
  Select: { peers: { InternalSelection: { borderRadius: "12px" } } },
  TreeSelect: { peers: { InternalSelection: { borderRadius: "12px" } } },
  Dropdown: { borderRadius: "12px" },
}));

export function useTheme() {
  onMounted(() => {
    themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    themeMediaQuery.addEventListener("change", onThemeChange);
  });

  onUnmounted(() => {
    if (themeMediaQuery) {
      themeMediaQuery.removeEventListener("change", onThemeChange);
    }
  });

  watch(isDark, (val) => {
    document.documentElement.setAttribute("data-theme", val ? "dark" : "light");
  }, { immediate: true });

  return { themeMode, isDark, themeOverrides, setThemeMode };
}
