import { Badge } from '@/ui';
import { ComponentProps } from 'react';

// 試し
export type BadgeVariant = ComponentProps<typeof Badge>['variant'];
export const getApprovalStatusBadgeVariant = (statusCode: string | undefined): BadgeVariant => {
  if (!statusCode) return 'default';

  switch (statusCode) {
    case 'submitted':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'draft':
      return 'outline';
    default:
      return 'default';
  }
};
