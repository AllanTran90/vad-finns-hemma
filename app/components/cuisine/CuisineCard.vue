<script setup lang="ts">
defineProps<{
    name: string;
    selected: boolean;
}>();

const emit = defineEmits<{
    select: [name: string];
}>();
</script>

<template>
    <button type="button" @click="emit('select', name)">
        {{ name }}
    </button>
    
</template>
