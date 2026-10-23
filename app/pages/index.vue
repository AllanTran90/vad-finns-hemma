<script setup lang="ts">
import { CUISINES, SURPRISE, pickRandomCuisine } from "#shared/cuisines";

const supabase = useSupabaseClient();
const { t } = useLang();
const ingredientName = ref("");
const selectedCuisine = ref("");

const {
  ingredients,
  errorMessage,
  loadIngredients,
  deleteIngredient,
  addIngredient,
  addIngredients,
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
  loading,
  errorMessage: recipeError,
  getRecipe,
} = useRecipe();

const canGetRecipe = computed(
  () => selectedCuisine.value && ingredients.value.length > 0 && !loading.value,
);

async function handleGetRecipe() {
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

async function signOut() {
  errorMessage.value = "";
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Logout error:", error);
    errorMessage.value = t("auth.logOutError");
    return;
  }

  await navigateTo("/login");
}

async function handleAdd() {
  await addIngredient(ingredientName.value);

  if (!errorMessage.value) {
    ingredientName.value = "";
  }
}

onMounted(() => {
  loadIngredients();
  loadPreferences();
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

    <section class="section">
      <h2>{{ t("pantry.title") }}</h2>
      <form class="add-form" @submit.prevent="handleAdd">
        <input
          v-model="ingredientName"
          type="text"
          :placeholder="t('pantry.placeholder')"
          required
        />
        <button class="btn" type="submit">{{ t("pantry.add") }}</button>
      </form>
      <PantryList :ingredients="ingredients" @delete="deleteIngredient" />
    </section>

    <section class="section">
      <h2>{{ t("scan.title") }}</h2>
      <ScanPhoto
        :existing="ingredients.map((ingredient) => ingredient.name)"
        @confirm="addIngredients"
      />
    </section>

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
    <p v-if="recipeError" role="alert">{{ recipeError }}</p>
    <RecipeCard v-if="recipe" :recipe="recipe" :avoid="allergens" />

    <button class="btn-link logout" type="button" @click="signOut">
      {{ t("auth.logOut") }}
    </button>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
  </main>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.header p {
  margin: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.add-form {
  display: flex;
  gap: 0.625rem;
}

.add-form input {
  flex: 1;
  min-width: 0;
}

.cuisine-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.surprise {
  grid-column: 1 / -1;
}

.logout {
  align-self: center;
  color: var(--color-muted);
}
</style>