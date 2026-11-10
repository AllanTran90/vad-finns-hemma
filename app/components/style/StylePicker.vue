<script setup lang="ts">
import { STYLES, type Style } from "#shared/styles";

defineProps<{
  selected: Style;
}>();

const emit = defineEmits<{
  change: [style: Style];
}>();

const { t } = useLang();

const options = computed(() =>
  STYLES.map((style) => ({ value: style, label: t(`style.${style}`) })),
);
</script>

<template>
  <!-- Only two choices, so they are always shown, not hidden in a foldout like the diet. -->
  <div class="style-picker">
    <h3>{{ t("style.title") }}</h3>
    <UiPillGroup
      :options="options"
      :selected="[selected]"
      @change="emit('change', $event[0] as Style)"
    />
  </div>
</template>

<style scoped>
.style-picker h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}
</style>
