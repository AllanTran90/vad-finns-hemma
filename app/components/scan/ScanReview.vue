<script setup lang="ts">
import { MAX_INGREDIENT_LENGTH } from "#shared/limits";

// The list after a scan, where the user can fix, add and remove rows before
// saving. The scan result lives in useImageScan (shared state), so this
// component reads it directly instead of getting it as props.
const props = defineProps<{
  // Checks if a name is already in the pantry. Comes from the parent so the
  // rule lives in one place.
  isKnown: (name: string) => boolean;
}>();

const emit = defineEmits<{
  confirm: [names: string[]];
  discard: [];
}>();

const { t } = useLang();
const { detected, items, knownItems } = useImageScan();

const newItem = ref("");

// Rows that are empty or already in the pantry will not be saved.
const newCount = computed(
  () =>
    items.value.filter((name) => name.trim() && !props.isKnown(name)).length,
);

function addItem() {
  const name = newItem.value.trim();

  if (!name) {
    return;
  }

  // Already in the pantry: nothing to add.
  if (!props.isKnown(name)) {
    items.value.push(name);
  }

  newItem.value = "";
}

function removeItem(index: number) {
  items.value.splice(index, 1);
}

function confirm() {
  const names = items.value.map((name) => name.trim()).filter(Boolean);

  emit("confirm", names);
}
</script>

<template>
  <div class="review">
    <h3>{{ t("scan.review") }}</h3>
    <p v-if="detected.length === 0" class="muted">
      {{ t("scan.nothing") }}
    </p>

    <p v-else-if="items.length === 0" class="muted">
      {{ t("scan.nothingNew") }}
    </p>

    <h4 v-if="items.length">{{ t("scan.newTitle", { count: newCount }) }}</h4>
    <ul v-if="items.length" class="rows">
      <li v-for="(_, index) in items" :key="index">
        <input
          v-model="items[index]"
          type="text"
          :maxlength="MAX_INGREDIENT_LENGTH"
          :aria-label="t('scan.ingredientN', { n: index + 1 })"
        />
        <button
          class="btn-link btn-remove"
          type="button"
          @click="removeItem(index)"
        >
          {{ t("scan.remove") }}
        </button>
      </li>
    </ul>

    <form class="add-row" @submit.prevent="addItem">
      <input
        v-model="newItem"
        type="text"
        :maxlength="MAX_INGREDIENT_LENGTH"
        :placeholder="t('scan.addPlaceholder')"
      />
      <button class="btn-link" type="submit">
        {{ t("scan.add") }}
      </button>
    </form>

    <div v-if="knownItems.length">
      <h4>{{ t("scan.knownTitle", { count: knownItems.length }) }}</h4>
      <ul class="known-list">
        <li v-for="(name, index) in knownItems" :key="index">{{ name }}</li>
      </ul>
    </div>

    <div class="actions">
      <button
        class="btn"
        type="button"
        :disabled="newCount === 0"
        @click="confirm"
      >
        {{ t("scan.confirm", { count: newCount }) }}
      </button>
      <button class="btn-link" type="button" @click="emit('discard')">
        {{ t("scan.discard") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.review {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.review h3 {
  margin: 0;
  font-size: 1rem;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.review h4 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.known-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.known-list li {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  font-size: 0.8125rem;
}

.rows li,
.add-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rows input,
.add-row input {
  flex: 1;
  min-width: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
