<template>
  <div
    :class="[
      'mt-[6px]',
      'transition-all',
      props.collapsed ? 'ml-[8px]' : 'ml-[18px]',
      props.collapsed ? 'mr-[8px]' : 'mr-[18px]',
    ]"
  >
    <n-tooltip trigger="hover" placement="right">
      <template #trigger>
        <n-button
          class="!h-[42px]"
          quaternary
          @mousedown="handleStart"
          @mouseup="handleEnd"
          @mouseleave="handleEnd"
          @touchstart.passive="handleStart"
          @touchend.passive="handleEnd"
          @click="emits('click')"
        >
          <template #icon>
            <icon
              icon="fluent:navigation-20-regular"
              width="20px"
              :class="{ shrink: isPressed, shrinkable: true }"
            />
          </template>
        </n-button>
      </template>
      <template #default>
        {{
          collapsed
            ? t("general.btn-open-navigation")
            : t("general.btn-close-navigation")
        }}
      </template>
    </n-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emits = defineEmits(["click"]);
const props = defineProps<{
  collapsed: boolean;
}>();
const isPressed = ref(false);
const pressStartTime = ref(0);
let animationTimeout: NodeJS.Timeout | null = null;

function handleStart(event: MouseEvent | TouchEvent) {
  if (event.cancelable) event.preventDefault();
  pressStartTime.value = Date.now();
  isPressed.value = true;

  // Clear any existing timeout
  if (animationTimeout) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
}

function handleEnd(event: MouseEvent | TouchEvent) {
  if (event.cancelable) event.preventDefault();
  const elapsed = Date.now() - pressStartTime.value;

  if (elapsed < 300) {
    const remaining = 300 - elapsed;
    animationTimeout = setTimeout(() => {
      isPressed.value = false;
    }, remaining);
  } else {
    isPressed.value = false;
  }
}
</script>

<style scoped>
.shrinkable {
  display: inline-flex;
  transition: transform 0.3s ease;
  transform-origin: center;
}

.shrink {
  transform: scale(0.5, 1);
}
</style>
