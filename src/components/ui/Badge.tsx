import React from 'react';
import { cn } from '@/lib/utils';
import { FamilySide, PaymentStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'wine' | 'gold' | 'paid' | 'pending' | 'danger' | 'neutral' | 'bride' | 'groom';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}) => {
  const variantStyles = {
    wine: 'bg-wine-100 text-wine-900 border-wine-200',
    gold: 'bg-gold-100 text-gold-900 border-gold-300',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-sand-100 text-charcoal-700 border-sand-border',
    bride: 'bg-pink-50 text-pink-700 border-pink-200',
    groom: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full border',
    md: 'text-sm px-3 py-1 rounded-full border',
  };

  return (
    <span className={cn('inline-flex items-center font-medium capitalize', variantStyles[variant], sizeStyles[size], className)} {...props}>
      {children}
    </span>
  );
};

export const FamilyBadge: React.FC<{ side: FamilySide; className?: string }> = ({ side, className }) => {
  return (
    <Badge variant={side === 'bride' ? 'bride' : 'groom'} className={className}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", side === 'bride' ? 'bg-pink-500' : 'bg-sky-600')} />
      {side === 'bride' ? "Bride's Family" : "Groom's Family"}
    </Badge>
  );
};

export const PaymentBadge: React.FC<{ status: PaymentStatus; className?: string }> = ({ status, className }) => {
  const map = {
    paid: { label: 'Paid in Full', variant: 'paid' as const },
    pending: { label: 'Pending', variant: 'pending' as const },
    partially_paid: { label: 'Partially Paid', variant: 'gold' as const },
  };

  const current = map[status] || { label: status, variant: 'neutral' as const };

  return <Badge variant={current.variant} className={className}>{current.label}</Badge>;
};
