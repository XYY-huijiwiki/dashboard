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
        {{
          fileRecord?.is_deleted
            ? fileRecord?.file_name_before_deleted
            : fileRecord?.file_name
        }}
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
      <view-model-async
        v-else-if="fileRecord?.content_type?.startsWith('model')"
        :model-url="genRawFileUrl(fileRecord)"
        :poster-url="genThumbUrl(fileRecord)"
      ></view-model-async>
      <!-- flash swf -->
      <embed
        v-else-if="
          fileRecord?.content_type?.startsWith('application/x-shockwave-flash')
        "
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
import { defineAsyncComponent } from 'vue'

import fileIcon from './FileIcon.vue'
import { genThumbUrl, genRawFileUrl } from '@renderer/utils/genUrl'

const { t } = useI18n()
const fileRecord = defineModel<FileRecord>()
const props = defineProps<{
  closable?: boolean
}>()

const ViewModelAsync = defineAsyncComponent(() => import('./ViewModel.vue'))
</script>

<style scoped></style>
