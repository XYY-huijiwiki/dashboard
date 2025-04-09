<template>
  <n-card size="small" content-style="padding-bottom: 4px">
    <n-flex justify="space-between" :wrap="false" :size="120">
      <n-scrollbar x-scrollable class="flex-1 w-0 shrink-0 pb-2">
        <n-flex :wrap="false" size="small">
          <!-- new -->
          <n-button
            quaternary
            :disabled="preset === 'recycle-bin'"
            @click="emit('new-file')"
          >
            <template #icon>
              <n-icon :size="24">
                <icon icon="fluent:add-circle-24-regular" />
              </n-icon>
            </template>
            {{ t("github-files.btn-new") }}
          </n-button>
          <n-divider class="relative top-2" vertical />
          <!-- rename -->
          <tooltipped-icon-button
            :text="t('github-files.btn-rename')"
            :disabled="checkedRowKeys.length !== 1 || preset === 'recycle-bin'"
            @click="emit('file-rename')"
          >
            <icon icon="fluent:rename-24-regular" />
          </tooltipped-icon-button>
          <!-- delete -->
          <tooltipped-icon-button
            :text="t('github-files.btn-delete')"
            :disabled="checkedRowKeys.length === 0 || preset === 'recycle-bin'"
            @click="emit('file-delete')"
          >
            <icon icon="fluent:delete-24-regular" />
          </tooltipped-icon-button>
          <n-divider class="relative top-2" vertical />
          <!-- link copy -->
          <tooltipped-icon-button
            :text="t('github-files.btn-link-copy')"
            :disabled="checkedRowKeys.length === 0"
            @click="emit('link-copy')"
          >
            <icon icon="fluent:link-24-regular" />
          </tooltipped-icon-button>
          <!-- download -->
          <tooltipped-icon-button
            :text="t('github-files.btn-download')"
            :disabled="
              is.web ? checkedRowKeys.length !== 1 : checkedRowKeys.length === 0
            "
            @click="emit('file-download')"
          >
            <icon icon="fluent:arrow-download-24-regular" />
          </tooltipped-icon-button>
          <n-divider class="relative top-2" vertical />
          <!-- sort -->
          <n-dropdown
            trigger="click"
            :options="sortOptions"
            @select="sortHandler"
          >
            <n-button quaternary>
              {{ t("github-files.sort.btn-sort") }}
              <template #icon>
                <n-icon :size="24">
                  <icon icon="fluent:arrow-sort-down-lines-24-regular" />
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
                  <icon
                    :icon="
                      explorerState.viewMode === 'details'
                        ? 'fluent:apps-list-24-regular'
                        : explorerState.viewMode === 'list'
                          ? 'fluent:list-24-regular'
                          : 'fluent:grid-24-regular'
                    "
                  />
                </n-icon>
              </template>
              {{ t("github-files.view.btn-view") }}
            </n-button>
          </n-dropdown>
        </n-flex>
      </n-scrollbar>

      <n-flex :wrap="false" class="pb-2" size="small">
        <!-- preview -->
        <n-button
          quaternary
          :disabled="checkedRowKeys.length !== 1"
          @click="emit('file-preview')"
        >
          {{ t("github-files.btn-preview") }}
          <template #icon>
            <n-icon :size="24">
              <icon icon="fluent:full-screen-maximize-24-regular" />
            </n-icon>
          </template>
        </n-button>
        <!-- details -->
        <n-button quaternary @click="showDetailsPane = !showDetailsPane">
          {{ t("github-files.btn-details") }}
          <template #icon>
            <n-icon :size="24">
              <icon
                :icon="
                  showDetailsPane
                    ? 'fluent:panel-right-contract-20-regular'
                    : 'fluent:panel-right-expand-20-regular'
                "
              />
            </n-icon>
          </template>
        </n-button>
      </n-flex>
    </n-flex>
  </n-card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, h } from "vue";
import { NIcon } from "naive-ui";
import { Icon } from "@iconify/vue";
import { storeToRefs } from "pinia";

import { useExplorerStateStore } from "@renderer/stores/explorerState";
import { is } from "@renderer/utils";

const { explorerState } = storeToRefs(useExplorerStateStore());

const { t } = useI18n();
const checkedRowKeys = defineModel<(string | number)[]>("checkedRowKeys", {
  required: true,
});
const showDetailsPane = defineModel<boolean>("showDetailsPane", {
  required: true,
});
const { preset } = defineProps<{
  preset: "default" | "recycle-bin";
}>();

const emit = defineEmits([
  "file-preview",
  "link-copy",
  "file-download",
  "file-delete",
  "file-rename",
  "new-file",
]);

/*
 *
 * Sorter
 *
 */
const sortOptions = ref([
  {
    label: t("github-files.sort.btn-type"),
    key: "type",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterKey !== "type" },
      }),
  },
  {
    label: t("github-files.sort.btn-name"),
    key: "name",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterKey !== "name" },
      }),
  },
  {
    label: t("github-files.sort.btn-date-modified"),
    key: "updated_at",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterKey !== "updated_at" },
      }),
  },
  {
    label: t("github-files.sort.btn-uploader"),
    key: "uploader",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterKey !== "uploader" },
      }),
  },
  {
    label: t("github-files.sort.btn-size"),
    key: "size",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterKey !== "size" },
      }),
  },
  {
    type: "divider",
    key: "divider",
  },
  {
    label: t("github-files.sort.btn-asc"),
    key: "ascend",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterOrder !== "ascend" },
      }),
  },
  {
    label: t("github-files.sort.btn-desc"),
    key: "descend",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.sorterOrder !== "descend" },
      }),
  },
]);
function sortHandler(key: SorterKey | SorterOrder): void {
  if (["ascend", "descend"].includes(key)) {
    explorerState.value.sorterOrder = key as SorterOrder;
  } else {
    explorerState.value.sorterKey = key as SorterKey;
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
      h(
        NIcon,
        { size: 20, class: "mr-1 align-sub" },
        { default: () => h(Icon, { icon: "fluent:apps-list-24-regular" }) },
      ),
      h("span", undefined, t("github-files.view.btn-details")),
    ],
    key: "details",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.viewMode !== "details" },
      }),
  },
  {
    label: () => [
      h(
        NIcon,
        { size: 20, class: "mr-1 align-sub" },
        { default: () => h(Icon, { icon: "fluent:list-24-regular" }) },
      ),
      h("span", undefined, t("github-files.view.btn-list")),
    ],
    key: "list",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.viewMode !== "list" },
      }),
  },
  {
    label: () => [
      h(
        NIcon,
        { size: 20, class: "mr-1 align-sub" },
        { default: () => h(Icon, { icon: "fluent:grid-24-regular" }) },
      ),
      h("span", undefined, t("github-files.view.btn-tiles")),
    ],
    key: "tiles",
    icon: () =>
      h(Icon, {
        icon: `fluent:checkmark-20-regular`,
        width: 20,
        class: { invisible: explorerState.value.viewMode !== "tiles" },
      }),
  },
]);
</script>

<style scoped></style>
