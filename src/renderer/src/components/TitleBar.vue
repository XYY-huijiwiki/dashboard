<template>
  <div
    class="title-bar flex items-center h-[30px] mr-[138px]"
    style="app-region: drag"
  >
    <div
      class="app-icon inline-block w-[30px] h-[30px] bg-no-repeat bg-center"
      :style="{ backgroundImage: `url(${iconImg})`, backgroundSize: '1rem' }"
    ></div>
    <div>
      <n-text class="align-middle">{{ props.title }}</n-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import iconImg from "@renderer/assets/icon.png?url";

const props = defineProps<{ title: string }>();
</script>

<style scoped></style>
