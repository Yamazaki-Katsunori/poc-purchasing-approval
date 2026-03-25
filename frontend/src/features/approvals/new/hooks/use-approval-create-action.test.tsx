import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApprovalCreateAction } from './use-approval-create-action';
import { createStore, Provider } from 'jotai';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const mutateAsyncMock = vi.fn();
const mockUseCreateApprovalMutation = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock('./use-create-approval-mutation', () => ({
  useCreateApprovalMutation: () => mockUseCreateApprovalMutation(),
}));

describe('useCreateApproval', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCreateApprovalMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    });
  });

  it('初期値を返す', () => {
    const store = createStore();

    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => useApprovalCreateAction(), { wrapper });

    expect(typeof result.current.onSubmit).toBe('function');
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('submit成功時にBEへ送信し、jotaiへ保存, confirm画面へ遷移する', async () => {
    const store = createStore();

    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

    const formData: CreateApprovalRequestTypes = {
      title: '備品購入申請',
      purchase_type: '備品',
      amount: '498',
      reason: '事務所のトイレで使用するトイレットペーパーの購入',
    };

    mutateAsyncMock.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useApprovalCreateAction(), { wrapper });

    await act(async () => {
      await result.current.onSubmit(formData);
    });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    expect(mutateAsyncMock).toHaveBeenCalledWith(formData);

    expect(store.get(approvalCreateAtom)).toEqual(formData);

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/approvals/new/confirm');
  });

  it('submit失敗時はjotaiへ保存せず、画面遷移しない', async () => {
    const store = createStore();

    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

    const formData: CreateApprovalRequestTypes = {
      title: '備品購入申請',
      purchase_type: '備品',
      amount: '10000',
      reason: 'キーボード購入のため',
    };

    mutateAsyncMock.mockRejectedValue(new Error('request failed'));

    const { result } = renderHook(() => useApprovalCreateAction(), { wrapper });

    await expect(
      act(async () => {
        await result.current.onSubmit(formData);
      }),
    ).rejects.toThrow('request failed');

    expect(store.get(approvalCreateAtom)).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
