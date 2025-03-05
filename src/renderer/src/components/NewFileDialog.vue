<template>
  <n-flex vertical>
    <n-flex vertical class="my-8">
      <n-alert v-if="fileName.match(/\s/)" type="warning">
        {{ t('github-files.msg-space-replacement-warning') }}
      </n-alert>
      <n-input-group>
        <n-button @click="handleSelectFile">
          {{ t('github-files.btn-select-file') }}
        </n-button>
        <n-input v-model:value="fileName" :disabled="!selectedFile" />
      </n-input-group>
      <n-select
        v-model:value="fileLicense"
        :placeholder="t('github-files.label-file-licence')"
        :options="licenceOptions"
      ></n-select>
      <n-input
        v-model:value="fileSource"
        type="textarea"
        :placeholder="t('github-files.label-file-source')"
      ></n-input>
      <component :is="genWikitextDom(fileSource)" v-if="fileSource" />
    </n-flex>
    <!-- footer (action) -->
    <n-flex justify="end">
      <n-button :disabled="loading" @click="$emit('close')">
        {{ t('general.btn-cancel') }}
      </n-button>
      <n-button :loading="loading" type="primary" :disabled="!canUpload" @click="confirmNewFile()">
        {{ t('general.btn-confirm') }}
      </n-button>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, computed, type Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import { useSettingsStore } from '@renderer/stores/settings'
import { dayjsLocales } from '@renderer/stores/locales'
import db from '@renderer/utils/queryDB'
import licenceOptions from '@renderer/utils/licenceOptions'
import genWikitextDom from '@renderer/utils/genWikitextDom'

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

const { t } = useI18n()

const { settings } = storeToRefs(useSettingsStore())

const loading = ref(false)
const fileName = ref('')
const fileLicense: Ref<null | string> = ref(null)
const fileSource: Ref<null | string> = ref(null)
const selectedFile = ref<Awaited<ReturnType<typeof window.api.openFileDialog>> | null>(null)
const canUpload = computed(
  () => !!selectedFile.value && !!fileName.value && !!fileLicense.value && !!fileSource.value
)

const emit = defineEmits(['close', 'done', 'loading-start', 'loading-end'])
watch(loading, (v) => {
  if (v) emit('loading-start')
  else emit('loading-end')
})

async function handleSelectFile(): Promise<void> {
  const file = await window.api.openFileDialog()
  if (!file) return
  selectedFile.value = file
  fileName.value = file.name
}

async function confirmNewFile(): Promise<void> {
  if (!selectedFile.value) return

  // start loading
  loading.value = true

  // replace space with underscore in file name
  const fileNameToBeUsed = fileName.value.trim().replaceAll(' ', '_')

  try {
    // step 1: upload to github
    const ghRes = await window.api.uploadToGitHub({
      owner: settings.value.ghOwner,
      repo: settings.value.ghRepo,
      releaseId: `${settings.value.rootReleaseId}`,
      ghToken: settings.value.ghToken,
      filePath: selectedFile.value.path,
      fileName: fileNameToBeUsed
    })

    console.log('ghRes', ghRes)

    // step 2: update database
    const wikitext = ``
    const query = db('files')
      .insert({
        id: ghRes.id,
        file_name: fileNameToBeUsed,
        file_name_base62: ghRes.name,
        file_size: ghRes.size,
        content_type: ghRes.content_type,
        uploader: ghRes.uploader.login,
        updated_at: ghRes.updated_at,
        wikitext,
        licence: fileLicense.value,
        source: fileSource.value
      })
      .toString()
    const url = new URL(settings.value.databaseUrl)
    url.searchParams.set('query', query)
    url.searchParams.set('gh_token', settings.value.ghToken)
    const dbRes = await fetch(url.href)
    console.log('dbRes', dbRes)

    window.$message.success(t('github-files.msg-upload-success'))
    emit('done')
  } catch (error) {
    console.dir(error)
    window.$notification.error({
      title: t('github-files.msg-upload-failed'),
      content: `${error}`,
      meta: dayjs().format('lll')
    })
  } finally {
    loading.value = false
    emit('close')
  }
}
</script>

<style scoped></style>
