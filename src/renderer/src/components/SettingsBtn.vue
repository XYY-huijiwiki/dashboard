<template>
  <n-menu
    :value="$route.name?.toString()"
    :options="options"
    :collapsed="props.collapsed"
    :collapsed-width="62"
    :collapsed-icon-size="20"
    class="pb-2 -mt-1"
    :class="[!is.web && 'mb-1']"
  ></n-menu>
</template>

<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { Ref } from "vue";
import type { MenuOption } from "naive-ui";
import { RouterLink } from "vue-router";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { is } from "@renderer/utils";

const { t } = useI18n();
const emits = defineEmits(["click"]);
const props = defineProps<{
  collapsed: boolean;
}>();
const isPressed = ref(false);
const pressStartTime = ref(0);
let animationTimeout: NodeJS.Timeout | null = null;
const options: Ref<MenuOption[]> = computed(() => [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: { name: "settings" },
          onMousedown: (e: MouseEvent) => handleStart(e),
          onMouseup: (e: MouseEvent) => handleEnd(e),
          onMouseleave: (e: MouseEvent) => handleEnd(e),
          onTouchstartPassive: (e: TouchEvent) => handleStart(e),
          onTouchendPassive: (e: TouchEvent) => handleEnd(e),
        },
        { default: () => t("settings.title") },
      ),
    key: "settings",
    icon: () =>
      h(Icon, {
        icon: `fluent:settings-20-regular`,
        class: {
          shrink: isPressed.value,
          shrinkable: true,
        },
      }),
  },
]);

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
::v-deep(.shrinkable) {
  display: inline-flex;
  transition: transform 0.3s ease;
  transform-origin: center;
  transform: rotate(-15deg);
}

::v-deep(.shrink) {
  transform: rotate(90deg);
}
</style>
