<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@renderer/stores/settings'
import { storeToRefs } from 'pinia'
import { useLocalesStore, supportedLangs, userLang } from '@renderer/stores/locales'

const { langCode } = storeToRefs(useLocalesStore())

const { settings } = storeToRefs(useSettingsStore())

const { resetSettings } = useSettingsStore()

const { t } = useI18n()

function clearData(): void {
  window.$dialog.warning({
    title: t('general.warning'),
    content: t('settings.text-confirm-restore'),
    positiveText: t('general.btn-confirm'),
    negativeText: t('general.btn-cancel'),
    autoFocus: false,
    onPositiveClick: () => {
      resetSettings()
      window.$message.success(t('settings.text-restore-done'))
    }
  })
}
</script>

<template>
  <n-form>
    <!-- language -->
    <n-form-item>
      <template #label>
        {{ t('settings.label-language') }}
      </template>
      <n-radio-group v-model:value="settings.language" name="radiogroup">
        <n-space>
          <n-radio key="auto" value="auto">
            {{
              t('settings.text-auto-language', [
                new Intl.DisplayNames([langCode], { type: 'language' }).of(userLang)
              ])
            }}
          </n-radio>
          <n-radio v-for="lang in supportedLangs" :key="lang" :value="lang">
            {{ new Intl.DisplayNames([lang], { type: 'language' }).of(lang) }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>
    <!-- github token -->
    <n-form-item>
      <template #label>
        {{ t('settings.label-github-token') }}
      </template>
      <n-input v-model:value="settings.ghToken" disabled />
    </n-form-item>
    <!-- restore defaults -->
    <n-form-item :label="t('settings.label-restore-defaults')">
      <n-button @click="clearData()">
        {{ t('settings.btn-restore') }}
      </n-button>
    </n-form-item>
    <!-- source code -->
    <n-form-item :label="t('settings.label-source-code')">
      <n-space>
        <n-button tag="a" href="//github.com/XYY-huijiwiki/gh-drive" target="_blank">
          {{ t('settings.btn-github') }}
        </n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>
