<script setup lang="ts">
// The row of buttons under the pantry list. Which buttons show depends on the
// list's mode, which the parent owns and shares through v-model.
defineProps<{
  // How many rows are ticked, and how many there are in total.
  selectedCount: number;
  total: number;
}>();

const mode = defineModel<"normal" | "selecting" | "confirmingAll">({
  required: true,
});

const emit = defineEmits<{
  cancel: [];
  deleteSelected: [];
  deleteAll: [];
}>();

const { t } = useLang();
</script>

<template>
  <div class="actions">
    <template v-if="mode === 'normal'">
      <button
        class="btn-link btn-remove"
        type="button"
        @click="mode = 'selecting'"
      >
        {{ t("pantry.select") }}
      </button>
      <button
        class="btn-link btn-remove"
        type="button"
        @click="mode = 'confirmingAll'"
      >
        {{ t("pantry.deleteAll") }}
      </button>
    </template>

    <template v-else>
      <button class="btn-link btn-remove" type="button" @click="emit('cancel')">
        {{ t("pantry.cancel") }}
      </button>
      <button
        v-if="mode === 'selecting'"
        class="btn-link btn-remove"
        type="button"
        :disabled="selectedCount === 0"
        @click="emit('deleteSelected')"
      >
        {{ t("pantry.deleteSelected", { count: selectedCount }) }}
      </button>
      <button
        v-else
        class="btn-link btn-remove confirm"
        type="button"
        @click="emit('deleteAll')"
      >
        {{ t("pantry.confirmAll", { count: total }) }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* The last step before everything is removed, so it stands out. */
.confirm {
  border-color: var(--color-warn-text);
  background: var(--color-warn-bg);
  color: var(--color-warn-text);
}
</style>
