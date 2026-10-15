<script setup lang="ts">
function onSubmit() {
  emit("submit", email.value, password.value);
}
defineProps<{
  title: string;
  passwordAutocomplete: string;
  errorMessage?: string;
}>();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const emit = defineEmits<{
  submit: [email: string, password: string];
}>();
</script>

<template>
  <h1>{{ title }}</h1>
  <form @submit.prevent="onSubmit">
    <input
      v-model="email"
      type="email"
      placeholder="Email"
      autocomplete="email"
      required
    />
    <div class="password-field">
    <input
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="Password"
      :autocomplete="passwordAutocomplete"
      required
    />
    <button
      type="button"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      @click="showPassword = !showPassword"
    >
      <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" />
    </button>
    </div>

    <button type="submit">{{ title }}</button>
  </form>
  <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
</template>

<style scoped>
.password-field {
  position: relative;
}

.password-field button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.password-field input {
  box-sizing: border-box;
  padding-right: 2.5rem;
}

</style>
