import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ButtonLoadingContent } from './button-loading-content';

vi.mock('@/ui/spinner', () => {
  return {
    Spinner: ({ size, label }: { size: string; label: string }) => (
      <div data-testid="spinner" data-size={size} aria-label={label} />
    ),
  };
});

describe('ButtonLoadingContent', () => {
  it('デフォルト表示を描画する', () => {
    render(<ButtonLoadingContent />);

    expect(screen.getByText('送信中...')).toBeInTheDocument();

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('data-size', 'sm');
    expect(spinner).toHaveAttribute('aria-label', 'button-loading');
  });

  it('text を差し替えられる', () => {
    render(<ButtonLoadingContent text="保存中..." />);

    expect(screen.getByText('保存中...')).toBeInTheDocument();
  });

  it('spinnerSize を Spinner に渡せる', () => {
    render(<ButtonLoadingContent spinnerSize="lg" />);

    expect(screen.getByTestId('spinner')).toHaveAttribute('data-size', 'lg');
  });

  it('className を付与できる', () => {
    render(<ButtonLoadingContent className="test-class" />);

    expect(screen.getByText('送信中...').parentElement).toHaveClass('test-class');
  });
});
