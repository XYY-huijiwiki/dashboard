<script lang="ts" setup>
import { darkTheme, useOsTheme } from 'naive-ui'
import { useLocalesStore } from '@renderer/stores/locales'
import { useSettingsStore } from '@renderer/stores/settings'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import App from './App.vue'

const OSThemeStr = useOsTheme()
const theme = computed(() => (OSThemeStr.value === 'dark' ? darkTheme : null))
const { langPackNaiveUI } = storeToRefs(useLocalesStore())
const { globalLoading } = storeToRefs(useSettingsStore())
</script>

<template>
  <n-config-provider
    :theme="theme"
    :locale="langPackNaiveUI.locale"
    :date-locale="langPackNaiveUI.dateLocale"
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
