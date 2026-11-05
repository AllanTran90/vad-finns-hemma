<script setup lang="ts">
const { t } = useLang();
const user = useSupabaseUser();
const route = useRoute();

const links = [
  { to: "/", label: "nav.ingredients", icon: "lucide:carrot" },
  { to: "/recipes", label: "nav.recipes", icon: "lucide:chef-hat" },
  { to: "/saved", label: "nav.saved", icon: "lucide:bookmark" },
] as const;

// A guest counts as logged in but can visit /login and /signup, so we check the page too.
const visible = computed(
  () => user.value && !["/login", "/signup"].includes(route.path),
);
</script>

<template>
  <nav v-if="visible" class="bottom-nav" :aria-label="t('nav.label')">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="nav-link"
    >
      <Icon :name="link.icon" size="1.5rem" />
      {{ t(link.label) }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  /* fixed: the menu stays at the bottom of the screen when you scroll. */
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  border-top: 1px solid var(--color-line);
  background: var(--color-surface);
  /* Keeps the links above the home bar on newer phones. */
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-link {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  min-height: 3.5rem;
  color: var(--color-muted);
  font-size: 0.75rem;
  text-decoration: none;
}

/* Vue Router adds this class to the link for the page you are on. */
.nav-link.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 600;
}

.nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
</style>
