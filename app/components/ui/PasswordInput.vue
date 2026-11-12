<script setup lang="ts">
// A password input with an eye button that shows or hides the password.
// Used with v-model, like a normal <input>: <UiPasswordInput v-model="password" />
defineProps<{
  // "current-password" on login, "new-password" on signup, so the browser
  // knows whether to fill in a saved password or suggest a new one.
  autocomplete: string;
}>();

// defineModel connects this input to the parent's v-model.
const password = defineModel<string>({ required: true });

const { t } = useLang();
const showPassword = ref(false);
</script>

<template>
  <div class="password-field">
    <input
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="t('auth.password')"
      :autocomplete="autocomplete"
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
</template>

<style scoped>
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
