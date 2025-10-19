// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: isCI ? 'npm run preview' : 'npm run dev',
    port: 4321,
    reuseExistingServer: !isCI,
    timeout: 120_000,
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
