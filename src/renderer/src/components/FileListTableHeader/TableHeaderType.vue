<template>
  <n-dropdown :options="dropdownOptions" placement="bottom-start" trigger="click" size="small">
    <n-button quaternary block strong size="small">
      <template #icon>
        <n-icon v-if="explorerState.sorterKey === 'type'">
          <arrow-sort-up16-regular v-if="explorerState.sorterOrder === 'ascend'" />
          <arrow-sort-down16-regular v-else />
        </n-icon>
        <n-icon v-else>
          <document16-regular />
        </n-icon>
      </template>
    </n-button>
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
import { NIcon } from 'naive-ui'

import { useExplorerStateStore } from '@renderer/stores/explorerState'

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
  }
])
</script>

<style scoped></style>
