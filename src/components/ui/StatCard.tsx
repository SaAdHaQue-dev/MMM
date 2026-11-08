import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlightColor?: 'wine' | 'gold' | 'emerald' | 'amber' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'wine',
  className,
}) => {
  const iconBgs = {
    wine: 'bg-wine-50 text-wine-800 border-wine-100',
    gold: 'bg-gold-50 text-gold-700 border-gold-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-sand-100 text-charcoal-700 border-sand-border',
  };

  return (
    <Card className={cn('p-5 hover:border-gold-300 transition-all group', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-charcoal-500 mb-1">
            {title}
          </p>
          <h4 className="text-2xl font-bold font-serif text-charcoal-900 group-hover:text-wine-800 transition-colors">
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-1.5 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-xl border flex items-center justify-center', iconBgs[highlightColor])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
