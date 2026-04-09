import { Button } from '@/ui';

type PaginationProps = {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  total?: number;
};

export function Pagination({ page, totalPages, hasPrev, hasNext, onPrev, onNext, total }: PaginationProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {typeof total === 'number' ? (
          <span>
            全{total}件 / {page}ページ目
          </span>
        ) : (
          <span>{page}ページ目</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onPrev} disabled={!hasPrev}>
          前へ
        </Button>

        <span className="min-w-20 text-center text-sm text-foreground">
          {totalPages > 0 ? `${page} / ${totalPages}` : '0 / 0'}
        </span>

        <Button type="button" variant="outline" onClick={onNext} disabled={!hasNext}>
          次へ
        </Button>
      </div>
    </div>
  );
}
