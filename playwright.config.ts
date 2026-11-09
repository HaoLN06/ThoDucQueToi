import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 2,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { baseURL: 'http://127.0.0.1:4173/ThoDucQueToi/', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173/ThoDucQueToi/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
