import type { Recipe } from "#shared/schemas/recipe";

export function useRecipe() {
  const { lang, t } = useLang();
  const recipe = ref<Recipe | null>(null);
  const loading = ref(false);
  const errorMessage = ref("");

  async function getRecipe(
    cuisine: string,
    ingredients: string[],
    avoid: string[],
    diet: string,
  ) {
    errorMessage.value = "";
    recipe.value = null;
    loading.value = true;

    try {
      recipe.value = await $fetch<Recipe>("/api/suggest", {
        method: "POST",
        body: { cuisine, ingredients, avoid, diet, lang: lang.value },
      });
    } catch (error) {
      console.log("Get recipe error:", error);
      errorMessage.value = t(apiErrorKey(error, "recipe.error"));
    } finally {
      loading.value = false;
    }
  }

  return { recipe, loading, errorMessage, getRecipe };
}
