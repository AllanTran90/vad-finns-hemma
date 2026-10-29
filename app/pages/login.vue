<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { t } = useLang();
const errorMessage = ref("");

async function signIn(email: string, password: string) {
  errorMessage.value = "";

  // Logging in replaces the guest session, and the guest's data cannot be
  // reached again. Same warning as when a guest logs out (see index.vue).
  if (user.value?.is_anonymous && !window.confirm(t("guest.loginConfirm"))) {
    return;
  }

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

// A guest gets a temporary account, so they can try the app without signing up.
async function continueAsGuest() {
  errorMessage.value = "";

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.log("Guest login error:", error);
    errorMessage.value = t("auth.guestError");
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
    :title="t('auth.logIn')"
    password-autocomplete="current-password"
    :error-message="errorMessage"
    @submit="signIn"
  >
    {{ t("auth.noAccount") }}
    <NuxtLink to="/signup">{{ t("auth.createAccount") }}</NuxtLink>
    <template #extra>
      <button class="btn-link" type="button" @click="continueAsGuest">
        {{ t("auth.guest") }}
      </button>
    </template>
  </UiAuthForm>
</template>
