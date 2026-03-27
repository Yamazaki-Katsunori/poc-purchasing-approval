import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBackAction } from './use-back-action';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';

// --- モック ---
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai');
  return {
    ...actual,
    useSetAtom: vi.fn(),
  };
});

describe('useBackAction', () => {
  const pushMock = vi.fn();
  const setAtomMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: pushMock });
    (useSetAtom as Mock).mockReturnValue(setAtomMock);
  });

  it('onCansel が呼ばれると atom をセットして router.push する', async () => {
    const { result } = renderHook(() => useBackAction());

    const data: CreateApprovalRequestTypes = {
      title: 'テスト',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'テスト理由',
    };

    await act(async () => {
      await result.current.onCansel(data);
    });

    // atom が呼ばれる
    expect(setAtomMock).toHaveBeenCalledWith(data);

    // router.push が呼ばれる
    expect(pushMock).toHaveBeenCalledWith('/approvals/new');
  });

  it('null を渡しても atom にセットして router.push する', async () => {
    const { result } = renderHook(() => useBackAction());

    await act(async () => {
      await result.current.onCansel(null);
    });

    expect(setAtomMock).toHaveBeenCalledWith(null);
    expect(pushMock).toHaveBeenCalledWith('/approvals/new');
  });
});
