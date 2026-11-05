<script setup lang="ts">
import { CUISINES, SURPRISE, pickRandomCuisine } from "#shared/cuisines";

const { t } = useLang();

const {
  ingredients,
  errorMessage: pantryError,
  loadIngredients,
} = usePantry();

const {
  allergens,
  diet,
  errorMessage: prefsError,
  loadPreferences,
  saveAllergens,
  saveDiet,
} = usePreferences();

const {
  recipe,
  selectedCuisine,
  loading,
  errorMessage: recipeError,
  getRecipe,
} = useRecipe();

const {
  errorMessage: favoritesError,
  loadFavorites,
  findFavorite,
  saveFavorite,
  deleteFavorite,
} = useFavorites();

const canGetRecipe = computed(
  () => selectedCuisine.value && ingredients.value.length > 0 && !loading.value,
);

// Tells the user why the recipe button is disabled.
const recipeHint = computed(() => {
  if (ingredients.value.length === 0) {
    return t("recipe.needIngredients");
  }
  if (!selectedCuisine.value) {
    return t("recipe.needCuisine");
  }
  return "";
});

async function handleGetRecipe() {
  if (!selectedCuisine.value) {
    return;
  }
  // "Surprise me" is not a real cuisine, so we pick one of the real ones.
  const cuisine =
    selectedCuisine.value === SURPRISE
      ? pickRandomCuisine()
      : selectedCuisine.value;

  await getRecipe(
    cuisine,
    ingredients.value.map((ingredient) => ingredient.name),
    allergens.value,
    diet.value,
  );
}

// The save button on the recipe card: remove the recipe if it is saved, otherwise save it.
// While a save or remove is running, more taps are ignored. Otherwise a double tap
// would save the recipe twice, because the list is only updated when the first save is done.
const savingFavorite = ref(false);

async function toggleFavorite() {
  if (!recipe.value || savingFavorite.value) {
    return;
  }

  savingFavorite.value = true;
  try {
    const saved = findFavorite(recipe.value);

    if (saved) {
      await deleteFavorite(saved.id);
    } else {
      await saveFavorite(recipe.value);
    }
  } finally {
    savingFavorite.value = false;
  }
}

onMounted(() => {
  loadIngredients();
  loadPreferences();
  loadFavorites();
});

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main class="page">
    <div class="layout">
      <div class="column">
        <section class="section">
          <h2>{{ t("cuisine.title") }}</h2>
          <div class="cuisine-grid">
            <CuisineCard
              v-for="cuisine in CUISINES"
              :key="cuisine"
              :name="cuisine"
              :selected="cuisine === selectedCuisine"
              @select="selectedCuisine = $event"
            />
            <CuisineCard
              class="surprise"
              :name="SURPRISE"
              :selected="selectedCuisine === SURPRISE"
              @select="selectedCuisine = $event"
            />
          </div>
        </section>

        <section class="section">
          <DietPicker :selected="diet" @change="saveDiet" />
          <AllergyPicker :selected="allergens" @change="saveAllergens" />
          <p v-if="prefsError" role="alert">{{ prefsError }}</p>
        </section>

        <button
          class="btn"
          type="button"
          :disabled="!canGetRecipe"
          @click="handleGetRecipe"
        >
          {{ loading ? t("recipe.getting") : t("recipe.get") }}
        </button>
        <p v-if="recipeHint" class="muted">{{ recipeHint }}</p>
        <p v-if="pantryError" role="alert">{{ pantryError }}</p>
        <p v-if="recipeError" role="alert">{{ recipeError }}</p>
      </div>

      <div class="column">
        <RecipeCard
          v-if="recipe"
          :recipe="recipe"
          :avoid="allergens"
          :saved="!!findFavorite(recipe)"
          @toggle="toggleFavorite"
        />
        <p v-if="favoritesError" role="alert">{{ favoritesError }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.cuisine-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 40rem) {
  .cuisine-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.surprise {
  grid-column: 1 / -1;
}
</style>
