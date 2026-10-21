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
    <button type="button" 
    :class="{ selected: selected}"
    @click="emit('select', name)"
    >
        {{ name }}
    </button>
    
</template>

<style scoped>
button {
    padding: 1rem;
    border: 2px solid var(--color-line);
    border-radius: 14px;
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}

@media (hover: hover) {
    button:hover {
        border-color: var(--color-primary);
    }
}

.selected{
    border-color: var(--color-select-border);
    background: var(--color-select-bg);
    font-weight: 600;
}
</style>
