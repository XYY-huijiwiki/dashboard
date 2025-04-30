/// <reference types="vite/client" />

// #region global constants defined in /electron.vite.config.ts

// app info
declare const __APP_VERSION__: string;
declare const __APP_HOMEPAGE__: string;
declare const __APP_ID__: string;
declare const __APP_URL__: string;
declare const __APP_BUILD_DATE__: number;

// proxies
declare const __IMAGE_PROXY__: string;
declare const __CORS_PROXY__: string;

// github config
declare const __GH_OWNER__: string;
declare const __GH_REPO__: string;
declare const __GH_FILE_RELEASE__: string;
declare const __GH_FILE_RELEASE_ID__: string;
declare const __GH_THUMB_RELEASE__: string;
declare const __GH_THUMB_RELEASE_ID__: string;

// cloudflare config
declare const __CF_DATABASE_URL__: string;

// #endregion
