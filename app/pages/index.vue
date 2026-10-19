<script setup lang="ts">
import { CUISINES } from "#shared/cuisines";

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
  <main>
    <h1>Vad finns hemma?</h1>
    <form @submit.prevent="handleAdd">
      <input
        v-model="ingredientName"
        type="text"
        placeholder="Ingredient"
        required
      />
      <button type="submit">Add</button>
    </form>

    <PantryList :ingredients="ingredients" @delete="deleteIngredient" />

    <div class="cuisine-grid">
    <CuisineCard
      v-for="cuisine in CUISINES"
      :key="cuisine"
      :name="cuisine"
      :selected="cuisine === selectedCuisine"
      @select="selectedCuisine = $event"
    />
    </div>

    <button type="button" @click="signOut">Log out</button>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
  </main>
</template>

<style scoped>
.cuisine-grid{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
</style>