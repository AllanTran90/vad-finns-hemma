<script setup lang="ts">
import { ALLERGENS, type Allergen } from "#shared/allergens";

defineProps<{
  selected: Allergen[];
}>();

// PillGroup works with plain strings. Every option comes from ALLERGENS, so what
// it sends back is always a list of real allergens (hence `as Allergen[]` below).
const emit = defineEmits<{
  change: [allergens: Allergen[]];
}>();

const { t } = useLang();

const options = computed(() =>
  ALLERGENS.map((allergen) => ({
    value: allergen,
    label: t(`allergen.${allergen}`),
  })),
);
</script>

<template>
  <UiFoldout :title="t('prefs.allergies')" :badge="selected.length">
    <p class="muted hint">{{ t("prefs.hint") }}</p>
    <UiPillGroup
      multiple
      tone="warn"
      :options="options"
      :selected="selected"
      @change="emit('change', $event as Allergen[])"
    />
  </UiFoldout>
</template>

<style scoped>
.hint {
  margin: 0;
  font-size: 0.875rem;
}
</style>
