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
    border: 2px solid #e5e5e5;
    border-radius: 12px;
    background: white;
    font-size: 1rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}

@media (hover: hover) {
    button:hover {
        border-color: #afeb55;
    }
}

.selected{
    border-color: #f59e0b;
    background: #fffbeb;
    font-weight: 600;

}
</style>
