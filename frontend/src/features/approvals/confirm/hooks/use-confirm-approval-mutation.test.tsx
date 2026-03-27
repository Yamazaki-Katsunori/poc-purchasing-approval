import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConfirmApprovalMutation } from './use-confirm-approval-mutation';
import { confirmApprovalApi } from '@/features/approvals/confirm/api/confirm-approval';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// --- API をモック ---
vi.mock('@/features/approvals/confirm/api/confirm-approval', () => ({
  confirmApprovalApi: vi.fn(),
}));

describe('useConfirmApprovalMutation', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    function TestQueryClientProvider({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return TestQueryClientProvider;
  };

  const apiMock = confirmApprovalApi as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: mutationFnとして confirmApprovalApi が呼ばれる', async () => {
    const mockResponse = { ok: true };
    apiMock.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useConfirmApprovalMutation(), {
      wrapper: createWrapper(),
    });

    const input: CreateApprovalRequestTypes = {
      title: 'テスト承認',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'テスト理由',
    };

    await act(async () => {
      await result.current.mutateAsync(input);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(input);
  });

  it('異常系: mutationFn が失敗した場合 isError が true になる', async () => {
    const mockError = new Error('失敗');
    apiMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useConfirmApprovalMutation(), {
      wrapper: createWrapper(),
    });

    const input: CreateApprovalRequestTypes = {
      title: 'テスト承認',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'テスト理由',
    };

    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(input);
  });
});
