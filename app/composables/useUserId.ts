import type { Ref } from "vue";

// The database needs to know who owns a row, so saving needs the user's id.
// No id means the login is gone (expired, or logged out in another tab).
// Shared by every composable that saves, so they all react the same way.
export function useUserId() {
  const user = useSupabaseUser();
  const { t } = useLang();

  // Returns the id, or shows "please log in again" in `errorMessage` and
  // returns null, so the caller can simply stop: if (!userId) return;
  function getUserIdOrError(errorMessage: Ref<string>) {
    const userId = user.value?.sub;

    if (!userId) {
      errorMessage.value = t("error.sessionExpired");
      return null;
    }

    return userId;
  }

  return { getUserIdOrError };
}
