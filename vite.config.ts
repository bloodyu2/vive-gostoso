import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        name: 'Vive Gostoso',
        short_name: 'Vive Gostoso',
        description: 'A infraestrutura digital de São Miguel do Gostoso, RN. A cidade online.',
        theme_color: '#0D7C7C',
        background_color: '#F5F2EE',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        dir: 'ltr',
        orientation: 'portrait-primary',
        categories: ['travel', 'local', 'community'],
        icons: [
          { src: '/icons/pwa/icon-16.png',   sizes: '16x16',   type: 'image/png' },
          { src: '/icons/pwa/icon-32.png',   sizes: '32x32',   type: 'image/png' },
          { src: '/icons/pwa/icon-48.png',   sizes: '48x48',   type: 'image/png' },
          { src: '/icons/pwa/icon-72.png',   sizes: '72x72',   type: 'image/png' },
          { src: '/icons/pwa/icon-96.png',   sizes: '96x96',   type: 'image/png' },
          { src: '/icons/pwa/icon-128.png',  sizes: '128x128', type: 'image/png' },
          { src: '/icons/pwa/icon-144.png',  sizes: '144x144', type: 'image/png' },
          { src: '/icons/pwa/icon-152.png',  sizes: '152x152', type: 'image/png' },
          { src: '/icons/pwa/icon-180.png',  sizes: '180x180', type: 'image/png' },
          { src: '/icons/pwa/icon-192.png',  sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa/icon-512.png',  sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'COME.',
            short_name: 'COME',
            description: 'Restaurantes e gastronomia',
            url: '/come',
            icons: [{ src: '/icons/pwa/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'FIQUE.',
            short_name: 'FIQUE',
            description: 'Pousadas e hospedagem',
            url: '/fique',
            icons: [{ src: '/icons/pwa/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'EXPLORE.',
            short_name: 'EXPLORE',
            description: 'Mapa interativo',
            url: '/explore',
            icons: [{ src: '/icons/pwa/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'APOIE.',
            short_name: 'APOIE',
            description: 'Fundo público transparente',
            url: '/apoie',
            icons: [{ src: '/icons/pwa/icon-96.png', sizes: '96x96' }],
          },
        ],
        screenshots: [
          {
            src: '/og-image.png',
            sizes: '1200x630',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Vive Gostoso — A cidade online',
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React core
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }

          // Mapbox — muito pesado, só carregado na rota /explore
          if (
            id.includes('node_modules/mapbox-gl') ||
            id.includes('node_modules/react-map-gl') ||
            id.includes('node_modules/supercluster') ||
            id.includes('node_modules/@mapbox')
          ) {
            return 'vendor-mapbox';
          }

          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }

          // TanStack Query
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }

          // i18n
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }

          // Lucide icons
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/lucide')) {
            return 'vendor-icons';
          }

          // Tudo mais → vendor-misc
          return 'vendor-misc';
        },
      },
    },
  },
})
