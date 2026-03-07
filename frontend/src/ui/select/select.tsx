'use client';
import { cn } from '@/shared/cn';
import type { ComponentProps } from 'react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<ComponentProps<'select'>, 'children'> & {
  options: SelectOption[];
  placeholder?: string; // 未選択表示
  error?: string;
};

export function Select({ className, options, placeholder = '選択してください', error, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <select className={cn('ui-control', error ? 'ui-control--error' : 'ui-control--ok', className)} {...props}>
        {/* value が未指定（undefined）なら placeholder を表示したいので、空文字を使う設計が簡単 */}
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
