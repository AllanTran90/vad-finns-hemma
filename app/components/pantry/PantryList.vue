<script setup lang="ts">
defineProps<{
  ingredients: { id: string; name: string }[];
}>();
const emit = defineEmits<{
  delete: [id: string];
}>();
</script>
<template>
  <ul>
    <li v-for="ingredient in ingredients" :key="ingredient.id">
      {{ ingredient.name }}
      <button type="button" @click="emit('delete', ingredient.id)">
        Delete
      </button>
    </li>
  </ul>
</template>
