<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { ComputedRef, Component, VNode } from 'vue'
import { NDropdown, NIcon } from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  FullScreenMaximize20Regular,
  Link20Regular,
  Delete20Regular,
  ArrowDownload20Regular,
  Rename20Regular,
  PanelRightExpand20Regular
} from '@vicons/fluent'

const { t } = useI18n()

const props = defineProps<{
  data: FileRecord[]
  position?: { x: number; y: number }
}>()

// show
const show = defineModel<boolean>('show')
// on-preview
const emit = defineEmits([
  'preview',
  'detail',
  'link-copy',
  'delete',
  'download',
  'rename',
  'details'
])

function genIcon(rawIcon: Component): VNode {
  return h(NIcon, { size: 20 }, () => h(rawIcon))
}

// options
const options: ComputedRef<DropdownOption[]> = computed(() => [
  {
    label: t('github-files.btn-preview'),
    icon: () => genIcon(FullScreenMaximize20Regular),
    key: 'preview',
    disabled: props.data.length > 1
  },
  {
    label: t('github-files.btn-link-copy'),
    icon: () => genIcon(Link20Regular),
    key: 'link-copy'
  },
  {
    type: 'divider'
  },
  {
    label: t('github-files.btn-delete'),
    icon: () => genIcon(Delete20Regular),
    disabled: props.data.length === 0,
    key: 'delete'
  },
  {
    label: t('github-files.btn-download'),
    icon: () => genIcon(ArrowDownload20Regular),
    disabled: props.data.length !== 1,
    key: 'download'
  },
  {
    label: t('github-files.btn-rename'),
    icon: () => genIcon(Rename20Regular),
    disabled: props.data.length !== 1,
    key: 'rename'
  },
  {
    type: 'divider'
  },
  {
    label: t('github-files.btn-details'),
    icon: () => genIcon(PanelRightExpand20Regular),
    key: 'details',
    disabled: props.data.length > 1
  }
])
</script>

<style scoped></style>
