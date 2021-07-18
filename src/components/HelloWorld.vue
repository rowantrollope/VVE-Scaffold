<template>
    <div class="text-center text-2xl m-10 space-y-3">
        <div class="">{{ msg }}</div>
        <div>count is: {{ count }}</div>
        <button class="btn" type="button" @click="count++">BUMP the count</button>
    </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

const props = defineProps({
    msg: String,
});

const count = ref(0)

</script>

<style scoped>
    .btn {
        @apply 
        rounded-md 
        bg-blue-500 
        text-white 
        p-2 
        text-lg 
        shadow-sm
        hover:bg-blue-400;
    }
</style>
