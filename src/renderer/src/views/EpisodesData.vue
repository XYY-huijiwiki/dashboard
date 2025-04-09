<template>
  <n-flex verticle>
    <n-divider>
      {{ t("episodes-data.label-data-export") }}
    </n-divider>
    <n-alert class="w-full" type="info">
      {{ t("episodes-data.backup-tip") }}
    </n-alert>
    <n-input-group>
      <n-select v-model:value="value" :options="cartoonList" filterable />
      <n-select
        v-model:value="settings.episodesDataExportType"
        class="!w-36"
        :options="[
          { label: '.json', value: 'json' },
          { label: '.xlsx', value: 'xlsx' },
        ]"
      />
      <n-button :loading="btnLoading" @click="getDataFile(value)">
        {{ t("episodes-data.btn-export") }}
      </n-button>
    </n-input-group>
    <n-divider>
      {{ t("episodes-data.label-data-import") }}
    </n-divider>
    <n-grid cols="2">
      <n-grid-item>
        <n-statistic :label="t('episodes-data.label-file-name')">
          {{ dataInfo.name }}
        </n-statistic>
      </n-grid-item>
      <n-grid-item>
        <n-statistic :label="t('episodes-data.label-episodes')">
          {{ dataInfo.length }}
        </n-statistic>
      </n-grid-item>
    </n-grid>

    <n-progress
      :percentage="
        dataInfo.length === 0 ? 0 : Math.floor((count / dataInfo.length) * 100)
      "
      :show-indicator="true"
      indicator-placement="inside"
      :status="importing ? 'info' : 'success'"
      :processing="importing"
    />

    <n-input-group>
      <n-input
        v-model:value="summary"
        :placeholder="t('episodes-data.label-edit-summary')"
      />
      <n-upload
        abstract
        :accept="`.` + settings.episodesDataExportType"
        :show-file-list="false"
        :on-update:file-list="refreshData"
        :default-upload="false"
      >
        <n-upload-trigger #="{ handleClick }" abstract>
          <n-button :disabled="importing" @click="handleClick">
            {{ t("episodes-data.label-select-file") }}
          </n-button>
        </n-upload-trigger>
      </n-upload>
      <n-button :disabled="!fileList[0] || count !== 0" @click="importData()">
        {{ t("episodes-data.btn-import") }}
      </n-button>
    </n-input-group>
  </n-flex>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import ky from "ky";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import type { UploadFileInfo } from "naive-ui";
import { utils, read } from "xlsx";
import { isArray } from "lodash-es";

import { errNotify, is, sleep } from "@renderer/utils";
import { downloadJson, downloadXlsx } from "@renderer/utils/EpisodesData";
import type {
  EpisodesRecord,
  EpisodesResponse,
} from "@renderer/utils/EpisodesData";
import cartoonList from "@renderer/assets/cartoon-list.json";
import { useSettingsStore } from "@renderer/stores/settings";
import { editPage } from "@renderer/utils/mwApi";

const { t } = useI18n();
const { settings } = storeToRefs(useSettingsStore());

// #region data export

// 定义一些变量
const btnLoading = ref(false);
const value = ref("喜羊羊与灰太狼（经典版）");

// 导出数据文件
async function getDataFile(title: string | null) {
  // check null
  if (!title) return;
  // 打开加载动画
  btnLoading.value = true;

  try {
    // fetch data
    const url = new URL(`https://xyy.huijiwiki.com/api/rest_v1/namespace/data`);
    url.searchParams.append("filter", JSON.stringify({ 系列1: title }));
    url.searchParams.append("sort_by", "集数");
    url.searchParams.append("pagesize", "530");
    url.searchParams.append("date", Date().toString());
    const response = await ky.get(url);

    // 处理数据
    const data = (await response.json()) as EpisodesResponse;
    const cartoonData = data._embedded;

    // export data, data type depends on settings
    if (settings.value.episodesDataExportType === "json") {
      await downloadJson(cartoonData, title + " " + new Date().toISOString());
    } else if (settings.value.episodesDataExportType === "xlsx") {
      await downloadXlsx(cartoonData, title + " " + new Date().toISOString());
    }

    // 导出成功提示
    window.$message.success(t("episodes-data.msg-export-success"));
  } catch (err) {
    errNotify(t("episodes-data.msg-export-failed"), err);
  } finally {
    btnLoading.value = false;
  }
}

// #endregion

// #region data import
// router guard to prevent leaving page when importing
onBeforeRouteLeave(() => {
  if (importing.value) {
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

const fileList: Ref<UploadFileInfo[]> = ref([]);
const importing = ref(false);
const dataInfo = ref({
  name: t("episodes-data.msg-no-file-selected"),
  length: 0,
});
const cartoonData: Ref<EpisodesRecord[]> = ref([]);
const summary = ref("");
const count = ref(0);

const refreshData = async (list: UploadFileInfo[]) => {
  // check if fileList[0] exists
  if (!list[0]?.file) {
    console.log("fileList changed before any file selected");
    return;
  }

  // sync fileList
  console.log(list);
  fileList.value = list;

  // reset import count
  count.value = 0;

  // define cartoonData to be uploaded
  let data: EpisodesRecord[];

  // read file
  if (fileList.value[0].type === "application/json") {
    // read json file
    const json = await list[0].file.text();
    // transform json file to cartoonData
    data = JSON.parse(json);
  }
  // theorically, `xlsx` can handle anything else
  else {
    // file to ArrayBuffer
    const arrayBuffer = await list[0].file.arrayBuffer();
    // read xlsx file
    const workbook = await read(arrayBuffer, { type: "array" });
    // transform xlsx file to cartoonData
    data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }

  dataInfo.value = {
    name: list[0].name,
    length: data.length,
  };

  cartoonData.value = data;
};

async function importData() {
  // check if fileList[0] exists
  if (!fileList.value[0]?.file) {
    console.log("import before any file selected");
    return;
  }

  // check if summary is empty
  if (summary.value === "") {
    window.$message.error(t("episodes-data.msg-empty-summary"));
    return;
  }

  // activate importing status
  importing.value = true;

  // upload data
  for await (const dataItem of cartoonData.value) {
    const { _id, ...newDataItem } = dataItem;
    // parse array string to array
    Object.keys(newDataItem).forEach((key) => {
      const value = newDataItem[key];
      try {
        if (isArray(JSON.parse(`${value}`)))
          newDataItem[key] = JSON.parse(`${value}`);
      } catch (error) {
        // do nothing
      }
    });
    const text = JSON.stringify(newDataItem);
    if (is.dev) {
      console.log(_id);
      console.log(newDataItem);
    }
    try {
      const res = await editPage({
        title: _id,
        text,
        summary: "【批量更新剧集信息】" + summary.value,
      });
      if (!res.ok) errNotify(t("general.error"), res.body);
    } catch (error) {
      errNotify(t("episodes-data.msg-import-failed", [_id]), error);
      continue;
    }
    count.value++;
    await sleep(500);
  }

  // deactivate importing status
  importing.value = false;
}
// #endregion
</script>

<style scoped></style>
