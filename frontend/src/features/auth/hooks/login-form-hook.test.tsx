import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginForm } from './login-form-hook';
import { CURRENT_USER_QUERY_KEY } from '@/features/layouts/hooks/useCurrentUser';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const mutateAsyncMock = vi.fn();

const mockUseLoginMutation = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock('./login-mutation', () => ({
  useLoginMutation: () => mockUseLoginMutation(),
}));

vi.mock('@/features/layouts/hooks/useCurrentUser', () => ({
  CURRENT_USER_QUERY_KEY: ['current-user'],
}));

describe('useLoginForm', () => {
  let queryClient: QueryClient;
  let invalidateQueriesSpy: ReturnType<typeof vi.spyOn>;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    const TestQueryClientProvider = ({ children }: { children: ReactNode }) => {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };

    return TestQueryClientProvider;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLoginMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    });
  });

  it('初期値を返す', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useLoginForm(), { wrapper });

    expect(result.current.getValues()).toEqual({
      email: '',
      password: '',
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.serverError).toBeNull();
  });

  it('onSubmit 成功時にログイン後の後続処理を実行する', async () => {
    mutateAsyncMock.mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    await result.current.onSubmit(input);

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    expect(mutateAsyncMock).toHaveBeenCalledWith(input);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: CURRENT_USER_QUERY_KEY,
    });

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/');
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('isPending をそのまま返す', () => {
    mockUseLoginMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: true,
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    expect(result.current.isPending).toBe(true);
  });

  it('error.message がある場合 serverError に入る', () => {
    mockUseLoginMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: new Error('メールアドレスまたはパスワードが正しくありません。'),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    expect(result.current.serverError).toBe('メールアドレスまたはパスワードが正しくありません。');
  });

  it('error がない場合 serverError は null を返す', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    expect(result.current.serverError).toBeNull();
  });

  it('onSubmit 失敗時は invalidateQueries と router 遷移を実行しない', async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error('login failed'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    const input = {
      email: 'test@example.com',
      password: 'wrong-password',
    };

    await expect(result.current.onSubmit(input)).rejects.toThrow('login failed');

    expect(mutateAsyncMock).toHaveBeenCalledWith(input);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
