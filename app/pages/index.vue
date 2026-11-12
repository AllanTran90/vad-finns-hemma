<script setup lang="ts">
import { MAX_INGREDIENTS } from "#shared/limits";

const user = useSupabaseUser();
const { t } = useLang();
const ingredientName = ref("");

const {
  ingredients,
  errorMessage: pantryError,
  loadIngredients,
  deleteIngredient,
  deleteIngredients,
  addIngredient,
  addIngredients,
  translating,
  translateIngredients,
} = usePantry();

async function handleAdd() {
  await addIngredient(ingredientName.value);

  if (!pantryError.value) {
    ingredientName.value = "";
  }
}

onMounted(() => {
  loadIngredients();
});

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main class="page">
    <header class="header">
      <h1>Vad finns hemma?</h1>
      <p class="muted">{{ t("app.tagline") }}</p>
    </header>

    <GuestBanner v-if="user?.is_anonymous" />

    <div class="layout">
      <section class="section">
        <!-- The count shows how much room is left before the pantry is full. -->
        <h2 class="pantry-title">
          {{ t("pantry.title") }}
          <span class="count muted">
            {{
              t("pantry.count", {
                count: ingredients.length,
                max: MAX_INGREDIENTS,
              })
            }}
          </span>
        </h2>
        <PantryAddForm v-model="ingredientName" @add="handleAdd" />
        <p v-if="pantryError" role="alert">{{ pantryError }}</p>
        <PantryList
          :ingredients="ingredients"
          @delete="deleteIngredient"
          @delete-many="deleteIngredients"
        />
        <!-- The label is in the app's language, so it says which language the
             names will be translated to. One AI call, so it counts towards the
             daily limit, and only runs when the user asks for it. -->
        <button
          v-if="ingredients.length > 0"
          class="btn-link translate"
          type="button"
          :disabled="translating"
          @click="translateIngredients"
        >
          <Icon name="lucide:languages" size="1.25rem" />
          {{ translating ? t("pantry.translating") : t("pantry.translate") }}
        </button>
      </section>

      <section class="section">
        <h2>{{ t("scan.title") }}</h2>
        <ScanPhoto
          :existing="ingredients.map((ingredient) => ingredient.name)"
          @confirm="addIngredients"
        />
      </section>
    </div>

    <UiLogoutButton />
  </main>
</template>

<style scoped>
.pantry-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.count {
  font-size: 0.875rem;
  font-weight: normal;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.header p {
  margin: 0;
}

.translate {
  gap: 0.375rem;
  align-self: flex-start;
}

.translate:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
