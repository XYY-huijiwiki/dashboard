<template>
  <n-flex vertical>
    <n-text class="my-8">{{
      fileRecords.length > 1
        ? t('github-files.msg-files-delete-confirmation')
        : t('github-files.msg-file-delete-confirmation')
    }}</n-text>
    <!-- footer (action) -->
    <n-flex justify="end">
      <n-button :disabled="loading" @click="$emit('close')">
        {{ t('general.btn-cancel') }}
      </n-button>
      <n-button :loading="loading" type="error" @click="confirmDelete()">
        {{ t('general.btn-confirm') }}
      </n-button>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import { useSettingsStore } from '@renderer/stores/settings'
import db from '@renderer/utils/queryDB'
import { ghUpdateAsset } from '@renderer/utils/octokit'
import { dayjsLocales } from '@renderer/stores/locales'

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

const { t } = useI18n()
const { settings } = storeToRefs(useSettingsStore())

const { fileRecords } = defineProps<{
  fileRecords: FileRecord[]
}>()

const loading = ref(false)

const emit = defineEmits(['close', 'done', 'loading-start', 'loading-end'])
watch(loading, (v) => {
  if (v) emit('loading-start')
  else emit('loading-end')
})

async function confirmDelete(): Promise<void> {
  loading.value = true

  try {
    // Loop through each file and update database to set is_deleted flag
    for await (const fileRecord of fileRecords) {
      console.log(`===fileRecord===`)
      console.log(fileRecord)
      // Step 1: rename the file to a uuid in GitHub
      const uuid = uuidv4()
      const fileExt = fileRecord.file_name.split('.').pop()
      const uuidName = uuid + '.' + fileExt
      const ghRes = await ghUpdateAsset(fileRecord.id, uuidName)
      console.log('Renaming result for file', fileRecord.file_name, ':', ghRes.name)
      console.log(`===ghRes===`)
      console.log(ghRes)

      // Step 2: update the database
      const query = db('files')
        .where('id', fileRecord.id)
        .update({
          is_deleted: true,
          deleted_at: ghRes.updated_at,
          file_name_before_deleted: fileRecord.file_name,
          file_name: uuidName,
          file_name_base62: uuidName
        })
        .toString()

      const url = new URL('https://xyy-huijiwiki-gh-files-db.karsten-zhou-773.workers.dev/')
      url.searchParams.set('query', query)
      url.searchParams.set('gh_token', settings.value.ghToken)

      const dbRes = await fetch(url.href)
      console.log('Deletion result for file', fileRecord.id, ':', dbRes)
    }

    window.$message.success(t('github-files.msg-delete-success'))
    emit('done')
  } catch (error) {
    console.dir(error)
    window.$notification.error({
      title: t('github-files.msg-delete-failed'),
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
