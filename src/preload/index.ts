import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api: typeof window.api = {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  uploadToGitHub: (params) => ipcRenderer.invoke('upload-to-github', params),
  ghLogin: () => ipcRenderer.invoke('gh-login'),
  downloadFile: (url, fileName) => ipcRenderer.invoke('download-file', url, fileName),
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (_, fileName, progress) => callback(fileName, progress))
  },
  onDownloadCompleted: (callback) => {
    ipcRenderer.on('download-completed', (_, fileName) => callback(fileName))
  },
  toggleFullScreen: () => ipcRenderer.invoke('toggle-fullscreen')
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
