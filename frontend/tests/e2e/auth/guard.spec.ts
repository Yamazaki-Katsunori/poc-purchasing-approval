import { test, expect } from '@playwright/test';

test.describe('auth guard', () => {
  test('未ログインでホームにアクセスするとログイン画面へリダイレクトされる', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });

  test('未ログインで申請作成画面にアクセスするとログイン画面へリダイレクトされる', async ({ page }) => {
    await page.goto('/approvals/new');

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });

  test('ログアウト後は保護画面にアクセスできない', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('applicant@example.com');
    await page.getByLabel(/パスワード/i).fill('password');
    await page.getByRole('button', { name: /ログイン/i }).click();

    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: /ログアウト/i }).click();

    await expect(page).toHaveURL('/login');

    await page.goto('/approvals/new');
    await expect(page).toHaveURL('/login');
  });
});
