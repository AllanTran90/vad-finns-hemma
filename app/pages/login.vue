<script setup lang="ts">

const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function signIn(email: string, password: string) {
  errorMessage.value = "";

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.log("Login error:", error);
    errorMessage.value = "Wrong email or password. Please try again.";
    return;
  }

  await navigateTo("/");
}
</script>

<template>
  <UiAuthForm
  title="Log in"
  password-autocomplete="current-password"
  :error-message="errorMessage"
  @submit="signIn"
    
  />
    <p>No account yet? <NuxtLink to="/signup">Create account</NuxtLink></p>
</template>
