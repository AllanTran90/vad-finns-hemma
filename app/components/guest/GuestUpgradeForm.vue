<script setup lang="ts">
// The form in the guest banner that turns the guest into a real account.
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
  <!-- No wrapping div, so the banner's spacing (gap) works as before. -->
  <form @submit.prevent="createAccount">
    <input
      v-model="email"
      type="email"
      :placeholder="t('auth.email')"
      autocomplete="email"
      required
    />
    <UiPasswordInput v-model="password" autocomplete="new-password" />
    <button class="btn" type="submit">{{ t("auth.createAccount") }}</button>
  </form>
  <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
  <p v-if="infoMessage" role="status">{{ infoMessage }}</p>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

p {
  margin: 0;
}
</style>
