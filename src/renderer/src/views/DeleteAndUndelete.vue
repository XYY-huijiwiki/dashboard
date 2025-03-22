<template>
  <n-flex vertical class="h-full">
    <n-tabs v-model:value="tab" type="line" animated @before-leave="() => !loading">
      <n-tab name="delete">
        {{ t('delete-and-undelete.delete.title') }}
      </n-tab>
      <n-tab name="undelete">
        {{ t('delete-and-undelete.undelete.title') }}
      </n-tab>
    </n-tabs>
    <n-flex vertical class="flex-1">
      <n-input-group>
        <n-select v-model:value="selectPagesValue" :options="selectPagesOptions" />
        <n-button :disabled="loading" type="info" @click="search[selectPagesValue]">
          {{ t(`delete-and-undelete.btn-search`) }}
        </n-button>
      </n-input-group>
      <n-data-table :columns="columns" :data="data" size="small" class="flex-1" flex-height />
      <n-input-group>
        <n-input
          v-model:value="summary"
          :placeholder="
            tab === 'delete'
              ? t(`delete-and-undelete.delete.text-reason`)
              : t(`delete-and-undelete.undelete.text-reason`)
          "
          :disabled="loading"
        />
        <n-button type="error" :loading="loading" @click="tab === 'delete' ? destroy() : rescue()">
          {{
            tab === 'delete'
              ? t(`delete-and-undelete.delete.btn-delete`)
              : t(`delete-and-undelete.undelete.btn-undelete`)
          }}
        </n-button>
      </n-input-group>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, h, type Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import type { DataTableColumn, SelectOption } from 'naive-ui'
import { NA, NTag } from 'naive-ui'

import { deletePage, undeletePage } from '@renderer/utils/mwApi'
import { sleep } from '@renderer/utils'

// router guard to prevent leaving page when deleting or undeleting
onBeforeRouteLeave(() => {
  if (loading.value) {
    window.$dialog.error({
      title: t('general.text-leave-warning-title'),
      content: t('general.text-leave-warning-content'),
      positiveText: t('general.btn-confirm'),
      autoFocus: false,
      transformOrigin: 'center'
    })
    return false
  } else {
    return true
  }
})

const { t } = useI18n()
const summary: Ref<string | undefined> = ref()
const loading = ref(false)
const tab: Ref<'delete' | 'undelete'> = ref('delete')

async function destroy(): Promise<void> {
  if (!summary.value) {
    window.$message.error(t('delete-and-undelete.delete.error-no-delete-reason'))
    return
  }

  loading.value = true

  for (let index = 0; index < data.value.length; index++) {
    const element = data.value[index]
    if (element.status !== 'to-do') continue
    element.status = 'doing'
    const deletionOK = await deletePage({
      title: element.title,
      reason: summary.value
    })
    if (deletionOK) {
      element.status = 'done'
    } else {
      element.status = 'error'
    }
    await sleep(500)
  }

  loading.value = false
}

async function rescue(): Promise<void> {
  if (!summary.value) {
    window.$message.error(t('delete-and-undelete.undelete.error-no-undelete-reason'))
    return
  }

  loading.value = true

  for (let index = 0; index < data.value.length; index++) {
    const element = data.value[index]
    if (element.status !== 'to-do') continue
    element.status = 'doing'
    const undeletion = await undeletePage({
      title: element.title,
      reason: summary.value
    })
    if (undeletion.ok) {
      element.status = 'done'
    } else {
      element.status = 'error'
    }
    await sleep(500)
  }

  loading.value = false
}

// #region Data Table
const columns: DataTableColumn<DeleteUndeleteState>[] = [
  {
    key: 'title',
    title: () => t(`delete-and-undelete.label-table-title`),
    render: (rowData) => {
      return h(
        NA,
        { href: location.origin + '/wiki/' + rowData.title, target: '_blank' },
        () => rowData.title
      )
    }
  },
  {
    key: 'status',
    title: () => t(`delete-and-undelete.label-table-status`),
    render: (rowData) => {
      return h(
        NTag,
        {
          type:
            rowData.status === 'to-do'
              ? 'info'
              : rowData.status === 'doing'
                ? 'warning'
                : rowData.status === 'done'
                  ? 'success'
                  : 'error',
          bordered: false
        },
        () => {
          const mapper = {
            delete: {
              'to-do': t('delete-and-undelete.delete.label-status-to-do'),
              doing: t('delete-and-undelete.delete.label-status-doing'),
              done: t('delete-and-undelete.delete.label-status-done'),
              error: t('delete-and-undelete.delete.label-status-error')
            },
            undelete: {
              'to-do': t('delete-and-undelete.undelete.label-status-to-do'),
              doing: t('delete-and-undelete.undelete.label-status-doing'),
              done: t('delete-and-undelete.undelete.label-status-done'),
              error: t('delete-and-undelete.undelete.label-status-error')
            }
          }
          return mapper[tab.value][rowData.status]
        }
      )
    }
  }
]
type DeleteUndeleteState = {
  title: string
  status: 'to-do' | 'doing' | 'done' | 'error'
}
const data: Ref<DeleteUndeleteState[]> = ref([])
watch(tab, () => {
  data.value = []
  summary.value = undefined
})
// #endregion

// #region select pages
const selectPagesValue: Ref<'xlsx' | 'txt'> = ref('txt')
const selectPagesOptions: Ref<SelectOption[]> = ref([
  {
    label: t('delete-and-undelete.label-select-pages-by-txt'),
    value: 'txt'
  },
  {
    label: t('delete-and-undelete.label-select-pages-by-xlsx'),
    value: 'xlsx',
    disabled: true
  },
  {
    label: t('delete-and-undelete.label-select-pages-by-category'),
    value: 'category',
    disabled: true
  }
])
const search = {
  txt: () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt'
    input.onchange = async () => {
      if (!input.files) return
      let txtString = await input.files[0].text()
      if (!txtString) return
      // normalise line breaks
      txtString = txtString.replace(/\r\n/g, '\n')
      // split by line breaks
      let list = txtString.split('\n')
      // trim
      list = list.map((item) => item.trim())
      // remove empty
      list = list.filter((item) => item !== '')
      // remove duplicate
      list = [...new Set(list)]
      data.value = list.map((item) => {
        return {
          title: item,
          status: 'to-do'
        }
      })
    }
    input.click()
  }
}
// #endregion
</script>

<style scoped></style>
