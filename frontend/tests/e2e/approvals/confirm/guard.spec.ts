import { test, expect } from '@playwright/test';

test.describe('購買新規申請確認画面: guard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('入力画面で formData を入力せず直接確認画面へアクセスした場合、入力画面へリダイレクトされる', async ({
    page,
  }) => {
    await page.goto('/approvals/new/confirm');

    await expect(page).toHaveURL(/\/approvals\/new$/);

    await expect(page.getByText('入力項目を入力してください')).toBeVisible();
  });
});
