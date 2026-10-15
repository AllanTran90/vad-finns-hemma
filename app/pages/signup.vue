<script setup lang="ts">
const supabase = useSupabaseClient();
const errorMessage = ref("");

async function signUp(email: string, password: string) {
  errorMessage.value = "";
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Signup error:", error);
    errorMessage.value = "Could not create account. Please check your email and password.";
    return;
  }

  await navigateTo("/");
}
</script>

<template>
  <main>
   <UiAuthForm
  title="Create account"
  password-autocomplete="new-password"
  :error-message="errorMessage"
  @submit="signUp"
    
  />

</main>
    <p>Already have an account? <NuxtLink to="/login">Log in</NuxtLink></p>
</template>
