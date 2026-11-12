import type { Database } from "#shared/database.types";
import { checkIngredientName } from "#shared/ingredientName";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "#shared/limits";

type PantryInsert = Database["public"]["Tables"]["pantry"]["Insert"];

export function usePantry() {
  const supabase = useSupabaseClient<Database>();
  const { t } = useLang();
  const errorMessage = ref("");
  const { getUserIdOrError } = useUserId();
  // useState gives every page the same list, unlike ref, which makes a new one each call.
  const ingredients = useState<{ id: string; name: string }[]>(
    "pantry-ingredients",
    () => [],
  );

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

    // The rules (empty, duplicate, too long, full) live in shared/ingredientName.ts.
    const problem = checkIngredientName(
      cleanName,
      ingredients.value.map((ingredient) => ingredient.name),
    );

    if (problem) {
      errorMessage.value = t(problem.key, problem.params);
      return;
    }

    const userId = getUserIdOrError(errorMessage);
    if (!userId) {
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

    const userId = getUserIdOrError(errorMessage);
    if (!userId) {
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

  // Removes many ingredients in one request: one, the selected ones or all of them.
  async function deleteIngredients(ids: string[]) {
    errorMessage.value = "";

    if (ids.length === 0) {
      return;
    }

    const { error } = await supabase.from("pantry").delete().in("id", ids);

    if (error) {
      console.log("Delete ingredients error:", error);
      errorMessage.value = t("pantry.errorDelete");
      return;
    }
    await loadIngredients();
  }

  function deleteIngredient(id: string) {
    return deleteIngredients([id]);
  }

  // The translation lives in its own file. It gets the same list, error
  // message and reload function, so the page still uses usePantry only.
  const { translating, translateIngredients } = usePantryTranslate({
    ingredients,
    errorMessage,
    loadIngredients,
  });

  return {
    ingredients,
    errorMessage,
    loadIngredients,
    addIngredient,
    addIngredients,
    deleteIngredient,
    deleteIngredients,
    translating,
    translateIngredients,
  };
}
