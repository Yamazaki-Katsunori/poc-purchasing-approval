import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test('ログイン画面が表示される', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/i)).toBeVisible();
    await expect(page.getByLabel(/パスワード/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ログイン/i })).toBeVisible();
  });

  test('正常な視覚情報でログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('applicant@example.com');
    await page.getByLabel(/パスワード/i).fill('password');
    await page.getByRole('button', { name: /ログイン/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /ホーム|ダッシュボード/i })).toBeVisible();
  });

  test('誤ったパスワードではログインできない', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('applicant@example.com');
    await page.getByLabel(/パスワード/i).fill('wrong-password');
    await page.getByRole('button', { name: /ログイン/i }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/ログインに失敗|メールアドレスまたはパスワードが不正/i)).toBeVisible();
  });

  test('誤ったメールアドレスではログインできない', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('wrong-email@example.com');
    await page.getByLabel(/パスワード/i).fill('password');
    await page.getByRole('button', { name: /ログイン/i }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/ログインに失敗|メールアドレスまたはパスワードが不正/i)).toBeVisible();
  });

  test('必須項目未入力ではバリデーションが表示される', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /ログイン/i }).click();

    await expect(page.getByText(/メールアドレスは必須|メールアドレスを入力してください/i)).toBeVisible();
    await expect(page.getByText(/パスワードは必須|パスワードを入力してください/i)).toBeVisible();
  });
});
