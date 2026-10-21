<script setup lang="ts">
import { CUISINES, SURPRISE } from "#shared/cuisines";

const supabase = useSupabaseClient();
const ingredientName = ref("");
const selectedCuisine = ref("");

const {
  ingredients,
  errorMessage,
  loadIngredients,
  deleteIngredient,
  addIngredient,
} = usePantry();

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
  await getRecipe(
    selectedCuisine.value,
    ingredients.value.map((ingredient) => ingredient.name),
  );
}

async function signOut() {
  errorMessage.value = "";
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Logout error:", error);
    errorMessage.value = "Could not log out. Please try again.";
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

onMounted(loadIngredients);

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main class="page">
    <header class="header">
      <h1>Vad finns hemma?</h1>
      <p class="muted">Add what you have, then pick a cuisine.</p>
    </header>

    <section class="section">
      <h2>Your ingredients</h2>
      <form class="add-form" @submit.prevent="handleAdd">
        <input
          v-model="ingredientName"
          type="text"
          placeholder="Ingredient"
          required
        />
        <button class="btn" type="submit">Add</button>
      </form>
      <PantryList :ingredients="ingredients" @delete="deleteIngredient" />
    </section>

    <section class="section">
      <h2>Pick a cuisine</h2>
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

    <button
      class="btn"
      type="button"
      :disabled="!canGetRecipe"
      @click="handleGetRecipe"
    >
      {{ loading ? "Getting recipe..." : "Get recipe" }}
    </button>
    <p v-if="recipeError" role="alert">{{ recipeError }}</p>
    <RecipeCard v-if="recipe" :recipe="recipe" />

    <button class="btn-link logout" type="button" @click="signOut">
      Log out
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