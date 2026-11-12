<script setup lang="ts">
// Shows the tips and the two photo buttons. It only picks a file and sends it
// up to the parent; the parent does the scanning.
defineProps<{
  loading: boolean;
  activeSource: string;
}>();

const emit = defineEmits<{
  pick: [file: File, sourceLabel: string];
}>();

const { t } = useLang();

// Two ways to get a photo. "capture" opens the back camera directly on a phone;
// without it the phone shows its normal photo picker. On a computer, both just
// open a file dialog.
const sources = [
  { label: "scan.camera", capture: "environment" },
  { label: "scan.gallery", capture: undefined },
] as const;

function onFileChange(event: Event, sourceLabel: string) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  // Clear the input so picking the same photo again still fires "change".
  input.value = "";

  if (file) {
    emit("pick", file, sourceLabel);
  }
}
</script>

<template>
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
      {{
        loading && activeSource === source.label
          ? t("scan.reading")
          : t(source.label)
      }}
      <input
        class="file-input"
        type="file"
        accept="image/*"
        :capture="source.capture"
        :disabled="loading"
        @change="onFileChange($event, source.label)"
      />
    </label>
  </div>
</template>

<style scoped>
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
</style>
