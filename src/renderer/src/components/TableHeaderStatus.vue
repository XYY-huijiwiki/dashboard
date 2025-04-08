<template>
  <n-dropdown
    :options="dropdownOptions"
    placement="bottom-start"
    trigger="click"
    size="small"
  >
    <n-button
      quaternary
      block
      strong
      size="small"
      class="!justify-start !-ml-2"
    >
      <n-badge :show="explorerState.filters.status.length !== 0" dot>
        <n-ellipsis>
          {{ t('github-files.table-header.label-status') }}
        </n-ellipsis>
      </n-badge>
      <icon icon="fluent:chevron-down-12-regular" width="12" class="ml-1" />
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue'
import { ref, h } from 'vue'
import { NBadge } from 'naive-ui'

import { useExplorerStateStore } from '@renderer/stores/explorerState'
import { xor } from 'lodash-es'

const { explorerState } = storeToRefs(useExplorerStateStore())
const { t } = useI18n()

const dropdownOptions = ref([
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
        icon: `fluent:filter-24-regular`,
        width: 20,
        class: {
          invisible: !explorerState.value.filters.status.length,
        },
      }),
    children: [
      { ...genFilterChild('unused'), disabled: true },
      { ...genFilterChild('wanted'), disabled: true },
      genFilterChild('no source'),
      genFilterChild('no licence'),
    ],
  },
])

function genFilterChild(filterText: FilterStatus) {
  return {
    label: () =>
      h(
        'span',
        { class: 'mr-4' },
        t(`github-files.status-${filterText.replace(' ', '-')}`),
      ),
    key: filterText,
    props: {
      // if the filterText is in the array, remove it, otherwise add it
      onclick: () =>
        (explorerState.value.filters.status = xor(
          explorerState.value.filters.status,
          [filterText],
        )),
    },
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: {
          invisible: !explorerState.value.filters.status.includes(filterText),
        },
      }),
  }
}
</script>

<style scoped></style>
