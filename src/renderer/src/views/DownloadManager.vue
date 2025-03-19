<template>
  <n-scrollbar>
    <n-list v-if="downloads.length" hoverable class="download-list">
      <n-list-item
        v-for="download in downloads"
        :key="download.uuid"
        :style="{ 'view-transition-name': download.uuid }"
      >
        <n-thing content-indented>
          <template #avatar>
            <file-icon :file-type="download.mimeType" :size="28" />
          </template>
          <template #header>
            <clickable-text
              class="text-base"
              :text="download.filename"
              @click="openFile(download.path)"
            />
          </template>
          <template #description>
            <n-text class="text-sm">
              {{ getOrigin(download.url) }}
            </n-text>
          </template>
          <template #header-extra>
            <n-button
              v-if="download.status === 'completed'"
              quaternary
              size="small"
              :title="t('download-manager.btn-remove-from-list')"
              @click="removeDownload(download.uuid)"
            >
              <template #icon>
                <icon icon="fluent:dismiss-20-regular" />
              </template>
            </n-button>
          </template>
          <template #footer>
            <n-progress type="line" :percentage="download.progress" />
          </template>
          <template #action>
            <n-flex>
              <n-button
                v-if="download.status === 'downloading'"
                size="small"
                @click="cancelDownload(download.downloadId)"
              >
                Cancel
              </n-button>
              <n-button size="small" @click="showInFolder(download.path)">
                {{ t('download-manager.btn-show-in-folder') }}
              </n-button>
            </n-flex>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>
    <n-empty v-else>
      {{ t('download-manager.msg-no-downloads') }}
    </n-empty>
  </n-scrollbar>
</template>

<script setup lang="ts">
import { useDownloadStore } from '@renderer/stores/download'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { dayjsLocales } from '@renderer/stores/locales'
import { remove } from 'lodash-es'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

const { cancelDownload } = useDownloadStore()
const { downloads } = storeToRefs(useDownloadStore())

function removeDownload(uuid: string) {
  document.startViewTransition(() => remove(downloads.value, (download) => download.uuid === uuid))
}

function getOrigin(url: string) {
  const _url = new URL(url)
  return _url.origin
}

function showInFolder(path: string | null) {
  if (!path) throw new Error('Path is not available')
  window.api.showInFolder(path)
}

function openFile(path: string | null) {
  if (!path) throw new Error('Path is not available')
  window.api.openFile(path)
}
</script>

<style scoped>
.download-list :deep(.n-thing-avatar) {
  flex: none;
}
.download-list :deep(.n-thing-header__title) {
  flex: auto;
  width: 0;
}
</style>
