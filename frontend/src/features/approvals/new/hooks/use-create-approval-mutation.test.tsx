import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
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

  it('mutationFnとしてcreateApprovalApiを呼び出す', async () => {
    createApprovalMock.mockResolvedValueOnce({ ok: true });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateApprovalMutation(), { wrapper });

    const inputs = {
      title: 'test',
      purchase_type: 'test_type',
      amount: '1000',
      reason: 'test approval create',
    };

    await act(async () => {
      await result.current.mutateAsync(inputs);
    });

    expect(createApprovalMock).toHaveBeenCalledWith(inputs);
  });
});
