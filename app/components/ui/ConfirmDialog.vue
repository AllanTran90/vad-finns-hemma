<script setup lang="ts">
const { t } = useLang();
const { message, answer } = useConfirm();
const dialog = ref<HTMLDialogElement | null>(null);

// <dialog> with showModal() gives us a lot for free: it sits on top of the page,
// the page behind cannot be clicked, focus stays inside and Esc closes it.
watch(message, (text) => {
  if (text) dialog.value?.showModal();
  else dialog.value?.close();
});
</script>

<template>
  <!-- @cancel is the Esc key. We handle it ourselves, so it counts as "Cancel". -->
  <dialog
    ref="dialog"
    class="confirm"
    aria-labelledby="confirm-text"
    @cancel.prevent="answer(false)"
  >
    <p id="confirm-text">{{ message }}</p>
    <div class="actions">
      <!-- autofocus on Cancel: the safe choice is the default one. -->
      <button class="btn-link" type="button" autofocus @click="answer(false)">
        {{ t("confirm.cancel") }}
      </button>
      <button class="btn" type="button" @click="answer(true)">
        {{ t("confirm.ok") }}
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.confirm {
  width: min(24rem, calc(100% - 2rem));
  padding: 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-surface);
  color: var(--color-text);
}

/* The dark layer behind the dialog. */
.confirm::backdrop {
  background: rgb(0 0 0 / 0.5);
}

.confirm p {
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
