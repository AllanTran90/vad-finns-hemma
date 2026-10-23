import type { Recipe } from "#shared/schemas/recipe";

// A saved recipe is a Recipe plus the id of its row in the database.
export type Favorite = Recipe & { id: string };

export function useFavorites() {
  // `any` because we have no generated database types (types: false).
  const supabase = useSupabaseClient<any>();
  const { t } = useLang();
  const user = useSupabaseUser();
  const errorMessage = ref("");
  const favorites = ref<Favorite[]>([]);

  async function loadFavorites() {
    const { data, error } = await supabase
      .from("favorites")
      .select(
        "id, name, ingredients, instructions, cuisine, kid_friendly, allergens, cook_time_minutes",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Load favorites error:", error);
      errorMessage.value = t("favorites.errorLoad");
      return;
    }
    favorites.value = data;
  }

  // A recipe has no id until it is saved, so we compare by name.
  function findFavorite(recipe: Recipe) {
    return favorites.value.find((favorite) => favorite.name === recipe.name);
  }

  async function saveFavorite(recipe: Recipe) {
    errorMessage.value = "";

    // Already saved: nothing to do.
    if (findFavorite(recipe)) {
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      ...recipe,
      user_id: user.value?.sub,
    });

    if (error) {
      console.log("Save favorite error:", error);
      errorMessage.value = t("favorites.errorSave");
      return;
    }

    await loadFavorites();
  }

  async function deleteFavorite(id: string) {
    errorMessage.value = "";

    const { error } = await supabase.from("favorites").delete().eq("id", id);

    if (error) {
      console.log("Delete favorite error:", error);
      errorMessage.value = t("favorites.errorDelete");
      return;
    }

    await loadFavorites();
  }

  return {
    favorites,
    errorMessage,
    loadFavorites,
    findFavorite,
    saveFavorite,
    deleteFavorite,
  };
}
