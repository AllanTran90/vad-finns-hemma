<script setup lang="ts">
import type { Recipe } from "#shared/schemas/recipe";

const props = withDefaults(
  defineProps<{
    recipe: Recipe;
    // The allergens the user wants to avoid.
    avoid?: string[];
    // Whether the recipe is in the user's favorites (the save button is highlighted).
    saved?: boolean;
  }>(),
  { avoid: () => [], saved: false },
);

const emit = defineEmits<{
  // The parent saves or removes the recipe; the card only reports the click.
  toggle: [];
}>();

const { t } = useLang();

// Allergens in the recipe that the user marked. The AI can make mistakes,
// so we check the answer ourselves.
const conflicts = computed(() =>
  props.recipe.allergens.filter((allergen) => props.avoid.includes(allergen)),
);

const conflictNames = computed(() =>
  conflicts.value.map((allergen) => t(`allergen.${allergen}`)).join(", "),
);
</script>

<template>
  <div class="recipe">
    <article class="card">
      <p v-if="conflicts.length" role="alert">
        {{ t("recipe.allergyWarning", { allergens: conflictNames }) }}
      </p>
      <div class="header">
        <h2 class="title">{{ recipe.name }}</h2>
        <button
          class="save-button"
          :class="{ saved }"
          type="button"
          :aria-pressed="saved"
          :aria-label="saved ? t('favorites.remove') : t('favorites.save')"
          @click="emit('toggle')"
        >
          <Icon name="lucide:chef-hat" size="1.5rem" />
        </button>
      </div>

      <div class="chips">
        <span class="chip chip-cuisine">{{ recipe.cuisine }}</span>
        <span class="chip chip-time">{{ recipe.cook_time_minutes }} min</span>
        <span v-if="recipe.kid_friendly" class="chip chip-kids">
          {{ t("recipe.kidFriendly") }}
        </span>
      </div>

      <div v-if="recipe.allergens.length">
        <p class="label">{{ t("recipe.contains") }}</p>
        <div class="chips">
          <span
            v-for="allergen in recipe.allergens"
            :key="allergen"
            class="chip chip-allergen"
          >
            {{ t(`allergen.${allergen}`) }}
          </span>
        </div>
      </div>

      <section>
        <h3>{{ t("recipe.ingredients") }}</h3>
        <ul class="ingredients">
          <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
            {{ ingredient }}
          </li>
        </ul>
      </section>

      <section>
        <h3>{{ t("recipe.instructions") }}</h3>
        <ol class="steps">
          <li v-for="(step, index) in recipe.instructions" :key="index">
            <span>{{ step }}</span>
          </li>
        </ol>
      </section>
    </article>

    <p class="note muted">
      {{ t("recipe.disclaimer") }}
    </p>
  </div>
</template>

<style scoped>
.recipe {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  background: var(--color-surface);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.title {
  min-width: 0;
  font-size: 1.625rem;
  line-height: 1.25;
}

.save-button {
  flex: none;
  display: grid;
  place-items: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-muted);
  border-radius: 50%;
  cursor: pointer;
}

/* Saved: a green icon on a soft green circle. A line icon cannot be filled. */
.save-button.saved {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

h3 {
  margin: 0 0 0.625rem;
  font-size: 1.125rem;
}

.label {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.chip-cuisine {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.chip-time {
  background: var(--color-bg);
  color: var(--color-muted);
}

.chip-kids {
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
}

.chip-allergen {
  background: var(--color-warn-bg);
  color: var(--color-warn-text);
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

.note {
  margin: 0;
  font-size: 0.8125rem;
}
</style>
