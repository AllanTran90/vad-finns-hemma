<script setup lang="ts">
import { CUISINES, SURPRISE, type CuisineChoice } from "#shared/cuisines";

// The grid of cuisines plus "Surprise me". Built like StylePicker: the parent
// owns the choice and gets it back through "change".
defineProps<{
  // Empty until the user has picked a cuisine.
  selected: CuisineChoice | "";
}>();

const emit = defineEmits<{
  change: [cuisine: CuisineChoice];
}>();
</script>

<template>
  <div class="cuisine-grid">
    <CuisineCard
      v-for="cuisine in CUISINES"
      :key="cuisine"
      :name="cuisine"
      :selected="cuisine === selected"
      @select="emit('change', $event)"
    />
    <CuisineCard
      class="surprise"
      :name="SURPRISE"
      :selected="selected === SURPRISE"
      @select="emit('change', $event)"
    />
  </div>
</template>

<style scoped>
.cuisine-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 40rem) {
  .cuisine-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* "Surprise me" takes a whole row. */
.surprise {
  grid-column: 1 / -1;
}
</style>
