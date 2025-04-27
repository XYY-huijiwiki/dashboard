/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  // app info
  readonly VITE_APP_ID: string;

  // proxies
  readonly VITE_IMAGE_PROXY: string;
  readonly VITE_CORS_PROXY: string;

  // github config
  readonly VITE_GH_OWNER: string;
  readonly VITE_GH_REPO: string;
  readonly VITE_GH_FILE_RELEASE: string;
  readonly VITE_GH_FILE_RELEASE_ID: string;
  readonly VITE_GH_THUMB_RELEASE: string;
  readonly VITE_GH_THUMB_RELEASE_ID: string;

  // cloudflare config
  readonly VITE_CF_DATABASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
