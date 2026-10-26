<script setup lang="ts">
const supabase = useSupabaseClient();
const { t } = useLang();
const errorMessage = ref("");
const infoMessage = ref("");

async function signUp(email: string, password: string) {
  errorMessage.value = "";
  infoMessage.value = "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Signup error:", error);
    // 429 means Supabase has sent too many emails for now, not that the input is wrong.
    errorMessage.value =
      error.status === 429 ? t("auth.rateLimit") : t("auth.signupError");
    return;
  }

  // With "Confirm email" turned on in Supabase there is no session until the
  // user clicks the link in the email, so we cannot send them to the start page yet.
  if (!data.session) {
    infoMessage.value = t("auth.checkEmail");
    return;
  }

  await navigateTo("/");
}

definePageMeta({
  middleware: "guest-only",
});
</script>

<template>
  <UiAuthForm
    :title="t('auth.createAccount')"
    password-autocomplete="new-password"
    :error-message="errorMessage"
    :info-message="infoMessage"
    @submit="signUp"
  >
    {{ t("auth.haveAccount") }}
    <NuxtLink to="/login">{{ t("auth.logIn") }}</NuxtLink>
  </UiAuthForm>
</template>
