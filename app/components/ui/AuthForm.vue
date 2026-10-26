<script setup lang="ts">
function onSubmit() {
  emit("submit", email.value, password.value);
}
defineProps<{
  title: string;
  passwordAutocomplete: string;
  errorMessage?: string;
  infoMessage?: string;
}>();

const { t } = useLang();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const emit = defineEmits<{
  submit: [email: string, password: string];
}>();
</script>

<template>
  <main class="auth">
    <div class="brand">
      <span class="brand-icon">
        <Icon name="lucide:chef-hat" size="2rem" />
      </span>
      <p class="brand-name">Vad finns hemma?</p>
      <p class="muted">{{ t("auth.tagline") }}</p>
    </div>

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
        <div class="password-field">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password')"
            :autocomplete="passwordAutocomplete"
            required
          />
          <button
            class="toggle"
            type="button"
            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" />
          </button>
        </div>

        <button class="btn" type="submit">{{ title }}</button>
      </form>
      <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
      <p v-if="infoMessage" role="status">{{ infoMessage }}</p>
    </div>

    <p class="switch">
      <slot />
    </p>
    <slot name="extra" />
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

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.brand-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.brand .muted {
  margin: 0;
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

.switch a {
  color: var(--color-primary);
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 3rem;
}

/* The eye sits inside the input, vertically centered on the right edge. */
.toggle {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--color-muted);
  font-size: 1.25rem;
  cursor: pointer;
  transform: translateY(-50%);
}

.toggle:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.toggle:focus-visible {
  outline: 2px solid var(--color-primary);
}
</style>
