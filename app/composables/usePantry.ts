export function usePantry() {
  // `any` because we have no generated database types (types: false).
  const supabase = useSupabaseClient<any>();
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

    const { error } = await supabase.from("pantry").insert({
      name: cleanName,
      user_id: user.value?.sub,
    });

    if (error) {
      console.log("Add ingredient error:", error);
      errorMessage.value = t("pantry.errorAdd");
      return;
    }

    await loadIngredients();
  }

  // Saves many ingredients in one request, e.g. the list from a photo scan.
  // Skips empty names and names that are already in the pantry.
  async function addIngredients(names: string[]) {
    errorMessage.value = "";

    const known = new Set(
      ingredients.value.map((ingredient) => ingredient.name.toLowerCase()),
    );
    const rows = [];

    for (const name of names) {
      const cleanName = name.trim();
      const key = cleanName.toLowerCase();

      if (!cleanName || known.has(key)) {
        continue;
      }

      known.add(key);
      rows.push({ name: cleanName, user_id: user.value?.sub });
    }

    if (rows.length === 0) {
      return;
    }

    const { error } = await supabase.from("pantry").insert(rows);

    if (error) {
      console.log("Add ingredients error:", error);
      errorMessage.value = t("pantry.errorAddMany");
      return;
    }

    await loadIngredients();
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
