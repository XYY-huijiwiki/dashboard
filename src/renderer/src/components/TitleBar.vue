<template>
  <n-element
    class="title-bar"
    :style="{
      backgroundColor:
        is.win && settings.backgroundMaterial !== 'auto'
          ? 'transparent'
          : shouldUseDarkColors
            ? 'var(--card-color)'
            : 'var(--action-color)',
    }"
  ></n-element>
</template>

<script setup lang="ts">
import { is } from "@renderer/utils";
import { storeToRefs } from "pinia";

import { useSettingsStore } from "@renderer/stores/settings";

const { settings, shouldUseDarkColors } = storeToRefs(useSettingsStore());
</script>

<style scoped>
.title-bar {
  height: 30px;
  padding-right: 138px;
  app-region: drag;
  transition:
    color 0.3s var(--cubic-bezier-ease-in-out),
    background-color 0.3s var(--cubic-bezier-ease-in-out),
    box-shadow 0.3s var(--cubic-bezier-ease-in-out),
    border-color 0.3s var(--cubic-bezier-ease-in-out);
}
</style>
