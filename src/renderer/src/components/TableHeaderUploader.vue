<template>
  <n-dropdown
    :options="dropdownOptions"
    placement="bottom-start"
    trigger="click"
    size="small"
  >
    <n-button
      quaternary
      block
      strong
      size="small"
      class="!justify-start !-ml-2"
    >
      <n-ellipsis>
        {{ t("github-files.table-header.label-uploader") }}
      </n-ellipsis>
      <icon
        v-if="explorerState.sorterKey === 'uploader'"
        :icon="
          explorerState.sorterOrder === 'ascend'
            ? 'fluent:arrow-sort-up-16-regular'
            : 'fluent:arrow-sort-down-16-regular'
        "
        :width="12"
        class="ml-1"
      />
      <icon icon="fluent:chevron-down-12-regular" :width="12" class="ml-1" />
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { Icon } from "@iconify/vue";
import { ref, h } from "vue";

import { useExplorerStateStore } from "@renderer/stores/explorerState";

const { explorerState } = storeToRefs(useExplorerStateStore());
const { t } = useI18n();

const dropdownOptions = ref([
  {
    label: () =>
      h(
        "span",
        { class: "mr-4" },
        t("github-files.table-header.btn-uploader-asc"),
      ),
    key: "ascend",
    icon: () =>
      h(Icon, {
        icon: "fluent:checkmark-20-regular",
        width: 20,
        class: {
          invisible: !(
            explorerState.value.sorterKey === "uploader" &&
            explorerState.value.sorterOrder === "ascend"
          ),
        },
      }),
    props: {
      onClick: () => {
        explorerState.value.sorterKey = "uploader";
        explorerState.value.sorterOrder = "ascend";
      },
    },
  },
  {
    label: () =>
      h(
        "span",
        { class: "mr-4" },
        t("github-files.table-header.btn-uploader-desc"),
      ),
    key: "descend",
    icon: () =>
      h(Icon, {
        icon: "fluent:checkmark-20-regular",
        width: 20,
        class: {
          invisible: !(
            explorerState.value.sorterKey === "uploader" &&
            explorerState.value.sorterOrder === "descend"
          ),
        },
      }),
    props: {
      onClick: () => {
        explorerState.value.sorterKey = "uploader";
        explorerState.value.sorterOrder = "descend";
      },
    },
  },
]);
</script>

<style scoped></style>
