// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxt/icon/module"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  supabase: {
    redirect: false,
    types: false,
  },
  runtimeConfig: {
    anthropicApiKey: "",
  },
});
