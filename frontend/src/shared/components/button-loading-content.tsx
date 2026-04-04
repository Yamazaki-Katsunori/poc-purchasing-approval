'use client';

import { Spinner } from '@/ui/spinner';
import { cn } from '@/shared/cn';

type ButtonLoadingContentProps = {
  text?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function ButtonLoadingContent({ text = '送信中...', spinnerSize = 'sm', className }: ButtonLoadingContentProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Spinner size={spinnerSize} label="button-loading" />
      <span>{text}</span>
    </span>
  );
}
