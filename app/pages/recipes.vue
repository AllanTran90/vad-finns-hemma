<script setup lang="ts">
import { SURPRISE, pickRandomCuisine } from "#shared/cuisines";

const { t } = useLang();

const { ingredients, errorMessage: pantryError, loadIngredients } = usePantry();

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
  selectedStyle,
  loading,
  errorMessage: recipeError,
  getRecipe,
} = useRecipe();

const {
  errorMessage: favoritesError,
  loadFavorites,
  findFavorite,
  toggleFavorite,
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
    selectedStyle.value,
  );
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
          <CuisinePicker
            :selected="selectedCuisine"
            @change="selectedCuisine = $event"
          />
        </section>

        <section class="section">
          <StylePicker
            :selected="selectedStyle"
            @change="selectedStyle = $event"
          />
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
          @toggle="toggleFavorite(recipe)"
        />
        <p v-if="favoritesError" role="alert">{{ favoritesError }}</p>
      </div>
    </div>
  </main>
</template>
