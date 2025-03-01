<template>
  <n-empty :description="t('general.error')">
    <template #icon>
      <n-icon size="40">
        <error-circle24-regular />
      </n-icon>
    </template>
  </n-empty>
</template>

<script setup lang="ts">
import { ErrorCircle24Regular } from '@vicons/fluent'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
