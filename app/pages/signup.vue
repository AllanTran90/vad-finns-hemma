<script setup lang="ts">
const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");

async function signUp() {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });

  if (error) {
    console.log("error:", error);
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
    <p>Already have an account? <NuxtLink to="/login">Log in</NuxtLink></p>
  </main>
</template>
