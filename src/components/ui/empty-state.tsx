'use client';

import { cn } from '@/lib/utils';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export const EmptyState = ({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-slate-500',
      className,
    )}
  >
    {icon && <div className="text-slate-400">{icon}</div>}
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);
