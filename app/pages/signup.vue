<script setup lang="ts">
const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function signUp() {
    errorMessage.value = "";
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
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
    <h1>Create account</h1>
    <form @submit.prevent="signUp">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        autocomplete="email"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        autocomplete="new-password"
      />
      <button type="submit">Create account</button>
    </form>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p>Already have an account? <NuxtLink to="/login">Log in</NuxtLink></p>
  </main>
</template>
