<script setup lang="ts">
const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function signIn() {
  errorMessage.value = "";

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
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
  <main>
    <h1>Log in</h1>
    <form @submit.prevent="signIn">
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
        autocomplete="current-password"
      />
      <button type="submit">Log in</button>
    </form>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p>No account yet? <NuxtLink to="/signup">Create account</NuxtLink></p>
  </main>
</template>
