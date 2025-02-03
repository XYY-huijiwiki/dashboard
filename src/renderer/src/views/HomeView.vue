<template>
  <n-flex vertical class="h-full">
    <file-search-bar v-model:search-text="searchText" @search="queryData" />
    <file-operations-bar
      v-model:checked-row-keys="checkedRowKeys"
      v-model:view-mode="viewMode"
      v-model:sorter-key="sorterKey"
      v-model:sorter-order="sorterOrder"
      v-model:show-details-pane="showDetailsPane"
      @file-preview="preview = checkedItems[0]"
      @link-copy="linkCopy"
      @file-download="fileDownload"
      @file-delete="deleteFiles"
      @file-rename="renameFile"
      @new-file="newFile"
    />
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
            v-if="viewMode === 'details' || viewMode === 'list'"
            v-model:checked-row-keys="checkedRowKeys"
            v-model:sorter-key="sorterKey"
            v-model:sorter-order="sorterOrder"
            v-model:filters="filters"
            :checked-items="checkedItems"
            :data="data"
            :loading="loading"
            :view-mode="viewMode"
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
        <file-details :file-details="checkedItems" @close="showDetailsPane = false" />
      </template>
    </n-split>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, h } from 'vue'
import type { Ref } from 'vue'
import type { DataTableRowKey, DataTableFilterState, DataTableSortOrder } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { storeToRefs } from 'pinia'

import { dayjsLocales } from '@renderer/stores/locales'
import fileListTable from '@renderer/components/file-list-table.vue'
import FileOperationsBar from '@renderer/components/file-operations-bar.vue'
import db from '@renderer/utils/queryDB'
import { genRawFileUrl } from '@renderer/utils/genUrl'
import { useSettingsStore } from '@renderer/stores/settings'

const { t } = useI18n()

const { settings } = storeToRefs(useSettingsStore())

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

const fileDownload = () => {
  checkedItems.value.forEach((item) => {
    const download_url = genRawFileUrl(item)
    download_url
      ? window.open(download_url)
      : window.$notification.error({
          title: t('github-files.msg-download-failed'),
          content: t('github-files.msg-download-failed-desc', [item.file_name]),
          meta: new Date().toLocaleString()
        })
  })
}

const linkCopy = () => {
  navigator.clipboard.writeText(checkedItems.value.map((item) => genRawFileUrl(item)).join('\n'))
  window.$message.success(t('github-files.msg-link-copied'))
}

// preview
const preview: Ref<FileRecord | undefined> = ref(undefined)

const sorterKey: Ref<SorterKey> = ref('name')
const sorterOrder: Ref<DataTableSortOrder> = ref(false)

const filters = ref<DataTableFilterState>({})

const loading: Ref<boolean> = ref(true)

const data: Ref<FileRecord[]> = ref([])
const filesInUse: Ref<string[]> = ref([])
const checkedRowKeys = ref<DataTableRowKey[]>([])

const viewMode: Ref<ViewMode> = ref('list')

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
    } = await (
      await fetch('https://xyy.huijiwiki.com/api.php?' + new URLSearchParams(params))
    ).json()
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

  // get total item count
  const url = new URL('https://xyy-huijiwiki-gh-files-db.karsten-zhou-773.workers.dev/')
  url.searchParams.set('query', 'SELECT COUNT(1) FROM `files` WHERE `is_deleted` IS NULL;')
  totalItemCount.value = (
    await (await fetch(url.href)).json().catch((error) => {
      console.table(error)
    })
  )[0]['results'][0][`COUNT(1)`] as number

  await queryData()

  loading.value = false
})

const searchText = ref('')
const totalItemCount = ref(0)
async function queryData(type: 'more' | 'refresh' = 'refresh') {
  if (type === 'more' && data.value.length >= totalItemCount.value) return

  loading.value = true

  const query = db('files').limit(settings.value.fileListPageSize).whereNull('is_deleted')

  type === 'more' && query.offset(data.value.length)

  // sorter
  const order = sorterOrder.value === 'ascend' ? 'ASC' : 'DESC'
  if (sorterOrder.value === false) {
    query.orderBy('updated_at', 'DESC')
  } else if (sorterKey.value === 'name') {
    query.orderBy('file_name', order)
  } else if (sorterKey.value === 'size') {
    query.orderBy('file_size', order)
  } else if (sorterKey.value === 'type') {
    query.orderBy('file_type', order)
  } else if (sorterKey.value === 'updated_at') {
    query.orderBy('updated_at', order)
  }

  // filter
  if (searchText.value) {
    query.whereLike('file_name', `%${searchText.value}%`)
  }

  // get data from database
  const queryStr = query.toString()
  console.log(queryStr)
  const url = new URL('https://xyy-huijiwiki-gh-files-db.karsten-zhou-773.workers.dev/')
  url.searchParams.set('query', queryStr)

  if (type === 'more') {
    data.value.push(...((await (await fetch(url.href)).json()) as DbResponse)[0].results)
  } else {
    data.value = ((await (await fetch(url.href)).json()) as DbResponse)[0].results
  }

  loading.value = false
}

// watch sorter and filters
watch([sorterKey, sorterOrder, filters], () => queryData())

// new file
async function newFile() {
  const NewFileDialog = (await import('@renderer/components/NewFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: 'Datei hochladen',
    preset: 'dialog',
    showIcon: false,
    style: 'width: 440px; max-width: 100%',
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
async function deleteFiles() {
  const DeleteFileDialog = (await import('@renderer/components/DeleteFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: 'Datei löschen',
    preset: 'dialog',
    showIcon: false,
    style: 'width: 440px; max-width: 100%',
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
async function renameFile() {
  const RenameFileDialog = (await import('@renderer/components/RenameFileDialog.vue')).default
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: 'Datei umbenennen',
    preset: 'dialog',
    showIcon: false,
    style: 'width: 440px; max-width: 100%',
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
</script>
