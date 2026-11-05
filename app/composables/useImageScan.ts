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
  const context = canvas.getContext("2d");
  if (!context) {
    // Without this we would send a black image to Claude and use up a call for nothing.
    throw new Error("Could not draw the photo");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
}

export function useImageScan() {
  const { lang, t } = useLang();
  // useState keeps the scan when the user changes page, even during a running
  // request. A scan costs an AI call, so an unconfirmed list should not be lost.
  const detected = useState<string[]>("scan-detected", () => []);
  const loading = useState("scan-loading", () => false);
  const errorMessage = useState("scan-error", () => "");
  // The list the user edits: only the NEW ingredients. It is a copy of what the AI
  // found, so the user's corrections never touch the AI's original answer.
  const items = useState<string[]>("scan-items", () => []);
  // What the photo showed that is already in the pantry. Read only.
  const knownItems = useState<string[]>("scan-known-items", () => []);
  const scanned = useState("scan-scanned", () => false);
  // The button that started the scan, so only that one says "Reading".
  const activeSource = useState("scan-active-source", () => "");

  function resetScan() {
    detected.value = [];
    errorMessage.value = "";
    items.value = [];
    knownItems.value = [];
    scanned.value = false;
  }

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

  return {
    detected,
    loading,
    errorMessage,
    items,
    knownItems,
    scanned,
    activeSource,
    scanPhoto,
    resetScan,
  };
}
