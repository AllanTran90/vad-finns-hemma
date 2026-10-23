<script setup lang="ts">
const supabase = useSupabaseClient();
const { t } = useLang();
const errorMessage = ref("");

async function signUp(email: string, password: string) {
  errorMessage.value = "";
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Signup error:", error);
    errorMessage.value = t("auth.signupError");
    return;
  }

  await navigateTo("/");
}
</script>

<template>
  <UiAuthForm
    :title="t('auth.createAccount')"
    password-autocomplete="new-password"
    :error-message="errorMessage"
    @submit="signUp"
  >
    {{ t("auth.haveAccount") }}
    <NuxtLink to="/login">{{ t("auth.logIn") }}</NuxtLink>
  </UiAuthForm>
</template>
