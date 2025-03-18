<template>
  <n-menu v-model:value="$route.name" :options="options"></n-menu>
</template>

<script setup lang="ts">
import { type Ref, h, computed } from 'vue'
import type { MenuOption } from 'naive-ui'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t } = useI18n()
const route = useRoute()
const isDisabled = computed(() => route.name === 'init')

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
    disabled: isDisabled.value,
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
    disabled: true,
    icon: renderIcon('arrow-download')
  },
  {
    label: renderLabel(t('side-menu.label-settings'), 'settings'),
    key: 'settings',
    disabled: isDisabled.value,
    icon: renderIcon('settings')
  }
])
</script>

<style scoped></style>
