<script setup lang="ts">
const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");

async function signUp() {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  console.log("error:", error);
}
</script>

<template>
  <main>
    <h1>Log in</h1>
    <form>
      <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
      <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
      <button type="submit">Log in</button>
      <button type="button" @click="signUp">Create account</button>
    </form>
  </main>
</template>
