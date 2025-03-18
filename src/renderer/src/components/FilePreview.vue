<template>
  <n-card
    closable
    class="w-full h-full"
    content-style="height: 0; display: flex; flex-direction: column;"
    @close="fileRecord = undefined"
  >
    <template #header>
      <n-ellipsis>
        <file-icon :file-type="fileRecord?.content_type" />
        {{ fileRecord?.file_name }}
      </n-ellipsis>
    </template>
    <template #default>
      <!-- video -->
      <video
        v-if="fileRecord?.content_type?.startsWith('video')"
        controls
        class="w-full h-0 flex-1 object-contain bg-black"
        :poster="genThumbUrl(fileRecord)"
        preload="metadata"
      >
        <source :src="genRawFileUrl(fileRecord)" :type="fileRecord?.content_type" />
      </video>
      <!-- image -->
      <img
        v-else-if="fileRecord?.content_type?.startsWith('image')"
        :src="genRawFileUrl(fileRecord)"
        class="w-full h-0 flex-1 object-contain bg-black"
      />
      <!-- audio -->
      <audio
        v-else-if="fileRecord?.content_type?.startsWith('audio')"
        ref="audioEle"
        controls
        class="w-full"
        preload="metadata"
      >
        <source :src="genRawFileUrl(fileRecord)" :type="fileRecord?.content_type" />
      </audio>
      <!-- model -->
      <model-viewer
        v-else-if="fileRecord?.content_type?.startsWith('model')"
        autoplay
        auto-rotate
        :src="genRawFileUrl(fileRecord)"
        camera-controls
        touch-action="pan-y"
        style="width: 100%; height: 100%"
        :poster="genThumbUrl(fileRecord)"
      ></model-viewer>
      <!-- no preview -->
      <n-result
        v-else
        :title="fileRecord?.file_name"
        :description="t('github-files.msg-no-preview')"
      >
        <template #icon>
          <n-icon :size="80">
            <Document48Regular />
          </n-icon>
        </template>
        <template #footer>
          <n-button tag="a" :href="fileRecord && genRawFileUrl(fileRecord)">
            {{ t('github-files.btn-download') }}
          </n-button>
        </template>
      </n-result>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Document48Regular } from '@vicons/fluent'
import '@google/model-viewer'

import fileIcon from './FileIcon.vue'
import { genThumbUrl, genRawFileUrl } from '@renderer/utils/genUrl'

const { t } = useI18n()
const fileRecord = defineModel<FileRecord>()
</script>

<style scoped></style>
