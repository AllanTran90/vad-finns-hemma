<script setup lang="ts">
import type { Recipe } from "#shared/schemas/recipe";

defineProps<{
  recipe: Recipe;
}>();
</script>

<template>
  <article>
    <h2>{{ recipe.name }}</h2>
    <p>
      {{ recipe.cuisine }} · {{ recipe.cook_time_minutes }} min ·
      {{ recipe.kid_friendly ? "Kid friendly" : "Not for kids" }}
    </p>

    <p v-if="recipe.allergens.length">
      Contains: {{ recipe.allergens.join(", ") }}
    </p>

    <h3>Ingredients</h3>
    <ul>
      <li v-for="ingredient in recipe.ingredients" :key="ingredient">
        {{ ingredient }}
      </li>
    </ul>

    <h3>Instructions</h3>
    <ol>
      <li v-for="step in recipe.instructions" :key="step">{{ step }}</li>
    </ol>
  </article>
</template>
