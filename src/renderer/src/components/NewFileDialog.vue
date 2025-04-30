<template>
  <n-flex vertical>
    <!-- content -->
    <n-upload
      v-model:file-list="fileList"
      :default-upload="false"
      :multiple="true"
      :show-retry-button="false"
      :disabled="loading"
    >
      <n-upload-dragger>
        <div style="margin-bottom: 12px">
          <n-icon size="48" :depth="3">
            <icon icon="fluent:cloud-arrow-up-48-regular" />
          </n-icon>
        </div>
        <n-text style="font-size: 16px">
          {{ t("file-explorer.upload-prompt") }}
        </n-text>
      </n-upload-dragger>
    </n-upload>

    <!-- footer -->
    <n-input-group>
      <n-input
        v-model:value="fileSource"
        :placeholder="t('file-explorer.label-file-source')"
        :disabled="loading"
      ></n-input>
      <n-select
        v-model:value="fileLicense"
        :placeholder="t('file-explorer.label-file-licence')"
        :disabled="loading"
        :options="licenceOptions"
        :render-tag="({ option }) => h('div', option.value)"
        :consistent-menu-width="false"
      ></n-select>
      <n-button :loading="loading" type="primary" @click="confirmNewFile()">
        {{ t("file-explorer.btn-upload") }}
      </n-button>
    </n-input-group>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, h } from "vue";
import type { Ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ky from "ky";
import { Icon } from "@iconify/vue";
import { NFlex } from "naive-ui";
import type { UploadFileInfo } from "naive-ui";
import { createId } from "seemly";

import { useSettingsStore } from "@renderer/stores/settings";
import { dayjsLocales } from "@renderer/stores/locales";
import db from "@renderer/utils/queryDB";
import licenceOptions from "@renderer/utils/licenceOptions";
import { isValidFilenameLength, getBase62Name } from "@renderer/utils/filename";
import { errNotify, is } from "@renderer/utils";

const corsProxy = import.meta.env.VITE_CORS_PROXY;
const ghOwner = import.meta.env.VITE_GH_OWNER;
const ghRepo = import.meta.env.VITE_GH_REPO;
const ghFileReleaseId = import.meta.env.VITE_GH_FILE_RELEASE_ID;
const databaseUrl = import.meta.env.VITE_CF_DATABASE_URL;

dayjs.extend(localizedFormat).locale(dayjsLocales.value);

const { t } = useI18n();
const { settings } = storeToRefs(useSettingsStore());
const { selectedFiles } = defineProps<{ selectedFiles: File[] }>();
const fileList: Ref<UploadFileInfo[]> = ref([]);
onMounted(() => {
  // map `selectedFiles` to `fileList` when initialized
  for (let index = 0; index < selectedFiles.length; index++) {
    const element = selectedFiles[index];
    fileList.value.push({
      id: createId(),
      name: element.name,
      status: "pending",
      file: element,
      type: element.type,
    });
  }
});
const fileLicense: Ref<null | string> = ref(null);
const fileSource: Ref<null | string> = ref(null);
const loading = ref(false);
const emit = defineEmits(["close", "loading-start", "loading-end"]);
watch(loading, (v) => {
  if (v) emit("loading-start");
  else emit("loading-end");
});

function preUploadValidate(uploadFileInfo: UploadFileInfo): void {
  if (uploadFileInfo.file === undefined || uploadFileInfo.file === null) {
    uploadFileInfo.status = "error";
    errNotify(
      t("general.unknown-error"),
      new Error("`uploadFileInfo.file` is undefined or null"),
    );
    return;
  }

  const filename = uploadFileInfo.name;
  const filetype = uploadFileInfo.type;
  const fileSize = uploadFileInfo.file.size;

  // nofilename
  if (filename === "") {
    uploadFileInfo.status = "error";
    errNotify(filename, t("file-explorer.msg-file-name-empty"));
  }

  // file name too long
  if (!isValidFilenameLength(filename)) {
    uploadFileInfo.status = "error";
    errNotify(filename, t("file-explorer.msg-file-name-too-long"));
  }

  // file name contains space (not fatal)
  if (filename.match(/\s/)) {
    window.$notification.warning({
      title: filename,
      content: t("file-explorer.msg-space-in-file-name"),
      meta: dayjs().format("lll"),
    });
  }

  // file size too large (20MiB in web) (not fatal)
  if (is.web && fileSize > 20 * 1024 * 1024) {
    window.$notification.warning({
      title: filename,
      content: () =>
        h(NFlex, { vertical: true }, () => [
          t("file-explorer.msg-file-size-too-large-for-web"),
          h(
            "a",
            {
              target: "_blank",
              href: "https://github.com/XYY-huijiwiki/dashboard/releases/latest",
            },
            [
              h("img", {
                src: `https://img.shields.io/github/v/release/XYY-huijiwiki/dashboard?label=${t("file-explorer.btn-download-latest-release")}&style=for-the-badge`,
                alt: t("file-explorer.btn-download-latest-release"),
              }),
            ],
          ),
        ]),
      meta: dayjs().format("lll"),
    });
  }

  // file size too large (2GiB forbidden)
  if (fileSize > 2 * 1024 * 1024 * 1024) {
    uploadFileInfo.status = "error";
    errNotify(filename, t("file-explorer.msg-file-size-too-large"));
  }

  // unknown file type (not fatal)
  if (filetype === "") {
    window.$notification.warning({
      title: filename,
      content: t("file-explorer.msg-unknown-file-type"),
      meta: dayjs().format("lll"),
    });
  }
}

async function confirmNewFile(): Promise<void> {
  // check file license and file source
  if (fileSource.value === null) {
    window.$message.warning(t("file-explorer.msg-file-source-empty"));
    return;
  }
  if (fileLicense.value === null) {
    window.$message.warning(t("file-explorer.msg-file-licence-empty"));
    return;
  }

  loading.value = true;

  for (let index = 0; index < fileList.value.length; index++) {
    const uploadFileInfo = fileList.value[index];

    // validate file info
    preUploadValidate(uploadFileInfo);

    // only process pending files
    if (uploadFileInfo.status !== "pending") {
      continue;
    }

    // replace spaces with underlines in file name
    const fileNameToBeUsed = uploadFileInfo.name.trim().replaceAll(" ", "_");

    try {
      // step 1: upload to github (both Electron and Web)
      uploadFileInfo.status = "uploading";
      uploadFileInfo.percentage = 0;
      let ghAssetUploadResponse: GhAssetUploadResponse;
      // step 1: upload to github (Web only)
      if (is.web) {
        const url = new URL(
          `${corsProxy}https://uploads.github.com/repos/${ghOwner}/${ghRepo}/releases/${ghFileReleaseId}/assets`,
        );
        url.searchParams.set("name", getBase62Name(fileNameToBeUsed));
        ghAssetUploadResponse = await ky
          .post(url, {
            headers: {
              "Content-Type":
                uploadFileInfo.file?.type || "application/octet-stream",
              Authorization: `token ${settings.value.ghToken}`,
            },
            body: uploadFileInfo.file,
          })
          .json();
      }
      // step 1: upload to github (Electron only)
      else {
        ghAssetUploadResponse = await window.api.uploadToGitHub({
          owner: ghOwner,
          repo: ghRepo,
          releaseId: ghFileReleaseId,
          ghToken: settings.value.ghToken,
          filePath: window.api.getPathForFile(uploadFileInfo.file!),
          fileName: fileNameToBeUsed,
        });
      }
      if (is.dev) console.log("ghRes", ghAssetUploadResponse);

      // step 2: update database
      const query = db("files")
        .insert({
          id: ghAssetUploadResponse.id,
          file_name: fileNameToBeUsed,
          file_name_base62: ghAssetUploadResponse.name,
          file_size: ghAssetUploadResponse.size,
          content_type: ghAssetUploadResponse.content_type,
          uploader: ghAssetUploadResponse.uploader.login,
          updated_at: ghAssetUploadResponse.updated_at,
          wikitext: "",
          licence: fileLicense.value,
          source: fileSource.value,
        })
        .toString();
      const url = new URL(databaseUrl);
      url.searchParams.set("query", query);
      url.searchParams.set("gh_token", settings.value.ghToken);
      const dbRes = await ky.post(url.href).json();
      if (is.dev) console.log("dbRes", dbRes);
      uploadFileInfo.percentage = 100;
      uploadFileInfo.status = "finished";
      uploadFileInfo.url = `https://xyy.huijiwiki.com/wiki/Project:控制中心#/preview/${uploadFileInfo.name}`;
    } catch (error) {
      uploadFileInfo.status = "error";
      errNotify(t("file-explorer.title-upload-failed"), error);
    }
  }

  loading.value = false;
}
</script>

<style scoped>
.upload-dragger {
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius);
  padding: 24px;
  opacity: 1;
  transition:
    opacity 0.3s var(--cubic-bezier-ease-in-out),
    border-color 0.3s var(--cubic-bezier-ease-in-out),
    background-color 0.3s var(--cubic-bezier-ease-in-out);
  background-color: var(--action-color);
  border: 1px dashed var(--border-color);
  &:hover,
  &.hover {
    border-color: var(--primary-color);
  }
}
.upload-list :deep(.n-thing-avatar) {
  flex: none;
}
.upload-list :deep(.n-thing-header__title) {
  flex: auto;
  width: 0;
}
</style>
