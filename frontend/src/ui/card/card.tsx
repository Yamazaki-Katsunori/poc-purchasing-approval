import { cn } from '@/shared';
import { ComponentPropsWithoutRef } from 'react';

type CardProps = ComponentPropsWithoutRef<'div'>;

type CardHeaderProps = ComponentPropsWithoutRef<'div'>;

type CardTitleProps = ComponentPropsWithoutRef<'h3'>;

type CardDescriptionProps = ComponentPropsWithoutRef<'p'>;

type CardContentProps = ComponentPropsWithoutRef<'div'>;

type CardFooterProps = ComponentPropsWithoutRef<'div'>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('ui-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('ui-card-header', className)} {...props} />;
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('ui-card-content', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn('ui-card-footer', className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn('text-base font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn('text-sm text-neutral-600', className)} {...props} />;
}
