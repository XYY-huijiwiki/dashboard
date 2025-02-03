import { ElectronAPI } from '@electron-toolkit/preload'

interface FileMetadata {
  name: string
  path: string
  size: number
  type: string
}

interface UploadParams {
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

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFileDialog: () => Promise<FileMetadata | null>
      uploadToGitHub: (params: UploadParams) => Promise<GhAssetUploadResponse>
      openExternal: (url: string) => void
      ghLogin: () => Promise<string>
    }
  }
}
