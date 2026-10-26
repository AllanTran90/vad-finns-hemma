<script setup lang="ts">
import { CUISINES, SURPRISE, pickRandomCuisine } from "#shared/cuisines";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { t } = useLang();
const ingredientName = ref("");
const selectedCuisine = ref("");
const logoutError = ref("");

const {
  ingredients,
  errorMessage: pantryError,
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

const {
  favorites,
  errorMessage: favoritesError,
  loadFavorites,
  findFavorite,
  saveFavorite,
  deleteFavorite,
} = useFavorites();

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

// The heart on the recipe card: remove the recipe if it is saved, otherwise save it.
async function toggleFavorite() {
  if (!recipe.value) {
    return;
  }

  const saved = findFavorite(recipe.value);

  if (saved) {
    await deleteFavorite(saved.id);
  } else {
    await saveFavorite(recipe.value);
  }
}

async function signOut() {
  logoutError.value = "";

  // A guest has no email or password to log in with again, so logging out
  // means the data is lost. Ask first.
  if (user.value?.is_anonymous && !window.confirm(t("guest.logoutConfirm"))) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Logout error:", error);
    logoutError.value = t("auth.logOutError");
    return;
  }

  await navigateTo("/login");
}

async function handleAdd() {
  await addIngredient(ingredientName.value);

  if (!pantryError.value) {
    ingredientName.value = "";
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
    <header class="header">
      <h1>Vad finns hemma?</h1>
      <p class="muted">{{ t("app.tagline") }}</p>
    </header>

    <GuestBanner v-if="user?.is_anonymous" />

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
      <p v-if="pantryError" role="alert">{{ pantryError }}</p>
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
    <RecipeCard
      v-if="recipe"
      :recipe="recipe"
      :avoid="allergens"
      :saved="!!findFavorite(recipe)"
      @toggle="toggleFavorite"
    />
    <p v-if="favoritesError" role="alert">{{ favoritesError }}</p>

    <section class="section">
      <h2>{{ t("favorites.title") }}</h2>
      <FavoritesList
        :favorites="favorites"
        :avoid="allergens"
        @delete="deleteFavorite"
      />
    </section>

    <button class="btn-link logout" type="button" @click="signOut">
      {{ t("auth.logOut") }}
    </button>
    <p v-if="logoutError" role="alert">{{ logoutError }}</p>
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