import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite",
  // vite-plugin-pwa (configured in the app's own vite.config.ts, which
  // Storybook otherwise reuses as-is) tries to generate a service-worker
  // precache manifest for whatever it's building — including Storybook's
  // own static output, where it chokes on Storybook's manager runtime
  // bundle (~3.3MB, over Workbox's 2MB default precache limit) and fails
  // the whole `storybook build`. Storybook's docs site was never meant to
  // be an installable/offline PWA, so the plugin (and everything it
  // returns — it's an array of several sub-plugins) is stripped out here
  // rather than tuning Workbox's limits to accommodate a bundle that
  // shouldn't be precached in the first place. The actual app build
  // (`vite build`) is untouched — it doesn't go through this config.
  async viteFinal(viteConfig) {
    const isPwaPlugin = (plugin: unknown): boolean =>
      typeof plugin === 'object' &&
      plugin !== null &&
      'name' in plugin &&
      typeof (plugin as { name: unknown }).name === 'string' &&
      (plugin as { name: string }).name.startsWith('vite-plugin-pwa');

    viteConfig.plugins = (viteConfig.plugins ?? []).filter((entry) => {
      const group = Array.isArray(entry) ? entry : [entry];
      return !group.some(isPwaPlugin);
    });
    return viteConfig;
  },
};
export default config;