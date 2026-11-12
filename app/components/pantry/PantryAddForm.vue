<script setup lang="ts">
import { MAX_INGREDIENT_LENGTH } from "#shared/limits";

// The form for adding one ingredient by hand. The parent owns the text (v-model)
// and does the saving when the form is sent ("add"), so the parent can decide
// to empty the input only when the save went well.
const name = defineModel<string>({ required: true });

const emit = defineEmits<{
  add: [];
}>();

const { t } = useLang();
</script>

<template>
  <form class="add-form" @submit.prevent="emit('add')">
    <input
      v-model="name"
      type="text"
      :placeholder="t('pantry.placeholder')"
      :maxlength="MAX_INGREDIENT_LENGTH"
      required
    />
    <button class="btn" type="submit">{{ t("pantry.add") }}</button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  gap: 0.625rem;
}

.add-form input {
  flex: 1;
  min-width: 0;
}
</style>
