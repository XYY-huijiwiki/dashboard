<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { useDialog, useMessage, useModal, useLoadingBar, useNotification } from 'naive-ui'
import { useTitle } from '@vueuse/core'
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowClockwise24Regular,
  Home24Regular,
  Settings24Regular,
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular
} from '@vicons/fluent'
import { useRouter } from 'vue-router'

const router = useRouter()
const dev = import.meta.env.DEV
const { t } = useI18n()

// naive-ui register
window.$dialog = useDialog()
window.$message = useMessage()
window.$modal = useModal()
window.$loadingBar = useLoadingBar()
window.$notification = useNotification()

// set title
useTitle(computed(() => t('home.title')))

// reactive navigation controls display
const canBack = ref(false)
const canForward = ref(false)
watch(
  () => router.currentRoute.value,
  () => {
    canBack.value = router.options.history.state.back !== null
    canForward.value = router.options.history.state.forward !== null
  },
  { immediate: true }
)

// #region fullscreen
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  window.api.toggleFullScreen()
}
</script>

<template>
  <n-card content-class="shrink-0 h-0" class="h-screen !rounded-none">
    <!-- 卡片左上角：返回 | 前进 | 刷新 | 主页 | 标题 -->
    <template #header>
      <n-space id="title-bar" align="center" :wrap="false" :wrap-item="false">
        <!-- back btn -->
        <n-button quaternary circle :disabled="!canBack" @click="router.back()">
          <template #icon>
            <n-icon :size="24">
              <arrow-left24-regular />
            </n-icon>
          </template>
        </n-button>
        <!-- forward btn -->
        <n-button v-show="canForward" quaternary circle @click="router.forward()">
          <template #icon>
            <n-icon :size="24">
              <arrow-right24-regular />
            </n-icon>
          </template>
        </n-button>
        <!-- refresh btn -->
        <n-button quaternary circle @click="router.go(0)">
          <template #icon>
            <n-icon :size="24">
              <arrow-clockwise24-regular />
            </n-icon>
          </template>
        </n-button>
        <!-- home btn -->
        <n-button
          v-if="$route.name !== 'home'"
          quaternary
          circle
          @click="router.push({ name: 'home' })"
        >
          <template #icon>
            <n-icon :size="24">
              <home24-regular />
            </n-icon>
          </template>
        </n-button>
        <n-tag v-if="dev">{{ t('dev-tag') }}</n-tag>
        {{ t(`${$route.name?.toString()}.title`) }}
      </n-space>
    </template>

    <!-- 卡片右上角按钮：fullscreen, settings -->
    <template #header-extra>
      <n-button
        quaternary
        circle
        :class="isFullscreen ? 'hvr-icon-push' : 'hvr-icon-pop'"
        @click="toggleFullscreen"
      >
        <template #icon>
          <n-icon :size="24">
            <full-screen-minimize24-regular v-if="isFullscreen" class="hvr-icon" />
            <full-screen-maximize24-regular v-else class="hvr-icon" />
          </n-icon>
        </template>
      </n-button>
      <n-button
        v-if="$route.name !== 'settings'"
        quaternary
        circle
        class="hvr-icon-spin"
        @click="router.push('/settings')"
      >
        <template #icon>
          <n-icon :size="24">
            <settings24-regular class="hvr-icon" />
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
</template>

<style scoped>
/* The following css are based on Hover.css (https://ianlunn.github.io/Hover/) */

/* Icon Spin */
.hvr-icon-spin .hvr-icon {
  transition-duration: 0.3s;
  transition-property: transform;
  transition-timing-function: ease-in-out;
}
.hvr-icon-spin:hover .hvr-icon,
.hvr-icon-spin:focus .hvr-icon,
.hvr-icon-spin:active .hvr-icon {
  transform: rotate(180deg);
}

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
