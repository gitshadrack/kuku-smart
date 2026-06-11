import type { ReactNode } from 'react';

import { Chip, TitleBlock } from '../components/ui';

export function GenericList({ title, items, icon, entry }: { title: string; items: { title: string; meta: string; amount?: string; tone?: 'green' | 'yellow' | 'red' | 'plain' }[]; icon: JSX.Element; entry?: ReactNode }) {
  return (
    <>
      <TitleBlock title={title} />
      {entry}
      <div className="space-y-stack-sm">
        {items.map((item) => (
          <div key={`${item.title}-${item.meta}`} className="record-card flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">{icon}</div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-on-surface-variant">{item.meta}</p>
              </div>
            </div>
            {item.amount && <div className="text-right"><p className="font-bold text-primary">{item.amount}</p><Chip tone={item.tone}>{item.tone === 'red' ? 'Alert' : 'Active'}</Chip></div>}
          </div>
        ))}
      </div>
    </>
  );
}
