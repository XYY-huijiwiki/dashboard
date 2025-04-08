<template>
  <n-spin
    v-if="
      explorerState.filters.type.length || explorerState.filters.status.length
    "
    :show="loading"
  >
    <n-alert>
      <template #default>
        <n-flex justify="space-between">
          <n-flex>
            <n-flex v-if="explorerState.filters.type.length">
              <n-text>{{ t('file-explorer.label-filtered-type') }}</n-text>
              <n-tag
                v-for="type in explorerState.filters.type"
                :key="type"
                size="small"
                closable
                round
                @close="removeFilterType(type)"
              >
                {{
                  {
                    image: t('github-files.table-header.btn-filter-by-image'),
                    video: t('github-files.table-header.btn-filter-by-video'),
                    audio: t('github-files.table-header.btn-filter-by-audio'),
                    text: t('github-files.table-header.btn-filter-by-text'),
                    other: t('github-files.table-header.btn-filter-by-other'),
                  }[type]
                }}
              </n-tag>
            </n-flex>
            <n-flex v-if="explorerState.filters.status.length">
              <n-text>{{ t('file-explorer.label-filtered-status') }}</n-text>
              <n-tag
                v-for="status in explorerState.filters.status"
                :key="status"
                size="small"
                closable
                round
                @close="removeFilterStatus(status)"
              >
                <!-- {{ status }} -->
                {{
                  {
                    unused: t('github-files.status-unused'),
                    wanted: t('github-files.status-wanted'),
                    'no source': t('github-files.status-no-source'),
                    'no licence': t('github-files.status-no-licence'),
                  }[status]
                }}
              </n-tag>
            </n-flex>
          </n-flex>
          <n-button
            size="tiny"
            round
            icon-placement="right"
            @click="clearFilters()"
          >
            {{ t('file-explorer.btn-clear-filters') }}
            <template #icon>
              <icon icon="fluent:filter-dismiss-16-regular" width="16" />
            </template>
          </n-button>
        </n-flex>
      </template>
      <template #icon>
        <icon icon="fluent:filter-24-regular" width="24" />
      </template>
    </n-alert>
  </n-spin>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
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
  explorerState.value.filters.type = explorerState.value.filters.type.filter(
    (type) => type !== tag,
  )
}

function removeFilterStatus(tag: FilterStatus) {
  explorerState.value.filters.status =
    explorerState.value.filters.status.filter((status) => status !== tag)
}
</script>

<style scoped></style>
