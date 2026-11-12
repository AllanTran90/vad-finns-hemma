<script setup lang="ts">
defineProps<{
  title: string;
  passwordAutocomplete: string;
  errorMessage?: string;
  infoMessage?: string;
}>();

const emit = defineEmits<{
  submit: [email: string, password: string];
}>();

const { t } = useLang();

const email = ref("");
const password = ref("");

function onSubmit() {
  emit("submit", email.value, password.value);
}
</script>

<template>
  <main class="auth">
    <UiAuthBrand />

    <div class="card">
      <h1>{{ title }}</h1>
      <form @submit.prevent="onSubmit">
        <input
          v-model="email"
          type="email"
          :placeholder="t('auth.email')"
          autocomplete="email"
          required
        />
        <UiPasswordInput
          v-model="password"
          :autocomplete="passwordAutocomplete"
        />

        <button class="btn" type="submit">{{ title }}</button>
      </form>
      <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
      <p v-if="infoMessage" role="status">{{ infoMessage }}</p>
    </div>

    <p class="switch">
      <slot />
    </p>
    <div v-if="$slots.extra" class="extra">
      <slot name="extra" />
    </div>
  </main>
</template>

<style scoped>
.auth {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 26rem;
  margin: 0 auto;
  padding: 3rem 1.25rem 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: 0 8px 24px rgb(47 125 79 / 0.08);
}

.switch {
  margin: 0;
  text-align: center;
}

/* The link comes from the page through the slot, so it needs :deep to be styled here. */
.switch :deep(a) {
  color: var(--color-primary);
  font-weight: 600;
}

.extra {
  display: flex;
  justify-content: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
