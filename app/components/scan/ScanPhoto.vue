<script setup lang="ts">
const props = defineProps<{
  // Names already in the pantry, used to mark rows that are not new.
  existing: string[];
}>();

const { t } = useLang();

const emit = defineEmits<{
  confirm: [names: string[]];
}>();

const { detected, loading, errorMessage, scanPhoto } = useImageScan();

// The list the user edits: only the NEW ingredients. It is a copy of what the AI
// found, so the user's corrections never touch the AI's original answer.
const items = ref<string[]>([]);
// What the photo showed that is already in the pantry. Read only.
const knownItems = ref<string[]>([]);
const newItem = ref("");
const scanned = ref(false);

// Two ways to get a photo. "capture" opens the back camera directly on a phone;
// without it the phone shows its normal photo picker. On a computer, both just
// open a file dialog.
const sources = [
  { label: "scan.camera", capture: "environment" },
  { label: "scan.gallery", capture: undefined },
] as const;

const existingNames = computed(
  () => new Set(props.existing.map((name) => name.trim().toLowerCase())),
);

function isKnown(name: string) {
  return existingNames.value.has(name.trim().toLowerCase());
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  await scanPhoto(file);

  // Clear the input so picking the same photo again still fires "change".
  input.value = "";

  if (errorMessage.value) {
    return;
  }

  items.value = detected.value.filter((name) => !isKnown(name));
  knownItems.value = detected.value.filter(isKnown);
  scanned.value = true;
}

// Rows that are empty or already in the pantry will not be saved.
const newCount = computed(
  () => items.value.filter((name) => name.trim() && !isKnown(name)).length,
);

function addItem() {
  const name = newItem.value.trim();

  if (!name) {
    return;
  }

  // Already in the pantry: nothing to add.
  if (!isKnown(name)) {
    items.value.push(name);
  }

  newItem.value = "";
}

function removeItem(index: number) {
  items.value.splice(index, 1);
}

function reset() {
  items.value = [];
  knownItems.value = [];
  newItem.value = "";
  scanned.value = false;
}

function confirm() {
  const names = items.value.map((name) => name.trim()).filter(Boolean);

  emit("confirm", names);
  reset();
}
</script>

<template>
  <div class="scan">
    <ul class="tips muted">
      <li>{{ t("scan.tip1") }}</li>
      <li>{{ t("scan.tip2") }}</li>
      <li>{{ t("scan.tip3") }}</li>
    </ul>

    <div class="sources">
      <label
        v-for="source in sources"
        :key="source.label"
        class="btn upload"
        :class="{ disabled: loading }"
      >
        {{ loading ? t("scan.reading") : t(source.label) }}
        <input
          class="file-input"
          type="file"
          accept="image/*"
          :capture="source.capture"
          :disabled="loading"
          @change="onFileChange"
        />
      </label>
    </div>

    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>

    <div v-if="scanned" class="review">
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
            :aria-label="t('scan.ingredientN', { n: index + 1 })"
          />
          <button class="btn-link" type="button" @click="removeItem(index)">
            {{ t("scan.remove") }}
          </button>
        </li>
      </ul>

      <form class="add-row" @submit.prevent="addItem">
        <input v-model="newItem" type="text" :placeholder="t('scan.addPlaceholder')" />
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
        <button class="btn-link" type="button" @click="reset">
          {{ t("scan.discard") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scan {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tips {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
}

.sources {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* The real file input is hidden; the label acts as the button. */
.upload {
  position: relative;
  text-align: center;
}

.upload.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
}

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
