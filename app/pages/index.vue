<script setup lang="ts">
const supabase = useSupabaseClient();
const errorMessage = ref("");
const user = useSupabaseUser();
const ingredientName = ref("");
const ingredients = ref<{ id: string; name: string }[]>([]);
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

async function loadIngredients() {
  const { data, error } = await supabase
    .from("pantry")
    .select("id, name")
    .order("created_at");

  if (error) {
    console.log("Load ingredients error;", error);
    errorMessage.value = "Could not load ingredients. Please try again.";
    return;
  }
  ingredients.value = data;
}

async function addIngredient() {
  errorMessage.value = "";

  const { error } = await supabase.from("pantry").insert({
    name: ingredientName.value,
    user_id: user.value?.sub,
  });

  if (error) {
    console.log("Add ingredient error:", error);
    errorMessage.value = "Could not add ingredient. Please try again.";
    return;
  }

  ingredientName.value = "";
  await loadIngredients();
}

onMounted(loadIngredients);

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main>
    <h1>Vad finns hemma?</h1>
    <form @submit.prevent="addIngredient">
      <input
        v-model="ingredientName"
        type="text"
        placeholder="Ingredient"
        required
      />
      <button type="submit">Add</button>
    </form>
    <ul>
      <li v-for="ingredient in ingredients" :key="ingredient.id">
        {{ ingredient.name }}
      </li>
    </ul>

    <button type="button" @click="signOut">Log out</button>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
  </main>
</template>
