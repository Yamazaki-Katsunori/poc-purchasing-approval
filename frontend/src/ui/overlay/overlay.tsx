'use client';

import { ReactNode } from 'react';
import { cn } from '@/shared/cn';

type OverlayProps = {
  open?: boolean;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
};

export function Overlay({ open = true, children, className, backdropClassName, contentClassName }: OverlayProps) {
  if (!open) return null;

  return (
    <div className={cn('fixed inset-0 z-9999 flex items-center justify-center', className)}>
      <div className={cn('absolute inset-0 bg-black/20 backdrop-blur-[1px]', backdropClassName)} />
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </div>
  );
}
