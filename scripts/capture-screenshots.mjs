import { chromium, devices } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:4173/tho-duc-time-journey/';
const saveKey = 'tho-duc-time-journey:save';
const demoSave = {
  schemaVersion: 1,
  player: { mapId: 'placeholder_village', x: 430, y: 270 },
  activeEra: 'present',
  quest: { guideSpoken: true, visitedLocations: ['den_can_vang'], portalUsed: false, completed: false },
  discoveredLocations: ['den_can_vang'],
  started: true,
};

const browser = await chromium.launch();

async function capture(contextOptions, output) {
  const context = await browser.newContext({ ...contextOptions, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.evaluate(({ key, value }) => globalThis.localStorage.setItem(key, JSON.stringify(value)), { key: saveKey, value: demoSave });
  await page.reload();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: output, fullPage: false });
  await context.close();
}

await capture({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, 'docs/screenshots/desktop-game.png');
await capture({ ...devices['Pixel 7'], deviceScaleFactor: 1 }, 'docs/screenshots/mobile-game.png');
await browser.close();
