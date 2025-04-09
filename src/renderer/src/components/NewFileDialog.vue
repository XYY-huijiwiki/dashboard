<template>
  <n-flex vertical>
    <n-flex vertical class="my-8">
      <n-alert v-if="fileName.match(/\s/)" type="warning">
        {{ t("github-files.msg-space-replacement-warning") }}
      </n-alert>
      <n-alert
        v-if="
          is.web && selectedFileWeb && selectedFileWeb.size > 20 * 1024 * 1024
        "
        type="warning"
      >
        {{ t("github-files.msg-file-size-warning") }}
        <a
          target="_blank"
          href="https://github.com/XYY-huijiwiki/dashboard/releases/latest"
        >
          <img
            :src="`https://img.shields.io/github/v/release/XYY-huijiwiki/dashboard?label=${t('github-files.btn-download-latest-release')}&style=for-the-badge`"
            :alt="t('github-files.btn-download-latest-release')"
          />
        </a>
      </n-alert>
      <n-input-group>
        <n-button @click="handleSelectFile">
          {{ t("github-files.btn-select-file") }}
        </n-button>
        <n-input
          v-model:value="fileName"
          :disabled="!selectedFile && !selectedFileWeb"
        ></n-input>
      </n-input-group>
      <n-select
        v-model:value="fileLicense"
        :placeholder="t('github-files.label-file-licence')"
        :options="licenceOptions"
      ></n-select>
      <n-input
        v-model:value="fileSource"
        type="textarea"
        :placeholder="t('github-files.label-file-source')"
      ></n-input>
      <component :is="genWikitextDom(fileSource)" v-if="fileSource" />
    </n-flex>
    <!-- footer (action) -->
    <n-flex justify="end">
      <n-button :disabled="loading" @click="$emit('close')">
        {{ t("general.btn-cancel") }}
      </n-button>
      <n-button
        :loading="loading"
        type="primary"
        :disabled="!canUpload"
        @click="confirmNewFile()"
      >
        {{ t("general.btn-confirm") }}
      </n-button>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, computed, type Ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ky from "ky";
import { useFileDialog } from "@vueuse/core";

import { useSettingsStore } from "@renderer/stores/settings";
import { dayjsLocales } from "@renderer/stores/locales";
import db from "@renderer/utils/queryDB";
import licenceOptions from "@renderer/utils/licenceOptions";
import genWikitextDom from "@renderer/utils/genWikitextDom";
import {
  fileNameLengthLimitFromOrg,
  fileNameOrgToBase62,
} from "@renderer/utils/fileName";
import { is } from "@renderer/utils";

dayjs.extend(localizedFormat).locale(dayjsLocales.value);

const { t } = useI18n();
const { settings } = storeToRefs(useSettingsStore());
const loading = ref(false);
const fileName = ref("");
const fileLicense: Ref<null | string> = ref(null);
const fileSource: Ref<null | string> = ref(null);
const selectedFile = ref<Awaited<
  ReturnType<typeof window.api.openFileDialog>
> | null>(null);
const selectedFileWeb: Ref<null | File> = ref(null);
const canUpload = computed(
  () =>
    // Electron Only
    (!is.web &&
      !!selectedFile.value &&
      !!fileName.value &&
      !!fileLicense.value &&
      !!fileSource.value) ||
    // Web Only
    (is.web &&
      !!selectedFileWeb.value &&
      !!fileName.value &&
      !!fileLicense.value &&
      !!fileSource.value),
);
const fileDialog = useFileDialog();

const emit = defineEmits(["close", "done", "loading-start", "loading-end"]);
watch(loading, (v) => {
  if (v) emit("loading-start");
  else emit("loading-end");
});

async function handleSelectFile(): Promise<void> {
  // Web Only
  if (is.web) {
    await fileDialog.open({
      multiple: false,
    });
    fileDialog.onChange(() => {
      if (fileDialog.files.value === null) return;
      selectedFileWeb.value = fileDialog.files.value[0];
      fileName.value = fileDialog.files.value[0].name;
    });
  }
  // Electron Only
  else {
    const file = await window.api.openFileDialog();
    if (!file) return;
    selectedFile.value = file;
    fileName.value = file.name;
  }
}

async function confirmNewFile(): Promise<void> {
  // if no file selected, do nothing (Electron only)
  if (!is.web && !selectedFile.value) return;
  // if no file selected, do nothing (Web only)
  if (is.web && !selectedFileWeb.value) return;
  // if no file name, do nothing
  if (!fileName.value) return;
  // if file name is too long
  const orgName = fileName.value;
  if (!fileNameLengthLimitFromOrg(orgName)) {
    window.$message.error(t("github-files.msg-file-name-too-long"));
    return;
  }

  // start loading
  loading.value = true;

  // replace space with underscore in file name
  const fileNameToBeUsed = fileName.value.trim().replaceAll(" ", "_");

  try {
    let ghRes: GhAssetUploadResponse;
    // step 1: upload to github (Web only)
    if (is.web) {
      const corsProxy = `https://cors-proxy.24218079.xyz/`;
      const url = new URL(
        `${corsProxy}https://uploads.github.com/repos/${settings.value.ghOwner}/${settings.value.ghRepo}/releases/${settings.value.rootReleaseId}/assets`,
      );
      url.searchParams.set("name", fileNameOrgToBase62(fileName.value));
      ghRes = await ky
        .post(url, {
          headers: {
            "Content-Type": selectedFileWeb.value?.type,
            Authorization: `token ${settings.value.ghToken}`,
          },
          body: selectedFileWeb.value,
        })
        .json();
    }
    // step 1: upload to github (Electron only)
    else {
      ghRes = await window.api.uploadToGitHub({
        owner: settings.value.ghOwner,
        repo: settings.value.ghRepo,
        releaseId: `${settings.value.rootReleaseId}`,
        ghToken: settings.value.ghToken,
        filePath: selectedFile.value?.path as string,
        fileName: fileNameToBeUsed,
      });
    }
    console.log("ghRes", ghRes);

    // step 2: update database
    const wikitext = ``;
    const query = db("files")
      .insert({
        id: ghRes.id,
        file_name: fileNameToBeUsed,
        file_name_base62: ghRes.name,
        file_size: ghRes.size,
        content_type: ghRes.content_type,
        uploader: ghRes.uploader.login,
        updated_at: ghRes.updated_at,
        wikitext,
        licence: fileLicense.value,
        source: fileSource.value,
      })
      .toString();
    const url = new URL(settings.value.databaseUrl);
    url.searchParams.set("query", query);
    url.searchParams.set("gh_token", settings.value.ghToken);
    const dbRes = await fetch(url.href);
    console.log("dbRes", dbRes);

    window.$message.success(t("github-files.msg-upload-success"));
    emit("done");
  } catch (error) {
    console.dir(error);
    window.$notification.error({
      title: t("github-files.msg-upload-failed"),
      content: `${error}`,
      meta: dayjs().format("lll"),
    });
  } finally {
    loading.value = false;
    emit("close");
  }
}
</script>

<style scoped></style>
