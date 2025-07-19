<template>
  <img
    :src="src"
    :alt="fileType"
    :width="size"
    :height="size"
    :class="[is.web ? `!inline-block` : `inline-block`, `align-text-bottom`]"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { is } from "@renderer/utils";

const { fileType } = defineProps({
  fileType: {
    type: String,
    default: "file",
  },
  size: {
    type: Number,
    default: 24,
  },
});

const iconPack = import.meta.glob("../assets/icons/*.ico", {
  as: "url",
  eager: true,
});

const src = computed(() => {
  const iconName = getIconName(fileType);
  let result = iconPack[`../assets/icons/${iconName}.ico`];
  if (is.dev && is.web) {
    const newOrigin = new URL(import.meta.url).origin;
    result = new URL(result, newOrigin).href;
  }
  return result;
});

function getIconName(type: string): string {
  if (
    [
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ].includes(type)
  )
    return "word";
  if (
    [
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ].includes(type)
  )
    return "excel";
  if (
    [
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    ].includes(type)
  )
    return "powerpoint";
  if (type === "application/pdf") return "doc";
  if (["application/zip", "application/x-zip-compressed"].includes(type))
    return "zip";
  if (type.startsWith("model")) return "model";
  if (type.startsWith("image")) return "image";
  if (type.startsWith("audio")) return "audio";
  if (type.startsWith("video")) return "video";
  if (type.startsWith("text")) return "text";
  return "default";
}
</script>
