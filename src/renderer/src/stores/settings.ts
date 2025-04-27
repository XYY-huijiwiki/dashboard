import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { type Ref, ref } from "vue";
import { cloneDeep } from "lodash-es";

interface Settings {
  language: string | "auto";
  ghToken: string;
  fileListPageSize: number;
  sidebarCollapsed: boolean;
  episodesDataExportType: "json" | "xlsx";
}

export const useSettingsStore = defineStore("settings", () => {
  // define default settings
  const defaultSettings: Settings = {
    language: "auto",
    ghToken: "",
    fileListPageSize: 50,
    sidebarCollapsed: false,
    episodesDataExportType: "xlsx",
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

  return { settings, resetSettings, globalLoading };
});
