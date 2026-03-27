import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { useApprovalCreateAction } from '@/features/approvals/new/hooks/use-approval-create-action';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

// router mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// mutation mock
const mutateAsyncMock = vi.fn();

vi.mock('@/features/approvals/new/hooks/use-create-approval-mutation', () => ({
  useCreateApprovalMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    error: null,
  }),
}));

describe('useCreateAction (integration + storage)', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useRouter as Mock).mockReturnValue({
      push: pushMock,
    });
  });

  function setup() {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });

    const store = createStore();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <JotaiProvider store={store}>{children}</JotaiProvider>
      </QueryClientProvider>
    );

    return { wrapper, store };
  }

  it('mutation → atom → sessionStorage → router のフローが動く', async () => {
    const { wrapper, store } = setup();

    const { result } = renderHook(() => useApprovalCreateAction(), { wrapper });

    const input = {
      title: 'テスト',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'テスト理由',
    };

    mutateAsyncMock.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.onSubmit(input);
    });

    // ① mutation
    expect(mutateAsyncMock).toHaveBeenCalledWith(input);

    // ② jotai store に入っている
    expect(store.get(approvalCreateAtom)).toEqual(input);

    // ③ sessionStorage にも保存されている
    const stored = sessionStorage.getItem('approvalCreate');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(input);

    // ④ router 遷移
    expect(pushMock).toHaveBeenCalledWith('/approvals/new/confirm');
  });

  it('異常系: mutation が失敗した場合、副作用が一切発生しない', async () => {
    const { wrapper, store } = setup();

    const { result } = renderHook(() => useApprovalCreateAction(), { wrapper });

    const input = {
      title: 'テスト',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'テスト理由',
    };

    // mutation を失敗させる
    const mockError = new Error('mutation failed');
    mutateAsyncMock.mockRejectedValueOnce(mockError);

    await expect(result.current.onSubmit(input)).rejects.toThrow('mutation failed');

    // ❌ mutation 以降の副作用が起きていないことを確認

    // ① atom には値が入っていないことを確認
    expect(store.get(approvalCreateAtom)).toBe(null);

    // ② sessionStorage にも保存されていないことを確認
    expect(sessionStorage.getItem('approvalCreate')).toBeNull();

    // ③ router 遷移されていない
    expect(pushMock).not.toHaveBeenCalled();
  });
});
