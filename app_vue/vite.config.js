import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/stylesheets/fonts";
          @import "@/assets/stylesheets/variables";
          @import "@/assets/stylesheets/mixins";
          @import "@/assets/stylesheets/functions";
        `
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: ['vuetify']
    }
  }
});
