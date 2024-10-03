// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  runtimeConfig: {
    secret: process.env.SECRET,
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  modules: ['nitro-cloudflare-dev', '@prisma/nuxt'],

  prisma: {
    installStudio: false,
  },
})
