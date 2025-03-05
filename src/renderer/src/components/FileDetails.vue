<template>
  <n-card class="h-full" closable content-class="h-0  " @close="emit('close')">
    <!-- for non single selected situtation -->
    <template v-if="fileDetails.length !== 1" #header>
      <n-ellipsis>
        <file-icon />
        {{ t('github-files.msg-number-files-selected', [fileDetails.length]) }}
      </n-ellipsis>
    </template>
    <!-- header: file name -->
    <template v-else-if="fileDetails.length === 1" #header>
      <n-ellipsis>
        <file-icon :file-type="fileDetails[0].content_type" />
        {{ fileDetails[0].file_name }}
      </n-ellipsis>
    </template>
    <!-- file thumb -->
    <template v-if="fileDetails.length === 1 && genThumbUrl(fileDetails[0])" #cover>
      <div class="bg-black">
        <img class="object-contain aspect-video" :src="genThumbUrl(fileDetails[0])" />
      </div>
    </template>
    <!-- file details -->
    <template v-if="fileDetails.length === 1" #default>
      <n-scrollbar>
        <!-- file details / basic info -->
        <n-divider>{{ t('github-files.label-basic-info') }}</n-divider>
        <n-flex vertical>
          <n-statistic :label="t('github-files.label-file-type')">
            {{ fileDetails[0].content_type }}
          </n-statistic>
          <n-statistic :label="t('github-files.label-file-size')">
            {{ filesize(fileDetails[0].file_size) }}
          </n-statistic>
        </n-flex>
        <!-- file details / desc -->
        <n-divider>
          {{ t('github-files.label-file-desc') }}
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle @click="emit('edit-file')">
                <template #icon>
                  <n-icon><edit16-regular /></n-icon>
                </template>
              </n-button>
            </template>
            <template #default>
              {{ t('github-files.title-edit') }}
            </template>
          </n-tooltip>
        </n-divider>
        <n-table :single-line="false">
          <tbody>
            <tr>
              <td>{{ t('github-files.label-file-source') }}</td>
              <td>{{ fileDetails[0].source }}</td>
            </tr>
            <tr>
              <td>{{ t('github-files.label-file-licence') }}</td>
              <td>{{ fileDetails[0].licence }}</td>
            </tr>
          </tbody>
        </n-table>
        <!-- file details / file usage -->
        <n-divider>{{ t('github-files.label-file-usage') }}</n-divider>
        <template v-if="fileUsageLoading || fileUsageData === null">
          <n-skeleton text :repeat="2" /> <n-skeleton text class="!w-6/10" />
        </template>
        <n-empty
          v-else-if="fileUsageData.length === 0"
          :description="t(`github-files.msg-file-no-usage`)"
        />
        <div v-else class="markdown-body !bg-transparent">
          <ul>
            <li v-for="item in fileUsageData" :key="item">
              <a :href="`https://xyy.huijiwiki.com/wiki/${item}`" target="_blank">{{ item }}</a>
            </li>
          </ul>
        </div>
        <!-- code snippet -->
        <n-divider>{{ t('github-files.label-code-snippet') }}</n-divider>
        <p>{{ t('github-files.code-snippet-image') }}</p>
        <suspense>
          <code-block :code="`[[文件:GitHub:${fileDetails[0].file_name}]]`" lang="wikitext" />
        </suspense>
        <p>{{ t('github-files.code-snippet-link') }}</p>
        <suspense>
          <code-block :code="`[[:文件:GitHub:${fileDetails[0].file_name}]]`" lang="wikitext" />
        </suspense>
        <p>{{ t('github-files.code-snippet-gallery') }}</p>
        <suspense>
          <code-block
            :code="`<gallery>\nGitHub:${fileDetails[0].file_name}\n</gallery>`"
            lang="wikitext"
          />
        </suspense>
      </n-scrollbar>
    </template>
    <!-- action btns -->
    <template v-if="fileDetails.length === 1" #action>
      <n-button @click="viewInXYYWiki">
        {{ t('github-files.btn-view-in-XYY-wiki') }}
      </n-button>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { filesize as filesizeNoLocale } from 'filesize'
import { storeToRefs } from 'pinia'
import { computedAsync } from '@vueuse/core'
import { Edit16Regular } from '@vicons/fluent'

import { useLocalesStore } from '@renderer/stores/locales'
import { genThumbUrl } from '@renderer/utils/genUrl'
import getWhatLinksHere from '@renderer/utils/getWhatLinksHere'

const { langCode } = storeToRefs(useLocalesStore())
const filesize = (size: number): string => filesizeNoLocale(size, { locale: langCode.value })
const { t } = useI18n()
const { fileDetails } = defineProps<{
  fileDetails: FileRecord[]
}>()
const emit = defineEmits(['close', 'edit-file'])

function viewInXYYWiki(): void {
  window.open(
    `https://xyy.huijiwiki.com/wiki/Project:迷你控制中心#/github-file/${fileDetails[0].file_name}`
  )
}

const fileUsageLoading = ref(false)
const fileUsageData: Ref<string[]> = computedAsync(
  async () => {
    if (fileDetails.length !== 1) return []
    else return await getWhatLinksHere(`File:GitHub:${fileDetails[0].file_name}`)
  },
  [], // initial state
  fileUsageLoading // loading state
)
</script>
