<script setup lang="ts">
import { DIETS, type Diet } from "#shared/diets";

defineProps<{
  selected: Diet;
}>();

const emit = defineEmits<{
  change: [diet: Diet];
}>();

const { t } = useLang();

const options = computed(() =>
  DIETS.map((diet) => ({ value: diet, label: t(`diet.${diet}`) })),
);
</script>

<template>
  <!-- The badge shows the chosen diet, unless it is "no restrictions". -->
  <UiFoldout
    :title="t('diet.title')"
    :badge="selected === 'none' ? undefined : t(`diet.${selected}`)"
  >
    <UiPillGroup
      :options="options"
      :selected="[selected]"
      @change="emit('change', $event[0] as Diet)"
    />
  </UiFoldout>
</template>
