import { cn } from '@/shared';

type DetailRowProps = { label: string; value: string; multiline?: boolean };

export function DetailRow({ label, value, multiline = false }: DetailRowProps) {
  return (
    <div className="p-2">
      <div className="mb-2 text-sm font-medium text-gray-700">{label}</div>
      <div
        className={cn(
          'w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900',
          multiline ? 'min-h-30 whitespace-pre-wrap' : '',
        )}
      >
        {value || '—'}
      </div>
    </div>
  );
}
