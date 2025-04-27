import "@renderer/assets/main.css";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "@renderer/AppOuter.vue";
import { userLang, langPacks } from "@renderer/stores/locales";
import { is } from "@renderer/utils";
import router from "@renderer/router/index";

// ===== CSS =====
if (is.web && !is.dev) {
  // tailwindcss compatibility for web
  const clearTailwind = async () => {
    const LOOP_LIMIT = 100;
    let loopCount = 0;
    while (loopCount < LOOP_LIMIT) {
      if (window.tailwind !== undefined) {
        window.tailwind = undefined;
      }
      loopCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };
  clearTailwind();
}

// ===== i18n =====
const language = JSON.parse(
  localStorage.getItem(`[${import.meta.env.VITE_APP_ID}] settings`) ||
    `{"language":"auto"}`,
).language;
const locale = language === "auto" ? userLang : language;
const i18n = createI18n({
  legacy: false,
  locale,
  messages: {
    [locale]: await langPacks[locale](),
  },
});

createApp(App).use(i18n).use(router).use(createPinia()).mount("#bodyContent");

export { i18n };
