<template>
  <n-card size="small" content-style="padding-bottom: 4px">
    <n-flex justify="space-between" :wrap="false" :size="120">
      <n-scrollbar x-scrollable class="flex-1 w-0 shrink-0 pb-2">
        <n-flex :wrap="false">
          <!-- new -->
          <n-button quaternary @click="emit('new-file')">
            <template #icon>
              <material-symbol>add_circle</material-symbol>
            </template>
            {{ t('github-files.btn-new') }}
          </n-button>
          <n-divider class="relative top-2" vertical />
          <!-- cut -->
          <tooltipped-icon-button
            :text="t('github-files.btn-cut')"
            icon="content_cut"
            :disabled="true"
            @click="console.log('')"
          />
          <!-- copy -->
          <tooltipped-icon-button
            :text="t('github-files.btn-copy')"
            icon="content_copy"
            :disabled="true"
            @click="console.log('')"
          />
          <!-- paste -->
          <tooltipped-icon-button
            :text="t('github-files.btn-paste')"
            icon="content_paste"
            :disabled="true"
            @click="console.log('')"
          />
          <!-- rename -->
          <tooltipped-icon-button
            :text="t('github-files.btn-rename')"
            icon="edit"
            :disabled="checkedRowKeys.length !== 1"
            @click="emit('file-rename')"
          />
          <!-- delete -->
          <tooltipped-icon-button
            :text="t('github-files.btn-delete')"
            icon="delete"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('file-delete')"
          />
          <n-divider class="relative top-2" vertical />
          <!-- link copy -->
          <tooltipped-icon-button
            :text="t('github-files.btn-link-copy')"
            icon="link"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('link-copy')"
          />
          <!-- download -->
          <tooltipped-icon-button
            :text="t('github-files.btn-download')"
            icon="download"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('file-download')"
          />
          <n-divider class="relative top-2" vertical />
          <!-- sort -->
          <n-dropdown trigger="click" :options="sortOptions" @select="sortHandler">
            <n-button quaternary>
              {{ t('github-files.sort.btn-sort') }}
              <template #icon>
                <MaterialSymbol>sort</MaterialSymbol>
              </template>
            </n-button>
          </n-dropdown>
          <!-- filter -->
          <n-dropdown
            trigger="click"
            :options="viewOptions"
            @select="(key: ViewMode) => (viewMode = key)"
          >
            <n-button quaternary>
              <template #icon>
                <MaterialSymbol>
                  {{
                    viewMode === 'details' ? 'menu' : viewMode === 'list' ? 'reorder' : 'grid_view'
                  }}
                </MaterialSymbol>
              </template>
              {{ t('github-files.view.btn-view') }}
            </n-button>
          </n-dropdown>
        </n-flex>
      </n-scrollbar>

      <n-flex :wrap="false" class="pb-2">
        <!-- preview -->
        <n-button quaternary :disabled="checkedRowKeys.length !== 1" @click="emit('file-preview')">
          {{ t('github-files.btn-preview') }}
          <template #icon>
            <MaterialSymbol>visibility </MaterialSymbol>
          </template>
        </n-button>
        <!-- details -->
        <n-button quaternary @click="showDetailsPane = !showDetailsPane">
          {{ t('github-files.btn-details') }}
          <template #icon>
            <MaterialSymbol>
              {{ showDetailsPane ? 'arrow_menu_open' : 'arrow_menu_close' }}
            </MaterialSymbol>
          </template>
        </n-button>
      </n-flex>
    </n-flex>
  </n-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MaterialSymbol from './material-symbol.vue'
import { ref, h } from 'vue'
import type { DataTableSortOrder } from 'naive-ui'

const { t } = useI18n()
const checkedRowKeys = defineModel<(string | number)[]>('checkedRowKeys', {
  required: true
})
const showDetailsPane = defineModel<boolean>('showDetailsPane', {
  required: true
})
const viewMode = defineModel<ViewMode>('viewMode', {
  required: true
})
const sorterKey = defineModel<SorterKey>('sorterKey', {
  required: true
})
const sorterOrder = defineModel<DataTableSortOrder>('sorterOrder', {
  required: true
})

const emit = defineEmits([
  'file-preview',
  'link-copy',
  'file-download',
  'file-delete',
  'file-rename',
  'new-file'
])

/*
 *
 * Sorter
 *
 */
const sortOptions = ref([
  {
    label: t('github-files.sort.btn-type'),
    key: 'type',
    icon: () => h(MaterialSymbol, () => sorterKey.value === 'type' && 'check')
  },
  {
    label: t('github-files.sort.btn-name'),
    key: 'name',
    icon: () => h(MaterialSymbol, () => sorterKey.value === 'name' && 'check')
  },
  {
    label: t('github-files.sort.btn-date-modified'),
    key: 'updated_at',
    icon: () => h(MaterialSymbol, () => sorterKey.value === 'updated_at' && 'check')
  },
  // {
  //   label: t('github-files.sort.btn-uploader'),
  //   key: 'uploader',
  //   icon: () => h(MaterialSymbol, () => sorterKey.value === 'uploader' && 'check'),
  // },
  {
    label: t('github-files.sort.btn-size'),
    key: 'size',
    icon: () => h(MaterialSymbol, () => sorterKey.value === 'size' && 'check')
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: t('github-files.sort.btn-asc'),
    key: 'ascend',
    icon: () => h(MaterialSymbol, () => sorterOrder.value === 'ascend' && 'check')
  },
  {
    label: t('github-files.sort.btn-desc'),
    key: 'descend',
    icon: () => h(MaterialSymbol, () => sorterOrder.value === 'descend' && 'check')
  }
])
const sortHandler = (key: SorterKey | DataTableSortOrder) => {
  ;['ascend', 'descend', false].includes(key)
    ? (sorterOrder.value = key as DataTableSortOrder)
    : (sorterKey.value = key as SorterKey)
}

/*
 *
 * View
 *
 */

const viewOptions =
  // computed(() => [
  ref([
    {
      label: () => [
        h(MaterialSymbol, { verticalAlign: 'middle', size: 20, class: 'mr-1' }, () => 'menu'),
        h('span', undefined, t('github-files.view.btn-details'))
      ],
      key: 'details',
      icon: () => h(MaterialSymbol, () => viewMode.value === 'details' && 'check')
    },
    {
      label: () => [
        h(MaterialSymbol, { verticalAlign: 'middle', size: 20, class: 'mr-1' }, () => 'reorder'),
        h('span', undefined, t('github-files.view.btn-list'))
      ],
      key: 'list',
      icon: () => h(MaterialSymbol, () => viewMode.value === 'list' && 'check')
    },
    {
      label: () => [
        h(MaterialSymbol, { verticalAlign: 'middle', size: 20, class: 'mr-1' }, () => 'grid_view'),
        h('span', undefined, t('github-files.view.btn-tiles'))
      ],
      key: 'tiles',
      icon: () => h(MaterialSymbol, () => viewMode.value === 'tiles' && 'check')
    }
  ])
</script>

<style scoped></style>
