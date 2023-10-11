import { fileURLToPath, URL } from 'node:url';
import svgLoader from 'vite-svg-loader';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [vue(), vuetify({ autoImport: true, styles: { configFile: 'src/assets/stylesheets/_vuetify.scss' } }), svgLoader()],
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
