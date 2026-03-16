import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginMutation } from './login-mutation';

const loginApiMock = vi.fn();

vi.mock('@/features/api/login', () => ({
  loginApi: (data: unknown) => loginApiMock(data),
}));

describe('useLoginMutation', () => {
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

  it('mutationFn として loginApi を呼び出す', async () => {
    loginApiMock.mockResolvedValueOnce({ ok: true });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLoginMutation(), { wrapper });

    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    await act(async () => {
      await result.current.mutateAsync(input);
    });

    expect(loginApiMock).toHaveBeenCalledWith(input);
  });
});
