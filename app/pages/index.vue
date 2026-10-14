<script setup lang="ts">
const supabase = useSupabaseClient();
const errorMessage = ref("")
async function signOut(){
  errorMessage.value = "";
  const { error } = await supabase.auth.signOut();

  if (error) {
  console.log("Logout error:", error);
  errorMessage.value = "Could not log out. Please try again.";
  return;
}

  await navigateTo("/login");

}
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <main>
    <h1>Vad finns hemma?</h1>
    <button type="button" @click="signOut">Log out</button>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
  </main>
</template>