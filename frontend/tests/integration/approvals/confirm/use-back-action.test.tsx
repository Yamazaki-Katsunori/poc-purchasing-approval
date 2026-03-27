import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { useBackAction } from '@/features/approvals/confirm/hooks/use-back-action';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useRouter } from 'next/navigation';

// router mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('useBackAction (integration + storage)', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useRouter as Mock).mockReturnValue({
      push: pushMock,
    });
  });

  function setup() {
    const store = createStore();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    );

    return { wrapper, store };
  }

  it('正常系: atom に値を保存し router.push が呼ばれる', async () => {
    const { wrapper, store } = setup();
    const { result } = renderHook(() => useBackAction(), { wrapper });

    const input = {
      title: '戻るテスト',
      purchase_type: 'test_type',
      amount: '500',
      reason: '戻る理由',
    };

    await act(async () => {
      await result.current.onCansel(input);
    });

    // ① atom に保存される
    expect(store.get(approvalCreateAtom)).toEqual(input);

    // ② sessionStorage にも保存される
    const stored = sessionStorage.getItem('approvalCreate');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(input);

    // ③ router 遷移
    expect(pushMock).toHaveBeenCalledWith('/approvals/new');
  });

  it('null の場合: atom に null が入り storage も更新される', async () => {
    const { wrapper, store } = setup();
    const { result } = renderHook(() => useBackAction(), { wrapper });

    await act(async () => {
      await result.current.onCansel(null);
    });

    // ① atom が null
    expect(store.get(approvalCreateAtom)).toBe(null);

    // ② storage も null（＝削除 or "null"）
    const stored = sessionStorage.getItem('approvalCreate');

    // jotaiの仕様で "null" が入る場合もあるので両対応
    expect(stored === null || JSON.parse(stored) === null).toBe(true);

    // ③ router 遷移
    expect(pushMock).toHaveBeenCalledWith('/approvals/new');
  });
});
