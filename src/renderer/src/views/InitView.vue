<template>
  <n-flex vertical>
    <n-h1>{{ t('init.welcome-title') }}</n-h1>
    <n-empty :description="t(`init.msg-login-desc`)">
      <template #icon>
        <github />
      </template>
      <template #extra>
        <n-button :loading="loading" @click="login">{{ t('init.btn-login') }}</n-button>
      </template>
    </n-empty>
  </n-flex>
</template>

<script setup lang="ts">
import { Github } from '@vicons/fa'
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import { useSettingsStore } from '@renderer/stores/settings'
import { dayjsLocales } from '@renderer/stores/locales'

dayjs.extend(localizedFormat).locale(dayjsLocales.value)

const { t } = useI18n()

const router = useRouter()

const { settings } = storeToRefs(useSettingsStore())

const loading = ref(false)

async function login(): Promise<void> {
  loading.value = true

  try {
    const token = await window.api.ghLogin()
    if (!token) throw new Error('No token')
    settings.value.ghToken = token

    window.$message.success(t('init.msg-login-success'))
    router.push('/')
  } catch (e) {
    console.dir(e)
    window.$notification.error({
      title: t('init.msg-login-failed'),
      content: `${e}`,
      meta: dayjs().format('lll')
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (settings.value.ghToken) {
    router.push('/')
  }
})
</script>

<style scoped></style>
