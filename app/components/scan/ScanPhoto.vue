<script setup lang="ts">
// The photo scan, put together from two parts: ScanSources (the photo buttons)
// and ScanReview (the list to fix). This component runs the scan and decides
// which detected names are new and which are already in the pantry.
const props = defineProps<{
  // Names already in the pantry, used to mark rows that are not new.
  existing: string[];
}>();

const emit = defineEmits<{
  confirm: [names: string[]];
}>();

const {
  detected,
  loading,
  errorMessage,
  items,
  knownItems,
  scanned,
  activeSource,
  scanPhoto,
  resetScan,
} = useImageScan();

const existingNames = computed(
  () => new Set(props.existing.map((name) => name.trim().toLowerCase())),
);

function isKnown(name: string) {
  return existingNames.value.has(name.trim().toLowerCase());
}

async function onPick(file: File, sourceLabel: string) {
  activeSource.value = sourceLabel;
  await scanPhoto(file);

  if (errorMessage.value) {
    return;
  }

  items.value = detected.value.filter((name) => !isKnown(name));
  knownItems.value = detected.value.filter(isKnown);
  scanned.value = true;
}

function confirm(names: string[]) {
  emit("confirm", names);
  resetScan();
}
</script>

<template>
  <div class="scan">
    <ScanSources
      :loading="loading"
      :active-source="activeSource"
      @pick="onPick"
    />

    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>

    <ScanReview
      v-if="scanned"
      :is-known="isKnown"
      @confirm="confirm"
      @discard="resetScan"
    />
  </div>
</template>

<style scoped>
.scan {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
