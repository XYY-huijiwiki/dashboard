<template>
  <n-spin
    v-if="explorerState.filters.type.length || explorerState.filters.status.length"
    :show="loading"
  >
    <n-alert>
      <template #default>
        <n-flex justify="space-between">
          <n-flex>
            <n-flex v-if="explorerState.filters.type.length">
              <n-text>{{ t('github-files.table-header.label-filtered-type') }}</n-text>
              <n-tag
                v-for="type in explorerState.filters.type"
                :key="type"
                size="small"
                closable
                round
                @close="removeFilterType(type)"
              >
                {{ type }}
              </n-tag>
            </n-flex>
            <n-flex v-if="explorerState.filters.status.length">
              <n-text>{{ t('github-files.table-header.label-filtered-status') }}</n-text>
              <n-tag
                v-for="status in explorerState.filters.status"
                :key="status"
                size="small"
                closable
                round
                @close="removeFilterStatus(status)"
              >
                {{ status }}
              </n-tag>
            </n-flex>
          </n-flex>
          <n-button size="tiny" round icon-placement="right" @click="clearFilters()">
            clear-filters
            <template #icon>
              <n-icon>
                <filter-dismiss16-regular />
              </n-icon>
            </template>
          </n-button>
        </n-flex>
      </template>
      <template #icon>
        <n-icon>
          <filter24-regular />
        </n-icon>
      </template>
    </n-alert>
  </n-spin>
</template>

<script setup lang="ts">
import { Filter24Regular, FilterDismiss16Regular } from '@vicons/fluent'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useExplorerStateStore } from '@renderer/stores/explorerState'

const { t } = useI18n()
const { explorerState } = storeToRefs(useExplorerStateStore())
const { loading } = defineProps<{
  loading: boolean
}>()

function clearFilters() {
  explorerState.value.filters.type = []
  explorerState.value.filters.status = []
}

function removeFilterType(tag: FilterType) {
  explorerState.value.filters.type = explorerState.value.filters.type.filter((type) => type !== tag)
}

function removeFilterStatus(tag: FilterStatus) {
  explorerState.value.filters.status = explorerState.value.filters.status.filter(
    (status) => status !== tag
  )
}
</script>

<style scoped></style>
