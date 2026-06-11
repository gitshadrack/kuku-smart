import { ClipboardCheck, ShieldCheck } from 'lucide-react';

import { Task } from '../db';

export const formatMoney = (value: number) => `KSh ${value.toLocaleString('en-KE')}`;

export function StatCard({ icon, label, value, note, tone = 'primary' }: { icon: JSX.Element; label: string; value: string; note: string; tone?: 'primary' | 'secondary' | 'tertiary' | 'error' }) {
  const color = { primary: 'text-primary', secondary: 'text-secondary', tertiary: 'text-tertiary', error: 'text-error' }[tone];
  return (
    <div className="record-card pressable flex min-h-[120px] flex-col justify-between p-stack-md">
      <div className="flex items-center gap-2 text-on-surface-variant">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div>
        <p className={`font-heading text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">{note}</p>
      </div>
    </div>
  );
}

export function Chip({ children, tone = 'green' }: { children: string; tone?: 'green' | 'yellow' | 'red' | 'plain' }) {
  const styles = {
    green: 'bg-primary-fixed text-primary',
    yellow: 'bg-secondary-container text-on-secondary-container',
    red: 'bg-error-container text-error',
    plain: 'bg-surface-container text-on-surface-variant'
  }[tone];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>{children}</span>;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-stack-sm flex items-center justify-between">
      <h2 className="font-heading text-xl font-semibold text-on-surface">{title}</h2>
      {action && <button onClick={onAction} className="min-h-0 rounded-lg px-2 py-1 text-sm font-bold text-primary">{action}</button>}
    </div>
  );
}

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="record-card flex gap-4 p-stack-md">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${task.priority === 'Urgent' ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'}`}>
        <ClipboardCheck size={22} />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold">{task.title}</h3>
            <p className="text-sm text-on-surface-variant">{task.category} due {task.dueDate}</p>
          </div>
          <Chip tone={task.priority === 'Urgent' ? 'red' : task.priority === 'High' ? 'yellow' : 'plain'}>{task.done ? 'Done' : task.priority}</Chip>
        </div>
      </div>
    </div>
  );
}

export function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-stack-md">
      <ShieldCheck className="shrink-0 text-primary" size={22} />
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-on-surface-variant">{text}</p>
      </div>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

export function TitleBlock({ title, chips = [] }: { title: string; chips?: string[] }) {
  return (
    <section className="mb-stack-lg">
      <h1 className="mb-stack-sm font-heading text-2xl font-bold text-on-surface">{title}</h1>
      {chips.length > 0 && <div className="flex flex-wrap gap-2">{chips.map((chip) => <Chip key={chip} tone="plain">{chip}</Chip>)}</div>}
    </section>
  );
}
