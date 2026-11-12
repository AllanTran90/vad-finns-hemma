<script setup lang="ts">
const props = defineProps<{
  ingredients: { id: string; name: string }[];
}>();
const { t } = useLang();

const emit = defineEmits<{
  delete: [id: string];
  deleteMany: [ids: string[]];
}>();

// The list is in one mode at a time, so two modes can never be active together.
const mode = ref<"normal" | "selecting" | "confirmingAll">("normal");
const selectedIds = ref<string[]>([]);

function backToNormal() {
  mode.value = "normal";
  selectedIds.value = [];
}

function deleteSelected() {
  emit("deleteMany", selectedIds.value);
  backToNormal();
}

function deleteAll() {
  emit(
    "deleteMany",
    props.ingredients.map((ingredient) => ingredient.id),
  );
  backToNormal();
}
</script>
<template>
  <div v-if="ingredients.length">
    <ul class="list">
      <li v-for="ingredient in ingredients" :key="ingredient.id">
        <label v-if="mode === 'selecting'" class="pick">
          <input v-model="selectedIds" type="checkbox" :value="ingredient.id" />
          {{ ingredient.name }}
        </label>
        <template v-else>
          <span>{{ ingredient.name }}</span>
          <button
            class="btn-link btn-remove"
            type="button"
            @click="emit('delete', ingredient.id)"
          >
            {{ t("pantry.delete") }}
          </button>
        </template>
      </li>
    </ul>

    <PantryActions
      v-model="mode"
      :selected-count="selectedIds.length"
      :total="ingredients.length"
      @cancel="backToNormal"
      @delete-selected="deleteSelected"
      @delete-all="deleteAll"
    />
  </div>
  <p v-else class="muted">{{ t("pantry.empty") }}</p>
</template>

<style scoped>
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-surface);
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem 0.25rem 1rem;
}

li + li {
  border-top: 1px solid var(--color-line);
}

/* The whole row can be tapped, and it is as high as the Delete button (44 px). */
.pick {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  cursor: pointer;
}

/* main.css makes every input full width, which a checkbox must not be. */
.pick input {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  accent-color: var(--color-primary);
}
</style>
