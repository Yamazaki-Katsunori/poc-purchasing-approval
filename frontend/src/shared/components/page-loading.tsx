'use client';

import { Spinner } from '@/ui/spinner';
import { cn } from '@/shared/cn';

type PageLoadingProps = {
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function PageLoading({ message = '読み込み中...', spinnerSize = 'lg', className }: PageLoadingProps) {
  return (
    <div
      className={cn('flex min-h-[40vh] items-center justify-center', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="inline-flex flex-col items-center gap-3">
        <Spinner size={spinnerSize} label="page-loading" />
        <p className="text-sm text-foreground">{message}</p>
      </div>
    </div>
  );
}
