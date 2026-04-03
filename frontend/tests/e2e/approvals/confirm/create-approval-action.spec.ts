import { test, expect } from '@playwright/test';
import { fillApprovalNewForm, expectApprovalConfirmValues, approvalFormData } from '../../helpers/approval-form';
import { formatNumberWithComma } from '@/shared';

test.describe('購買新規申請確認画面: 申請実行', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('正常に申請データを登録し、ホーム画面へ遷移して toast が表示される', async ({ page }) => {
    await page.goto('/approvals/new');

    await fillApprovalNewForm(page);
    await page.getByRole('button', { name: '確認' }).click();

    await expect(page).toHaveURL(/\/approvals\/new\/confirm$/);
    await expectApprovalConfirmValues(page);

    const createApprovalResponsePromise = page.waitForResponse((response) => {
      return response.url().includes('/api/approvals/confirm') && response.ok();
    });

    await page.getByRole('button', { name: '申請' }).click();

    await createApprovalResponsePromise;

    await expect(page).toHaveURL('/');

    await expect(page.getByText('申請を作成しました')).toBeVisible();

    // NOTE: 一覧作成後に有効化予定
    // await expect(page.getByText(approvalFormData.title)).toBeVisible();
  });

  test('入力画面へ戻るボタン押下時、入力画面へ遷移し formData が保持されている', async ({ page }) => {
    await page.goto('/approvals/new');

    await fillApprovalNewForm(page);
    await page.getByRole('button', { name: '確認' }).click();

    await expect(page).toHaveURL(/\/approvals\/new\/confirm$/);

    await page.getByRole('button', { name: '入力画面へ戻る' }).click();

    await expect(page).toHaveURL(/\/approvals\/new$/);

    await expect(page.getByRole('textbox', { name: 'タイトル' })).toHaveValue(approvalFormData.title);
    await expect(page.getByRole('combobox', { name: '購買種別' })).toHaveValue(approvalFormData.purchase_type);
    await expect(page.getByRole('textbox', { name: '購入金額' })).toHaveValue(
      formatNumberWithComma(approvalFormData.amount),
    );
    await expect(page.getByRole('textbox', { name: '申請理由' })).toHaveValue(approvalFormData.reason);
  });
});
