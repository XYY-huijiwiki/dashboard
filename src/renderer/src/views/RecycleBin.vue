<template>
  <n-flex vertical class="h-full">
    <file-search-bar
      v-model:search-text="searchText"
      :loading="loading"
      @search="handleSearch"
    />
    <file-operations-bar
      v-model:checked-row-keys="checkedRowKeys"
      v-model:show-details-pane="showDetailsPane"
      preset="recycle-bin"
      @file-preview="preview = checkedItems[0]"
      @link-copy="linkCopy"
      @file-download="fileDownload"
    />
    <filter-alert :loading="loading" />
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
        <file-preview-card v-if="preview" v-model="preview" :closable="true" />
        <template v-else>
          <file-list-table
            v-if="
              explorerState.viewMode === 'details' ||
              explorerState.viewMode === 'list'
            "
            v-model:checked-row-keys="checkedRowKeys"
            preset="recycle-bin"
            :checked-items="checkedItems"
            :data="data"
            :loading="loading"
            :files-in-use="filesInUse"
            @load-more="!loading && queryData('more')"
            @file-preview="preview = checkedItems[0]"
            @file-details="showDetailsPane = true"
            @link-copy="linkCopy"
            @file-download="fileDownload"
          />
          <file-list-grid
            v-else
            v-model:checked-row-keys="checkedRowKeys"
            preset="recycle-bin"
            :data="data"
            :checked-items="checkedItems"
            :loading="loading"
            @load-more="!loading && queryData('more')"
            @file-preview="preview = checkedItems[0]"
            @file-details="showDetailsPane = true"
            @link-copy="linkCopy"
            @file-download="fileDownload"
          />
        </template>
      </template>
      <template v-if="showDetailsPane" #2>
        <file-details
          :file-details="checkedItems"
          @close="showDetailsPane = false"
          @edit-file="editFile"
        />
      </template>
    </n-split>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, h } from "vue";
import type { Ref } from "vue";
import type { DataTableRowKey } from "naive-ui";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { storeToRefs } from "pinia";
import ky from "ky";
import { debounce } from "lodash-es";
import { useRouter } from "vue-router";

import { dayjsLocales } from "@renderer/stores/locales";
import db from "@renderer/utils/queryDB";
import { genRawFileUrl } from "@renderer/utils/genUrl";
import { useSettingsStore } from "@renderer/stores/settings";
import { useExplorerStateStore } from "@renderer/stores/explorerState";
import fetchFilesInUse from "@renderer/utils/fetchFilesInUse";
import { useDownloadStore } from "@renderer/stores/download";
import { is } from "@renderer/utils";

const { t } = useI18n();
const { startDownload } = useDownloadStore();
const { settings } = storeToRefs(useSettingsStore());
const { explorerState } = storeToRefs(useExplorerStateStore());
const router = useRouter();

dayjs.extend(localizedFormat).locale(dayjsLocales.value);

const fileDownload = debounce(fileDownloadUndebounced, 300);
async function fileDownloadUndebounced() {
  if (is.web) {
    const a = document.createElement("a");
    a.href = genRawFileUrl(checkedItems.value[0]);
    a.click();
  } else {
    router.push({ name: "download-manager" });
    for (const item of checkedItems.value) {
      startDownload(item);
    }
  }
}

function linkCopy(): void {
  navigator.clipboard.writeText(
    checkedItems.value.map((item) => genRawFileUrl(item)).join("\n"),
  );
  window.$message.success(t("github-files.msg-link-copied"));
}

// preview
const preview: Ref<FileRecord | undefined> = ref(undefined);

const loading: Ref<boolean> = ref(true);

const data: Ref<FileRecord[]> = ref([]);
const filesInUse: Ref<string[]> = ref([]);
const checkedRowKeys = ref<DataTableRowKey[]>([]);

/*
 *
 * Details Pane
 *
 */
const checkedItems: Ref<FileRecord[]> = computed(() => {
  if (checkedRowKeys.value.length === 0) {
    return [];
  } else {
    return data.value.filter((item) =>
      checkedRowKeys.value.includes(item.file_name),
    );
  }
});
const showDetailsPane = ref(false);
const detailsDrawerSizeTemp = ref(0.7);
const detailsDrawerSize = ref(1);
watch(showDetailsPane, (value) => {
  if (value) {
    detailsDrawerSize.value = detailsDrawerSizeTemp.value;
  } else {
    detailsDrawerSizeTemp.value = detailsDrawerSize.value;
    detailsDrawerSize.value = 1;
  }
});

onMounted(async () => {
  loading.value = true;

  try {
    console.time("init fetching");
    await Promise.all([
      (filesInUse.value = await fetchFilesInUse()),
      queryData(),
    ]);
    console.timeEnd("init fetching");
  } catch (error) {
    console.dir(error);
    window.$notification.error({
      title: t("github-files.msg-rename-failed"),
      content: `${error}`,
      meta: dayjs().format("lll"),
    });
  } finally {
    loading.value = false;
  }
});

function handleSearch() {
  preview.value = undefined;
  queryData();
}
const searchText = ref("");
const totalItemCount = ref(0);
async function queryData(type: "more" | "refresh" = "refresh"): Promise<void> {
  if (type === "more" && data.value.length >= totalItemCount.value) return; // cancel if no more data

  loading.value = true;

  try {
    const query = db("files")
      .limit(settings.value.fileListPageSize)
      .whereNotNull("is_deleted");

    if (type === "more") query.offset(data.value.length);

    // sorter
    const order = explorerState.value.sorterOrder === "ascend" ? "ASC" : "DESC";
    if (explorerState.value.sorterKey === "name") {
      query.orderBy("file_name", order);
    } else if (explorerState.value.sorterKey === "size") {
      query.orderBy("file_size", order);
    } else if (explorerState.value.sorterKey === "type") {
      query.orderBy("content_type", order);
    } else if (explorerState.value.sorterKey === "updated_at") {
      query.orderBy("updated_at", order);
    } else if (explorerState.value.sorterKey === "uploader") {
      query.orderBy("uploader", order);
    } else if (explorerState.value.sorterKey === "deleted_at") {
      query.orderBy("deleted_at", order);
    } else if (explorerState.value.sorterKey === "file_name_before_deleted") {
      query.orderBy("file_name_before_deleted", order);
    }

    // search
    if (searchText.value) {
      query.andWhereLike(
        "file_name_before_deleted",
        `%${searchText.value.trim().replaceAll(" ", "_")}%`,
      );
    }

    // filter file type
    const fileType = explorerState.value.filters.type;
    if (fileType && fileType.length > 0 && fileType.length !== 5) {
      query.andWhere((builder) => {
        for (let index = 0; index < fileType.length; index++) {
          const element = fileType[index];
          if (element === "image")
            builder.orWhereLike("content_type", "image%");
          if (element === "audio")
            builder.orWhereLike("content_type", "audio%");
          if (element === "video")
            builder.orWhereLike("content_type", "video%");
          if (element === "text") builder.orWhereLike("content_type", "text%");
          if (element === "other")
            builder.orWhereNot((innerBuilder) => {
              innerBuilder
                .orWhereLike("content_type", "image%")
                .orWhereLike("content_type", "audio%")
                .orWhereLike("content_type", "video%")
                .orWhereLike("content_type", "text%");
            });
        }
      });
    }

    // filter file status
    const fileStaus = explorerState.value.filters.status;
    if (fileStaus.includes("no source")) {
      query.andWhere("source", "");
    }
    if (fileStaus.includes("no licence")) {
      query.andWhere("licence", "");
    }

    // get total item count
    async function getTotalItemCount(): Promise<number> {
      const url = new URL(import.meta.env.VITE_CF_DATABASE_URL);
      const queryStr = query.clone().count().toString();
      url.searchParams.set("query", queryStr);
      return ((await ky.get(url.href).json()) as DbResponse)[0]["results"][0][
        `count(*)`
      ];
    }

    // get data from database
    async function getItems(): Promise<FileRecord[]> {
      const url = new URL(import.meta.env.VITE_CF_DATABASE_URL);
      const queryStr = query.clone().toString();
      url.searchParams.set("query", queryStr);
      return ((await ky.get(url.href).json()) as DbResponse)[0].results;
    }

    if (type === "more") {
      // load more
      const itemsTemp = await getItems();
      data.value.push(...itemsTemp);
    } else {
      // refresh
      const [totalItemCountTemp, itemsTemp] = await Promise.all([
        getTotalItemCount(),
        getItems(),
      ]);
      totalItemCount.value = totalItemCountTemp;
      data.value = itemsTemp;
    }
  } catch (error) {
    console.dir(error);
    window.$notification.error({
      title: t("general.error"),
      content: `${error}`,
      meta: dayjs().format("lll"),
    });
  } finally {
    loading.value = false;
  }
}

// watch sorter and filters
watch(
  () => [
    explorerState.value.sorterKey,
    explorerState.value.sorterOrder,
    explorerState.value.filters.type,
    explorerState.value.filters.status,
  ],
  () => queryData(),
);

// edit file (source and licence)
async function editFile(): Promise<void> {
  const EditFileDialog = (
    await import("@renderer/components/EditFileDialog.vue")
  ).default;
  const modalInstance = window.$modal.create({
    autoFocus: false,
    title: t("github-files.title-edit"),
    preset: "dialog",
    showIcon: false,
    style: "width: 480px; max-width: 100%",
    content: () =>
      h(EditFileDialog, {
        onClose: () => modalInstance.destroy(),
        onDone: () => queryData(),
        onLoadingStart: () => {
          modalInstance.closable = false;
          modalInstance.closeOnEsc = false;
          modalInstance.maskClosable = false;
        },
        onLoadingEnd: () => {
          modalInstance.closable = true;
          modalInstance.closeOnEsc = true;
          modalInstance.maskClosable = true;
        },
        fileRecord: checkedItems.value[0],
      }),
  });
}
</script>
