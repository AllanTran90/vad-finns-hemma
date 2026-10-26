import { z } from "zod";
import type { Database } from "#shared/database.types";
import { recipeSchema, type Recipe } from "#shared/schemas/recipe";

// A saved recipe is a Recipe plus the id of its row in the database.
const favoriteSchema = recipeSchema.extend({ id: z.string() });
export type Favorite = z.infer<typeof favoriteSchema>;

export function useFavorites() {
  const supabase = useSupabaseClient<Database>();
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

    // The database allows empty (null) values in some columns, but a Favorite never
    // has them. Checking each row with the recipe schema gives us the right type,
    // and one broken row does not hide the others.
    favorites.value = data.flatMap((row) => {
      const parsed = favoriteSchema.safeParse(row);
      if (!parsed.success) {
        console.log("Skipping invalid favorite:", row.id, parsed.error);
        return [];
      }
      return [parsed.data];
    });
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

    const userId = user.value?.sub;
    if (!userId) {
      errorMessage.value = t("error.sessionExpired");
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      ...recipe,
      user_id: userId,
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
