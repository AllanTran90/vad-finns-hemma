import type { Recipe } from "#shared/schemas/recipe";

export function useRecipe() {
  const recipe = ref<Recipe | null>(null);
  const loading = ref(false);
  const errorMessage = ref("");

  async function getRecipe(cuisine: string, ingredients: string[]) {
    errorMessage.value = "";
    recipe.value = null;
    loading.value = true;

    try {
      recipe.value = await $fetch<Recipe>("/api/suggest", {
        method: "POST",
        body: { cuisine, ingredients },
      });
    } catch (error) {
      console.log("Get recipe error:", error);
      errorMessage.value = "Could not get a recipe. Please try again.";
    } finally {
      loading.value = false;
    }
  }

  return { recipe, loading, errorMessage, getRecipe };
}
