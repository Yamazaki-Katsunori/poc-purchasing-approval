'use client';

import { Overlay } from '@/ui/overlay';
import { Spinner } from '@/ui/spinner';
import { cn } from '@/shared/cn';

type GlobalLoadingOverlayProps = {
  open?: boolean;
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function GlobalLoadingOverlay({
  open = false,
  message = '読み込み中...',
  spinnerSize = 'md',
  className,
}: GlobalLoadingOverlayProps) {
  return (
    <Overlay open={open}>
      <div
        className={cn(
          'rounded-2xl border bg-background px-6 py-4 shadow-lg',
          'inline-flex items-center gap-3',
          className,
        )}
        role="status"
        aria-live="polite"
        aria-busy={open}
      >
        <Spinner size={spinnerSize} label="global-loading" />
        <span className="text-sm font-medium text-foreground">{message}</span>
      </div>
    </Overlay>
  );
}
