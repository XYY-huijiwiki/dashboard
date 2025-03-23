import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, defineViteConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: {
          format: 'es'
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        output: {
          format: 'es'
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: defineViteConfig(({ mode }) => {
    return {
      base: mode === 'web' ? '//xyy-huijiwiki.github.io/dashboard/' : undefined,
      build: {
        manifest: true
      },
      server: {
        cors: true
      },
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src')
        }
      },
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag) => ['model-viewer'].includes(tag)
            }
          }
        }),
        Components({
          resolvers: [NaiveUiResolver()]
        }),
        tailwindcss(),
        nodePolyfills(),
        vueDevTools()
      ]
    }
  })
})
