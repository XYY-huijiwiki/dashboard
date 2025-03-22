<template>
  <n-tabs v-model:value="tab" type="line" animated @before-leave="() => !loading">
    <!-- delete -->
    <n-tab-pane name="delete" :tab="t('delete-and-undelete.delete.title')">
      <n-flex vertical>
        <n-input-group>
          <n-select v-model:value="selectPagesValue" :options="selectPagesOptions" />
          <n-button
            :disabled="loading"
            type="info"
            @click="debounce(search[selectPagesValue], 200)()"
          >
            {{ t(`delete-and-undelete.delete.btn-search`) }}
          </n-button>
        </n-input-group>
        <n-data-table :columns="columns" :data="data" :max-height="240" size="small" />
        <n-input-group>
          <n-input
            v-model:value="summary"
            :placeholder="t(`delete-and-undelete.delete.text-reason`)"
            :disabled="loading"
          />
          <n-button type="error" :loading="loading" @click="debounce(destroy, 200)()">
            {{ t(`delete-and-undelete.delete.btn-delete`) }}
          </n-button>
        </n-input-group>
      </n-flex>
    </n-tab-pane>
    <!-- undelete -->
    <n-tab-pane name="undelete" :tab="t('delete-and-undelete.undelete.title')">
      <n-flex vertical>
        <n-input-group>
          <n-select v-model:value="selectPagesValue" :options="selectPagesOptions" />
          <n-button
            :disabled="loading"
            type="info"
            @click="debounce(search[selectPagesValue], 200)()"
          >
            {{ t(`delete-and-undelete.undelete.btn-search`) }}
          </n-button>
        </n-input-group>
        <n-data-table :columns="columns" :data="data" :max-height="240" size="small" />
        <n-input-group>
          <n-input
            v-model:value="summary"
            :placeholder="t(`delete-and-undelete.undelete.text-reason`)"
            :disabled="loading"
          />
          <n-button type="success" :loading="loading" @click="debounce(rescue, 200)()">
            {{ t(`delete-and-undelete.undelete.btn-undelete`) }}
          </n-button>
        </n-input-group>
      </n-flex>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { ref, h, type Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import type { DataTableColumn, SelectOption } from 'naive-ui'
import { NA, NTag } from 'naive-ui'
import { debounce } from 'lodash-es'

import { deletePage, undeletePage } from '@renderer/utils/mwApi'
import { sleep } from '@renderer/utils'

// router guard to prevent leaving page when deleting
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
    title: () =>
      tab.value === 'delete'
        ? t(`delete-and-undelete.delete.label-table-title`)
        : t(`delete-and-undelete.undelete.label-table-title`),
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
    title: () =>
      tab.value === 'delete'
        ? t(`delete-and-undelete.delete.label-table-status`)
        : t(`delete-and-undelete.undelete.label-table-status`),
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
