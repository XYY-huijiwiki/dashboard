<template>
  <n-dropdown
    :options="dropdownOptions"
    placement="bottom-start"
    trigger="click"
    size="small"
  >
    <n-tooltip>
      <template #default>
        {{ t('github-files.table-header.label-type') }}
      </template>
      <template #trigger>
        <n-button quaternary block strong size="small">
          <template #icon>
            <n-badge :show="explorerState.filters.type.length !== 0" dot>
              <icon
                v-if="explorerState.sorterKey === 'type'"
                :icon="
                  explorerState.sorterOrder === 'ascend'
                    ? 'fluent:arrow-sort-up-16-regular'
                    : 'fluent:arrow-sort-down-16-regular'
                "
              />
              <icon v-else icon="fluent:document-16-regular" />
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
import { Icon } from '@iconify/vue'
import { ref, h } from 'vue'
import { xor } from 'lodash-es'

import { useExplorerStateStore } from '@renderer/stores/explorerState'

const { explorerState } = storeToRefs(useExplorerStateStore())
const { t } = useI18n()

const dropdownOptions = ref([
  {
    label: () =>
      h('span', { class: 'mr-4' }, t('github-files.table-header.btn-type-asc')),
    key: 'ascend',
    icon: () =>
      h(Icon, {
        icon: 'fluent:checkmark-20-regular',
        width: 20,
        class: {
          invisible: !(
            explorerState.value.sorterKey === 'type' &&
            explorerState.value.sorterOrder === 'ascend'
          ),
        },
      }),
    props: {
      onClick: () => {
        explorerState.value.sorterKey = 'type'
        explorerState.value.sorterOrder = 'ascend'
      },
    },
  },
  {
    label: () =>
      h(
        'span',
        { class: 'mr-4' },
        t('github-files.table-header.btn-type-desc'),
      ),
    key: 'descend',
    icon: () =>
      h(Icon, {
        icon: 'fluent:checkmark-20-regular',
        width: 20,
        class: {
          invisible: !(
            explorerState.value.sorterKey === 'type' &&
            explorerState.value.sorterOrder === 'descend'
          ),
        },
      }),
    props: {
      onClick: () => {
        explorerState.value.sorterKey = 'type'
        explorerState.value.sorterOrder = 'descend'
      },
    },
  },
  {
    type: 'divider',
  },
  {
    label: () =>
      h(
        'span',
        { class: 'mr-4' },
        t('github-files.table-header.btn-filter-by'),
      ),
    key: 'filter',
    icon: () =>
      h(Icon, {
        icon: 'fluent:checkmark-20-regular',
        width: 20,
        class: {
          invisible: !explorerState.value.filters.type.length,
        },
      }),
    children: [
      genFilterChild('image'),
      genFilterChild('audio'),
      genFilterChild('video'),
      genFilterChild('text'),
      genFilterChild('other'),
    ],
  },
])

function genFilterChild(filterText: FilterType) {
  const i18nMapper = {
    image: t(`github-files.table-header.btn-filter-by-image`),
    audio: t(`github-files.table-header.btn-filter-by-audio`),
    video: t(`github-files.table-header.btn-filter-by-video`),
    text: t(`github-files.table-header.btn-filter-by-text`),
    other: t(`github-files.table-header.btn-filter-by-other`),
  }
  return {
    label: () => h('span', { class: 'mr-4' }, i18nMapper[filterText]),
    key: filterText,
    props: {
      // if the filterText is in the array, remove it, otherwise add it
      onclick: () =>
        (explorerState.value.filters.type = xor(
          explorerState.value.filters.type,
          [filterText],
        )),
    },
    icon: () =>
      h(Icon, {
        icon: 'fluent:checkmark-20-regular',
        width: 20,
        class: {
          invisible: !explorerState.value.filters.type.includes(filterText),
        },
      }),
  }
}
</script>

<style scoped></style>
