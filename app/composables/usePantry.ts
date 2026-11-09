import type { Database } from "#shared/database.types";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "#shared/limits";
import type { TranslatedIngredients } from "#shared/schemas/translatedIngredients";

type PantryInsert = Database["public"]["Tables"]["pantry"]["Insert"];

export function usePantry() {
  const supabase = useSupabaseClient<Database>();
  const { t, lang } = useLang();
  const errorMessage = ref("");
  const translating = ref(false);
  const user = useSupabaseUser();
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

  // Translates the whole pantry to the language the app is set to, and saves the
  // new names. Only rows whose name changed are saved.
  async function translateIngredients() {
    errorMessage.value = "";
    const list = ingredients.value;

    if (list.length === 0) {
      return;
    }

    // No user means the login is gone, so we do not even ask Claude.
    if (!user.value?.sub) {
      errorMessage.value = t("error.sessionExpired");
      return;
    }

    translating.value = true;

    try {
      const result = await $fetch<TranslatedIngredients>(
        "/api/translate-ingredients",
        {
          method: "POST",
          body: { names: list.map((item) => item.name), lang: lang.value },
        },
      );

      // The server has checked that we got one name per row, in the same order.
      // Two names can become the same ("tomat" and "tomato" both become "tomat"),
      // so we keep the first one and delete the others, like addIngredient
      // never allows duplicates.
      const seen = new Set<string>();
      const changed: { id: string; name: string }[] = [];
      const duplicateIds: string[] = [];

      list.forEach((item, i) => {
        const newName = result.names[i]!;
        const key = newName.toLowerCase();

        if (seen.has(key)) {
          duplicateIds.push(item.id);
          return;
        }
        seen.add(key);

        if (newName !== item.name) {
          changed.push({ id: item.id, name: newName });
        }
      });

      // One update per changed row, all sent at the same time (Promise.all).
      // Not upsert: the database counts an upsert as an insert, so the 50 row
      // limit (limit_rows_per_user) would stop it for a full pantry.
      // RLS only lets us update our own rows.
      if (changed.length > 0) {
        const results = await Promise.all(
          changed.map((row) =>
            supabase.from("pantry").update({ name: row.name }).eq("id", row.id),
          ),
        );
        const error = results.find((result) => result.error)?.error;
        if (error) {
          console.log("Save translation error:", error);
          errorMessage.value = t("pantry.errorTranslate");
          return;
        }
      }

      if (duplicateIds.length > 0) {
        const { error } = await supabase
          .from("pantry")
          .delete()
          .in("id", duplicateIds);
        if (error) {
          console.log("Delete duplicates error:", error);
        }
      }

      await loadIngredients();
    } catch (error) {
      console.log("Translate ingredients error:", error);
      errorMessage.value = t(apiErrorKey(error, "pantry.errorTranslate"));
    } finally {
      translating.value = false;
    }
  }

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
