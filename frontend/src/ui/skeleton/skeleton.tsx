'use client';

import { cn } from '@/shared/cn';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-muted', className)} />;
}
