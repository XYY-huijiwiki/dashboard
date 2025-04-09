import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { type Ref, ref } from "vue";
import { cloneDeep } from "lodash-es";

interface Settings {
  language: string | "auto";
  rootReleaseId: 202273771;
  thumbsReleaseId: 206099778;
  ghToken: string;
  ghOwner: "XYY-huijiwiki";
  ghRepo: "files";
  ghFileRelease: "eOsizdoz";
  ghThumbRelease: "thumb";
  fileListPageSize: number;
  databaseUrl: string;
  sidebarCollapsed: boolean;
  episodesDataExportType: "json" | "xlsx";
}

export const useSettingsStore = defineStore("settings", () => {
  // define default settings
  const defaultSettings: Settings = {
    language: "auto",
    ghToken: "",
    rootReleaseId: 202273771,
    thumbsReleaseId: 206099778,
    ghOwner: "XYY-huijiwiki",
    ghRepo: "files",
    ghFileRelease: "eOsizdoz",
    ghThumbRelease: "thumb",
    fileListPageSize: 50,
    databaseUrl: `https://xyy-file-db.24218079.xyz/`,
    sidebarCollapsed: false,
    episodesDataExportType: "xlsx",
  };
  // init settings from localStorage or use default settings
  const settings: Ref<Settings> = useLocalStorage(
    "[Ov23liXwSttWUEILSEqe] settings",
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
