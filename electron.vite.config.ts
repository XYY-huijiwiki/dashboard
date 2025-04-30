import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import {
  defineConfig,
  externalizeDepsPlugin,
  defineViteConfig,
} from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { execSync } from "node:child_process";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: {
          format: "es",
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        output: {
          format: "es",
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: defineViteConfig(({ mode }) => {
    return {
      base: mode === "web" ? "//xyy-huijiwiki.github.io/dashboard/" : undefined,
      build: {
        manifest: true,
      },
      server: {
        cors: true,
      },
      resolve: {
        alias: {
          "@renderer": resolve("src/renderer/src"),
        },
      },
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag) => ["model-viewer"].includes(tag),
            },
          },
        }),
        Components({
          resolvers: [NaiveUiResolver()],
        }),
        tailwindcss(),
        nodePolyfills({
          include: ["stream", "timers", "tty", "fs", "crypto", "vm"],
        }),
      ],
      define: (() => {
        let lastCommitDate = 0;
        // Check if Git is available
        try {
          lastCommitDate = parseInt(
            execSync("git log -1 --format=%ct").toString(),
          );
        } catch {
          console.warn("Git is not available. Skipping commit date retrieval.");
        }
        const packageJson = JSON.parse(
          readFileSync(resolve("package.json"), "utf-8"),
        );
        return {
          // app info
          __APP_VERSION__: JSON.stringify(packageJson.version),
          __APP_HOMEPAGE__: JSON.stringify(packageJson.homepage),
          __APP_ID__: JSON.stringify("Ov23liXwSttWUEILSEqe"),
          __APP_URL__: JSON.stringify(
            "https://xyy.huijiwiki.com/wiki/Project:控制中心",
          ),
          __APP_LAST_COMMIT_DATE__: JSON.stringify(lastCommitDate),

          // proxies
          __IMAGE_PROXY__: JSON.stringify("https://karsten-zhou.gumlet.io/"),
          __CORS_PROXY__: JSON.stringify("https://cors-proxy.24218079.xyz/"),

          // github config
          __GH_OWNER__: JSON.stringify("XYY-huijiwiki"),
          __GH_REPO__: JSON.stringify("files"),
          __GH_FILE_RELEASE__: JSON.stringify("eOsizdoz"),
          __GH_FILE_RELEASE_ID__: JSON.stringify("202273771"),
          __GH_THUMB_RELEASE__: JSON.stringify("thumb"),
          __GH_THUMB_RELEASE_ID__: JSON.stringify("206099778"),

          // cloudflare config
          __CF_DATABASE_URL__: JSON.stringify(
            "https://xyy-file-db.24218079.xyz/",
          ),
        };
      })(),
    };
  }),
});
