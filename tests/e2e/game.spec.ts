import { expect, test } from '@playwright/test';

const saveKey = 'tho-duc-time-journey:save';
const makeSave = (overrides: Record<string, unknown> = {}) => ({
  schemaVersion: 2,
  player: { mapId: 'tho_duc_geographic_v1', x: 519, y: 1060 },
  activeEra: 'present',
  quest: { guideSpoken: true, visitedLocations: [], portalUsed: false, completed: false },
  discoveredLocations: [],
  started: true,
  navigationTarget: null,
  ...overrides,
});

test('mở trang và bắt đầu một phiên chơi', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /Thọ Đức/ })).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu khám phá' }).click();
  await expect(page.getByLabel('Bản đồ địa lý Thọ Đức')).toBeVisible();
  await expect(page.getByText(/Bản đồ địa lý khái quát/)).toBeVisible();
  await expect(page.getByLabel('Bản đồ Thọ Đức')).toBeVisible();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('canvas')).toBeVisible();
});

test('minimap chọn điểm đến và hiển thị khoảng cách', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Bắt đầu khám phá' }).click();
  const mapPanel = page.getByLabel('Bản đồ Thọ Đức');
  const toggle = mapPanel.getByRole('button', { name: /Bản đồ/ });
  if (await toggle.isVisible()) await toggle.click();
  await mapPanel.getByRole('button', { name: 'Đền Can Vang' }).click();
  await expect(mapPanel.getByText(/m theo tỷ lệ bản đồ/)).toBeVisible();
});

test('mở bảng thông tin di sản và giữ tiến trình sau tải lại', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: saveKey, value: makeSave() });
  await page.reload();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('button', { name: /Khám phá/ })).toBeVisible();
  await page.getByRole('button', { name: /Khám phá/ }).click();
  await expect(page.getByRole('heading', { name: 'Đình Thọ Đức' })).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục khám phá' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: /Nhật ký/ }).click();
  await expect(page.getByText('Đã khám phá:')).toBeVisible();
  await expect(page.locator('.journal-summary')).toContainText('1/3');
});

test('cổng đã mở cho phép đổi cảnh nhiều lần', async ({ page }) => {
  const completedSave = makeSave({
    quest: { guideSpoken: true, visitedLocations: ['dinh_tho_duc', 'den_can_vang', 'chua_thap_linh'], portalUsed: false, completed: false },
    discoveredLocations: ['dinh_tho_duc', 'den_can_vang', 'chua_thap_linh'],
  });
  await page.goto('./');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: saveKey, value: completedSave });
  await page.reload();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  const timeline = page.getByRole('button', { name: 'Chuyển đổi thời kỳ' });
  await timeline.click();
  await expect(page.locator('.game-shell')).toHaveClass(/era-ly_1077/);
  await timeline.click();
  await expect(page.locator('.game-shell')).toHaveClass(/era-present/);
});
