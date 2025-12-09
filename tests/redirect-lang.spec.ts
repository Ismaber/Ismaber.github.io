import { test, expect } from '@playwright/test';

test('redirige según idioma del navegador', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(/\/(es|en)(?:\/|$|\?|#)/);

  const { pathname } = new URL(page.url());
  const localeSlug = test.info().project.metadata?.localeSlug as 'es' | 'en';

  expect(pathname).toBe(`/${localeSlug}/`);
});
