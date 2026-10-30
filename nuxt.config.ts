// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxt/icon/module"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  supabase: {
    redirect: false,
    types: false,
  },
  runtimeConfig: {
    anthropicApiKey: "",
  },
  // Security headers on every page and API answer.
  // DENY: no other site can show our app in a frame (stops clickjacking).
  // nosniff: the browser must trust the content type we send.
  // Referrer-Policy: only our own site sees the full address when a user leaves.
  routeRules: {
    "/**": {
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
  },
});
