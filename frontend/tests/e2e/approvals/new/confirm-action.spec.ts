import { test, expect } from '@playwright/test';
import {
  fillApprovalNewForm,
  expectApprovalNewFormValues,
  expectApprovalConfirmValues,
} from '../../helpers/approval-form';

test.describe('購買新規入力画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('必要な入力項目を入力し、確認画面へ正常に遷移できる', async ({ page }) => {
    await page.goto('/approvals/new');

    await fillApprovalNewForm(page);

    await page.getByRole('button', { name: '確認' }).click();

    await expect(page).toHaveURL(/\/approvals\/new\/confirm$/);

    await expectApprovalConfirmValues(page);
  });

  test('キャンセルボタン押下時、formData(atom)をクリアしてホーム画面へ正常に遷移できる', async ({ page }) => {
    await page.goto('/approvals/new');

    await fillApprovalNewForm(page);

    await page.getByRole('button', { name: 'キャンセル' }).click();

    await expect(page).toHaveURL('/');

    // 再度入力画面へ遷移し、atom がクリアされていることを確認
    await page.goto('/approvals/new');

    await expect(page.getByRole('textbox', { name: 'タイトル' })).toHaveValue('');
    await expect(page.getByRole('combobox', { name: '購買種別' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: '購入金額' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: '申請理由' })).toHaveValue('');

    // select の初期値は実装次第なので必要なら確認
    // await expect(page.getByRole('combobox', { name: '購買種別' })).toHaveValue('');
  });

  test('確認画面から入力画面へ戻った場合、formData が保持されている', async ({ page }) => {
    await page.goto('/approvals/new');

    await fillApprovalNewForm(page);

    await page.getByRole('button', { name: '確認' }).click();
    await expect(page).toHaveURL(/\/approvals\/new\/confirm$/);

    await page.getByRole('button', { name: '入力画面へ戻る' }).click();
    await expect(page).toHaveURL(/\/approvals\/new$/);

    await expectApprovalNewFormValues(page);
  });
});
