import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateApprovalMutation } from './use-create-approval-mutation';

const createApprovalMock = vi.fn();

vi.mock('@/features/approvals/new/api/create-approval', () => ({
  createApprovalApi: (data: unknown) => createApprovalMock(data),
}));

describe('useCreateApprovalMutation', () => {
  // tanStackQuery QueryClientのラッパー
  function createWrapper() {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });

    function TestQueryClientProvider({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return TestQueryClientProvider;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: mutationFnとしてcreateApprovalApiを呼び出す', async () => {
    const mockResponse = { ok: true };
    createApprovalMock.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateApprovalMutation(), { wrapper });

    const inputs = {
      title: 'test',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'test approval create',
    };

    await act(async () => {
      const resultData = await result.current.mutateAsync(inputs);
      expect(resultData).toEqual(mockResponse);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createApprovalMock).toHaveBeenCalledWith(inputs);
  });

  it('異常系: mutationFnとしてcreateApprovalApiを呼び出す', async () => {
    const mockError = new Error('failed');
    createApprovalMock.mockRejectedValueOnce(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateApprovalMutation(), { wrapper });

    const inputs = {
      title: 'test',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'test 異常系 approval create',
    };

    await act(async () => {
      await expect(result.current.mutateAsync(inputs)).rejects.toThrow('failed');
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true); // ← これが本質
    });

    expect(createApprovalMock).toHaveBeenCalledWith(inputs);
    expect(result.current.error).toEqual(mockError);
  });
});
