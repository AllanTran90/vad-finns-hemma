// Our own version of window.confirm(), in the app's style and language.
// Usage: if (!(await confirm(t("..."))) return;
//
// The question lives in useState, so the one ConfirmDialog in app.vue can show it.
// The answer comes back through a Promise: confirm() hands out a "ticket" (the
// Promise), and the dialog calls `resolve` with true or false when a button is pressed.
let resolve: ((answer: boolean) => void) | null = null;
// A plain variable, not useState, since a function cannot be sent from server to
// browser. That is safe here: confirm() only runs after a click, so in the browser.

export function useConfirm() {
  const message = useState<string>("confirm-message", () => "");

  function confirm(text: string) {
    message.value = text;
    return new Promise<boolean>((r) => {
      resolve = r;
    });
  }

  function answer(value: boolean) {
    message.value = "";
    resolve?.(value);
    resolve = null;
  }

  return { message, confirm, answer };
}
