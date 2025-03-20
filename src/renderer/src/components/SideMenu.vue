<template>
  <n-menu v-model:value="$route.name" :options="options"></n-menu>
</template>

<script setup lang="ts">
import { type Ref, h, computed } from 'vue'
import type { MenuOption } from 'naive-ui'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import isElectron from 'is-electron'
import DownloadIcon from './DownloadIcon.vue'
import { useDownloadStore } from '@renderer/stores/download'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const route = useRoute()
const { activeDownloads } = storeToRefs(useDownloadStore())

function renderIcon(icon: string) {
  return () => h(Icon, { icon: `fluent:${icon}-24-regular` })
}
function renderLabel(text: string, link: string) {
  return () => h(RouterLink, { to: { name: link } }, { default: () => text })
}

const options: Ref<MenuOption[]> = computed(() => [
  {
    label: renderLabel(t('side-menu.label-file-explorer'), 'file-explorer'),
    key: 'file-explorer',
    disabled: route.name === 'init',
    icon: renderIcon('folder')
  },
  {
    label: renderLabel(t('side-menu.label-recycle-bin'), 'recycle-bin'),
    key: 'recycle-bin',
    disabled: true,
    icon: renderIcon('bin-recycle-full')
  },
  {
    label: renderLabel(t('side-menu.label-download-manager'), 'download-manager'),
    key: 'download-manager',
    disabled: route.name === 'init' || !isElectron(),
    icon: () => h(DownloadIcon, { downloading: activeDownloads.value.length > 0 })
  },
  {
    label: renderLabel(t('side-menu.label-settings'), 'settings'),
    key: 'settings',
    disabled: route.name === 'init',
    icon: renderIcon('settings')
  }
])
</script>

<style scoped></style>
