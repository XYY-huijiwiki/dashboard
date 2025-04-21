import { ElectronAPI } from "@electron-toolkit/preload";
import { DownloadItem } from "electron";

type UploadParams = {
  ghToken: string;
  owner: string;
  repo: string;
  releaseId: string;
  filePath: string;
  fileName: string;
};

type GhAssetUploadResponse = {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string;
  uploader: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: "User";
    user_view_type: "public";
    site_admin: boolean;
  };
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
};

type CustomApi = {
  getPathForFile: (file: File) => string;
  uploadToGitHub: (params: UploadParams) => Promise<GhAssetUploadResponse>;
  ghLogin: () => Promise<string>;

  downloadFile: ({
    uuid,
    url,
    filename,
    directory,
  }: {
    uuid: string;
    url: string;
    filename: string;
    directory?: string;
  }) => Promise<void>;
  onDownloadStarted: (
    callback: (args: { uuid: string; downloadId: string }) => void,
  ) => void;
  onDownloadProgress: (
    callback: (args: {
      uuid: string;
      percentCompleted: number;
      bytesReceived: number;
      totalBytes: number;
      downloadRateBytesPerSecond: number;
      estimatedTimeRemainingSeconds: number;
    }) => void,
  ) => void;
  onDownloadCompleted: (
    callback: (args: {
      uuid: string;
      filePath: string;
      filename: string;
    }) => void,
  ) => void;
  onDownloadCancelled: (callback: (args: { uuid: string }) => void) => void;
  onDownloadError: (
    callback: (args: { uuid: string; err: string }) => void,
  ) => void;

  cancelDownload: (downloadId: string) => Promise<void>;
  pauseDownload: (downloadId: string) => Promise<void>;
  resumeDownload: (downloadId: string) => Promise<void>;

  toggleFullScreen: () => Promise<void>;
  toggleDevTools: () => Promise<void>;

  showInFolder: (filePath: string) => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  isFileExists: (filePath: string) => Promise<boolean>;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomApi;
  }
}
