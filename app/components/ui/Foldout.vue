<script setup lang="ts">
defineProps<{
  title: string;
  // Small label next to the title, e.g. how many choices are active.
  badge?: string | number;
}>();
</script>

<template>
  <details class="foldout">
    <summary>
      {{ title }}
      <span v-if="badge" class="badge">{{ badge }}</span>
    </summary>

    <div class="content">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.foldout {
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-surface);
}

summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.badge {
  padding: 0 0.5rem;
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 500;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}
</style>
