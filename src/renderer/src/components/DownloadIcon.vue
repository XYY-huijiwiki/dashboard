<template>
  <div v-if="downloading" class="relative size-6">
    <div class="absolute inset-0 flex justify-center items-center">
      <icon icon="fluent:arrow-download-16-regular" width="16" />
    </div>
    <div class="absolute inset-0 flex justify-center items-center">
      <icon
        icon="fluent:circle-hint-24-regular"
        class="animate-spin"
        width="24"
      />
    </div>
  </div>
  <icon v-else icon="fluent:arrow-download-24-regular" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{ downloading: boolean }>()
</script>

<style scoped>
/* slower thedefault .animate-spin */
.animate-spin {
  animation-duration: 5s;
}
</style>
