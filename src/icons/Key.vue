<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <circle cx="8" cy="12" r="3.2" :stroke="color" stroke-width="1.7" />
    <path d="M11.2 12H20" :stroke="color" stroke-width="1.7" stroke-linecap="round" />
    <path d="M16.4 12V9.9" :stroke="color" stroke-width="1.7" stroke-linecap="round" />
    <path d="M18.8 12V10.7" :stroke="color" stroke-width="1.7" stroke-linecap="round" />
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
