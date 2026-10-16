export function usePantry() {
  const supabase = useSupabaseClient();
  const errorMessage = ref("");
  const ingredients = ref<{ id: string; name: string }[]>([]);

  async function loadIngredients() {
    const { data, error } = await supabase
      .from("pantry")
      .select("id, name")
      .order("created_at");

    if (error) {
      console.log("Load ingredients error:", error);
      errorMessage.value = "Could not load ingredients. Please try again.";
      return;
    }
    ingredients.value = data;
  }

  async function deleteIngredient(id: string) {
    errorMessage.value = "";

    const { error } = await supabase.from("pantry").delete().eq("id", id);

    if (error) {
      console.log("Delete ingredient error:", error);
      errorMessage.value = "Could not delete ingredient. Please try again.";
      return;
    }
    await loadIngredients();
  }

  return { ingredients, errorMessage, loadIngredients, deleteIngredient };
}
