import { formatNumberWithComma } from '@/shared';
import { expect, Page } from '@playwright/test';

export const approvalFormData = {
  title: 'Playwright E2E 申請タイトル',
  purchase_type: 'goods',
  amount: '5000',
  reason: 'Playwright から入力した申請理由です',
};

export async function fillApprovalNewForm(page: Page) {
  await page.getByRole('textbox', { name: 'タイトル' }).fill(approvalFormData.title);
  await page.getByRole('combobox', { name: '購買種別' }).selectOption(approvalFormData.purchase_type);
  await page.getByRole('textbox', { name: '購入金額' }).fill(approvalFormData.amount);
  await page.getByRole('textbox', { name: '申請理由' }).fill(approvalFormData.reason);
}

export async function expectApprovalNewFormValues(page: Page) {
  await expect(page.getByRole('textbox', { name: 'タイトル' })).toHaveValue(approvalFormData.title);
  await expect(page.getByRole('combobox', { name: '購買種別' })).toHaveValue(approvalFormData.purchase_type);
  await expect(page.getByRole('textbox', { name: '購入金額' })).toHaveValue(
    formatNumberWithComma(approvalFormData.amount),
  );
  await expect(page.getByRole('textbox', { name: '申請理由' })).toHaveValue(approvalFormData.reason);
}

export async function expectApprovalConfirmValues(page: Page) {
  await expect(page.getByText(approvalFormData.title)).toBeVisible();
  await expect(page.getByText(formatNumberWithComma(approvalFormData.amount))).toBeVisible();
  await expect(page.getByText(approvalFormData.reason)).toBeVisible();
}
