<template>
  <n-dropdown :options="dropdownOptions" placement="bottom-start" trigger="click" size="small">
    <n-tooltip>
      <template #default>
        {{ t('github-files.table-header.label-type') }}
      </template>
      <template #trigger>
        <n-button quaternary block strong size="small">
          <template #icon>
            <n-badge :show="explorerState.filters.type.length !== 0" dot>
              <n-icon v-if="explorerState.sorterKey === 'type'">
                <arrow-sort-up16-regular v-if="explorerState.sorterOrder === 'ascend'" />
                <arrow-sort-down16-regular v-else />
              </n-icon>
              <n-icon v-else>
                <document16-regular />
              </n-icon>
            </n-badge>
          </template>
        </n-button>
      </template>
    </n-tooltip>
  </n-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import {
  ArrowSortDown16Regular,
  ArrowSortUp16Regular,
  Checkmark24Regular,
  Document16Regular
} from '@vicons/fluent'
import { ref, h } from 'vue'
import { NBadge, NIcon } from 'naive-ui'

import { useExplorerStateStore } from '@renderer/stores/explorerState'
import { xor } from 'lodash-es'

const { explorerState } = storeToRefs(useExplorerStateStore())
const { t } = useI18n()

const dropdownOptions = ref([
  {
    label: () => h('span', { class: 'mr-4' }, t('github-files.table-header.btn-type-asc')),
    key: 'ascend',
    icon: () =>
      h(
        NIcon,
        {
          size: 20,
          class: {
            invisible: !(
              explorerState.value.sorterKey === 'type' &&
              explorerState.value.sorterOrder === 'ascend'
            )
          }
        },
        { default: () => h(Checkmark24Regular) }
      ),
    props: {
      onClick: () => {
        explorerState.value.sorterKey = 'type'
        explorerState.value.sorterOrder = 'ascend'
      }
    }
  },
  {
    label: () => h('span', { class: 'mr-4' }, t('github-files.table-header.btn-type-desc')),
    key: 'descend',
    icon: () =>
      h(
        NIcon,
        {
          size: 20,
          class: {
            invisible: !(
              explorerState.value.sorterKey === 'type' &&
              explorerState.value.sorterOrder === 'descend'
            )
          }
        },
        { default: () => h(Checkmark24Regular) }
      ),
    props: {
      onClick: () => {
        explorerState.value.sorterKey = 'type'
        explorerState.value.sorterOrder = 'descend'
      }
    }
  },
  {
    type: 'divider'
  },
  {
    label: () => h('span', { class: 'mr-4' }, t('github-files.table-header.btn-filter-by')),
    key: 'filter',
    icon: () =>
      h(
        NIcon,
        {
          size: 20,
          class: {
            invisible: !explorerState.value.filters.type.length
          }
        },
        { default: () => h(Checkmark24Regular) }
      ),
    children: [
      genFilterChild('image'),
      genFilterChild('audio'),
      genFilterChild('video'),
      genFilterChild('text'),
      genFilterChild('other')
    ]
  }
])

function genFilterChild(filterText: FilterType) {
  const i18nMapper = {
    image: t(`github-files.table-header.btn-filter-by-image`),
    audio: t(`github-files.table-header.btn-filter-by-audio`),
    video: t(`github-files.table-header.btn-filter-by-video`),
    text: t(`github-files.table-header.btn-filter-by-text`),
    other: t(`github-files.table-header.btn-filter-by-other`)
  }
  return {
    label: () => h('span', { class: 'mr-4' }, i18nMapper[filterText]),
    key: filterText,
    props: {
      // if the filterText is in the array, remove it, otherwise add it
      onclick: () =>
        (explorerState.value.filters.type = xor(explorerState.value.filters.type, [filterText]))
    },
    icon: () =>
      h(
        NIcon,
        {
          size: 20,
          class: {
            invisible: !explorerState.value.filters.type.includes(filterText)
          }
        },
        { default: () => h(Checkmark24Regular) }
      )
  }
}
</script>

<style scoped></style>
