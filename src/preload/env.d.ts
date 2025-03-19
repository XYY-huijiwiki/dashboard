import { ElectronAPI } from '@electron-toolkit/preload'
import { DownloadItem } from 'electron'

type FileMetadata = {
  name: string
  path: string
  size: number
  type: string
}

type UploadParams = {
  ghToken: string
  owner: string
  repo: string
  releaseId: string
  filePath: string
  fileName: string
}

type GhAssetUploadResponse = {
  url: string
  id: number
  node_id: string
  name: string
  label: string
  uploader: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: 'User'
    user_view_type: 'public'
    site_admin: boolean
  }
  content_type: string
  state: string
  size: number
  download_count: number
  created_at: string
  updated_at: string
  browser_download_url: string
}

type CustomApi = {
  openFileDialog: () => Promise<FileMetadata | null>
  uploadToGitHub: (params: UploadParams) => Promise<GhAssetUploadResponse>
  ghLogin: () => Promise<string>

  downloadFile: ({
    url,
    filename,
    directory
  }: {
    url: string
    filename: string
    directory?: string
  }) => Promise<void>
  onDownloadStarted: (
    callback: (args: {
      id: string
      url: string
      filename: string
      mimeType: string
      totalBytes: number
      path: string
    }) => void
  ) => void
  onDownloadProgress: (
    callback: (args: { id: string; percentCompleted: number; bytesReceived: number }) => void
  ) => void
  onDownloadCompleted: (
    callback: (args: { id: string; filePath: string; filename: string }) => void
  ) => void
  onDownloadCancelled: (callback: (args: { id: string }) => void) => void
  onDownloadError: (callback: (args: { id: string; error: Error }) => void) => void

  cancelDownload: (id: string) => Promise<void>
  pauseDownload: (id: string) => Promise<void>
  resumeDownload: (id: string) => Promise<void>

  toggleFullScreen: () => Promise<void>
  toggleDevTools: () => Promise<void>

  showInFolder: (filePath: string) => Promise<void>
  openFile: (filePath: string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomApi
  }
}
