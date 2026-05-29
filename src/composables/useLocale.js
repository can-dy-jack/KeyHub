import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { zhCN, enUS, dateZhCN, dateEnUS } from "naive-ui";

const LOCALE_KEY = "keyhub-locale";

const currentLocale = ref(localStorage.getItem(LOCALE_KEY) || "zh-CN");

const naiveLocale = computed(() => (currentLocale.value === "en" ? enUS : zhCN));
const naiveDateLocale = computed(() => (currentLocale.value === "en" ? dateEnUS : dateZhCN));

export function useLocale() {
  const i18n = useI18n();

  function setLocale(locale) {
    currentLocale.value = locale;
    localStorage.setItem(LOCALE_KEY, locale);
  }

  watch(
    currentLocale,
    (val) => {
      i18n.locale.value = val;
    },
    { immediate: true },
  );

  watch(
    currentLocale,
    (val) => {
      document.documentElement.setAttribute("lang", val === "en" ? "en" : "zh-CN");
    },
    { immediate: true },
  );

  return {
    locale: currentLocale,
    setLocale,
    naiveLocale,
    naiveDateLocale,
  };
}
