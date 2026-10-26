<script setup lang="ts">
const props = defineProps<{
  options: { value: string; label: string }[];
  selected: string[];
  // true: many pills can be selected (checkboxes). false: only one (radio buttons).
  multiple?: boolean;
  // Colour of the selected pills.
  tone?: "primary" | "warn";
}>();

const emit = defineEmits<{
  change: [values: string[]];
}>();

// Radio buttons need the same name to work as one group.
const groupName = useId();

function choose(value: string) {
  if (!props.multiple) {
    emit("change", [value]);
    return;
  }

  // Adds the value if it is not selected, removes it if it is.
  const next = props.selected.includes(value)
    ? props.selected.filter((name) => name !== value)
    : [...props.selected, value];

  emit("change", next);
}
</script>

<template>
  <div class="pills" :class="tone ?? 'primary'">
    <label
      v-for="option in options"
      :key="option.value"
      class="pill"
      :class="{ selected: selected.includes(option.value) }"
    >
      <input
        :type="multiple ? 'checkbox' : 'radio'"
        :name="groupName"
        :checked="selected.includes(option.value)"
        @change="choose(option.value)"
      />
      {{ option.label }}
    </label>
  </div>
</template>

<style scoped>
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-bg);
  font-size: 0.875rem;
  cursor: pointer;
}

.primary .pill.selected {
  border-color: var(--color-select-border);
  background: var(--color-select-bg);
  font-weight: 600;
}

.warn .pill.selected {
  border-color: var(--color-warn-text);
  background: var(--color-warn-bg);
  color: var(--color-warn-text);
  font-weight: 600;
}

/* The real input is hidden; the whole pill acts as the checkbox or radio button. */
.pill input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
}

.pill:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
