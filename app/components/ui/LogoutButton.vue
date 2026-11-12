<script setup lang="ts">
// The log out button with its own error message. It does everything itself:
// asks a guest first, logs out in Supabase, clears the user's data and goes
// to the login page.
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { t } = useLang();
const { confirm } = useConfirm();
const { clearUserData } = useClearUserData();

const logoutError = ref("");

async function signOut() {
  logoutError.value = "";

  // A guest has no email or password to log in with again, so logging out
  // means the data is lost. Ask first.
  if (user.value?.is_anonymous && !(await confirm(t("guest.logoutConfirm")))) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Logout error:", error);
    logoutError.value = t("auth.logOutError");
    return;
  }

  clearUserData();
  await navigateTo("/login");
}
</script>

<template>
  <!-- No wrapping div, so the button is centered by the page's own layout. -->
  <button class="btn-link logout" type="button" @click="signOut">
    {{ t("auth.logOut") }}
  </button>
  <p v-if="logoutError" role="alert">{{ logoutError }}</p>
</template>

<style scoped>
.logout {
  align-self: center;
  color: var(--color-muted);
}
</style>
