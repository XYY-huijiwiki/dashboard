<template>
  <n-flex vertical>
    <n-form class="my-8">
      <n-form-item :label="t('github-files.label-file-licence')">
        <n-select
          v-model:value="newLicence"
          :options="licenceOptions"
        ></n-select>
      </n-form-item>
      <n-form-item :label="t('github-files.label-file-source')">
        <n-input v-model:value="newSource" type="textarea" />
      </n-form-item>
    </n-form>
    <!-- footer (action) -->
    <n-flex justify="end">
      <n-button :disabled="loading" @click="$emit('close')">
        {{ t("general.btn-cancel") }}
      </n-button>
      <n-button
        :loading="loading"
        type="primary"
        :disabled="!isOK"
        @click="confirmEdit"
      >
        {{ t("general.btn-confirm") }}
      </n-button>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import db from "@renderer/utils/queryDB";
import { useSettingsStore } from "@renderer/stores/settings";
import { dayjsLocales } from "@renderer/stores/locales";
import licenceOptions from "@renderer/utils/licenceOptions";

dayjs.extend(localizedFormat).locale(dayjsLocales.value);
const { t } = useI18n();
const { settings } = storeToRefs(useSettingsStore());

const { fileRecord } = defineProps<{
  fileRecord: FileRecord;
}>();

const loading = ref(false);
const newLicence = ref(fileRecord.licence);
const newSource = ref(fileRecord.source);
const isOK = computed(
  () =>
    newLicence.value !== "" && // licence is input
    newSource.value !== "" && // source is input
    (newLicence.value !== fileRecord.licence ||
      newSource.value !== fileRecord.source), // changed
);

const emit = defineEmits(["close", "done", "loading-start", "loading-end"]);
watch(loading, (v) => {
  if (v) emit("loading-start");
  else emit("loading-end");
});

async function confirmEdit(): Promise<void> {
  // basic validation
  if (!isOK.value) return;

  loading.value = true;

  try {
    // Update database record
    const query = db("files")
      .where("id", fileRecord.id)
      .update({
        licence: newLicence.value,
        source: newSource.value,
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
      .toString();

    const url = new URL(import.meta.env.VITE_CF_DATABASE_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("gh_token", settings.value.ghToken);

    const dbRes = await fetch(url.href);
    console.log("Database update result:", dbRes);

    window.$message.success(t("github-files.msg-edit-success"));
    emit("done");
  } catch (error) {
    console.dir(error);
    window.$notification.error({
      title: t("github-files.msg-edit-failed"),
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
