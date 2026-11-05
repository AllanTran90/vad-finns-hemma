<script setup lang="ts">
const { t } = useLang();

const { favorites, errorMessage, loadFavorites, deleteFavorite } =
  useFavorites();

// The allergens are needed for the warnings on each saved recipe.
const {
  allergens,
  errorMessage: prefsError,
  loadPreferences,
} = usePreferences();

onMounted(() => {
  loadFavorites();
  loadPreferences();
});

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main class="page">
    <section class="section">
      <h2>{{ t("favorites.title") }}</h2>
      <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
      <p v-if="prefsError" role="alert">{{ prefsError }}</p>
      <FavoritesList
        :favorites="favorites"
        :avoid="allergens"
        @delete="deleteFavorite"
      />
    </section>
  </main>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
