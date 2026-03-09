import { test, expect } from '@playwright/test';

test.describe('not login approvals new page redirect', () => {
  test('未ログイン時はログイン画面へリダイレクトされる', async ({ page }) => {
    await page.goto('/approvals/new');

    await expect(page).toHaveURL('/login');
  });
});

// test.describe('approvals new page', () => {
//   test('キャンセル押下でホームへ戻る', async ({ page }) => {
//     await page.goto('/approvals/new');
//
//     await expect(page).toHaveURL(/\/approvals\/new$/);
//
//     await page.getByRole('button', { name: 'キャンセル' }).click();
//
//     await expect(page).toHaveURL('/');
//   });
// });
