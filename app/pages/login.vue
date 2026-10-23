<script setup lang="ts">

const supabase = useSupabaseClient();
const { t } = useLang();
const errorMessage = ref("");

async function signIn(email: string, password: string) {
  errorMessage.value = "";

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.log("Login error:", error);
    errorMessage.value = t("auth.loginError");
    return;
  }

  await navigateTo("/");
}
</script>

<template>
  <UiAuthForm
    :title="t('auth.logIn')"
    password-autocomplete="current-password"
    :error-message="errorMessage"
    @submit="signIn"
  >
    {{ t("auth.noAccount") }}
    <NuxtLink to="/signup">{{ t("auth.createAccount") }}</NuxtLink>
  </UiAuthForm>
</template>
