import type { DetectedIngredients } from "#shared/schemas/detectedIngredients";

const MAX_SIZE = 1568;

// Shrinks the photo in the browser and returns it as base64 (without the
// "data:image/jpeg;base64," prefix). Phone photos are too big to send as is.
async function resizeToBase64(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
}

export function useImageScan() {
  const { lang, t } = useLang();
  const detected = ref<string[]>([]);
  const loading = ref(false);
  const errorMessage = ref("");

  async function scanPhoto(file: File) {
    errorMessage.value = "";
    detected.value = [];
    loading.value = true;

    try {
      const image = await resizeToBase64(file);
      const result = await $fetch<DetectedIngredients>("/api/analyze-image", {
        method: "POST",
        body: { image, mediaType: "image/jpeg", lang: lang.value },
      });
      detected.value = result.ingredients;
    } catch (error) {
      console.log("Scan photo error:", error);
      errorMessage.value = t(apiErrorKey(error, "scan.error"));
    } finally {
      loading.value = false;
    }
  }

  return { detected, loading, errorMessage, scanPhoto };
}
