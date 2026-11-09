<script setup lang="ts">
import { MAX_INGREDIENT_LENGTH } from "#shared/limits";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { t } = useLang();
const { confirm } = useConfirm();
const ingredientName = ref("");
const logoutError = ref("");

const {
  ingredients,
  errorMessage: pantryError,
  loadIngredients,
  deleteIngredient,
  deleteIngredients,
  addIngredient,
  addIngredients,
} = usePantry();

const { clearUserData } = useClearUserData();

async function signOut() {
  logoutError.value = "";

  // A guest has no email or password to log in with again, so logging out
  // means the data is lost. Ask first.
  if (user.value?.is_anonymous && !(await confirm(t("guest.logoutConfirm")))) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Logout error:", error);
    logoutError.value = t("auth.logOutError");
    return;
  }

  clearUserData();
  await navigateTo("/login");
}

async function handleAdd() {
  await addIngredient(ingredientName.value);

  if (!pantryError.value) {
    ingredientName.value = "";
  }
}

onMounted(() => {
  loadIngredients();
});

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main class="page">
    <header class="header">
      <h1>Vad finns hemma?</h1>
      <p class="muted">{{ t("app.tagline") }}</p>
    </header>

    <GuestBanner v-if="user?.is_anonymous" />

    <div class="layout">
      <section class="section">
        <h2>{{ t("pantry.title") }}</h2>
        <form class="add-form" @submit.prevent="handleAdd">
          <input
            v-model="ingredientName"
            type="text"
            :placeholder="t('pantry.placeholder')"
            :maxlength="MAX_INGREDIENT_LENGTH"
            required
          />
          <button class="btn" type="submit">{{ t("pantry.add") }}</button>
        </form>
        <p v-if="pantryError" role="alert">{{ pantryError }}</p>
        <PantryList
          :ingredients="ingredients"
          @delete="deleteIngredient"
          @delete-many="deleteIngredients"
        />
      </section>

      <section class="section">
        <h2>{{ t("scan.title") }}</h2>
        <ScanPhoto
          :existing="ingredients.map((ingredient) => ingredient.name)"
          @confirm="addIngredients"
        />
      </section>
    </div>

    <button class="btn-link logout" type="button" @click="signOut">
      {{ t("auth.logOut") }}
    </button>
    <p v-if="logoutError" role="alert">{{ logoutError }}</p>
  </main>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.header p {
  margin: 0;
}

.add-form {
  display: flex;
  gap: 0.625rem;
}

.add-form input {
  flex: 1;
  min-width: 0;
}

.logout {
  align-self: center;
  color: var(--color-muted);
}
</style>
