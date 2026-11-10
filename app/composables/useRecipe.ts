import type { Allergen } from "#shared/allergens";
import type { Diet } from "#shared/diets";
import type { Style } from "#shared/styles";
import type { Recipe } from "#shared/schemas/recipe";
import type { Cuisine, CuisineChoice } from "#shared/cuisines";

export function useRecipe() {
  const { lang, t } = useLang();
  // useState keeps these when the user changes page, even during a running request.
  const recipe = useState<Recipe | null>("recipe", () => null);
  const selectedCuisine = useState<CuisineChoice | "">(
    "recipe-cuisine",
    () => "",
  );
  const selectedStyle = useState<Style>("recipe-style", () => "home");
  const loading = useState("recipe-loading", () => false);
  const errorMessage = useState("recipe-error", () => "");

  async function getRecipe(
    cuisine: Cuisine,
    ingredients: string[],
    avoid: Allergen[],
    diet: Diet,
    style: Style,
  ) {
    errorMessage.value = "";
    recipe.value = null;
    loading.value = true;

    try {
      recipe.value = await $fetch<Recipe>("/api/suggest", {
        method: "POST",
        body: { cuisine, ingredients, avoid, diet, style, lang: lang.value },
      });
    } catch (error) {
      console.log("Get recipe error:", error);
      errorMessage.value = t(apiErrorKey(error, "recipe.error"));
    } finally {
      loading.value = false;
    }
  }

  return {
    recipe,
    selectedCuisine,
    selectedStyle,
    loading,
    errorMessage,
    getRecipe,
  };
}
