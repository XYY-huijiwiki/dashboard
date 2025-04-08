<template>
  <n-flex vertical>
    <n-h1>{{ t('init.welcome-title') }}</n-h1>
    <n-empty :description="t(`init.msg-login-desc`)">
      <template #icon>
        <github />
      </template>
      <template #extra>
        <n-button :loading="loading" @click="login">{{
          t('init.btn-login')
        }}</n-button>
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

import { is, errNotify } from '@renderer/utils'
import { useSettingsStore } from '@renderer/stores/settings'

const { t } = useI18n()

const router = useRouter()

const { settings } = storeToRefs(useSettingsStore())

const loading = ref(false)

async function login(): Promise<void> {
  // #region web login
  if (is.web) {
    const serverlessURL = 'https://dashboard-login.24218079.xyz/'
    const url = new URL(serverlessURL + 'login')
    url.searchParams.set('redirect_uri', location.href)
    url.searchParams.set('scope', 'public_repo')
    location.href = url.href
  }
  // #endregion

  // #region electron login
  else {
    loading.value = true

    try {
      const token = await window.api.ghLogin()
      if (!token) throw new Error('No token')
      settings.value.ghToken = token

      window.$message.success(t('init.msg-login-success'))
      router.push({ name: 'file-explorer' })
    } catch (e) {
      errNotify(t('init.msg-login-failed'), e as Error)
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  // #region web onMounted
  if (is.web) {
    try {
      // check if `access_token` is returned from GitHub
      const accessToken = new URLSearchParams(location.search).get(
        'access_token',
      )
      if (accessToken) {
        settings.value.ghToken = accessToken
        location.href = (() => {
          const url = new URL(location.href)
          url.searchParams.delete('access_token')
          return url.href
        })()
      }

      // check if user is already logged in
      if (settings.value.ghToken) {
        const res = await (
          await fetch('https://api.github.com/repos/XYY-huijiwiki/files', {
            headers: {
              Authorization: `bearer ${settings.value.ghToken}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          })
        ).json()
        console.log(res)
        // bad credentials
        if (res.status === '401') {
          settings.value.ghToken = ''
        }
        // success
        else if (res.permissions?.admin) {
          loading.value = false
          router.push({ name: 'file-explorer' })
          return
        }
        // permission denied
        else {
          settings.value.ghToken = ''
          window.$dialog.warning({
            autoFocus: false,
            title: t('init.permission-denied-title'),
            content: t('init.permission-denied-content', settings.value.ghRepo),
          })
        }

        loading.value = false
        return
      }

      // not logged in
      loading.value = false
    } catch (error) {
      errNotify(t('init.msg-login-failed'), error as Error)
    }
  }
  // #endregion

  // #region electron onMounted
  else {
    if (settings.value.ghToken) {
      router.push({ name: 'file-explorer' })
    }
  }
  // #endregion
})
</script>

<style scoped></style>
