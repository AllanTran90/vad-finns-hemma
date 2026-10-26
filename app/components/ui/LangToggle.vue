<script setup lang="ts">
const { lang, t, setLang } = useLang();

// Sets <html lang="..."> so screen readers use the right voice.
useHead({ htmlAttrs: { lang: () => lang.value } });
</script>

<template>
  <button
    class="lang-toggle"
    type="button"
    :aria-label="t('lang.switchTo')"
    @click="setLang(lang === 'en' ? 'sv' : 'en')"
  >
    {{ lang === "en" ? "SV" : "EN" }}
  </button>
</template>

<style scoped>
/* Sits to the left of the theme button (1rem + 2.75rem + 0.5rem). */
.lang-toggle {
  position: absolute;
  top: 1rem;
  right: 4.25rem;
  z-index: 10;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.lang-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
