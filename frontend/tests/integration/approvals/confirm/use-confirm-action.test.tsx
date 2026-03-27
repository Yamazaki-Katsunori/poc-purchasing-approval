import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { useConfirmAction } from '@/features/approvals/confirm/hooks/use-confirm-action';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useRouter } from 'next/navigation';
import { APP_CODE } from '@/shared/app-code';
import { AppError } from '@/shared/error/appError';

// router mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// API mock（integrationなのでここだけmock）
const mutateAsyncMock = vi.fn();

vi.mock('@/features/approvals/confirm/hooks/use-confirm-approval-mutation', () => ({
  useConfirmApprovalMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    error: null,
  }),
}));

describe('useConfirmAction (integration + storage)', () => {
  const pushMock = vi.fn();
  const refreshMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useRouter as Mock).mockReturnValue({
      push: pushMock,
      refresh: refreshMock,
    });
  });

  function setup() {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });

    const store = createStore();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <JotaiProvider store={store}>{children}</JotaiProvider>
      </QueryClientProvider>
    );

    return { wrapper, store };
  }

  it('正常系: mutation → atomクリア → router.push → refresh が実行される', async () => {
    const { wrapper, store } = setup();
    const { result } = renderHook(() => useConfirmAction(), { wrapper });

    const input = {
      title: '確認テスト',
      purchase_type: 'test_type',
      amount: '1000',
      reason: '確認理由',
    };

    // 事前にatomに値を入れておく（リアルな状態）
    store.set(approvalCreateAtom, input);

    mutateAsyncMock.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.onSubmit(input);
    });

    // ① mutation
    expect(mutateAsyncMock).toHaveBeenCalledWith(input);

    // ② atom がクリアされる
    expect(store.get(approvalCreateAtom)).toBe(null);

    // ③ storage もクリアされる
    const stored = sessionStorage.getItem('approvalCreate');
    expect(stored === null || JSON.parse(stored) === null).toBe(true);

    // ④ router.push
    expect(pushMock).toHaveBeenCalledWith('/');

    // ⑤ router.refresh
    expect(refreshMock).toHaveBeenCalled();
  });

  it('異常系①: assertで落ちる場合、何も実行されない', async () => {
    const { wrapper, store } = setup();
    const { result } = renderHook(() => useConfirmAction(), { wrapper });

    // assertで落ちる（null）
    await expect(result.current.onSubmit(null)).rejects.toThrow(new AppError(APP_CODE.APPROVAL_DRAFT_NOT_FOUND));

    // 副作用なし
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(store.get(approvalCreateAtom)).toBe(null);
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('異常系②: mutation失敗時、後続処理が実行されない', async () => {
    const { wrapper, store } = setup();
    const { result } = renderHook(() => useConfirmAction(), { wrapper });

    const input = {
      title: '確認テスト',
      purchase_type: 'test_type',
      amount: '1000',
      reason: '確認理由',
    };

    // 初期値セット
    store.set(approvalCreateAtom, input);

    mutateAsyncMock.mockRejectedValueOnce(new Error('mutation failed'));

    await expect(result.current.onSubmit(input)).rejects.toThrow();

    // mutationは呼ばれている
    expect(mutateAsyncMock).toHaveBeenCalledWith(input);

    // ❌ それ以降は実行されない
    expect(store.get(approvalCreateAtom)).toEqual(input); // クリアされてない
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
