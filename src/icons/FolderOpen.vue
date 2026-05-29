<template>
    <svg class="icon" :width="size" :height="size" :fill="color" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
        <g>
            <rect height="24" opacity="0" width="24" x="0" y="0" />
            <path
                d="M2 6a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v1H4v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
                :fill="color" fill-opacity="0.85" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" fill="none" />
            <path
                d="M22 13h-5l-1.5 2h-3L11 13H2"
                :fill="color" fill-opacity="0.85" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
        </g>
    </svg>
</template>


<script setup>
defineProps({
    size: {
        type: [Number, String],
        default: 24
    },
    color: {
        type: String,
        default: 'currentColor'
    }
})
</script>
