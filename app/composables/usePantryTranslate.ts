import type { Ref } from "vue";
import type { Database } from "#shared/database.types";
import type { TranslatedIngredients } from "#shared/schemas/translatedIngredients";

// The parts of usePantry that the translation needs. usePantry passes in its
// own list, error message and reload function, so both share the same ones.
type PantryParts = {
  ingredients: Ref<{ id: string; name: string }[]>;
  errorMessage: Ref<string>;
  loadIngredients: () => Promise<void>;
};

export function usePantryTranslate({
  ingredients,
  errorMessage,
  loadIngredients,
}: PantryParts) {
  const supabase = useSupabaseClient<Database>();
  const { t, lang } = useLang();
  const { getUserIdOrError } = useUserId();
  const translating = ref(false);

  // Translates the whole pantry to the language the app is set to, and saves the
  // new names. Only rows whose name changed are saved.
  async function translateIngredients() {
    errorMessage.value = "";
    const list = ingredients.value;

    if (list.length === 0) {
      return;
    }

    // No user means the login is gone, so we do not even ask Claude.
    if (!getUserIdOrError(errorMessage)) {
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
          // Some rows may already be saved, so we still reload the list (finally).
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
    } catch (error) {
      console.log("Translate ingredients error:", error);
      errorMessage.value = t(apiErrorKey(error, "pantry.errorTranslate"));
    } finally {
      // Always show what the database really has, also after a half-done save.
      // loadIngredients only sets its own error if the reload itself fails.
      await loadIngredients();
      translating.value = false;
    }
  }

  return { translating, translateIngredients };
}
