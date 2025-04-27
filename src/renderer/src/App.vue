<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { computed, ref, watch } from "vue";
import type { Ref } from "vue";
import {
  useDialog,
  useMessage,
  useModal,
  useLoadingBar,
  useNotification,
} from "naive-ui";
import { useTitle, useFullscreen } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useSettingsStore } from "@renderer/stores/settings";
import NavigationBtn from "./components/NavigationBtn.vue";
import { is } from "@renderer/utils";

const { settings } = storeToRefs(useSettingsStore());
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

// #region fullscreen
const fullscreenHTML: Ref<null | HTMLElement> = ref(null);
const { isFullscreen: isFullscreenWeb, toggle } = useFullscreen(fullscreenHTML);
const isFullscreen = !is.web ? ref(false) : isFullscreenWeb;
const toggleFullscreen = async () => {
  if (!is.web) {
    isFullscreen.value = !isFullscreen.value;
    window.api.toggleFullScreen();
  } else {
    toggle();
  }
};
// #endregion
</script>

<template>
  <title-bar v-if="is.win" :title="title" />
  <n-layout
    ref="fullscreenHTML"
    has-sider
    :class="isEnableWindowsMaterial ? '!bg-transparent' : ''"
    embedded
  >
    <n-layout-sider
      :bordered="!isEnableWindowsMaterial"
      :native-scrollbar="false"
      :collapsed="settings.sidebarCollapsed"
      collapse-mode="width"
      :collapsed-width="62"
      :class="isEnableWindowsMaterial ? '!bg-transparent' : ''"
    >
      <navigation-btn
        :collapsed="settings.sidebarCollapsed"
        @click="settings.sidebarCollapsed = !settings.sidebarCollapsed"
      />
      <side-menu :collapsed="settings.sidebarCollapsed" />
    </n-layout-sider>
    <n-layout-content
      :class="isEnableWindowsMaterial ? 'rounded-tl-lg overflow-hidden' : ''"
    >
      <n-card
        content-class="shrink-0 h-0"
        class="!rounded-none !border-none"
        :class="[is.web && !isFullscreen ? 'h-[80vh]' : 'h-screen']"
      >
        <!-- 卡片左上角：返回 | 前进 | 刷新  | 标题 -->
        <template #header>
          <n-space
            id="title-bar"
            align="center"
            :wrap="false"
            :wrap-item="false"
          >
            <!-- back btn -->
            <n-button
              quaternary
              circle
              :disabled="!canBack"
              @click="router.back()"
            >
              <template #icon>
                <n-icon :size="24">
                  <icon icon="fluent:arrow-left-24-regular" />
                </n-icon>
              </template>
            </n-button>
            <!-- forward btn -->
            <n-button
              v-show="canForward"
              quaternary
              circle
              @click="router.forward()"
            >
              <template #icon>
                <n-icon :size="24">
                  <icon icon="fluent:arrow-right-24-regular" />
                </n-icon>
              </template>
            </n-button>
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
          </n-space>
        </template>

        <!-- 卡片右上角按钮：fullscreen -->
        <template v-if="!is.win" #header-extra>
          <n-button
            quaternary
            circle
            :class="isFullscreen ? 'hvr-icon-push' : 'hvr-icon-pop'"
            @click="toggleFullscreen"
          >
            <template #icon>
              <n-icon :size="24">
                <!-- <full-screen-minimize24-regular v-if="isFullscreen" class="hvr-icon" />
                <full-screen-maximize24-regular v-else class="hvr-icon" /> -->
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
        </template>

        <!-- 卡片主体部分：路由 -->
        <template #default>
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </template>
      </n-card>
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
