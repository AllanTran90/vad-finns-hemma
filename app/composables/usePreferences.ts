import type { Database } from "#shared/database.types";
import type { Allergen } from "#shared/allergens";
import type { Diet } from "#shared/diets";

export function usePreferences() {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { t } = useLang();
  const allergens = ref<Allergen[]>([]);
  const diet = ref<Diet>("none");
  const errorMessage = ref("");

  // What the database really has. When a save fails we go back to this, not to what
  // the screen showed a moment ago, because another save may have finished in between.
  let savedAllergens: Allergen[] = [];
  let savedDiet: Diet = "none";

  async function loadPreferences() {
    errorMessage.value = "";

    // maybeSingle: no row yet (new user) is fine, we get null instead of an error.
    // RLS makes sure we can only ever see our own row.
    const { data, error } = await supabase
      .from("preferences")
      .select("allergens, diet")
      .maybeSingle();

    if (error) {
      console.log("Load preferences error:", error);
      errorMessage.value = t("prefs.errorLoad");
      return;
    }

    allergens.value = data?.allergens ?? [];
    diet.value = data?.diet ?? "none";
    savedAllergens = allergens.value;
    savedDiet = diet.value;
  }

  // upsert = insert the row, or update it if the user already has one.
  // Only the columns we send are changed, so saving allergens never touches diet.
  async function savePreferences(fields: {
    allergens?: Allergen[];
    diet?: Diet;
  }) {
    const userId = user.value?.sub;
    if (!userId) {
      errorMessage.value = t("error.sessionExpired");
      return false;
    }

    const { error } = await supabase.from("preferences").upsert({
      user_id: userId,
      ...fields,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log("Save preferences error:", error);
      errorMessage.value = t("prefs.errorSave");
    }

    return !error;
  }

  async function saveAllergens(next: Allergen[]) {
    errorMessage.value = "";

    // Show the change right away, and go back to the saved value if saving fails.
    allergens.value = next;

    if (await savePreferences({ allergens: next })) {
      savedAllergens = next;
    } else {
      allergens.value = savedAllergens;
    }
  }

  async function saveDiet(next: Diet) {
    errorMessage.value = "";

    diet.value = next;

    if (await savePreferences({ diet: next })) {
      savedDiet = next;
    } else {
      diet.value = savedDiet;
    }
  }

  return {
    allergens,
    diet,
    errorMessage,
    loadPreferences,
    saveAllergens,
    saveDiet,
  };
}
