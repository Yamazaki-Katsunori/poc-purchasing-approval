import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useApprovalsQuery } from './use-approvals-query';
import { getApprovals } from '../api/get-approvals';

vi.mock('../api/get-approvals', () => {
  return {
    getApprovals: vi.fn(),
  };
});

describe('useApprovalsQuery', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    function TestQueryClientProvider({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return TestQueryClientProvider;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('page / per_page を渡して一覧データを取得できる', async () => {
    const apiMock = vi.mocked(getApprovals);
    apiMock.mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'テスト申請',
          approval_user: '山田 太郎',
          approval_status: '申請中',
          requested_at: '2026-04-09T10:00:00Z',
          created_at: '2026-04-09T10:00:00Z',
          approved_at: null,
        },
      ],
      pagination: {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        has_prev: false,
        has_next: false,
      },
    });

    const { result } = renderHook(() => useApprovalsQuery({ page: 1, per_page: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getApprovals).toHaveBeenCalledWith({ page: 1, per_page: 10 });
    expect(result.current.data).toEqual({
      items: [
        {
          id: 1,
          title: 'テスト申請',
          approval_user: '山田 太郎',
          approval_status: '申請中',
          requested_at: '2026-04-09T10:00:00Z',
          created_at: '2026-04-09T10:00:00Z',
          approved_at: null,
        },
      ],
      pagination: {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        has_prev: false,
        has_next: false,
      },
    });
  });
});
