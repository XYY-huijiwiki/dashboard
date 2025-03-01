<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useDialog, useMessage, useModal, useLoadingBar, useNotification } from 'naive-ui'
import { useTitle } from '@vueuse/core'
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowClockwise24Regular,
  Home24Regular,
  Settings24Regular
} from '@vicons/fluent'

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
</script>

<template>
  <n-card content-class="shrink-0 h-0" class="h-screen !rounded-none">
    <!-- 卡片左上角：返回 | 前进 | 刷新 | 主页 | 标题 -->
    <template #header>
      <n-space id="mini-dashboard-title-bar" align="center" :wrap="false" :wrap-item="false">
        <!-- back btn -->
        <n-button quaternary circle @click="$router.back()">
          <template #icon>
            <n-icon :size="24">
              <arrow-left24-regular />
            </n-icon>
          </template>
        </n-button>
        <!-- forward btn -->
        <n-button quaternary circle @click="$router.forward()">
          <template #icon>
            <n-icon :size="24">
              <arrow-right24-regular />
            </n-icon>
          </template>
        </n-button>
        <!-- refresh btn -->
        <n-button quaternary circle @click="$router.go(0)">
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
          @click="$router.push({ name: 'home' })"
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

    <!-- 卡片右上角按钮：设置 -->
    <template #header-extra>
      <n-button
        v-if="$route.name !== 'settings'"
        quaternary
        circle
        @click="$router.push('/settings')"
      >
        <template #icon>
          <n-icon :size="24">
            <settings24-regular class="duration-1000 ease-in-out hover:rotate-180" />
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
