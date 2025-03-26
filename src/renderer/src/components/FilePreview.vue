<template>
  <n-card
    class="w-full h-full"
    content-style="height: 0; display: flex; flex-direction: column;"
    :closable="props.closable"
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
        :src="genRawFileUrl(fileRecord)"
      ></video>
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
        :src="genRawFileUrl(fileRecord)"
      ></audio>
      <!-- model -->
      <model-viewer
        v-else-if="fileRecord?.content_type?.startsWith('model')"
        autoplay
        :src="genRawFileUrl(fileRecord)"
        camera-controls
        touch-action="pan-y"
        style="width: 100%; height: 100%"
        :poster="genThumbUrl(fileRecord)"
      ></model-viewer>
      <!-- flash swf -->
      <embed
        v-else-if="fileRecord?.content_type?.startsWith('application/x-shockwave-flash')"
        :src="genRawFileUrl(fileRecord)"
        class="w-full h-0 flex-1 object-contain bg-black"
        type="application/x-shockwave-flash"
      />
      <!-- no preview -->
      <n-result
        v-else
        :title="fileRecord?.file_name"
        :description="t('github-files.msg-no-preview')"
      >
        <template #icon>
          <icon icon="fluent:document-unknown-24-regular" width="80" />
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
import { Icon } from '@iconify/vue'
import { nextTick, watch } from 'vue'

import fileIcon from './FileIcon.vue'
import { genThumbUrl, genRawFileUrl } from '@renderer/utils/genUrl'

const { t } = useI18n()
const fileRecord = defineModel<FileRecord>()
const props = defineProps<{
  closable?: boolean
}>()

// Dynamic import
const unwatch = watch(
  fileRecord,
  async (file) => {
    // for models
    if (file?.content_type?.startsWith('model')) {
      import('@google/model-viewer')
      await nextTick() // prevent unwatch() being called before init
      unwatch()
    }
    // for flash swf
    else if (file?.content_type?.startsWith('application/x-shockwave-flash')) {
      const scriptElement = document.createElement('script')
      scriptElement.src = 'https://unpkg.com/@ruffle-rs/ruffle'
      document.body.appendChild(scriptElement)
      await nextTick() // prevent unwatch() being called before init
      unwatch()
    }
  },
  { immediate: true }
)
</script>

<style scoped></style>
