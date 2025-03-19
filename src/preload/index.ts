import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api: typeof window.api = {
  // upload
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  uploadToGitHub: (params) => ipcRenderer.invoke('upload-to-github', params),
  ghLogin: () => ipcRenderer.invoke('gh-login'),
  // download
  downloadFile: (args) => ipcRenderer.invoke('download-file', args),
  onDownloadStarted: (callback) =>
    ipcRenderer.on('download-started', (_event, args) => callback(args)),
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (_event, args) => callback(args)),
  onDownloadCompleted: (callback) =>
    ipcRenderer.on('download-completed', (_event, args) => callback(args)),
  onDownloadCancelled: (callback) =>
    ipcRenderer.on('download-cancelled', (_event, args) => callback(args)),
  onDownloadError: (callback) => ipcRenderer.on('download-error', (_event, args) => callback(args)),
  cancelDownload: (id) => ipcRenderer.invoke('cancel-download', id),
  pauseDownload: (id) => ipcRenderer.invoke('pause-download', id),
  resumeDownload: (id) => ipcRenderer.invoke('resume-download', id),
  // window
  toggleFullScreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),
  // file operations
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
