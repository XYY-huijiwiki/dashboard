import type {
  MessageApi,
  DialogApi,
  LoadingBarApi,
  NotificationApi,
  ModalApi,
} from "naive-ui";

declare global {
  type ViewMode = "details" | "list" | "tiles";
  type SorterOrder = "ascend" | "descend";
  type SorterKey =
    | "type"
    | "name"
    | "updated_at"
    | "uploader"
    | "size"
    | "deleted_at"
    | "file_name_before_deleted";
  type FilterType = "image" | "video" | "audio" | "text" | "other";
  type FilterStatus = "unused" | "wanted" | "no source" | "no licence";

  interface Window {
    $dialog: DialogApi;
    $message: MessageApi;
    $modal: ModalApi;
    $loadingBar: LoadingBarApi;
    $notification: NotificationApi;
  }

  // new
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

  // DbResponse
  type DbResponse = [
    {
      results: FileRecord[];
      success: boolean;
      meta: {
        served_by: string;
        served_by_region: string;
        served_by_primary: boolean;
        timings: {
          sql_duration_ms: number;
        };
        duration: number;
        changes: number;
        last_row_id: number;
        changed_db: boolean;
        size_after: number;
        rows_read: number;
        rows_written: number;
      };
    },
  ];

  type FileRecord = {
    id: number;
    file_name: string;
    file_name_base62: string;
    file_size: number;
    content_type: string;
    uploader: string;
    updated_at: string;
    wikitext: string;
    licence: string;
    source: string;
    is_deleted?: number;
    deleted_at?: string;
    file_name_before_deleted?: string;
    thumb_id?: number;
  };
}
