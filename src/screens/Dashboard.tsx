import { BarChart3, Egg, Package, ShieldCheck, Sprout, Wallet } from 'lucide-react';

import { useFarmData } from '../app/hooks';

import { RouteKey } from '../app/routes';

import { Chip, SectionHeader, StatCard, TaskCard, formatMoney } from '../components/ui';

export function Dashboard({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
  const totalBirds = data.batches.reduce((sum, batch) => sum + batch.quantity, 0);
  const eggsToday = data.eggs[0] ? data.eggs[0].trays * 30 + data.eggs[0].looseEggs : 0;
  const feedLeft = data.inventory.filter((i) => i.category === 'Feed').reduce((sum, item) => sum + item.quantity, 0);
  const income = data.sales.filter((s) => s.type === 'Income').reduce((sum, sale) => sum + sale.amount, 0);
  const expenses = data.sales.filter((s) => s.type === 'Expense').reduce((sum, sale) => sum + sale.amount, 0);
  return (
    <>
      <div className="mb-stack-lg flex items-center justify-between rounded-xl border border-primary/20 bg-primary-fixed p-stack-md text-primary">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} />
          <span className="text-sm font-bold">FLOCK HEALTH: OPTIMAL</span>
        </div>
        <Chip>Good</Chip>
      </div>
      <section className="mb-stack-lg grid grid-cols-2 gap-gutter-mobile">
        <StatCard icon={<Sprout size={20} />} label="Total Birds" value={String(totalBirds)} note="+12 this week" />
        <StatCard icon={<BarChart3 size={20} />} label="Mortality" value="2%" note="Below threshold" tone="error" />
        <StatCard icon={<Egg size={20} />} label="Daily Eggs" value={String(eggsToday)} note="Target: 150" tone="secondary" />
        <StatCard icon={<Package size={20} />} label="Feed Left" value={`${feedLeft}kg`} note="Reorder at 160kg" tone="tertiary" />
      </section>
      <section className="record-card mb-stack-lg p-stack-md">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-primary">Revenue This Week</h2>
          <Wallet className="text-primary" />
        </div>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">{formatMoney(income - expenses)}</span>
          <span className="font-bold text-primary">+14%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full w-[85%] bg-secondary-container" />
        </div>
      </section>
      <SectionHeader title="Upcoming Tasks" action="View all" onAction={() => setCurrent('farm_activity_log_1')} />
      <div className="space-y-stack-sm">
        {data.tasks.slice(0, 3).map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </>
  );
}
