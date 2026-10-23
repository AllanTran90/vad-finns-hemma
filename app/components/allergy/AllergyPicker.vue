<script setup lang="ts">
import { ALLERGENS } from "#shared/allergens";

defineProps<{
  selected: string[];
}>();

const emit = defineEmits<{
  change: [allergens: string[]];
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
      @change="emit('change', $event)"
    />
  </UiFoldout>
</template>

<style scoped>
.hint {
  margin: 0;
  font-size: 0.875rem;
}
</style>
