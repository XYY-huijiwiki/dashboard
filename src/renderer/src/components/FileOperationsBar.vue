<template>
  <n-card size="small" content-style="padding-bottom: 4px">
    <n-flex justify="space-between" :wrap="false" :size="120">
      <n-scrollbar x-scrollable class="flex-1 w-0 shrink-0 pb-2">
        <n-flex :wrap="false">
          <!-- new -->
          <n-button quaternary @click="emit('new-file')">
            <template #icon>
              <n-icon :size="24">
                <add-circle24-regular />
              </n-icon>
            </template>
            {{ t('github-files.btn-new') }}
          </n-button>
          <n-divider class="relative top-2" vertical />
          <!-- cut -->
          <tooltipped-icon-button
            :text="t('github-files.btn-cut')"
            :disabled="true"
            @click="console.log('')"
          >
            <cut24-regular />
          </tooltipped-icon-button>
          <!-- copy -->
          <tooltipped-icon-button
            :text="t('github-files.btn-copy')"
            :disabled="true"
            @click="console.log('')"
          >
            <copy24-regular />
          </tooltipped-icon-button>
          <!-- paste -->
          <tooltipped-icon-button
            :text="t('github-files.btn-paste')"
            :disabled="true"
            @click="console.log('')"
          >
            <clipboard-paste24-regular />
          </tooltipped-icon-button>
          <!-- rename -->
          <tooltipped-icon-button
            :text="t('github-files.btn-rename')"
            :disabled="checkedRowKeys.length !== 1"
            @click="emit('file-rename')"
          >
            <rename24-regular />
          </tooltipped-icon-button>
          <!-- delete -->
          <tooltipped-icon-button
            :text="t('github-files.btn-delete')"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('file-delete')"
          >
            <delete24-regular />
          </tooltipped-icon-button>
          <n-divider class="relative top-2" vertical />
          <!-- link copy -->
          <tooltipped-icon-button
            :text="t('github-files.btn-link-copy')"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('link-copy')"
          >
            <link24-regular />
          </tooltipped-icon-button>
          <!-- download -->
          <tooltipped-icon-button
            :text="t('github-files.btn-download')"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('file-download')"
          >
            <arrow-download24-regular />
          </tooltipped-icon-button>
          <n-divider class="relative top-2" vertical />
          <!-- sort -->
          <n-dropdown trigger="click" :options="sortOptions" @select="sortHandler">
            <n-button quaternary>
              {{ t('github-files.sort.btn-sort') }}
              <template #icon>
                <n-icon :size="24">
                  <arrow-sort-down-lines24-regular />
                </n-icon>
              </template>
            </n-button>
          </n-dropdown>
          <!-- filter -->
          <n-dropdown
            trigger="click"
            :options="viewOptions"
            @select="(key: ViewMode) => (explorerState.viewMode = key)"
          >
            <n-button quaternary>
              <template #icon>
                <n-icon :size="24">
                  <apps-list24-regular v-if="explorerState.viewMode === 'details'" />
                  <list24-regular v-else-if="explorerState.viewMode === 'list'" />
                  <grid24-regular v-else />
                </n-icon>
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
            <n-icon :size="24">
              <full-screen-maximize24-regular />
            </n-icon>
          </template>
        </n-button>
        <!-- details -->
        <n-button quaternary @click="showDetailsPane = !showDetailsPane">
          {{ t('github-files.btn-details') }}
          <template #icon>
            <n-icon :size="24">
              <panel-right-contract20-regular v-if="showDetailsPane" />
              <panel-right-expand20-regular v-else />
            </n-icon>
          </template>
        </n-button>
      </n-flex>
    </n-flex>
  </n-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, h } from 'vue'
import { NIcon } from 'naive-ui'
import {
  AddCircle24Regular,
  PanelRightExpand20Regular,
  PanelRightContract20Regular,
  AppsList24Regular,
  List24Regular,
  Grid24Regular,
  Checkmark24Regular,
  ArrowSortDownLines24Regular,
  ArrowDownload24Regular,
  Link24Regular,
  FullScreenMaximize24Regular,
  Delete24Regular,
  Rename24Regular,
  Copy24Regular,
  ClipboardPaste24Regular,
  Cut24Regular
} from '@vicons/fluent'
import { storeToRefs } from 'pinia'

import { useExplorerStateStore } from '@renderer/stores/explorerState'

const { explorerState } = storeToRefs(useExplorerStateStore())

const { t } = useI18n()
const checkedRowKeys = defineModel<(string | number)[]>('checkedRowKeys', {
  required: true
})
const showDetailsPane = defineModel<boolean>('showDetailsPane', {
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
    icon: () =>
      h(NIcon, { size: 20, class: { invisible: explorerState.value.sorterKey !== 'type' } }, () =>
        h(Checkmark24Regular)
      )
  },
  {
    label: t('github-files.sort.btn-name'),
    key: 'name',
    icon: () =>
      h(NIcon, { size: 20, class: { invisible: explorerState.value.sorterKey !== 'name' } }, () =>
        h(Checkmark24Regular)
      )
  },
  {
    label: t('github-files.sort.btn-date-modified'),
    key: 'updated_at',
    icon: () =>
      h(
        NIcon,
        { size: 20, class: { invisible: explorerState.value.sorterKey !== 'updated_at' } },
        () => h(Checkmark24Regular)
      )
  },
  {
    label: t('github-files.sort.btn-uploader'),
    key: 'uploader',
    icon: () =>
      h(
        NIcon,
        { size: 20, class: { invisible: explorerState.value.sorterKey !== 'uploader' } },
        () => h(Checkmark24Regular)
      )
  },
  {
    label: t('github-files.sort.btn-size'),
    key: 'size',
    icon: () =>
      h(NIcon, { size: 20, class: { invisible: explorerState.value.sorterKey !== 'size' } }, () =>
        h(Checkmark24Regular)
      )
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: t('github-files.sort.btn-asc'),
    key: 'ascend',
    icon: () =>
      h(
        NIcon,
        { size: 20, class: { invisible: explorerState.value.sorterOrder !== 'ascend' } },
        () => h(Checkmark24Regular)
      )
  },
  {
    label: t('github-files.sort.btn-desc'),
    key: 'descend',
    icon: () =>
      h(
        NIcon,
        { size: 20, class: { invisible: explorerState.value.sorterOrder !== 'descend' } },
        () => h(Checkmark24Regular)
      )
  }
])
function sortHandler(key: SorterKey | SorterOrder): void {
  if (['ascend', 'descend'].includes(key)) {
    explorerState.value.sorterOrder = key as SorterOrder
  } else {
    explorerState.value.sorterKey = key as SorterKey
  }
}

/*
 *
 * View
 *
 */
const viewOptions = ref([
  {
    label: () => [
      h(NIcon, { size: 20, class: 'mr-1 align-sub' }, { default: () => h(AppsList24Regular) }),
      h('span', undefined, t('github-files.view.btn-details'))
    ],
    key: 'details',
    icon: () =>
      h(
        NIcon,
        { size: 24, class: { invisible: explorerState.value.viewMode !== 'details' } },
        { default: () => h(Checkmark24Regular) }
      )
  },
  {
    label: () => [
      h(NIcon, { size: 20, class: 'mr-1 align-sub' }, { default: () => h(List24Regular) }),
      h('span', undefined, t('github-files.view.btn-list'))
    ],
    key: 'list',
    icon: () =>
      h(
        NIcon,
        { size: 24, class: { invisible: explorerState.value.viewMode !== 'list' } },
        { default: () => h(Checkmark24Regular) }
      )
  },
  {
    label: () => [
      h(NIcon, { size: 20, class: 'mr-1 align-sub' }, { default: () => h(Grid24Regular) }),
      h('span', undefined, t('github-files.view.btn-tiles'))
    ],
    key: 'tiles',
    icon: () =>
      h(
        NIcon,
        { size: 24, class: { invisible: explorerState.value.viewMode !== 'tiles' } },
        { default: () => h(Checkmark24Regular) }
      )
  }
])
</script>

<style scoped></style>
