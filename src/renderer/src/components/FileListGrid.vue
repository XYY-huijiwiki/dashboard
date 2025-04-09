<template>
  <n-spin :show="loading" class="h-full" content-class="h-full">
    <n-card class="h-full" content-class="shrink-0 h-0">
      <n-infinite-scroll :distance="270" @load="emit('load-more')">
        <drag-select
          v-model="checkedRowKeys as any"
          class="h-full"
          @click="showDropdown = false"
        >
          <drag-select-option
            v-for="item in data"
            :key="item.file_name"
            :value="item.file_name"
          >
            <n-el
              tag="div"
              class="tile"
              @contextmenu="(e: MouseEvent) => handleContextMenu(item, e)"
            >
              <img
                v-if="genThumbUrl(item)"
                class="thumb"
                :src="genThumbUrl(item)"
                alt="thumb"
              />
              <div v-else class="thumb">
                <file-icon :file-type="item.content_type" :size="48" />
              </div>
              <div class="name">
                <ClickableText
                  :text="
                    item.is_deleted
                      ? item.file_name_before_deleted || item.file_name
                      : item.file_name
                  "
                  center
                  @click="
                    (e: MouseEvent) => {
                      if (e.ctrlKey || e.metaKey) return
                      checkedRowKeys = [item.file_name]
                      emit('file-preview')
                    }
                  "
                >
                </ClickableText>
              </div>
              <div class="date line-clamp-1">
                {{
                  dayjs(
                    item.is_deleted ? item.deleted_at : item.updated_at,
                  ).format('ll')
                }}
              </div>
              <n-checkbox
                class="checkbox"
                :checked="checkedRowKeys.includes(item.file_name)"
                @click="
                  (e: MouseEvent) => {
                    e.stopPropagation()
                    checkedRowKeys.includes(item.file_name)
                      ? (checkedRowKeys = checkedRowKeys.filter(
                          (i) => i !== item.file_name,
                        ))
                      : (checkedRowKeys = [...checkedRowKeys, item.file_name])
                  }
                "
              />
            </n-el>
          </drag-select-option>
        </drag-select>
      </n-infinite-scroll>
    </n-card>
  </n-spin>
  <file-menu
    v-model:show="showDropdown"
    :preset="preset"
    :data="checkedItems"
    :position="{
      x: dropdownX,
      y: dropdownY,
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
import type { DataTableCreateRowKey } from 'naive-ui'
import { nextTick, ref } from 'vue'
import dayjs from 'dayjs'
import { dayjsLocales } from '@renderer/stores/locales'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { DragSelect, DragSelectOption } from '@coleqiu/vue-drag-select'
import { genThumbUrl } from '@renderer/utils/genUrl'

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

const emit = defineEmits([
  'file-preview',
  'file-details',
  'link-copy',
  'file-download',
  'file-delete',
  'file-rename',
  'new-file',
  'load-more',
])

const { data, checkedItems, loading, preset } = defineProps<{
  data: FileRecord[]
  checkedItems: FileRecord[]
  loading: boolean
  preset: 'default' | 'recycle-bin'
}>()
const checkedRowKeys = defineModel<ReturnType<DataTableCreateRowKey>[]>(
  'checkedRowKeys',
  {
    required: true,
  },
)

// select and context menu
const showDropdown = ref(false)
const dropdownX = ref(0)
const dropdownY = ref(0)
async function handleContextMenu(
  item: FileRecord,
  e: MouseEvent,
): Promise<void> {
  e.preventDefault()
  // if this row is unchecked, cancel other checked rows and check this row
  if (!checkedRowKeys.value.includes(item.file_name)) {
    checkedRowKeys.value = [item.file_name]
  }
  await nextTick()
  dropdownX.value = e.clientX
  dropdownY.value = e.clientY
  showDropdown.value = true
}
</script>

<style lang="less">
.n-scrollbar-content:has(> .drag-select__wrapper) {
  height: 100%;
}

.drag-select {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  height: 100%;
  flex-direction: row;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: center;
  .tile {
    width: 138px;
    height: 135px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    position: relative;
    border: 2px solid transparent;
  }
  .tile:hover {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow:
      0 0 2px rgba(0, 0, 0, 0.12),
      0 2px 4px rgba(0, 0, 0, 0.14);
  }
  .tile:has(.checkbox[aria-checked='true']) {
    background-color: rgba(255, 255, 255, 0.2);
    border: 2px solid var(--primary-color);
  }
  .thumb {
    object-fit: contain;
    margin: 16px 16px 0 16px;
    flex: 1;
    height: 0;
    flex-shrink: 0;
  }
  div.thumb {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
  }
  .name {
    font-size: 12px;
    margin-top: 12px;
    margin-left: 8px;
    margin-right: 8px;
    text-align: center;
  }
  .date {
    font-size: 12px;
    margin-bottom: 12px;
    margin-left: 8px;
    margin-right: 8px;
    text-align: center;
  }
  .checkbox {
    position: absolute;
    top: 0;
    right: 0;
    margin: 8px;
    visibility: hidden;
  }
  .checkbox[aria-checked='true'] {
    visibility: visible;
  }
  .tile:hover .checkbox {
    visibility: visible;
  }
}
.drag-select__area {
  border: 2px solid #0466b6;
  background-color: #0466b680 !important;
}
</style>
