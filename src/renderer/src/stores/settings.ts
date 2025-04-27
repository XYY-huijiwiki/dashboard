import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed, type Ref, ref, watch } from "vue";
import { cloneDeep } from "lodash-es";
import { usePreferredColorScheme } from "@vueuse/core";
import { is } from "@renderer/utils";

interface Settings {
  language: string | "auto";
  ghToken: string;
  fileListPageSize: number;
  sidebarCollapsed: boolean;
  episodesDataExportType: "json" | "xlsx";
  themeSource: "system" | "light" | "dark";
  backgroundMaterial: "auto" | "none" | "mica" | "acrylic";
}

export const useSettingsStore = defineStore("settings", () => {
  // define default settings
  const defaultSettings: Settings = {
    language: "auto",
    ghToken: "",
    fileListPageSize: 50,
    sidebarCollapsed: false,
    episodesDataExportType: "xlsx",
    themeSource: "system",
    backgroundMaterial: "auto",
  };
  // init settings from localStorage or use default settings
  const settings: Ref<Settings> = useLocalStorage(
    `[${import.meta.env.VITE_APP_ID}] settings`,
    defaultSettings,
    {
      mergeDefaults: true,
    },
  );

  // function of reset settings
  function resetSettings(): void {
    settings.value = cloneDeep(defaultSettings);
  }

  // global state
  const globalLoading = ref(false);

  // global theme
  const systemTheme = usePreferredColorScheme();
  const shouldUseDarkColors: Ref<boolean> = computed(() => {
    if (settings.value.themeSource === "system") {
      return systemTheme.value === "dark";
    }
    return settings.value.themeSource === "dark";
  });
  if (!is.web) {
    // set theme source to main process (Electron only)
    watch(
      () => settings.value.themeSource,
      (newThemeSource) => {
        window.api.setThemeSource(newThemeSource);
      },
      { immediate: true },
    );
  }
  if (is.win) {
    watch(
      () => settings.value.backgroundMaterial,
      (newMaterial) => {
        if (is.win) {
          window.api.setBackgroundMaterial(newMaterial);
        }
      },
      { immediate: true },
    );
  }

  return { settings, resetSettings, globalLoading, shouldUseDarkColors };
});
