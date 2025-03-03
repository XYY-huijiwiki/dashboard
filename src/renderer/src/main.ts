import './assets/main.css'
import { createI18n } from 'vue-i18n'
import router from '@renderer/router/index'
import { createPinia } from 'pinia'

import { createApp } from 'vue'
import App from './AppOuter.vue'

import { userLang, langPacks } from '@renderer/stores/locales'

// ===== i18n =====
const language = JSON.parse(localStorage.getItem('settings') || `{"language":"auto"}`).language
const locale = language === 'auto' ? userLang : language
const i18n = createI18n({
  legacy: false,
  locale,
  messages: {
    [locale]: await langPacks[locale]()
  }
})

createApp(App).use(i18n).use(router).use(createPinia()).mount('#app')

export { i18n }
