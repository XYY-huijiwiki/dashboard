<template>
  <n-dropdown
    v-model:show="show"
    placement="bottom-start"
    trigger="manual"
    :x="props.position ? props.position.x : undefined"
    :y="props.position ? props.position.y : undefined"
    :options="options"
    @clickoutside="show = false"
    @select="(key) => emit(key)"
  >
    <slot></slot>
  </n-dropdown>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { ComputedRef, VNode } from 'vue'
import { NDropdown } from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

import { is } from '@renderer/utils'

const { t } = useI18n()

const props = defineProps<{
  data: FileRecord[]
  position?: { x: number; y: number }
  preset: 'default' | 'recycle-bin'
}>()

// show
const show = defineModel<boolean>('show', { required: true })
// on-preview
const emit = defineEmits([
  'preview',
  'detail',
  'link-copy',
  'delete',
  'download',
  'rename',
  'details',
])

function genIcon(iconName: string): VNode {
  return h(Icon, { icon: `fluent:${iconName}-20-regular`, width: 20 })
}

// options
const options: ComputedRef<DropdownOption[]> = computed(() => [
  {
    label: t('github-files.btn-preview'),
    icon: () => genIcon('full-screen-maximize'),
    key: 'preview',
    disabled: props.data.length > 1,
  },
  {
    label: t('github-files.btn-link-copy'),
    icon: () => genIcon('link'),
    key: 'link-copy',
  },
  {
    type: 'divider',
  },
  {
    label: t('github-files.btn-delete'),
    icon: () => genIcon('delete'),
    disabled: props.data.length === 0 || props.preset === 'recycle-bin',
    key: 'delete',
  },
  {
    label: t('github-files.btn-download'),
    icon: () => genIcon('arrow-download'),
    disabled: is.web ? props.data.length !== 1 : props.data.length === 0,
    key: 'download',
  },
  {
    label: t('github-files.btn-rename'),
    icon: () => genIcon('rename'),
    disabled: props.data.length !== 1 || props.preset === 'recycle-bin',
    key: 'rename',
  },
  {
    type: 'divider',
  },
  {
    label: t('github-files.btn-details'),
    icon: () => genIcon('panel-right-expand'),
    key: 'details',
    disabled: props.data.length > 1,
  },
])
</script>

<style scoped></style>
