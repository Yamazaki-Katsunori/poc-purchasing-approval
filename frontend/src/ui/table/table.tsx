import { cn } from '@/shared';
import { ComponentPropsWithoutRef } from 'react';

type TableProps = ComponentPropsWithoutRef<'table'>;
type TableHeaderProps = ComponentPropsWithoutRef<'thead'>;
type TableBodyProps = ComponentPropsWithoutRef<'tbody'>;
type TableFooterProps = ComponentPropsWithoutRef<'tfoot'>;
type TableRowProps = ComponentPropsWithoutRef<'tr'>;
type TableHeadProps = ComponentPropsWithoutRef<'th'>;
type TableCellProps = ComponentPropsWithoutRef<'td'>;
type TableCaptionProps = ComponentPropsWithoutRef<'caption'>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableFooter({ className, ...props }: TableFooterProps) {
  return <tfoot className={cn('border-t bg-gray-50 font-medium [&>tr]:last:border-b-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn('border-b transition-colors hover:bg-gray-50', className)} {...props} />;
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <th className={cn('h-12 px-4 text-left align-middle font-medium text-gray-500', className)} {...props} />;
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn('p-4 align-middle', className)} {...props} />;
}

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return <caption className={cn('mt-4 text-sm text-gray-500', className)} {...props} />;
}
