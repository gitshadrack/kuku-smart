import { Egg, HeartPulse, Package, Users, Wallet } from 'lucide-react';

import { useFarmData } from '../app/hooks';

import { StatCard, TitleBlock, formatMoney } from '../components/ui';

export function ReportScreen({ title, data }: { title: string; data: ReturnType<typeof useFarmData> }) {
  const income = data.sales.filter((s) => s.type === 'Income').reduce((sum, sale) => sum + sale.amount, 0);
  const expenses = data.sales.filter((s) => s.type === 'Expense').reduce((sum, sale) => sum + sale.amount, 0);
  return (
    <>
      <TitleBlock title={title} chips={['Local data', 'Offline ready']} />
      <section className="mb-stack-lg grid grid-cols-2 gap-gutter-mobile">
        <StatCard icon={<Wallet size={20} />} label="Net Profit" value={formatMoney(income - expenses)} note="This period" />
        <StatCard icon={<Egg size={20} />} label="Eggs" value={`${data.eggs.reduce((s, e) => s + e.trays, 0)} trays`} note="Recorded" tone="secondary" />
        <StatCard icon={<HeartPulse size={20} />} label="Health Cases" value={String(data.health.length)} note="Open logs" tone="tertiary" />
        <StatCard icon={<Users size={20} />} label="Workers" value={String(data.workers.length)} note="Active team" />
      </section>
      <div className="record-card p-stack-md">
        <h2 className="mb-4 font-heading text-xl font-semibold text-primary">Weekly trend</h2>
        <div className="flex h-32 items-end gap-2">
          {[42, 58, 50, 70, 85, 95].map((height, index) => <div key={index} className="flex-1 rounded-t bg-primary-fixed" style={{ height: `${height}%` }} />)}
        </div>
        <div className="mt-2 flex justify-between text-xs font-bold text-on-surface-variant"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Today</span></div>
      </div>
    </>
  );
}
