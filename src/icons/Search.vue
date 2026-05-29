<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.75" :stroke="color" stroke-width="1.8" />
    <path d="M16.2 16.2L20 20" :stroke="color" stroke-width="1.8" stroke-linecap="round" />
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
