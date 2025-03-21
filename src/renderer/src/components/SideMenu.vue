<template>
  <n-menu
    :value="$route.name === 'file-preview' ? 'file-explorer' : $route.name"
    :options="options"
    :collapsed="props.collapsed"
    :collapsed-width="62"
    :collapsed-icon-size="20"
  ></n-menu>
</template>

<script setup lang="ts">
import { type Ref, h, computed } from 'vue'
import type { MenuOption } from 'naive-ui'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'

import DownloadIcon from '@renderer/components/DownloadIcon.vue'
import { useDownloadStore } from '@renderer/stores/download'
import { is } from '@renderer/utils'

const { t } = useI18n()
const route = useRoute()
const { activeDownloads } = storeToRefs(useDownloadStore())
const props = defineProps<{
  collapsed: boolean
}>()

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
    disabled: route.name === 'init' || is.web,
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
