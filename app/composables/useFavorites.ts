import { z } from "zod";
import type { Database } from "#shared/database.types";
import { recipeSchema, type Recipe } from "#shared/schemas/recipe";

// A saved recipe is a Recipe plus the id of its row in the database.
const favoriteSchema = recipeSchema.extend({ id: z.string() });
export type Favorite = z.infer<typeof favoriteSchema>;

export function useFavorites() {
  const supabase = useSupabaseClient<Database>();
  const { t } = useLang();
  const { getUserIdOrError } = useUserId();
  const errorMessage = ref("");
  // useState gives every page the same list, unlike ref, which makes a new one each call.
  const favorites = useState<Favorite[]>("favorites", () => []);

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

    const userId = getUserIdOrError(errorMessage);
    if (!userId) {
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

  // The save button on the recipe card: remove the recipe if it is saved, otherwise save it.
  // While a save or remove is running, more taps are ignored. Otherwise a double tap
  // would save the recipe twice, because the list is only updated when the first save is done.
  const savingFavorite = ref(false);

  async function toggleFavorite(recipe: Recipe) {
    if (savingFavorite.value) {
      return;
    }

    savingFavorite.value = true;
    try {
      const saved = findFavorite(recipe);

      if (saved) {
        await deleteFavorite(saved.id);
      } else {
        await saveFavorite(recipe);
      }
    } finally {
      savingFavorite.value = false;
    }
  }

  return {
    favorites,
    errorMessage,
    loadFavorites,
    findFavorite,
    saveFavorite,
    deleteFavorite,
    toggleFavorite,
  };
}
