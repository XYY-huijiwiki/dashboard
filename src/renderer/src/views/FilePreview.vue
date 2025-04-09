<template>
  <n-spin v-if="!fileRecord" class="h-full w-full">
    <div class="h-full w-full"></div>
  </n-spin>
  <n-split
    v-else
    :default-size="0.7"
    direction="horizontal"
    :min="0.6"
    :max="0.8"
    pane1-class="pr-1"
    pane2-class="pl-1"
    :resize-trigger-size="3"
    class="h-full w-full"
  >
    <template #1>
      <file-preview v-model="fileRecord" :closable="false" />
    </template>
    <template #2>
      <file-details :file-details="[fileRecord]" :uncontrolled="true" />
    </template>
  </n-split>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import db from "@renderer/utils/queryDB";
import { errNotify } from "@renderer/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const fileRecord: Ref<FileRecord | undefined> = ref(undefined);

onMounted(async () => {
  const fileName = (route.params.filename as string).replace(/ /g, "_");
  const queryStr = db("files")
    .where("file_name", fileName)
    .where("is_deleted", null)
    .toString();
  console.log(queryStr);
  const queryUrl = new URL(
    "https://xyy-huijiwiki-gh-files-db.karsten-zhou-773.workers.dev/",
  );
  queryUrl.searchParams.set("query", queryStr);
  const result = (await fetch(queryUrl.toString()).then((res) => res.json()))[0]
    .results as [FileRecord] | [];
  if (result.length !== 1) {
    errNotify(
      t("file-preview.title-file-not-found"),
      new Error(`${fileName} not found.`),
    );
    router.push({ name: "error" });
    return;
  }
  fileRecord.value = result[0];
});
</script>

<style scoped></style>
