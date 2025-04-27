<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";

import { useSettingsStore } from "@renderer/stores/settings";
import {
  useLocalesStore,
  supportedLangs,
  userLang,
} from "@renderer/stores/locales";
import { is } from "@renderer/utils";

const { langCode } = storeToRefs(useLocalesStore());

const { settings } = storeToRefs(useSettingsStore());

const { resetSettings } = useSettingsStore();

const { t } = useI18n();

function clearData(): void {
  window.$dialog.warning({
    title: t("general.warning"),
    content: t("settings.text-confirm-restore"),
    positiveText: t("general.btn-confirm"),
    negativeText: t("general.btn-cancel"),
    autoFocus: false,
    onPositiveClick: () => {
      resetSettings();
      window.$message.success(t("settings.text-restore-done"));
    },
  });
}

function toggleDevtools(): void {
  window.api.toggleDevTools();
}
</script>

<template>
  <n-scrollbar>
    <n-form>
      <!-- language -->
      <n-form-item>
        <template #label>
          {{ t("settings.label-language") }}
        </template>
        <n-radio-group v-model:value="settings.language" name="radiogroup">
          <n-space>
            <n-radio key="auto" value="auto">
              {{
                t("settings.text-auto-language", [
                  new Intl.DisplayNames([langCode], { type: "language" }).of(
                    userLang,
                  ),
                ])
              }}
            </n-radio>
            <n-radio v-for="lang in supportedLangs" :key="lang" :value="lang">
              {{ new Intl.DisplayNames([lang], { type: "language" }).of(lang) }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <!-- theme mode -->
      <n-form-item>
        <template #label>
          {{ t("settings.label-theme-mode") }}
        </template>
        <n-radio-group v-model:value="settings.themeSource" name="themeMode">
          <n-space>
            <n-radio key="system" value="system">
              {{ t("settings.text-theme-system") }}
            </n-radio>
            <n-radio key="light" value="light">
              {{ t("settings.text-theme-light") }}
            </n-radio>
            <n-radio key="dark" value="dark">
              {{ t("settings.text-theme-dark") }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <!-- background material -->
      <n-form-item v-if="is.win">
        <template #label>
          {{ t("settings.label-background-material") }}
        </template>
        <n-radio-group
          v-model:value="settings.backgroundMaterial"
          name="backgroundMaterial"
        >
          <n-space>
            <n-radio key="auto" value="auto">
              {{ t("settings.text-material-auto") }}
            </n-radio>
            <n-radio key="none" value="none">
              {{ t("settings.text-material-none") }}
            </n-radio>
            <n-radio key="mica" value="mica">
              {{ t("settings.text-material-mica") }}
            </n-radio>
            <n-radio key="acrylic" value="acrylic">
              {{ t("settings.text-material-acrylic") }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <!-- github token -->
      <n-form-item>
        <template #label>
          {{ t("settings.label-github-token") }}
        </template>
        <n-input v-model:value="settings.ghToken" disabled />
      </n-form-item>
      <!-- restore defaults -->
      <n-form-item :label="t('settings.label-restore-defaults')">
        <n-button @click="clearData()">
          {{ t("settings.btn-restore") }}
        </n-button>
      </n-form-item>
      <!-- toggle devtools -->
      <n-form-item v-if="!is.web" :label="t('settings.label-toggle-devtools')">
        <n-button @click="toggleDevtools()">
          {{ t("settings.btn-toggle") }}
        </n-button>
      </n-form-item>
      <!-- source code -->
      <n-form-item :label="t('settings.label-source-code')">
        <n-space>
          <n-button
            tag="a"
            href="//github.com/XYY-huijiwiki/dashboard"
            target="_blank"
          >
            {{ t("settings.btn-github") }}
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-scrollbar>
</template>
