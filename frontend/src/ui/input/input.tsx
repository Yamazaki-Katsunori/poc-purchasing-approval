import { cn } from '@/shared/cn';
import type { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'> & {
  error?: string;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input className={cn('ui-control', error ? 'ui-control--error' : 'ui-control--ok', className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
