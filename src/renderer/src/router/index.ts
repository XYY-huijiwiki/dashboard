import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
  type RouteLocation
} from 'vue-router'
import { useSettingsStore } from '@renderer/stores/settings'
import { storeToRefs } from 'pinia'
import { is } from '@renderer/utils'

const views = import.meta.glob('@renderer/views/**/*.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'error' }
  },
  { path: '/', redirect: { name: 'file-explorer' } },
  {
    path: '/file-explorer',
    name: 'file-explorer',
    meta: {
      ghAuthRequired: true
    },
    component: views['/src/views/FileExplorer.vue']
  },
  {
    path: '/recycle-bin',
    name: 'recycle-bin',
    meta: {
      ghAuthRequired: true
    },
    component: views['/src/views/RecycleBin.vue']
  },
  {
    path: '/file-preview/:filename',
    name: 'file-preview',
    meta: {},
    component: views['/src/views/FilePreview.vue']
  },
  {
    path: '/download-manager',
    name: 'download-manager',
    meta: {
      electronOnly: true
    },
    component: views['/src/views/DownloadManager.vue']
  },
  {
    path: '/episodes-data',
    name: 'episodes-data',
    meta: {
      webOnly: true
    },
    component: views['/src/views/EpisodesData.vue']
  },
  {
    path: '/delete-and-undelete',
    name: 'delete-and-undelete',
    meta: {
      webOnly: true
    },
    component: views['/src/views/DeleteAndUndelete.vue']
  },
  {
    path: '/miui-themes',
    name: 'miui-themes',
    meta: {
      webOnly: true
    },
    component: views['/src/views/MiuiThemes.vue']
  },
  {
    path: '/settings',
    name: 'settings',
    meta: {},
    component: views['/src/views/SettingsView.vue']
  },
  {
    path: '/init',
    name: 'init',
    meta: {},
    component: views['/src/views/InitView.vue']
  },
  {
    path: '/error',
    meta: {},
    name: 'error',
    component: views['/src/views/ErrorView.vue']
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/**
 * Determines if the client can access a specific route based on the platform (web or Electron).
 *
 * @param {RouteLocation} to - The target route location.
 * @returns {boolean} - Returns `true` if the client can access the route, otherwise `false`.
 */
function canClientAccess(to: RouteLocation): boolean {
  // Web only guard
  if (!is.web && to.meta.webOnly) {
    return false
  }
  // Electron only guard
  if (is.web && to.meta.electronOnly) {
    return false
  }
  return true
}

/**
 * Determines if the user can access a specific route based on their GitHub authentication status.
 *
 * @param {RouteLocation} to - The target route location.
 * @returns {boolean} - Returns `true` if the user can access the route, otherwise `false`.
 */
function canUserAccess(to: RouteLocation): boolean {
  const { settings } = storeToRefs(useSettingsStore())
  // GitHub Auth guard
  if (!settings.value.ghToken && to.meta.ghAuthRequired) {
    return false
  }
  return true
}

router.beforeEach((to) => {
  // Always true for init and error routes
  if (to.name === 'init' || to.name === 'error') {
    return true
  }
  if (!canClientAccess(to)) {
    return false
  }
  if (!canUserAccess(to)) {
    return { name: 'init' }
  }
  return true
})

export default router
export { canClientAccess, canUserAccess }
