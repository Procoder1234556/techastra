import type { ReactNode } from 'react';

type Props = { title: string; children?: ReactNode };

export function StaticPage({ title, children }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <div className="mt-6 prose prose-neutral dark:prose-invert text-neutral-600 dark:text-neutral-400">
        {children || <p>Content placeholder for this TechAstra page.</p>}
      </div>
    </div>
  );
}
