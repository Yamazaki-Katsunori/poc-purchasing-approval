import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/approvals-user.json';

setup('authenticate for approvals e2e', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('textbox', { name: 'メールアドレス' }).fill('approver@example.com');
  await page.getByRole('textbox', { name: 'パスワード' }).fill('password');

  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL('/');

  await page.context().storageState({ path: authFile });
});
