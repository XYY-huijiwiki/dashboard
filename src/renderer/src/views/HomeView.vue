<template>
  <n-flex vertical class="h-full">
    <file-search-bar v-model:search-text="searchText" @search="queryData" />
    <file-operations-bar
      v-model:checked-row-keys="checkedRowKeys"
      v-model:show-details-pane="showDetailsPane"
      @file-preview="preview = checkedItems[0]"
      @link-copy="linkCopy"
      @file-download="fileDownload"
      @file-delete="deleteFiles"
      @file-rename="renameFile"
      @new-file="newFile"
    />
    <filter-alert />
    <n-split
      v-model:size="detailsDrawerSize"
      direction="horizontal"
      :min="0.6"
      :max="0.8"
      :pane1-class="showDetailsPane ? 'pr-1' : ''"
      pane2-class="pl-1"
      :resize-trigger-size="showDetailsPane ? 3 : 0"
      class="flex-1 shrink-0 !h-0"
    >
      <template #1>
        <file-preview v-if="preview" v-model="preview" />
        <template v-else>
          <file-list-table
            v-if="explorerState.viewMode === 'details' || explorerState.viewMode === 'list'"
            v-model:checked-row-keys="checkedRowKeys"
            :checked-items="checkedItems"
            :data="data"
            :loading="loading"
            :files-in-use="filesInUse"
            @load-more="!loading && queryData('more')"
            @file-preview="preview = checkedItems[0]"
            @file-details="showDetailsPane = true"
            @link-copy="linkCopy"
            @file-download="fileDownload"
            @file-delete="deleteFiles"
            @file-rename="renameFile"
            @new-file="newFile"
          />
          <file-list-grid
            v-else
            v-model:checked-row-keys="checkedRowKeys"
            :data="data"
            :checked-items="checkedItems"
            :loading="loading"
            @load-more="!loading && queryData('more')"
            @file-preview="preview = checkedItems[0]"
            @file-details="showDetailsPane = true"
            @link-copy="linkCopy"
            @file-download="fileDownload"
            @file-delete="deleteFiles"
            @file-rename="renameFile"
            @new-file="newFile"
          />
        </template>
      </template>
      <template v-if="showDetailsPane" #2>
        <file-details
          :file-details="checkedItems"
          @close="showDetailsPane = false"
          @edit-file="editFile"
        />
      </template>
    </n-split>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, h } from 'vue'
import type { Ref } from 'vue'
import type { DataTableRowKey } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { storeToRefs } from 'pinia'
import ky from 'ky'

import { dayjsLocales } from '@renderer/stores/locales'
import fileListTable from '@renderer/components/FileListTable.vue'
import FileOperationsBar from '@renderer/components/FileOperationsBar.vue'
import db from '@renderer/utils/queryDB'
import { genRawFileUrl } from '@renderer/utils/genUrl'
import { useSettingsStore } from '@renderer/stores/settings'
import { useExplorerStateStore } from '@renderer/stores/explorerState'

const { t } = useI18n()

const { settings } = storeToRefs(useSettingsStore())
const { explorerState } = storeToRefs(useExplorerStateStore())

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

function fileDownload(): void {
  checkedItems.value.forEach((item) => {
    const download_url = genRawFileUrl(item)
    if (download_url) {
      window.open(download_url)
    } else {
      window.$notification.error({
        title: t('github-files.msg-download-failed'),
        content: t('github-files.msg-download-failed-desc', [item.file_name]),
        meta: new Date().toLocaleString()
      })
    }
  })
}

function linkCopy(): void {
  navigator.clipboard.writeText(checkedItems.value.map((item) => genRawFileUrl(item)).join('\n'))
  window.$message.success(t('github-files.msg-link-copied'))
}

// preview
const preview: Ref<FileRecord | undefined> = ref(undefined)

const loading: Ref<boolean> = ref(true)

const data: Ref<FileRecord[]> = ref([])
const filesInUse: Ref<string[]> = ref([])
const checkedRowKeys = ref<DataTableRowKey[]>([])

/*
 *
 * Details Pane
 *
 */
const checkedItems: Ref<FileRecord[]> = computed(() => {
  if (checkedRowKeys.value.length === 0) {
    return []
  } else {
    return data.value.filter((item) => checkedRowKeys.value.includes(item.file_name))
  }
})
const showDetailsPane = ref(false)
const detailsDrawerSizeTemp = ref(0.7)
const detailsDrawerSize = ref(1)
watch(showDetailsPane, (value) => {
  if (value) {
    detailsDrawerSize.value = detailsDrawerSizeTemp.value
  } else {
    detailsDrawerSizeTemp.value = detailsDrawerSize.value
    detailsDrawerSize.value = 1
  }
})

onMounted(async () => {
  loading.value = true

  // get data from XYY-huijiwiki
  try {
    let filesInUseTemp: string[] = []
    let ifContinue = true
    do {
      const params = {
        action: 'query',
        list: 'querypage',
        qppage: 'Wantedfiles',
        format: 'json',
        qplimit: 'max',
        qpoffset: filesInUseTemp.length.toString()
      }
      const res: {
        batchcomplete: string
        continue:
          | {
              qpoffset: number
              continue: string
            }
          | undefined
        query: {
          querypage: {
            name: string
            results: {
              value: string
              ns: number
              title: string
            }[]
          }
        }
      } = await ky.get('https://xyy.huijiwiki.com/api.php?' + new URLSearchParams(params)).json()
      filesInUseTemp.push(
        ...res.query.querypage.results.map((item) =>
          decodeURIComponent(item.title).replace(/ /g, '_').replace('文件:', '')
        )
      )
      ifContinue = res.continue !== undefined
    } while (ifContinue)
    // filter filesInUse
    filesInUseTemp = filesInUseTemp.filter((item) => item.startsWith('GitHub:'))
    // remove "GitHub:" from filesInUse
    filesInUse.value = filesInUseTemp.map((item) => item.replace('GitHub:', ''))

    await queryData()
  } catch (error) {
    console.dir(error)
    window.$notification.error({
      title: t('github-files.msg-rename-failed'),
      content: `${error}`,
      meta: dayjs().format('lll')
    })
  } finally {
    loading.value = false
  }
})

const searchText = ref('')
const totalItemCount = ref(0)
async function queryData(type: 'more' | 'refresh' = 'refresh'): Promise<void> {
  if (type === 'more' && data.value.length >= totalItemCount.value) return

  loading.value = true

  try {
    const query = db('files').limit(settings.value.fileListPageSize).whereNull('is_deleted')

    if (type === 'more') query.offset(data.value.length)

    // sorter
    const order = explorerState.value.sorterOrder === 'ascend' ? 'ASC' : 'DESC'
    if (explorerState.value.sorterKey === 'name') {
      query.orderBy('file_name', order)
    } else if (explorerState.value.sorterKey === 'size') {
      query.orderBy('file_size', order)
    } else if (explorerState.value.sorterKey === 'type') {
      query.orderBy('content_type', order)
    } else if (explorerState.value.sorterKey === 'updated_at') {
      query.orderBy('updated_at', order)
    }

    // search
    if (searchText.value) {
      query.andWhereLike('file_name', `%${searchText.value}%`)
    }

    // filter file type
    const fileType = explorerState.value.filters.type
    if (fileType && fileType.length > 0 && fileType.length !== 5) {
      query.andWhere((builder) => {
        for (let index = 0; index < fileType.length; index++) {
          const element = fileType[index]
          if (element === 'image') builder.orWhereLike('content_type', 'image%')
          if (element === 'audio') builder.orWhereLike('content_type', 'audio%')
          if (element === 'video') builder.orWhereLike('content_type', 'video%')
          if (element === 'text') builder.orWhereLike('content_type', 'text%')
          if (element === 'other')
            builder.orWhereNot((innerBuilder) => {
              innerBuilder
                .orWhereLike('content_type', 'image%')
                .orWhereLike('content_type', 'audio%')
                .orWhereLike('content_type', 'video%')
                .orWhereLike('content_type', 'text%')
            })
        }
      })
    }

    // filter file status
    const fileStaus = explorerState.value.filters.status
    if (fileStaus.includes('no source')) {
      query.andWhere('source', '')
    }
    if (fileStaus.includes('no licence')) {
      query.andWhere('licence', '')
    }

    // get total item count
    const url = new URL('https://xyy-huijiwiki-gh-files-db.karsten-zhou-773.workers.dev/')
    if (type === 'refresh') {
      const queryStr = query.clone().count().toString()
      url.searchParams.set('query', queryStr)
      totalItemCount.value = ((await ky.get(url.href).json()) as DbResponse)[0]['results'][0][
        `count(*)`
      ]
      console.log('totalItemCount', totalItemCount.value)
    }

    // get data from database
    const queryStr = query.toString()
    console.log(queryStr)
    url.searchParams.set('query', queryStr)

    if (type === 'more') {
      data.value.push(...((await ky.get(url.href).json()) as DbResponse)[0].results)
    } else {
      data.value = ((await ky.get(url.href).json()) as DbResponse)[0].results
    }
  } catch (error) {
    console.dir(error)
    window.$notification.error({
      title: t('general.error'),
      content: `${error}`,
      meta: dayjs().format('lll')
    })
  } finally {
    loading.value = false
  }
}

// watch sorter and filters
watch(
  () => [
    explorerState.value.sorterKey,
    explorerState.value.sorterOrder,
    explorerState.value.filters.type,
    explorerState.value.filters.status
  ],
  () => queryData()
)

// new file
async function newFile(): Promise<void> {
  const NewFileDialog = (await import('@renderer/components/NewFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: t('github-files.title-new'),
    preset: 'dialog',
    showIcon: false,
    style: 'width: 480px; max-width: 100%',
    content: () =>
      h(NewFileDialog, {
        onClose: () => modalInstance.destroy(),
        onDone: () => queryData(),
        onLoadingStart: () => {
          modalInstance.closable = false
          modalInstance.closeOnEsc = false
          modalInstance.maskClosable = false
        },
        onLoadingEnd: () => {
          modalInstance.closable = true
          modalInstance.closeOnEsc = true
          modalInstance.maskClosable = true
        }
      })
  })
}

// delete files
async function deleteFiles(): Promise<void> {
  const isPlural = checkedItems.value.length > 1
  const DeleteFileDialog = (await import('@renderer/components/DeleteFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: isPlural ? t(`github-files.title-files-delete`) : t(`github-files.title-file-delete`),
    preset: 'dialog',
    showIcon: false,
    style: 'width: 480px; max-width: 100%',
    content: () =>
      h(DeleteFileDialog, {
        onClose: () => modalInstance.destroy(),
        onDone: () => queryData(),
        onLoadingStart: () => {
          modalInstance.closable = false
          modalInstance.closeOnEsc = false
          modalInstance.maskClosable = false
        },
        onLoadingEnd: () => {
          modalInstance.closable = true
          modalInstance.closeOnEsc = true
          modalInstance.maskClosable = true
        },
        fileRecords: checkedItems.value
      })
  })
}

// rename file
async function renameFile(): Promise<void> {
  const RenameFileDialog = (await import('@renderer/components/RenameFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: t('github-files.title-rename'),
    preset: 'dialog',
    showIcon: false,
    style: 'width: 480px; max-width: 100%',
    content: () =>
      h(RenameFileDialog, {
        onClose: () => modalInstance.destroy(),
        onDone: () => queryData(),
        onLoadingStart: () => {
          modalInstance.closable = false
          modalInstance.closeOnEsc = false
          modalInstance.maskClosable = false
        },
        onLoadingEnd: () => {
          modalInstance.closable = true
          modalInstance.closeOnEsc = true
          modalInstance.maskClosable = true
        },
        fileRecord: checkedItems.value[0]
      })
  })
}

// edit file (source and licence)
async function editFile(): Promise<void> {
  const EditFileDialog = (await import('@renderer/components/EditFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: t('github-files.title-edit'),
    preset: 'dialog',
    showIcon: false,
    style: 'width: 480px; max-width: 100%',
    content: () =>
      h(EditFileDialog, {
        onClose: () => modalInstance.destroy(),
        onDone: () => queryData(),
        onLoadingStart: () => {
          modalInstance.closable = false
          modalInstance.closeOnEsc = false
          modalInstance.maskClosable = false
        },
        onLoadingEnd: () => {
          modalInstance.closable = true
          modalInstance.closeOnEsc = true
          modalInstance.maskClosable = true
        },
        fileRecord: checkedItems.value[0]
      })
  })
}
</script>
