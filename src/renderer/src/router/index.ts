import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useSettingsStore } from '@renderer/stores/settings'

const views = import.meta.glob('@renderer/views/**/*.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: views['/src/views/HomeView.vue']
  },
  {
    path: '/settings',
    name: 'settings',
    component: views['/src/views/SettingsView.vue']
  },
  { path: '/init', name: 'init', component: views['/src/views/InitView.vue'] },
  { path: '/error', name: 'error', component: views['/src/views/ErrorView.vue'] }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 100,
      behavior: 'smooth'
    }
  }
})

router.beforeEach((to) => {
  const store = useSettingsStore()
  if (!store.settings.ghToken && to.name !== 'init') {
    return '/init'
  }
  return true
})

export default router
