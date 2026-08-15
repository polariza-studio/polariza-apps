/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { VitePWA } from 'vite-plugin-pwa';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({
  mode
}) => ({
  base: mode === 'production' ? '/polariza-apps/setup/' : '/',
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    // Icons/splash are generated at build time from the brand mark
    // (public/favicon.png) — no separate icon asset to maintain. The
    // generator's defaults shrink maskable/apple icons to 70% on a white
    // pad (meant for logos with breathing room); our mark is already a
    // full-bleed lime square, so padding is disabled and the fallback
    // fill matches its background instead of the default white.
    pwaAssets: {
      image: 'public/favicon.png',
      preset: {
        transparent: { sizes: [64, 192, 512], favicons: [[48, 'favicon.ico']] },
        maskable: { sizes: [512], padding: 0, resizeOptions: { background: '#BFF753' } },
        apple: { sizes: [180], padding: 0, resizeOptions: { background: '#BFF753' } }
      }
    },
    manifest: {
      name: 'SetUp',
      short_name: 'SetUp',
      description: 'Plan, organize and track your workouts',
      theme_color: '#294000',
      background_color: '#CEFB83',
      display: 'standalone'
    }
  })],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }, {
      extends: true,
      test: {
        name: 'unit',
        environment: 'node',
        include: ['src/**/*.test.ts']
      }
    }]
  }
}));