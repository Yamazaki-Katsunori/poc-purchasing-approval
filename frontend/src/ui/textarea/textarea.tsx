'use client';

import { cn } from '@/shared/cn';
import type { ComponentProps, HTMLAttributes } from 'react';

type TextareaProps = ComponentProps<'textarea'> & {
  error?: string;
} & HTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, error, ...rest }: TextareaProps) {
  const classes = cn('ui-control', 'min-h-[120px] resize-y', error ? 'ui-control--error' : 'ui-control--ok', className);

  return (
    <div className="w-full">
      <textarea className={classes} {...rest} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
