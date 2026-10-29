import type { Database } from "#shared/database.types";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "#shared/limits";

type PantryInsert = Database["public"]["Tables"]["pantry"]["Insert"];

export function usePantry() {
  const supabase = useSupabaseClient<Database>();
  const { t } = useLang();
  const errorMessage = ref("");
  const user = useSupabaseUser();
  const ingredients = ref<{ id: string; name: string }[]>([]);

  async function loadIngredients() {
    const { data, error } = await supabase
      .from("pantry")
      .select("id, name")
      .order("created_at");

    if (error) {
      console.log("Load ingredients error:", error);
      errorMessage.value = t("pantry.errorLoad");
      return;
    }
    ingredients.value = data;
  }

  async function addIngredient(name: string) {
    errorMessage.value = "";

    const cleanName = name.trim();

    if (!cleanName) {
      errorMessage.value = t("pantry.errorEmpty");
      return;
    }

    const alreadyThere = ingredients.value.some(
      (ingredient) => ingredient.name.toLowerCase() === cleanName.toLowerCase(),
    );

    if (alreadyThere) {
      errorMessage.value = t("pantry.errorDuplicate");
      return;
    }

    // Same limits as /api/suggest, so the recipe button never gets a 400.
    if (cleanName.length > MAX_INGREDIENT_LENGTH) {
      errorMessage.value = t("pantry.errorTooLong", {
        max: MAX_INGREDIENT_LENGTH,
      });
      return;
    }

    if (ingredients.value.length >= MAX_INGREDIENTS) {
      errorMessage.value = t("pantry.errorFull", { max: MAX_INGREDIENTS });
      return;
    }

    // The database needs to know who owns the row. No user means the login is gone.
    const userId = user.value?.sub;
    if (!userId) {
      errorMessage.value = t("error.sessionExpired");
      return;
    }

    const { error } = await supabase.from("pantry").insert({
      name: cleanName,
      user_id: userId,
    });

    if (error) {
      console.log("Add ingredient error:", error);
      errorMessage.value = t("pantry.errorAdd");
      return;
    }

    await loadIngredients();
  }

  // Saves many ingredients in one request, e.g. the list from a photo scan.
  // Skips empty names and names that are already in the pantry. Names that are
  // too long, or do not fit in a full pantry, are skipped and counted, so the
  // user is told about them instead of losing them silently.
  async function addIngredients(names: string[]) {
    errorMessage.value = "";

    const userId = user.value?.sub;
    if (!userId) {
      errorMessage.value = t("error.sessionExpired");
      return;
    }

    const known = new Set(
      ingredients.value.map((ingredient) => ingredient.name.toLowerCase()),
    );
    const rows: PantryInsert[] = [];
    let skipped = 0;

    for (const name of names) {
      const cleanName = name.trim();
      const key = cleanName.toLowerCase();

      if (!cleanName || known.has(key)) {
        continue;
      }

      const isFull = ingredients.value.length + rows.length >= MAX_INGREDIENTS;
      if (cleanName.length > MAX_INGREDIENT_LENGTH || isFull) {
        skipped++;
        continue;
      }

      known.add(key);
      rows.push({ name: cleanName, user_id: userId });
    }

    if (rows.length > 0) {
      const { error } = await supabase.from("pantry").insert(rows);

      if (error) {
        console.log("Add ingredients error:", error);
        errorMessage.value = t("pantry.errorAddMany");
        return;
      }

      await loadIngredients();
    }

    if (skipped > 0) {
      errorMessage.value = t("pantry.errorSkipped", {
        count: skipped,
        max: MAX_INGREDIENTS,
        length: MAX_INGREDIENT_LENGTH,
      });
    }
  }

  async function deleteIngredient(id: string) {
    errorMessage.value = "";

    const { error } = await supabase.from("pantry").delete().eq("id", id);

    if (error) {
      console.log("Delete ingredient error:", error);
      errorMessage.value = t("pantry.errorDelete");
      return;
    }
    await loadIngredients();
  }

  return {
    ingredients,
    errorMessage,
    loadIngredients,
    addIngredient,
    addIngredients,
    deleteIngredient,
  };
}
