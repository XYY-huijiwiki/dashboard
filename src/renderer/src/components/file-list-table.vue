<template>
  <n-data-table
    ref="dataTable"
    v-model:checked-row-keys="checkedRowKeys"
    class="h-full w-full"
    :columns="columns"
    :data="data"
    virtual-scroll
    remote
    max-height="calc(100vh - 215.4px)"
    :loading="loading"
    :size="viewMode === 'details' ? undefined : 'small'"
    :row-key="(row: FileRecord) => row.file_name"
    :row-props="rowProps"
    :scroll-x="800"
    @update:sorter="
      (data: DataTableSortState | null) => {
        sorterKey = data?.columnKey as SorterKey
        sorterOrder = data?.order as DataTableSortOrder
      }
    "
    @update-filters="(data: DataTableFilterState) => (filters = data)"
    @scroll="(e) => handleScroll(e)"
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
import { h, ref, nextTick, watch } from 'vue'
import type { Ref } from 'vue'
import { NText, NTag, NSpace, NDataTable } from 'naive-ui'
import type {
  DataTableColumns,
  DataTableSortState,
  DataTableCreateRowKey,
  DataTableFilterState,
  DataTableSortOrder
} from 'naive-ui'
import fileIcon from '@renderer/components/file-icon.vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { dayjsLocales } from '@renderer/stores/locales'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { filesize as filesizeNoLocale } from 'filesize'
import { useLocalesStore } from '@renderer/stores/locales'
import { storeToRefs } from 'pinia'
import { NBaseIcon } from 'naive-ui/es/_internal'
import { ArrowDownIcon } from 'naive-ui/es/_internal/icons'
import ClickableText from './ClickableText.vue'

const { langCode } = storeToRefs(useLocalesStore())
const filesize = (size: number) => filesizeNoLocale(size, { locale: langCode.value })
dayjs.extend(localizedFormat).locale(dayjsLocales.value)
const { t } = useI18n()

const dataTable = ref()

const { data, filesInUse } = defineProps<{
  filesInUse: string[]
  data: FileRecord[]
  loading: boolean
  viewMode: 'details' | 'list'
  checkedItems: FileRecord[]
}>()

const emit = defineEmits([
  'file-preview',
  'file-details',
  'link-copy',
  'file-download',
  'file-delete',
  'file-rename',
  'new-file',
  'load-more'
])

/*
 *
 * Data Table sorter and filters
 *
 */
const checkedRowKeys = defineModel<ReturnType<DataTableCreateRowKey>[]>('checkedRowKeys', {
  required: true
})
const sorterKey = defineModel<SorterKey>('sorterKey', {
  required: true
})
const sorterOrder = defineModel<DataTableSortOrder>('sorterOrder', { required: true })
const filters = defineModel<DataTableFilterState>('filters', { required: true })
watch([sorterKey, sorterOrder], ([key, order]) => {
  dataTable.value?.sort(key, order)
})
watch(
  filters,
  (value) => {
    dataTable.value?.filter(value)
  },
  {
    deep: true
  }
)

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
    title: () => {
      if (sorterKey.value === 'type') {
        return h(
          'span',
          {
            class: [
              'n-data-table-sorter',
              sorterOrder.value === 'ascend' && 'n-data-table-sorter--asc',
              sorterOrder.value === 'descend' && 'n-data-table-sorter--desc'
            ],
            style: { marginLeft: '6px' }
          },
          h(NBaseIcon, { clsPrefix: 'n' }, () => h(ArrowDownIcon))
        )
      } else {
        return h(fileIcon, { size: 28 })
      }
    },
    renderSorter: () => undefined,
    key: 'type',
    width: '4em',
    sorter: 'default',
    render: (row) => h(fileIcon, { fileType: row.content_type, size: 28 })
  },
  {
    title: () => t('github-files.table-header-name'),
    key: 'name',
    resizable: true,
    width: 350,
    minWidth: 200,
    maxWidth: 500,
    sorter: 'default',
    render: (row) =>
      h(ClickableText, {
        onClick: (e: MouseEvent) => {
          if (e.ctrlKey || e.metaKey) return
          checkedRowKeys.value = [row.file_name]
          emit('file-preview')
        },
        text: row.file_name
      }),
    filter: (value, row) => row.file_name.toLowerCase().includes(value.toString().toLowerCase())
  },
  {
    title: () => t('github-files.table-header-date-modified'),
    key: 'updated_at',
    width: '10em',
    sorter: 'default',
    render: (row) => h(NText, () => dayjs(row.updated_at).format('ll'))
  },
  {
    title: () => t('github-files.table-header-uploader'),
    key: 'uploader',
    width: '10em',
    sorter: 'default',
    render: (row) => {
      return h(ClickableText, {
        onClick: () => window.api.openExternal(`https://github.com/${row.uploader}`),
        text: row.uploader
      })
    }
  },
  {
    title: () => t('github-files.table-header-size'),
    key: 'size',
    width: '8em',
    sorter: 'default',
    render: (row) => h(NText, () => filesize(row.file_size))
  },
  {
    title: () => t('github-files.table-header-status'),
    key: 'status',
    minWidth: '10em',
    // filterOptions: [
    //   { label: t('github-files.status-unused'), value: 'unused' },
    //   { label: t('github-files.status-wanted'), value: 'wanted' },
    //   { label: t('github-files.status-no-source'), value: 'no source' },
    //   { label: t('github-files.status-no-licence'), value: 'no licence' },
    //   { label: t('github-files.status-asset-broken'), value: 'asset broken' }
    // ],
    // filter: (value, row) => {
    //   return row.warnings.includes(value as WarningType)
    // },
    render: (row) => {
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
const rowProps = (row: FileRecord) => {
  return {
    onContextmenu: async (e: MouseEvent) => {
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
    onclick: async (e: MouseEvent) => {
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
async function handleScroll(e: Event) {
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
