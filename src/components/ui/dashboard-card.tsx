'use client';

import { cn } from '@/lib/utils';

export type DashboardCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const DashboardCard = ({
  title,
  description,
  action,
  children,
  className,
}: DashboardCardProps) => (
  <section
    className={cn(
      'space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
      className,
    )}
  >
    <header className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
    <div>{children}</div>
  </section>
);
