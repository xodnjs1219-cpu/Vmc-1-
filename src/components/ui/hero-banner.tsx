'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type HeroBannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
};

export type HeroBannerProps = {
  items: HeroBannerItem[];
  className?: string;
};

export const HeroBanner = ({ items, className }: HeroBannerProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      {items.map((item) => {
        const content = (
          <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 text-left backdrop-blur-sm transition hover:border-white/25">
            <div className="relative h-40 w-full overflow-hidden rounded-xl">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                priority
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
          </article>
        );

        if (item.linkUrl) {
          return (
            <Link key={item.id} href={item.linkUrl} className="block h-full">
              {content}
            </Link>
          );
        }

        return (
          <div key={item.id} className="h-full">
            {content}
          </div>
        );
      })}
    </div>
  );
};
