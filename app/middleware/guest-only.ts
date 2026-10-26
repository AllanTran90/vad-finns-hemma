// For /login and /signup: someone who is already logged in goes to the start page.
// A guest (anonymous user) may stay, because they need these pages to log in
// to a real account.
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();

  if (user.value && !user.value.is_anonymous) {
    return navigateTo("/");
  }
});
