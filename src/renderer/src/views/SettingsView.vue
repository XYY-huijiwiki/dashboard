<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { dayjsLocales } from "@renderer/stores/locales";
import { useSettingsStore } from "@renderer/stores/settings";
import {
  useLocalesStore,
  supportedLangs,
  userLang,
} from "@renderer/stores/locales";
import { is } from "@renderer/utils";

dayjs.extend(localizedFormat).locale(dayjsLocales.value);

const { langCode } = storeToRefs(useLocalesStore());

const { settings } = storeToRefs(useSettingsStore());

const { resetSettings } = useSettingsStore();

const { t } = useI18n();

const homepage = __APP_HOMEPAGE__;
const website = __APP_URL__;
const version = __APP_VERSION__;
const lastCommitDate = dayjs(__APP_BUILD_DATE__).format("ll");

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
          <n-flex>
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
          </n-flex>
        </n-radio-group>
      </n-form-item>
      <!-- theme mode -->
      <n-form-item>
        <template #label>
          {{ t("settings.label-theme-mode") }}
        </template>
        <n-radio-group v-model:value="settings.themeSource" name="themeMode">
          <n-flex>
            <n-radio key="system" value="system">
              {{ t("settings.text-theme-system") }}
            </n-radio>
            <n-radio key="light" value="light">
              {{ t("settings.text-theme-light") }}
            </n-radio>
            <n-radio key="dark" value="dark">
              {{ t("settings.text-theme-dark") }}
            </n-radio>
          </n-flex>
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
          <n-flex>
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
          </n-flex>
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
      <!-- about -->
      <n-form-item :label="t('settings.label-about')">
        <n-flex :align="'center'">
          <n-a :href="homepage" target="_blank">
            {{ t("settings.label-github") }}
          </n-a>
          <n-divider v-if="!is.web" vertical />
          <n-a v-if="!is.web" :href="website" target="_blank">
            {{ t("settings.label-website") }}
          </n-a>
          <n-divider vertical />
          <n-text>{{ `${t("settings.label-version")} ${version}` }}</n-text>
          <n-divider vertical />
          <n-text>
            {{ `${t("settings.label-release-date")} ${lastCommitDate}` }}
          </n-text>
        </n-flex>
      </n-form-item>
    </n-form>
  </n-scrollbar>
</template>
