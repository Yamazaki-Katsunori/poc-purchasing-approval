import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageLoading } from './page-loading';

vi.mock('@/ui/spinner', () => {
  return {
    Spinner: ({ size, label }: { size: string; label: string }) => (
      <div data-testid="spinner" data-size={size} aria-label={label} />
    ),
  };
});

describe('PageLoading', () => {
  it('デフォルトのローディング表示を描画する', () => {
    render(<PageLoading />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-busy', 'true');

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('data-size', 'lg');
    expect(spinner).toHaveAttribute('aria-label', 'page-loading');
  });

  it('message prop で表示文言を差し替えられる', () => {
    render(<PageLoading message="申請一覧を取得中です..." />);

    expect(screen.getByText('申請一覧を取得中です...')).toBeInTheDocument();
  });

  it('spinnerSize prop を Spinner に渡す', () => {
    render(<PageLoading spinnerSize="sm" />);

    expect(screen.getByTestId('spinner')).toHaveAttribute('data-size', 'sm');
  });

  it('className を付与できる', () => {
    render(<PageLoading className="test-class" />);

    expect(screen.getByRole('status')).toHaveClass('test-class');
  });
});
