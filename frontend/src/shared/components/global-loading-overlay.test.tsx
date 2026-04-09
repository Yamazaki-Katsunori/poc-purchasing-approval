import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GlobalLoadingOverlay } from './global-loading-overlay';

vi.mock('@/ui/overlay', () => {
  return {
    Overlay: ({ open, children }: { open: boolean; children: React.ReactNode }) => (
      <div data-testid="overlay" data-open={String(open)}>
        {children}
      </div>
    ),
  };
});

vi.mock('@/ui/spinner', () => {
  return {
    Spinner: ({ size, label }: { size: string; label: string }) => (
      <div data-testid="spinner" data-size={size} aria-label={label} />
    ),
  };
});

describe('GlobalLoadingOverlay', () => {
  it('デフォルト値で描画できる', () => {
    render(<GlobalLoadingOverlay />);

    const overlay = screen.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-open', 'false');

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-busy', 'false');

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('data-size', 'md');
    expect(spinner).toHaveAttribute('aria-label', 'global-loading');
  });

  it('open=true を Overlay と aria-busy に反映する', () => {
    render(<GlobalLoadingOverlay open />);

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-open', 'true');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('message と spinnerSize を反映できる', () => {
    render(<GlobalLoadingOverlay open message="保存中です..." spinnerSize="lg" />);

    expect(screen.getByText('保存中です...')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toHaveAttribute('data-size', 'lg');
  });

  it('className を付与できる', () => {
    render(<GlobalLoadingOverlay className="test-class" />);

    expect(screen.getByRole('status')).toHaveClass('test-class');
  });
});
