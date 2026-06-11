import { Plus } from 'lucide-react';

import { Batch } from '../db';

import { useFarmData } from '../app/hooks';

import { RouteKey } from '../app/routes';

import { Chip, Metric, TitleBlock, formatMoney } from '../components/ui';

export function BatchesScreen({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
  return (
    <>
      <TitleBlock title="Bird Batches" chips={[`${data.batches.reduce((s, b) => s + b.quantity, 0)} Total Birds`, `${data.batches.length} Active Batches`]} />
      <div className="mb-stack-md flex rounded-lg bg-surface-container p-1">
        <button className="flex-1 rounded-md bg-white py-2 font-bold text-primary">Active</button>
        <button className="flex-1 rounded-md py-2 font-bold text-on-surface-variant">Historical</button>
      </div>
      <div className="space-y-stack-md">
        {data.batches.map((batch) => <BatchCard key={batch.id} batch={batch} />)}
      </div>
      <button onClick={() => setCurrent('add_new_batch_1')} className="fixed bottom-24 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-bold text-on-primary shadow-[0_2px_8px_rgba(22,26,50,0.25)]">
        <Plus size={20} /> Add Batch
      </button>
    </>
  );
}

export function BatchCard({ batch }: { batch: Batch }) {
  return (
    <div className="record-card space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-on-surface-variant">{batch.name}</p>
          <h2 className="font-heading text-xl font-semibold">{batch.breed}</h2>
        </div>
        <Chip tone={batch.status === 'At Risk' ? 'yellow' : 'green'}>{batch.status}</Chip>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Metric label="Quantity" value={`${batch.quantity} Birds`} />
        <Metric label="Arrival" value={batch.arrivalDate} />
      </div>
      <div className="border-t border-outline-variant pt-3 text-sm text-on-surface-variant">Supplier: {batch.supplier}</div>
      <button className="h-touch-target w-full rounded-xl border-2 border-primary font-bold text-primary">View Records</button>
    </div>
  );
}
