import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run dev',
    port: 4321,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-es',
      use: { ...devices['Desktop Chrome'], locale: 'es-ES' },
      metadata: { localeSlug: 'es' },
    },
    {
      name: 'chromium-en',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
      metadata: { localeSlug: 'en' },
    },
  ],
});
