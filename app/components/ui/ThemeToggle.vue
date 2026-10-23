<script setup lang="ts">
type Theme = "light" | "dark";

const { t } = useLang();

// null means "no choice yet", so the system setting decides (see main.css).
const saved = useCookie<Theme | null>("theme", {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
});

// The server cannot know the system setting, so we read it in the browser.
const systemDark = ref(false);

onMounted(() => {
  systemDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
});

const isDark = computed(() =>
  saved.value ? saved.value === "dark" : systemDark.value,
);

function toggle() {
  saved.value = isDark.value ? "light" : "dark";
}

// Sets <html data-theme="..."> so the variables in main.css switch.
useHead({
  htmlAttrs: { "data-theme": () => saved.value ?? undefined },
});
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="isDark ? t('theme.toLight') : t('theme.toDark')"
    @click="toggle"
  >
    <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" size="1.25rem" />
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
