import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './loginForm';
import type { SubmitEvent } from 'react';

const mockRegister = vi.fn((name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}));

const mockOnSubmit = vi.fn();
const mockSubmitHandler = vi.fn(async (e?: SubmitEvent<HTMLFormElement>) => {
  e?.preventDefault?.();
});

const mockHandleSubmit = vi.fn(() => mockSubmitHandler);

const mockUseLoginForm = vi.fn();

vi.mock('../hooks/login-form-hook', () => ({
  useLoginForm: () => mockUseLoginForm(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLoginForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {},
        isSubmitted: false,
      },
      onSubmit: mockOnSubmit,
      isPending: false,
      serverError: '',
    });
  });

  it('ログインフォームの基本要素を表示する', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス:')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('パスワードを入力してください')).toBeInTheDocument();
  });

  it('submit時に handleSubmit(onSubmit) で返された関数を実行する', async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    expect(mockHandleSubmit).toHaveBeenCalledWith(mockOnSubmit);
    expect(mockSubmitHandler).toHaveBeenCalledTimes(1);
  });

  it('メールアドレスのバリデーションエラーを表示する', () => {
    mockUseLoginForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {
          email: {
            message: 'メールアドレスは必須です',
          },
        },
        isSubmitted: true,
      },
      onSubmit: mockOnSubmit,
      isPendng: false,
      serverError: '',
    });

    render(<LoginForm />);

    expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
  });

  it('パスワードのバリデーションエラーを表示する', () => {
    mockUseLoginForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {
          password: {
            message: 'パスワードは必須です',
          },
        },
        isSubmitted: true,
      },
      onSubmit: mockOnSubmit,
      isPendng: false,
      serverError: '',
    });

    render(<LoginForm />);

    expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
  });

  it('isSubmitted=false のときは errors があってもバリデーションエラーを表示しない', () => {
    mockUseLoginForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {
          email: {
            message: 'メールアドレスは必須です',
          },
        },
        isSubmitted: false,
      },
      onSubmit: mockOnSubmit,
      isPendng: false,
      serverError: '',
    });

    render(<LoginForm />);

    expect(screen.queryByText('メールアドレスは必須です')).not.toBeInTheDocument();
  });

  it('serverError がある場合に表示する', () => {
    mockUseLoginForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {},
        isSubmitted: false,
      },
      onSubmit: mockOnSubmit,
      isPendng: false,
      serverError: 'メールアドレスまたはパスワードが正しくありません。',
    });

    render(<LoginForm />);

    expect(screen.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeInTheDocument();
  });

  it('isPending=true のとき、ローディングアニメーション"読み込み中..."が表示される', () => {
    mockUseLoginForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {},
        isSubmitted: false,
      },
      onSubmit: mockOnSubmit,
      isPending: true,
      serverError: '',
    });

    render(<LoginForm />);

    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
  });
});
