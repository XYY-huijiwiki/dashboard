<template>
  <div class="h-full w-full flex items-center justify-center">
    <n-empty :description="t('general.error')">
      <template #icon>
        <icon icon="fluent:error-circle-48-regular" width="40px" />
      </template>
    </n-empty>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
