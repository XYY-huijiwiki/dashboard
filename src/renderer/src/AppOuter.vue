<script lang="ts" setup>
import { darkTheme } from "naive-ui";
import { useLocalesStore } from "@renderer/stores/locales";
import { useSettingsStore } from "@renderer/stores/settings";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import App from "./App.vue";

const { shouldUseDarkColors } = storeToRefs(useSettingsStore());

const theme = computed(() => (shouldUseDarkColors.value ? darkTheme : null));
const { langPackNaiveUI } = storeToRefs(useLocalesStore());
const { globalLoading } = storeToRefs(useSettingsStore());
</script>

<template>
  <n-config-provider
    :theme="theme"
    :locale="langPackNaiveUI.locale"
    :date-locale="langPackNaiveUI.dateLocale"
    inline-theme-disabled
    :style="{
      colorScheme: shouldUseDarkColors ? 'dark' : 'light',
    }"
    :class="shouldUseDarkColors ? 'dark' : ''"
  >
    <n-dialog-provider>
      <n-message-provider>
        <n-modal-provider>
          <n-notification-provider>
            <n-loading-bar-provider>
              <n-spin :show="globalLoading">
                <app />
              </n-spin>
            </n-loading-bar-provider>
          </n-notification-provider>
        </n-modal-provider>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
