import { contextBridge, ipcRenderer, webUtils } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api: typeof window.api = {
  // upload
  getPathForFile: (file) => webUtils.getPathForFile(file),
  uploadToGitHub: (params) => ipcRenderer.invoke("upload-to-github", params),
  ghLogin: () => ipcRenderer.invoke("gh-login"),
  // download
  downloadFile: (args) => ipcRenderer.invoke("download-file", args),
  onDownloadStarted: (callback) =>
    ipcRenderer.on("download-started", (_event, args) => callback(args)),
  onDownloadProgress: (callback) =>
    ipcRenderer.on("download-progress", (_event, args) => callback(args)),
  onDownloadCompleted: (callback) =>
    ipcRenderer.on("download-completed", (_event, args) => callback(args)),
  onDownloadCancelled: (callback) =>
    ipcRenderer.on("download-cancelled", (_event, args) => callback(args)),
  onDownloadError: (callback) =>
    ipcRenderer.on("download-error", (_event, args) => callback(args)),
  cancelDownload: (downloadId) =>
    ipcRenderer.invoke("cancel-download", downloadId),
  pauseDownload: (downloadId) =>
    ipcRenderer.invoke("pause-download", downloadId),
  resumeDownload: (downloadId) =>
    ipcRenderer.invoke("resume-download", downloadId),
  // window
  toggleFullScreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  toggleDevTools: () => ipcRenderer.invoke("toggle-devtools"),
  // file operations
  showInFolder: (filePath) => ipcRenderer.invoke("show-in-folder", filePath),
  openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),
  isFileExists: (filePath) => ipcRenderer.invoke("is-file-exists", filePath),
  // themes
  setThemeSource: (themeSource) =>
    ipcRenderer.invoke("set-theme-source", themeSource),
  setBackgroundMaterial: (material) =>
    ipcRenderer.invoke("set-background-material", material),
  setTitleBarOverlay: (options) =>
    ipcRenderer.invoke("set-title-bar-overlay", options),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
