<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <path d="M12 5V19" :stroke="color" stroke-width="1.9" stroke-linecap="round" />
    <path d="M5 12H19" :stroke="color" stroke-width="1.9" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 14,
  },
  color: {
    type: String,
    default: "currentColor",
  },
});
</script>
