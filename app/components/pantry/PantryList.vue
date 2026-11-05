<script setup lang="ts">
defineProps<{
  ingredients: { id: string; name: string }[];
}>();
const { t } = useLang();

const emit = defineEmits<{
  delete: [id: string];
}>();
</script>
<template>
  <ul v-if="ingredients.length" class="list">
    <li v-for="ingredient in ingredients" :key="ingredient.id">
      <span>{{ ingredient.name }}</span>
      <button
        class="btn-link btn-remove"
        type="button"
        @click="emit('delete', ingredient.id)"
      >
        {{ t("pantry.delete") }}
      </button>
    </li>
  </ul>
  <p v-else class="muted">{{ t("pantry.empty") }}</p>
</template>

<style scoped>
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-surface);
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem 0.25rem 1rem;
}

li + li {
  border-top: 1px solid var(--color-line);
}
</style>
