// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', 'nuxt-auth-utils'],

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-27',

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  runtimeConfig: {
    databaseURL: process.env.DATABASE_URL,
  },

  css: ['~/assets/css/main.css'],
});
