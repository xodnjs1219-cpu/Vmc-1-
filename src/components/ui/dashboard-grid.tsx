'use client';

import { cn } from '@/lib/utils';

export type DashboardGridProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClassNames: Record<DashboardGridProps['columns'], string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
};

export const DashboardGrid = ({
  children,
  columns = 2,
  className,
}: DashboardGridProps) => (
  <div
    className={cn(
      'grid gap-6',
      columnClassNames[columns],
      className,
    )}
  >
    {children}
  </div>
);
