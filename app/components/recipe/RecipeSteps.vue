<script setup lang="ts">
import type { Recipe } from "#shared/schemas/recipe";

// The "recipe note" part of a recipe card: the ingredient list and the
// numbered steps. It only shows what it gets, it has no logic of its own.
defineProps<{
  ingredients: Recipe["ingredients"];
  instructions: Recipe["instructions"];
}>();

const { t } = useLang();
</script>

<template>
  <section>
    <h3>{{ t("recipe.ingredients") }}</h3>
    <ul class="ingredients">
      <li v-for="(ingredient, index) in ingredients" :key="index">
        {{ ingredient }}
      </li>
    </ul>
  </section>

  <section>
    <h3>{{ t("recipe.instructions") }}</h3>
    <ol class="steps">
      <li v-for="(step, index) in instructions" :key="index">
        <span>{{ step }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
h3 {
  margin: 0 0 0.625rem;
  font-size: 1.125rem;
}

ul,
ol {
  display: grid;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ingredients li {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

/* A small green dot in front of each ingredient. */
.ingredients li::before {
  content: "";
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.steps {
  counter-reset: step;
  gap: 0.75rem;
}

.steps li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  counter-increment: step;
}

/* The step number in a green circle. CSS counts the steps itself (counter). */
.steps li::before {
  content: counter(step);
  flex: none;
  display: grid;
  place-items: center;
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 600;
}
</style>
