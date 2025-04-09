<template>
  <n-scrollbar>
    <n-list v-if="downloads.length" hoverable class="download-list">
      <n-list-item
        v-for="download in downloads"
        :key="download.uuid"
        :style="{ 'view-transition-name': `dl-item-${download.uuid}` }"
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
              v-if="
                ['completed', 'error', 'cancelled', 'deleted'].includes(
                  download.status,
                )
              "
              quaternary
              size="tiny"
              :title="t('download-manager.btn-remove-from-list')"
              @click="removeDownload(download.uuid)"
            >
              <template #icon>
                <icon icon="fluent:dismiss-20-regular" />
              </template>
            </n-button>
          </template>
          <template #footer>
            <n-text
              v-if="download.status === 'error'"
              class="text-xs"
              type="error"
            >
              {{ download.error }}
            </n-text>
            <n-progress
              type="line"
              :percentage="download.progress"
              :status="progressStatusMapper[download.status]"
              :processing="download.status === 'downloading'"
            />
          </template>
          <template #action>
            <n-flex justify="space-between">
              <n-flex>
                <n-text class="text-xs" strong>
                  {{
                    {
                      pending: t("download-manager.label-pending"),
                      downloading: t("download-manager.label-downloading"),
                      completed: t("download-manager.label-completed"),
                      error: t("download-manager.label-error"),
                      cancelled: t("download-manager.label-cancelled"),
                      deleted: t("download-manager.label-deleted"),
                      paused: t("download-manager.label-paused"),
                    }[download.status]
                  }}
                </n-text>
                <n-divider v-if="download.status === 'downloading'" vertical />
                <n-text
                  v-if="download.status === 'downloading'"
                  class="text-xs"
                >
                  {{
                    t("download-manager.msg-downloading-info", {
                      downloadedSize: filesize(download.transferredBytes),
                      totalSize: filesize(download.totalBytes),
                      speed: filesize(download.downloadRateBytesPerSecond),
                      eta: Math.ceil(download.estimatedTimeRemainingSeconds),
                    })
                  }}
                </n-text>
              </n-flex>
              <n-flex>
                <n-button
                  v-if="download.status === 'completed'"
                  size="tiny"
                  @click="showInFolder(download.path)"
                >
                  {{ t("download-manager.btn-show-in-folder") }}
                </n-button>
                <n-button
                  v-if="download.status === 'downloading'"
                  size="tiny"
                  @click="
                    (pauseDownload(download.downloadId),
                    (download.status = 'paused'))
                  "
                >
                  {{ t("download-manager.btn-pause") }}
                </n-button>
                <n-button
                  v-if="download.status === 'paused'"
                  size="tiny"
                  @click="
                    (resumeDownload(download.downloadId),
                    (download.status = 'downloading'))
                  "
                >
                  {{ t("download-manager.btn-resume") }}
                </n-button>
                <n-button
                  v-if="['downloading', 'paused'].includes(download.status)"
                  size="tiny"
                  @click="
                    (cancelDownload(download.downloadId),
                    (download.status = 'cancelled'))
                  "
                >
                  {{ t("download-manager.btn-cancel") }}
                </n-button>
              </n-flex>
            </n-flex>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>
    <n-empty v-else>
      {{ t("download-manager.msg-no-downloads") }}
    </n-empty>
  </n-scrollbar>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { remove } from "lodash-es";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { filesize as filesizeNoLocale } from "filesize";
import type { ProgressStatus } from "naive-ui";

import { useLocalesStore } from "@renderer/stores/locales";
import { useDownloadStore } from "@renderer/stores/download";
import { onMounted } from "vue";

const { t } = useI18n();
const { langCode } = storeToRefs(useLocalesStore());
const filesize = (size: number): string =>
  filesizeNoLocale(size, { locale: langCode.value });
const { pauseDownload, resumeDownload, cancelDownload } = useDownloadStore();
const { downloads } = storeToRefs(useDownloadStore());

function removeDownload(uuid: string) {
  document.startViewTransition(() =>
    remove(downloads.value, (download) => download.uuid === uuid),
  );
}

function getOrigin(url: string) {
  const _url = new URL(url);
  return _url.origin;
}

function showInFolder(path: string | null) {
  if (!path) throw new Error("Path is not available");
  window.api.showInFolder(path);
}

function openFile(path: string | null) {
  if (!path) throw new Error("Path is not available");
  window.api.openFile(path);
}

const progressStatusMapper: Record<string, ProgressStatus> = {
  pending: "default",
  downloading: "default",
  completed: "success",
  error: "error",
  cancelled: "warning",
  deleted: "error",
  paused: "warning",
};

onMounted(async () => {
  for (const download of downloads.value) {
    if (download.status === "completed") {
      if (await window.api.isFileExists(download.path || "")) {
        download.status = "completed";
      } else {
        download.status = "deleted";
      }
    }
  }
});
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
