<template>
  <n-flex vertical class="h-full">
    <n-input-group>
      <n-select
        v-model:value="selectPagesValue"
        :options="selectPagesOptions"
      />
      <n-button
        :disabled="loading"
        type="info"
        @click="search[selectPagesValue]"
      >
        {{ t(`rename-pages.btn-search`) }}
      </n-button>
    </n-input-group>
    <n-data-table
      :columns="columns"
      :data="data"
      size="small"
      class="flex-1"
      flex-height
    />
    <n-input-group>
      <n-input
        v-model:value="summary"
        :placeholder="t(`rename-pages.label-reason`)"
        :disabled="loading"
      />
      <n-button type="primary" :loading="loading" @click="rename">
        {{ t(`rename-pages.btn-rename`) }}
      </n-button>
    </n-input-group>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, h, computed, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import type { DataTableColumn, SelectOption } from "naive-ui";
import { NA, NFlex, NTag } from "naive-ui";
import { read, utils } from "xlsx";

import { renamePage } from "@renderer/utils/mwApi";
import { sleep } from "@renderer/utils";
import { isArray } from "lodash-es";

// router guard to prevent leaving page when deleting or undeleting
onBeforeRouteLeave(() => {
  if (loading.value) {
    window.$dialog.error({
      title: t("general.text-leave-warning-title"),
      content: t("general.text-leave-warning-content"),
      positiveText: t("general.btn-confirm"),
      autoFocus: false,
      transformOrigin: "center",
    });
    return false;
  } else {
    return true;
  }
});

const { t } = useI18n();
const summary: Ref<string | undefined> = ref();
const loading = ref(false);

async function rename() {
  if (!summary.value) {
    window.$message.error(
      t("delete-and-undelete.delete.error-no-delete-reason"),
    );
    return;
  }

  loading.value = true;

  for (const row of data.value) {
    if (row.status !== "to-do") continue;
    const renameResult = await renamePage({
      from: row.titleFrom,
      to: row.titleTo,
      reason: summary.value,
      noredirect: true,
    });
    if (renameResult.ok) {
      row.status = "done";
    } else {
      const errorTypeMapper: Record<string, string> = {
        missingtitle: t("rename-pages.errors.missingtitle"),
        nofrom: t("rename-pages.errors.nofrom"),
        noto: t("rename-pages.errors.noto"),
        notoken: t("rename-pages.errors.notoken"),
        "cantmove-anon": t("rename-pages.errors.cantmove-anon"),
        cantmove: t("rename-pages.errors.cantmove"),
        cantmovefile: t("rename-pages.errors.cantmovefile"),
        selfmove: t("rename-pages.errors.selfmove"),
        immobilenamespace: t("rename-pages.errors.immobilenamespace"),
        articleexists: t("rename-pages.errors.articleexists"),
        redirectexists: t("rename-pages.errors.redirectexists"),
        protectedpage: t("rename-pages.errors.protectedpage"),
        protectedtitle: t("rename-pages.errors.protectedtitle"),
        nonfilenamespace: t("rename-pages.errors.nonfilenamespace"),
        filetypemismatch: t("rename-pages.errors.filetypemismatch"),
        mustbeposted: t("rename-pages.errors.mustbeposted"),
      };
      const error = renameResult.body;
      const errorDetail = errorTypeMapper[error] || error;
      row.errorDetail = errorDetail;
      row.status = "error";
    }

    await sleep(500);
  }
  loading.value = false;
}

// #region Data Table
type RenameState = {
  titleFrom: string;
  titleTo: string;
  status: "to-do" | "doing" | "done" | "error";
  errorDetail?: string;
};
const data: Ref<RenameState[]> = ref([]);
const columns: Ref<DataTableColumn<RenameState>[]> = computed(() => [
  {
    key: "title-from",
    ellipsis: { tooltip: true },
    resizable: true,
    minWidth: 240,
    title: () => t(`rename-pages.label-table-title-from`),
    render: (rowData) => {
      return h(
        NA,
        {
          href: location.origin + "/wiki/" + rowData.titleFrom,
          target: "_blank",
        },
        () => rowData.titleFrom,
      );
    },
  },
  {
    key: "title-to",
    ellipsis: { tooltip: true },
    resizable: true,
    minWidth: 240,
    title: () => t(`rename-pages.label-table-title-to`),
    render: (rowData) => {
      return h(
        NA,
        {
          href: location.origin + "/wiki/" + rowData.titleTo,
          target: "_blank",
        },
        () => rowData.titleTo,
      );
    },
  },
  {
    key: "status",
    title: () => t(`rename-pages.label-table-status`),
    resizable: true,
    minWidth: 240,
    render: (rowData) => {
      // <n-flex>
      //   <template #trigger>
      //     <n-tag>...</n-tag>
      //   </template>
      //   <template #default>
      //     <span>...</span>
      //   </template>
      // </n-flex>
      return h(NFlex, () => [
        h(
          NTag,
          {
            type:
              rowData.status === "to-do"
                ? "info"
                : rowData.status === "doing"
                  ? "warning"
                  : rowData.status === "done"
                    ? "success"
                    : "error",
            bordered: false,
            class: [rowData.errorDetail && "cursor-help"],
          },
          () => {
            const mapper = {
              "to-do": t("rename-pages.label-status-to-do"),
              doing: t("rename-pages.label-status-doing"),
              done: t("rename-pages.label-status-done"),
              error: t("general.error"),
            };
            return mapper[rowData.status];
          },
        ),
        h("span", rowData.errorDetail),
      ]);
    },
  },
]);
// #endregion

// #region select pages
const selectPagesValue: Ref<"xlsx"> = ref("xlsx");
const selectPagesOptions: Ref<SelectOption[]> = ref([
  {
    label: t("rename-pages.label-select-pages-by-xlsx"),
    value: "xlsx",
  },
]);
const search = {
  xlsx: () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";
    input.onchange = async () => {
      if (!input.files) return;

      /*
        convert
        | orgPageName_1 | newPageName_1 |
        | orgPageName_2 | newPageName_2 |
        to
        [
          { titleFrom: orgPageName_1, titleTo: newPageName_1, status: 'to-do' },
          { titleFrom: orgPageName_2, titleTo: newPageName_2, status: 'to-do' }
        ]
      */
      const file = input.files[0];
      const fileArrayBuffer = await file.arrayBuffer();
      const workbook = read(fileArrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(worksheet, { header: 1 });
      const renameData: RenameState[] = json.map((row) => {
        if (!isArray(row) || row.length !== 2)
          throw new Error("Invalid data format");
        return {
          titleFrom: `${row[0]}`,
          titleTo: `${row[1]}`,
          status: "to-do",
        };
      });
      data.value = renameData;
    };
    input.click();
  },
};
// #endregion
</script>

<style scoped></style>
