<template>
  <n-tooltip :show="disabled ? false : undefined">
    <template #default>
      {{ text }}
    </template>
    <template #trigger>
      <n-button quaternary :disabled="disabled" @click="emit('click')">
        <template #icon>
          <n-icon :size="24">
            <slot></slot>
          </n-icon>
        </template>
      </n-button>
    </template>
  </n-tooltip>
</template>

<script setup lang="ts">
import { NTooltip, NButton } from 'naive-ui'
defineProps<{
  text: string
  disabled?: boolean
}>()
const emit = defineEmits(['click'])
</script>

<style scoped></style>
