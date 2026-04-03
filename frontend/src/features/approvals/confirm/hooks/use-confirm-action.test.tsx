import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfirmAction } from './use-confirm-action';
import { useConfirmApprovalMutation } from './use-confirm-approval-mutation';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { assertCreateApprovalRequestData } from '@/features/approvals/confirm/guards/asserts';
import { AppError } from '@/shared/error/appError';
import { APP_CODE } from '@/shared/app-code';

// --- モック ---
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai');
  return { ...actual, useSetAtom: vi.fn() };
});

vi.mock('./use-confirm-approval-mutation', () => ({
  useConfirmApprovalMutation: vi.fn(),
}));

vi.mock('@/features/approvals/confirm/guards/asserts', () => ({
  assertCreateApprovalRequestData: vi.fn(),
}));

describe('useConfirmAction', () => {
  const pushMock = vi.fn();
  const setAtomMock = vi.fn();
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as Mock).mockReturnValue({
      push: pushMock,
    });

    (useSetAtom as Mock).mockReturnValue(setAtomMock);

    (useConfirmApprovalMutation as Mock).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    });
  });

  it('正常系: assert → mutation → atom → router が順に呼ばれる', async () => {
    const { result } = renderHook(() => useConfirmAction());

    const input: CreateApprovalRequestTypes = {
      title: 'テスト',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'テスト理由',
    };

    mutateAsyncMock.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.onSubmit(input);
    });

    // assert が呼ばれる
    expect(assertCreateApprovalRequestData).toHaveBeenCalledWith(input);

    // mutation が呼ばれる
    expect(mutateAsyncMock).toHaveBeenCalledWith(input);

    // atom が null にセットされる
    expect(setAtomMock).toHaveBeenCalledWith(null);

    // router.push / router.refresh が呼ばれる
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('null を渡すと assert で例外が投げられる', async () => {
    const { result } = renderHook(() => useConfirmAction());

    (assertCreateApprovalRequestData as Mock).mockImplementation(() => {
      throw new AppError(APP_CODE.APPROVAL_DRAFT_NOT_FOUND);
    });

    await act(async () => {
      await expect(result.current.onSubmit(null)).rejects.toThrow(AppError);
    });

    // mutation / atom / router は呼ばれない
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(setAtomMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
