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
    />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      :autocomplete="passwordAutocomplete"
    />
    <button type="submit">{{ title }}</button>
  </form>
  <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
</template>
