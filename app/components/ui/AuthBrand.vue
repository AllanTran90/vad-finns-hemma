<script setup lang="ts">
// The logo at the top of the login and signup pages: the chef's hat, the app
// name and the tagline. Only HTML and CSS, no logic.
const { t } = useLang();
</script>

<template>
  <div class="brand">
    <span class="brand-icon">
      <Icon name="lucide:chef-hat" size="2rem" />
    </span>
    <p class="brand-name">Vad finns hemma?</p>
    <p class="muted">{{ t("auth.tagline") }}</p>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.brand-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.brand .muted {
  margin: 0;
}
</style>
