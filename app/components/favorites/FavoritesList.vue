<script setup lang="ts">
import type { Favorite } from "~/composables/useFavorites";

defineProps<{
  favorites: Favorite[];
  // The allergens the user wants to avoid, passed on to each card.
  avoid?: string[];
}>();

const { t } = useLang();

const emit = defineEmits<{
  delete: [id: string];
}>();
</script>

<template>
  <div v-if="favorites.length" class="list">
    <UiFoldout
      v-for="favorite in favorites"
      :key="favorite.id"
      :title="favorite.name"
    >
      <RecipeCard
        :recipe="favorite"
        :avoid="avoid"
        saved
        @toggle="emit('delete', favorite.id)"
      />
    </UiFoldout>
  </div>
  <p v-else class="muted">{{ t("favorites.empty") }}</p>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
