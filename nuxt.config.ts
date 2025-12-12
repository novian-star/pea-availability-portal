// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', 'nuxt-auth-utils', '@vueuse/nuxt'],

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
    statisticsSheetId: process.env.STATISTICS_SHEET_ID,
    equipmentsSheetId: process.env.EQUIPMENTS_SHEET_ID,
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleGenAiApiKey: process.env.GOOGLE_GEN_AI_API_KEY,
    frtuSheetId: process.env.FRTU_SHEET_ID,
    substationSheetId: process.env.SUBSTATION_SHEET_ID,
    allowedOrigins: process.env.ALLOWED_ORIGINS,

    public: {
      bannerMessage: process.env.BANNER_MESSAGE,
      bannerType: process.env.BANNER_TYPE,
    },
  },

  css: ['~/assets/css/main.css'],
});
