<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <rect x="9" y="7" width="10" height="12" rx="1.8" :stroke="color" stroke-width="1.6" />
    <path d="M6 15V5.8C6 4.8 6.8 4 7.8 4H15" :stroke="color" stroke-width="1.6" stroke-linecap="round" />
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
