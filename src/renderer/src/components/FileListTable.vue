<template>
  <n-data-table
    ref="dataTable"
    v-model:checked-row-keys="checkedRowKeys"
    class="h-full w-full"
    :columns="columns"
    :data="data"
    virtual-scroll
    remote
    :max-height="explorerState.viewMode === 'details' ? maxHeight - 53 : maxHeight - 45"
    :loading="loading"
    :size="explorerState.viewMode === 'details' ? undefined : 'small'"
    :row-key="(row: FileRecord) => row.file_name"
    :row-props="rowProps"
    @scroll="(e: Event) => handleScroll(e)"
  />
  <file-menu
    v-model:show="showDropdown"
    :data="checkedItems"
    :position="{
      x: dropdownX,
      y: dropdownY
    }"
    @preview="emit('file-preview')"
    @link-copy="emit('link-copy')"
    @download="emit('file-download')"
    @delete="emit('file-delete')"
    @rename="emit('file-rename')"
    @details="emit('file-details')"
  />
</template>

<script setup lang="ts">
import { h, ref, nextTick } from 'vue'
import type { Ref, VNode } from 'vue'
import { NText, NTag, NSpace } from 'naive-ui'
import type { DataTableColumns, DataTableCreateRowKey } from 'naive-ui'
import FileIcon from '@renderer/components/FileIcon.vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { dayjsLocales } from '@renderer/stores/locales'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { filesize as filesizeNoLocale } from 'filesize'
import { useLocalesStore } from '@renderer/stores/locales'
import { storeToRefs } from 'pinia'
import ClickableText from './ClickableText.vue'
import TableHeaderName from './TableHeaderName.vue'
import TableHeaderUpdatedAt from './TableHeaderUpdatedAt.vue'
import TableHeaderUploader from './TableHeaderUploader.vue'
import TableHeaderType from './TableHeaderType.vue'
import TableHeaderSize from './TableHeaderSize.vue'
import { useExplorerStateStore } from '@renderer/stores/explorerState'
import { useElementSize } from '@vueuse/core'
import TableHeaderStatus from './TableHeaderStatus.vue'

const { explorerState } = storeToRefs(useExplorerStateStore())

const { langCode } = storeToRefs(useLocalesStore())
const filesize = (size: number): string => filesizeNoLocale(size, { locale: langCode.value })
dayjs.extend(localizedFormat).locale(dayjsLocales.value)
const { t } = useI18n()

const dataTable = ref()
const { height: maxHeight } = useElementSize(dataTable)

const { data, filesInUse } = defineProps<{
  filesInUse: string[]
  data: FileRecord[]
  loading: boolean
  checkedItems: FileRecord[]
}>()

const emit = defineEmits([
  'file-preview',
  'file-details',
  'link-copy',
  'file-download',
  'file-delete',
  'file-rename',
  'load-more',
  'new-file',
  'update:filters'
])

const checkedRowKeys = defineModel<ReturnType<DataTableCreateRowKey>[]>('checkedRowKeys', {
  required: true
})

/*
 *
 * Data Table Columns
 *
 */
const columns: Ref<DataTableColumns<FileRecord>> = ref([
  {
    type: 'selection',
    fixed: 'left'
  },
  {
    title: () => h(TableHeaderType),
    key: 'type',
    width: '4em',
    render: (row) => h(FileIcon, { class: 'ml-1', fileType: row.content_type, size: 28 })
  },
  {
    title: () => h(TableHeaderName),
    key: 'name',
    resizable: true,
    width: 350,
    minWidth: 200,
    render: (row) =>
      h(ClickableText, {
        onClick: (e: MouseEvent) => {
          if (e.ctrlKey || e.metaKey) return
          checkedRowKeys.value = [row.file_name]
          emit('file-preview')
        },
        text: row.file_name
      })
  },
  {
    title: () => h(TableHeaderUpdatedAt),
    key: 'updated_at',
    minWidth: 100,
    width: '10em',
    resizable: true,
    render: (row) => h(NText, () => dayjs(row.updated_at).format('ll'))
  },
  {
    title: () => h(TableHeaderUploader),
    key: 'uploader',
    width: '10em',
    minWidth: 100,
    resizable: true,
    render: (row): VNode => {
      return h(ClickableText, {
        onClick: () => window.open(`https://github.com/${row.uploader}`),
        text: row.uploader
      })
    }
  },
  {
    title: () => h(TableHeaderSize),
    key: 'size',
    width: '10em',
    minWidth: 100,
    resizable: true,
    render: (row) => h(NText, () => filesize(row.file_size))
  },
  {
    title: () => h(TableHeaderStatus),
    key: 'status',
    minWidth: '10em',
    render: (row): VNode => {
      const warnings: string[] = []
      if (!row.licence) warnings.push('no licence')
      if (!row.source) warnings.push('no source')
      if (!filesInUse.includes(row.file_name)) warnings.push('unused')
      return h(NSpace, () => [
        warnings.length === 0
          ? h(NTag, { type: 'success', size: 'small' }, () => t('github-files.status-normal'))
          : warnings.map((warning) =>
              h(NTag, { type: 'error', size: 'small' }, () =>
                t(`github-files.status-${warning.replace(' ', '-')}`)
              )
            )
      ])
      // equivalent to HTML
      // <n-space>
      //    <n-tag v-if="row.warnings.length === 0" type="success" size="small">Normal</n-tag>
      //    <n-tag v-else v-for="warning in row.warnings" type="error" size="small">{{ warning }}</n-tag>
      // </n-space>
    }
  }
])

/*
 *
 * Data Table Customization
 *
 */
const showDropdown = ref(false)
const dropdownX = ref(0)
const dropdownY = ref(0)
const rowProps = (
  row: FileRecord
): {
  onContextmenu: (e: MouseEvent) => Promise<void>
  onclick: (e: MouseEvent) => Promise<void>
} => {
  return {
    onContextmenu: async (e): Promise<void> => {
      e.preventDefault()
      // if this row is unchecked, cancel other checked rows and check this row
      if (!checkedRowKeys.value.includes(row.file_name)) {
        checkedRowKeys.value = [row.file_name]
      }
      await nextTick()
      dropdownX.value = e.clientX
      dropdownY.value = e.clientY
      showDropdown.value = true
    },
    onclick: async (e): Promise<void> => {
      const triggerClassList = (e.target as HTMLElement).classList
      if (e.button !== 0) {
        // do nothing if click event is not triggered by left button
        return
      } else if (triggerClassList.contains('n-checkbox-box__border')) {
        // do nothing if target is div.n-checkbox-box__border
        // this is to prevent bubble from checkbox
        return
      } else if (
        triggerClassList.contains('n-data-table-td--selection') ||
        e.ctrlKey ||
        e.metaKey
      ) {
        // if checkbox (.n-checkbox-box__border) is clicked, toggle checkbox
        // if ctrl or cmd key is pressed, toggle checkbox
        if (checkedRowKeys.value.includes(row.file_name)) {
          checkedRowKeys.value = checkedRowKeys.value.filter((item) => item !== row.file_name)
        } else {
          checkedRowKeys.value = [...checkedRowKeys.value, row.file_name]
        }
      } else {
        // else, single select this row
        checkedRowKeys.value = [row.file_name]
      }
    }
  }
}

// scroll handler
async function handleScroll(e: Event): Promise<void> {
  const target = e.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  const distance = 270
  // if scroll to bottom
  if (scrollTop + clientHeight >= scrollHeight - distance) {
    // load more data
    emit('load-more')
  }
}
</script>
