import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // 允许开发环境验证 PWA
      },
      manifest: {
        name: '汉字赛车总动员',
        short_name: '汉字赛车',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6b21a8',
        icons: [],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // 音频文件缓存：优先使用缓存，网络更新
            urlPattern: /\/audio\/characters\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'character-audio',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
              },
            },
          },
          {
            // 其余静态资源
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'font' ||
              request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 天
              },
            },
          },
        ],
      },
    }),
    // 构建体积分析：仅当 ANALYZE=1 时启用
    (process.env.ANALYZE === '1' ? visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }) : undefined) as any,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // 允许局域网访问（手机测试）
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'audio-vendor': ['howler'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
  },
})

