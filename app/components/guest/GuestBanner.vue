<script setup lang="ts">
const supabase = useSupabaseClient();
const { t } = useLang();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const infoMessage = ref("");

// updateUser turns the guest into a real user and keeps the same user id,
// so the pantry and the saved recipes stay with the account.
async function createAccount() {
  errorMessage.value = "";
  infoMessage.value = "";

  const { data, error } = await supabase.auth.updateUser({
    email: email.value,
    password: password.value,
  });

  if (error) {
    console.log("Upgrade guest error:", error);
    errorMessage.value =
      error.status === 429 ? t("auth.rateLimit") : t("auth.signupError");
    return;
  }

  // With "Confirm email" on, the new email is pending until the user clicks the link.
  if (data.user.new_email) {
    infoMessage.value = t("guest.checkEmail");
    return;
  }

  // The "is guest" flag lives in the login token, so we fetch a fresh one.
  // The banner disappears when the token says the user is no longer a guest.
  await supabase.auth.refreshSession();
}
</script>

<template>
  <section class="guest">
    <h2>{{ t("guest.title") }}</h2>
    <p class="muted">{{ t("guest.text") }}</p>
    <form @submit.prevent="createAccount">
      <input
        v-model="email"
        type="email"
        :placeholder="t('auth.email')"
        autocomplete="email"
        required
      />
      <input
        v-model="password"
        type="password"
        :placeholder="t('auth.password')"
        autocomplete="new-password"
        required
      />
      <button class="btn" type="submit">{{ t("auth.createAccount") }}</button>
    </form>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-if="infoMessage" role="status">{{ infoMessage }}</p>
  </section>
</template>

<style scoped>
.guest {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-primary-soft);
}

.guest h2,
.guest p {
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
