<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { computed, ref, watch } from "vue";
import {
  useDialog,
  useMessage,
  useModal,
  useLoadingBar,
  useNotification,
} from "naive-ui";
import { useTitle } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useSettingsStore } from "@renderer/stores/settings";
import NavigationBtn from "./components/NavigationBtn.vue";
import { is } from "@renderer/utils";

const { settings, shouldUseDarkColors } = storeToRefs(useSettingsStore());
const router = useRouter();
const { t } = useI18n();
const isEnableWindowsMaterial = computed(
  () => settings.value.backgroundMaterial !== "auto" && is.win,
);

// naive-ui register
window.$dialog = useDialog();
window.$message = useMessage();
window.$modal = useModal();
window.$loadingBar = useLoadingBar();
window.$notification = useNotification();

// set title
const title = computed(() => t("home.title"));
useTitle(title);

// reactive navigation controls display
const canBack = ref(false);
const canForward = ref(false);
watch(
  () => router.currentRoute.value,
  () => {
    canBack.value = router.options.history.state.back !== null;
    canForward.value = router.options.history.state.forward !== null;
  },
  { immediate: true },
);

// #region fullscreen (web only)
const isFullscreen = ref(false);
const toggleFullscreen = () => {
  if (isFullscreen.value) {
    document.querySelector("html")?.style.removeProperty("overflow");
  } else {
    document.querySelector("html")?.style.setProperty("overflow", "hidden");
  }
  isFullscreen.value = !isFullscreen.value;
};
// #endregion
</script>

<template>
  <n-layout
    has-sider
    :class="[
      is.web && !isFullscreen ? 'h-[80vh]' : 'h-screen',
      is.web && isFullscreen ? 'fixed inset-0 z-[1000]' : '',
      isEnableWindowsMaterial ? '!bg-transparent' : '',
    ]"
  >
    <n-layout-sider
      :bordered="!isEnableWindowsMaterial"
      :collapsed="settings.sidebarCollapsed"
      collapse-mode="width"
      :collapsed-width="62"
      :class="isEnableWindowsMaterial ? '!bg-transparent' : ''"
    >
      <n-flex vertical class="h-full" :size="0">
        <backward-btn
          :disabled="!canBack"
          :collapsed="settings.sidebarCollapsed"
          @click="router.back()"
        />
        <navigation-btn
          :collapsed="settings.sidebarCollapsed"
          @click="settings.sidebarCollapsed = !settings.sidebarCollapsed"
        />
        <n-scrollbar class="h-0 flex-1">
          <side-menu :collapsed="settings.sidebarCollapsed" />
        </n-scrollbar>
        <n-divider class="!my-2" />
        <settings-btn
          :collapsed="settings.sidebarCollapsed"
          @click="router.push({ name: 'settings' })"
        />
      </n-flex>
    </n-layout-sider>
    <n-layout-content
      content-class="flex flex-col"
      :class="isEnableWindowsMaterial ? '!bg-transparent' : ''"
    >
      <title-bar v-if="is.win" />
      <n-element
        class="h-0 flex-1 p-6 gap-6 flex flex-col"
        :class="[isEnableWindowsMaterial ? '!rounded-tl-lg ' : '']"
        :style="{
          backgroundColor: shouldUseDarkColors
            ? 'var(--card-color)'
            : 'var(--action-color)',
        }"
      >
        <!-- header -->
        <n-flex :wrap="false" :align="'center'">
          <!-- refresh btn -->
          <n-button quaternary circle @click="router.go(0)">
            <template #icon>
              <n-icon :size="24">
                <icon icon="fluent:arrow-clockwise-24-regular" />
              </n-icon>
            </template>
          </n-button>
          <!-- dev tag -->
          <n-tag v-if="is.dev">{{ t("general.dev-tag") }}</n-tag>
          <!-- navigation title -->
          <n-text strong class="text-lg">
            {{
              {
                "file-explorer": t("file-explorer.title"),
                "file-preview": t("file-preview.title"),
                "recycle-bin": t("recycle-bin.title"),
                "download-manager": t("download-manager.title"),
                "miui-themes": t("miui-themes.title"),
                "rename-pages": t("rename-pages.title"),
                "find-and-replace": t("find-and-replace.title"),
                "delete-and-undelete": t("delete-and-undelete.title"),
                "episodes-data": t("episodes-data.title"),
                settings: t("settings.title"),
                init: t("init.title"),
                error: t("error.title"),
                loading: t("general.loading"),
              }[$route.name || "loading"]
            }}
          </n-text>
          <!-- search bar -->
          <div id="title-bar" class="w-0 flex-1"></div>
          <!-- fullscreen btn -->
          <n-button
            v-if="is.web"
            quaternary
            circle
            :class="isFullscreen ? 'hvr-icon-push' : 'hvr-icon-pop'"
            @click="toggleFullscreen"
          >
            <template #icon>
              <n-icon :size="24">
                <icon
                  v-if="isFullscreen"
                  icon="fluent:full-screen-minimize-24-regular"
                  class="hvr-icon"
                />
                <icon
                  v-else
                  icon="fluent:full-screen-maximize-24-regular"
                  class="hvr-icon"
                />
              </n-icon>
            </template>
          </n-button>
        </n-flex>
        <!-- body -->
        <div class="h-0 flex-1">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </div>
      </n-element>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
/* The following css are based on Hover.css (https://ianlunn.github.io/Hover/) */

/* Icon Pop */
@-webkit-keyframes hvr-icon-pop {
  50% {
    transform: scale(1.25);
  }
}
@keyframes hvr-icon-pop {
  50% {
    transform: scale(1.25);
  }
}
.hvr-icon-pop .hvr-icon {
  transform: translateZ(0);
  transition-duration: 0.3s;
  transition-property: transform;
  transition-timing-function: ease-out;
}
.hvr-icon-pop:hover .hvr-icon,
.hvr-icon-pop:focus .hvr-icon,
.hvr-icon-pop:active .hvr-icon {
  animation-name: hvr-icon-pop;
  animation-duration: 0.3s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
}

/* Icon Push */
@-webkit-keyframes hvr-icon-push {
  50% {
    transform: scale(0.75);
  }
}
@keyframes hvr-icon-push {
  50% {
    transform: scale(0.75);
  }
}
.hvr-icon-push .hvr-icon {
  transform: translateZ(0);
  transition-duration: 0.3s;
  transition-property: transform;
  transition-timing-function: ease-out;
}
.hvr-icon-push:hover .hvr-icon,
.hvr-icon-push:focus .hvr-icon,
.hvr-icon-push:active .hvr-icon {
  animation-name: hvr-icon-push;
  animation-duration: 0.3s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
}
</style>
