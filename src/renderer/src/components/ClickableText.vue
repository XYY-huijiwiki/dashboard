<template>
  <div class="flex items-center" :class="{ 'justify-center': center }">
    <p
      class="cursor-pointer truncate inline-block max-w-full hover:underline"
      :title="text"
      @click="emit('click', $event)"
    >
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['click'])
const { text, center } = defineProps({
  text: {
    type: String,
    required: true,
  },
  center: {
    type: Boolean,
    default: false,
  },
})
</script>
