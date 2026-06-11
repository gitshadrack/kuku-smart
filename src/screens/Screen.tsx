import { Activity, AlertTriangle, Bell, CalendarDays, ClipboardCheck, Egg, HeartPulse, Package, ShieldCheck, ShoppingCart, Sprout, Stethoscope, Users, Wallet } from 'lucide-react';

import { ModuleActivation } from '../db';

import { useFarmData } from '../app/hooks';

import { RouteKey } from '../app/routes';

import { formatMoney } from '../components/ui';

import { BatchesScreen } from './BatchesScreen';

import { Dashboard } from './Dashboard';

import { GenericList } from './GenericList';

import { MarketScreen } from './MarketScreen';

import { ReportScreen } from './ReportScreen';

import { SettingsScreen } from './SettingsScreen';

import { BatchForm, HealthForm, LiveRecordForm, SaleForm } from './recordForms';

export function Screen({ route, data, setCurrent, refresh, onActivateModule, onLogout }: { route: { key: RouteKey; label: string; group: string; kind: string }; data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void; refresh: () => void; onActivateModule: (activation: ModuleActivation, paymentReference: string) => void; onLogout: () => void }) {
  const liveEntry = <LiveRecordForm kind={route.kind} onSaved={refresh} />;
  if (route.kind === 'dashboard') return <Dashboard data={data} setCurrent={setCurrent} />;
  if (route.kind === 'batch-form') return <BatchForm onSaved={() => { refresh(); setCurrent('bird_batches_1'); }} />;
  if (route.kind === 'health-form') return <HealthForm onSaved={refresh} />;
  if (route.kind === 'sale-form') return <SaleForm onSaved={() => { refresh(); setCurrent('market_connectivity_1'); }} />;
  if (route.kind === 'batches') return <BatchesScreen data={data} setCurrent={setCurrent} />;
  if (route.kind === 'market') return <MarketScreen data={data} setCurrent={setCurrent} />;
  if (route.kind === 'report' || route.kind === 'forecast') return <ReportScreen title={route.label} data={data} />;
  if (route.kind === 'settings') return <SettingsScreen data={data} onActivateModule={onActivateModule} onLogout={onLogout} />;
  if (route.kind === 'sales') return <GenericList title={route.label} icon={<Wallet size={22} />} entry={liveEntry} items={data.sales.map((sale) => ({ title: sale.item, meta: `${sale.buyer} - ${sale.date}`, amount: `${sale.type === 'Income' ? '+' : '-'} ${formatMoney(sale.amount)}`, tone: sale.type === 'Income' ? 'green' : 'red' }))} />;
  if (route.kind === 'eggs') return <GenericList title={route.label} icon={<Egg size={22} />} entry={liveEntry} items={data.eggs.map((egg) => ({ title: `${egg.trays} trays, ${egg.looseEggs} loose`, meta: `${egg.batchName} - ${egg.date}`, amount: `${egg.damaged} damaged`, tone: egg.damaged > 2 ? 'yellow' : 'green' }))} />;
  if (route.kind === 'health' || route.kind === 'treatments') return <GenericList title={route.label} icon={<HeartPulse size={22} />} entry={liveEntry} items={data.health.map((h) => ({ title: h.issue, meta: `${h.batchName} - ${h.treatment}`, amount: h.status, tone: h.status === 'Clear' ? 'green' : 'yellow' }))} />;
  if (route.kind === 'feed') return <GenericList title={route.label} icon={<Package size={22} />} entry={liveEntry} items={data.feed.map((f) => ({ title: f.feedType, meta: `${f.quantityKg} kg from ${f.supplier}`, amount: formatMoney(f.cost) }))} />;
  if (route.kind === 'inventory') return <GenericList title={route.label} icon={<Package size={22} />} entry={liveEntry} items={data.inventory.map((i) => ({ title: i.item, meta: `${i.category} - reorder at ${i.reorderLevel} ${i.unit}`, amount: `${i.quantity} ${i.unit}`, tone: i.quantity <= i.reorderLevel ? 'yellow' : 'green' }))} />;
  if (route.kind === 'suppliers') return <GenericList title={route.label} icon={<Sprout size={22} />} entry={liveEntry} items={data.suppliers.map((c) => ({ title: c.name, meta: `${c.county} - ${c.specialty}`, amount: c.phone }))} />;
  if (route.kind === 'vets') return <GenericList title={route.label} icon={<Stethoscope size={22} />} entry={liveEntry} items={data.vets.map((c) => ({ title: c.name, meta: `${c.county} - ${c.specialty}`, amount: c.phone }))} />;
  if (route.kind === 'vaccination') return <GenericList title={route.label} icon={<ShieldCheck size={22} />} entry={liveEntry} items={data.vaccinations.map((v) => ({ title: v.vaccine, meta: `${v.batchName} due ${v.dueDate}`, amount: v.status, tone: v.status === 'Due' ? 'red' : 'yellow' }))} />;
  if (route.kind === 'mortality') return <GenericList title={route.label} icon={<AlertTriangle size={22} />} entry={liveEntry} items={data.mortality.map((m) => ({ title: `${m.count} birds`, meta: `${m.batchName} - ${m.cause}`, amount: m.date, tone: 'red' }))} />;
  if (route.kind === 'maintenance') return <GenericList title={route.label} icon={<Activity size={22} />} entry={liveEntry} items={data.maintenance.map((m) => ({ title: m.asset, meta: `${m.action} - ${formatMoney(m.cost)}`, amount: m.status, tone: m.status === 'Complete' ? 'green' : 'yellow' }))} />;
  if (route.kind === 'workers') return <GenericList title={route.label} icon={<Users size={22} />} entry={liveEntry} items={data.workers.map((w) => ({ title: w.name, meta: `${w.role} - ${w.attendance}`, amount: `${w.performance}%`, tone: w.performance > 90 ? 'green' : 'yellow' }))} />;
  if (route.kind === 'sms') return <GenericList title={route.label} icon={<Bell size={22} />} entry={liveEntry} items={data.sms.map((s) => ({ title: s.alertType, meta: `${s.recipient} - ${s.timing}`, amount: s.enabled ? 'Enabled' : 'Off', tone: s.enabled ? 'green' : 'plain' }))} />;
  if (route.kind === 'checklist') return <GenericList title={route.label} icon={<ClipboardCheck size={22} />} items={['Footbath refreshed', 'Visitors logged', 'Dead birds disposed safely', 'Coop doors secured'].map((title) => ({ title, meta: 'Today checklist', amount: 'Done', tone: 'green' }))} />;
  if (route.kind === 'offers') return <GenericList title={route.label} icon={<ShoppingCart size={22} />} items={data.buyers.map((buyer, i) => ({ title: `${buyer.name} offer`, meta: `Wants eggs and broilers in ${buyer.county}`, amount: formatMoney(10500 + i * 2500), tone: 'yellow' }))} />;
  return <GenericList title={route.label} icon={<CalendarDays size={22} />} entry={liveEntry} items={data.tasks.map((task) => ({ title: task.title, meta: `${task.category} - ${task.dueDate}`, amount: task.priority, tone: task.priority === 'Urgent' ? 'red' : 'yellow' }))} />;
}
