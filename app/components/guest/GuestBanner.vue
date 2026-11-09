<script setup lang="ts">
const supabase = useSupabaseClient();
const { t } = useLang();

// A cookie (like the theme) so the server already knows the choice and the
// big banner does not flash on reload. Closing only folds it into one line,
// so creating an account is always one tap away.
const hidden = useCookie<boolean>("guest-banner-hidden", {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
});

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const infoMessage = ref("");

// updateUser turns the guest into a real user and keeps the same user id,
// so the pantry and the saved recipes stay with the account.
async function createAccount() {
  errorMessage.value = "";
  infoMessage.value = "";

  const { data, error } = await supabase.auth.updateUser({
    email: email.value,
    password: password.value,
  });

  if (error) {
    console.log("Upgrade guest error:", error);
    errorMessage.value =
      error.status === 429 ? t("auth.rateLimit") : t("auth.signupError");
    return;
  }

  // With "Confirm email" on, the new email is pending until the user clicks the link.
  if (data.user.new_email) {
    infoMessage.value = t("guest.checkEmail");
    return;
  }

  // The "is guest" flag lives in the login token, so we fetch a fresh one.
  // The banner disappears when the token says the user is no longer a guest.
  await supabase.auth.refreshSession();
}
</script>

<template>
  <div v-if="hidden" class="guest-bar">
    <span>{{ t("guest.short") }}</span>
    <button class="link-btn" type="button" @click="hidden = false">
      {{ t("auth.createAccount") }}
    </button>
  </div>
  <section v-else class="guest">
    <div class="guest-head">
      <h2>{{ t("guest.title") }}</h2>
      <button
        class="close-btn"
        type="button"
        :aria-label="t('guest.hide')"
        @click="hidden = true"
      >
        <Icon name="lucide:x" size="1.25rem" />
      </button>
    </div>
    <p class="muted">{{ t("guest.text") }}</p>
    <form @submit.prevent="createAccount">
      <input
        v-model="email"
        type="email"
        :placeholder="t('auth.email')"
        autocomplete="email"
        required
      />
      <input
        v-model="password"
        type="password"
        :placeholder="t('auth.password')"
        autocomplete="new-password"
        required
      />
      <button class="btn" type="submit">{{ t("auth.createAccount") }}</button>
    </form>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-if="infoMessage" role="status">{{ infoMessage }}</p>
    <!-- The form above can only create a NEW account. This is the way to an
         existing one. /login warns the guest that the guest data is lost. -->
    <p class="login-link">
      {{ t("auth.haveAccount") }}
      <NuxtLink to="/login">{{ t("auth.logIn") }}</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.guest {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-primary-soft);
}

.guest h2,
.guest p {
  margin: 0;
}

.guest-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

/* 44 x 44 px so it is easy to hit with a thumb. */
.close-btn {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: -0.5rem -0.5rem 0 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
}

.guest-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-primary-soft);
}

.link-btn {
  min-height: 44px;
  padding: 0 0.75rem;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.login-link a {
  color: var(--color-primary);
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
