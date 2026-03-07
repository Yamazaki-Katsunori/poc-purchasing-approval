'use client';

import { cn } from '@/shared/cn';
import { ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  isLoading?: boolean;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'ui-btn',
        variant === 'primary' && 'ui-btn--primary',
        variant === 'secondary' && 'ui-btn--secondary',
        variant === 'danger' && 'ui-btn--danger',
        size === 'sm' && 'ui-btn--sm',
        size === 'md' && 'ui-btn--md',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '処理中…' : children}
    </button>
  );
}
