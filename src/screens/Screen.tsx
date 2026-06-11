import { useState } from 'react';

import { Activity, AlertTriangle, BarChart3, Bell, CalendarDays, Check, ChevronRight, ClipboardCheck, Egg, Eye, EyeOff, HeartPulse, ListPlus, LogOut, Package, Plus, Save, Search, Settings, ShieldCheck, ShoppingCart, Sprout, Stethoscope, Users, Wallet } from 'lucide-react';

import { Batch, ModuleActivation, Sale, Task, VaccinationRecord, createRecord, db, moduleCatalog, queueChange } from '../db';

import { useFarmData } from '../app/hooks';

import { RouteKey } from '../app/routes';

import { accountIconFor, accountIconOptions, confirmLogout, createPasswordCredentials, getStoredAuthRecord, storeAuthRecord, verifyLogin, type AccountIconKey, type AuthRecord } from '../auth/auth';

import { modulePrice } from '../admin/storage';

import { FormShell, LiveFormContext, SelectField, TextField, useLiveFormState } from '../components/forms';
import { Chip, InfoCard, Metric, SectionHeader, StatCard, TaskCard, TitleBlock, formatMoney } from '../components/ui';

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

export function BatchForm({ onSaved }: { onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  async function submit(formData: FormData) {
    setSaving(true);
    await createRecord(db.batches, 'batches', {
      name: String(formData.get('name') || 'Batch New'),
      breed: String(formData.get('breed') || 'Improved Kienyeji'),
      quantity: Number(formData.get('quantity') || 0),
      arrivalDate: String(formData.get('arrivalDate') || new Date().toISOString().slice(0, 10)),
      supplier: String(formData.get('supplier') || 'Local supplier'),
      cost: Number(formData.get('cost') || 0),
      status: 'Healthy'
    });
    setSaving(false);
    onSaved();
  }
  return (
    <FormShell title="Batch Details" note="Enter the information for your new flock to start tracking performance and health." onSubmit={submit} submitLabel={saving ? 'Saving...' : 'Save Batch'} icon={<Save size={20} />}>
      <TextField name="name" label="Batch Name/ID" placeholder="e.g. BATCH-2026-005" />
      <SelectField name="breed" label="Breed Type" options={['Improved Kienyeji', 'Kuroiler', 'Broilers', 'Layers', 'Kenbro', 'Indigenous']} />
      <div className="grid gap-stack-md md:grid-cols-2">
        <TextField name="quantity" label="Quantity" type="number" placeholder="0" />
        <TextField name="arrivalDate" label="Arrival Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
      </div>
      <TextField name="supplier" label="Supplier Name" placeholder="e.g. Kuku Hatcheries Ltd" />
      <TextField name="cost" label="Initial Cost" type="number" placeholder="0" />
      <InfoCard title="Smart Records" text="New batches are saved locally first and added to the sync queue for future online synchronization." />
    </FormShell>
  );
}

export function HealthForm({ onSaved }: { onSaved: () => void }) {
  async function submit(formData: FormData) {
    await createRecord(db.health_records, 'health_records', {
      batchName: String(formData.get('batchName') || 'Batch #042'),
      date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
      issue: String(formData.get('issue') || 'Routine check'),
      treatment: String(formData.get('treatment') || 'No treatment required'),
      status: String(formData.get('status') || 'Monitoring')
    });
    onSaved();
  }
  return (
    <FormShell title="Log Health Record" note="Record symptoms, treatment actions, and follow-up notes while in the coop." onSubmit={submit} submitLabel="Save Health Record" icon={<HeartPulse size={20} />}>
      <TextField name="batchName" label="Batch Name" placeholder="Batch #042" />
      <TextField name="date" label="Record Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
      <TextField name="issue" label="Issue Observed" placeholder="e.g. coughing, low appetite" />
      <TextField name="treatment" label="Treatment / Action" placeholder="e.g. isolated birds and called vet" />
      <SelectField name="status" label="Status" options={['Monitoring', 'Clear', 'Needs Vet', 'Recovered']} />
    </FormShell>
  );
}

export function SaleForm({ onSaved }: { onSaved: () => void }) {
  async function submit(formData: FormData) {
    await createRecord(db.sales, 'sales', {
      item: String(formData.get('item') || 'Egg trays'),
      buyer: String(formData.get('buyer') || 'Local buyer'),
      quantity: String(formData.get('quantity') || '1 tray'),
      amount: Number(formData.get('amount') || 0),
      date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
      type: 'Income'
    });
    onSaved();
  }
  return (
    <FormShell title="List Produce for Sale" note="Create a local produce listing and keep it available offline for buyer follow-up." onSubmit={submit} submitLabel="Save Listing" icon={<ShoppingCart size={20} />}>
      <TextField name="item" label="Produce" placeholder="e.g. 20 trays of eggs" />
      <TextField name="quantity" label="Quantity" placeholder="20 trays" />
      <TextField name="amount" label="Asking Price" type="number" placeholder="12000" />
      <TextField name="buyer" label="Preferred Buyer / Market" placeholder="Nyeri Town Hotel" />
      <TextField name="date" label="Available Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
    </FormShell>
  );
}

export function LiveRecordForm({ kind, onSaved }: { kind: string; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const form = useLiveFormState();
  const titleByKind: Record<string, string> = {
    sales: 'Record transaction',
    eggs: 'Record egg collection',
    health: 'Record health note',
    treatments: 'Record treatment',
    feed: 'Record feed stock',
    inventory: 'Record inventory item',
    suppliers: 'Record supplier',
    vets: 'Record vet contact',
    vaccination: 'Record vaccination',
    mortality: 'Record mortality',
    maintenance: 'Record maintenance',
    workers: 'Record worker',
    sms: 'Record SMS alert',
    activity: 'Record task'
  };
  async function submit(formData: FormData) {
    if (kind === 'sales') {
      await createRecord(db.sales, 'sales', {
        item: String(formData.get('item') || 'Farm sale'),
        buyer: String(formData.get('buyer') || 'Local buyer'),
        quantity: String(formData.get('quantity') || '1 unit'),
        amount: Number(formData.get('amount') || 0),
        date: String(formData.get('date') || today),
        type: String(formData.get('type') || 'Income') as Sale['type']
      });
    } else if (kind === 'eggs') {
      await createRecord(db.egg_records, 'egg_records', {
        batchName: String(formData.get('batchName') || 'Batch #039'),
        date: String(formData.get('date') || today),
        trays: Number(formData.get('trays') || 0),
        looseEggs: Number(formData.get('looseEggs') || 0),
        damaged: Number(formData.get('damaged') || 0)
      });
    } else if (kind === 'health' || kind === 'treatments') {
      await createRecord(db.health_records, 'health_records', {
        batchName: String(formData.get('batchName') || 'Batch #042'),
        date: String(formData.get('date') || today),
        issue: String(formData.get('issue') || 'Routine check'),
        treatment: String(formData.get('treatment') || 'No treatment required'),
        status: String(formData.get('status') || 'Monitoring')
      });
    } else if (kind === 'feed') {
      await createRecord(db.feed_records, 'feed_records', {
        feedType: String(formData.get('feedType') || 'Layers Mash'),
        quantityKg: Number(formData.get('quantityKg') || 0),
        cost: Number(formData.get('cost') || 0),
        supplier: String(formData.get('supplier') || 'Local supplier'),
        date: String(formData.get('date') || today)
      });
    } else if (kind === 'inventory') {
      await createRecord(db.inventory_items, 'inventory_items', {
        item: String(formData.get('item') || 'Farm item'),
        category: String(formData.get('category') || 'General'),
        quantity: Number(formData.get('quantity') || 0),
        unit: String(formData.get('unit') || 'units'),
        reorderLevel: Number(formData.get('reorderLevel') || 0)
      });
    } else if (kind === 'suppliers' || kind === 'vets') {
      const record = {
        name: String(formData.get('name') || 'New contact'),
        county: String(formData.get('county') || 'Nyeri'),
        phone: String(formData.get('phone') || '+254'),
        specialty: String(formData.get('specialty') || 'Poultry services')
      };
      if (kind === 'suppliers') await createRecord(db.suppliers, 'suppliers', record);
      else await createRecord(db.vets, 'vets', record);
    } else if (kind === 'vaccination') {
      await createRecord(db.vaccination_records, 'vaccination_records', {
        vaccine: String(formData.get('vaccine') || 'Newcastle'),
        batchName: String(formData.get('batchName') || 'Batch #042'),
        dueDate: String(formData.get('dueDate') || today),
        status: String(formData.get('status') || 'Due') as VaccinationRecord['status']
      });
    } else if (kind === 'mortality') {
      await createRecord(db.mortality_records, 'mortality_records', {
        batchName: String(formData.get('batchName') || 'Batch #042'),
        date: String(formData.get('date') || today),
        count: Number(formData.get('count') || 0),
        cause: String(formData.get('cause') || 'Unknown')
      });
    } else if (kind === 'maintenance') {
      await createRecord(db.equipment_maintenance, 'equipment_maintenance', {
        asset: String(formData.get('asset') || 'Farm equipment'),
        date: String(formData.get('date') || today),
        action: String(formData.get('action') || 'Inspection'),
        cost: Number(formData.get('cost') || 0),
        status: String(formData.get('status') || 'Planned')
      });
    } else if (kind === 'workers') {
      await createRecord(db.workers, 'workers', {
        name: String(formData.get('name') || 'New worker'),
        role: String(formData.get('role') || 'Farm support'),
        phone: String(formData.get('phone') || '+254'),
        attendance: String(formData.get('attendance') || 'Present'),
        performance: Number(formData.get('performance') || 80)
      });
    } else if (kind === 'sms') {
      await createRecord(db.sms_alert_settings, 'sms_alert_settings', {
        alertType: String(formData.get('alertType') || 'Farm reminder'),
        enabled: String(formData.get('enabled') || 'true') === 'true',
        recipient: String(formData.get('recipient') || 'Owner'),
        timing: String(formData.get('timing') || 'Immediately')
      });
    } else {
      await createRecord(db.tasks, 'tasks', {
        title: String(formData.get('title') || 'Farm task'),
        dueDate: String(formData.get('dueDate') || today),
        priority: String(formData.get('priority') || 'Normal') as Task['priority'],
        category: String(formData.get('category') || 'General'),
        done: false
      });
    }
    onSaved();
  }
  return (
    <details className="record-card mb-stack-lg p-stack-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-primary">
        <span className="flex items-center gap-2"><Plus size={20} />{titleByKind[kind] ?? 'Record new item'}</span>
        <ChevronRight size={18} />
      </summary>
      <LiveFormContext.Provider value={form}>
        <form
          className="mt-stack-md grid gap-stack-md md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit(new FormData(event.currentTarget));
            form.reset();
          }}
        >
          <LiveFields kind={kind} today={today} />
          <button className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-on-primary md:col-span-2">
            <Save size={20} /> Save locally
          </button>
        </form>
      </LiveFormContext.Provider>
    </details>
  );
}

export function LiveFields({ kind, today }: { kind: string; today: string }) {
  if (kind === 'sales') return <><TextField name="item" label="Item" placeholder="20 trays of eggs" /><TextField name="buyer" label="Buyer / Payee" placeholder="Nyeri Town Hotel" /><TextField name="quantity" label="Quantity" placeholder="20 trays" /><TextField name="amount" label="Amount" type="number" placeholder="12000" /><TextField name="date" label="Date" type="date" defaultValue={today} /><SelectField name="type" label="Type" options={['Income', 'Expense']} /></>;
  if (kind === 'eggs') return <><TextField name="batchName" label="Batch" placeholder="Batch #039" /><TextField name="date" label="Date" type="date" defaultValue={today} /><TextField name="trays" label="Trays" type="number" placeholder="0" /><TextField name="looseEggs" label="Loose eggs" type="number" placeholder="0" /><TextField name="damaged" label="Damaged eggs" type="number" placeholder="0" /></>;
  if (kind === 'health' || kind === 'treatments') return <><TextField name="batchName" label="Batch" placeholder="Batch #042" /><TextField name="date" label="Date" type="date" defaultValue={today} /><TextField name="issue" label="Issue" placeholder="Low appetite" /><TextField name="treatment" label="Treatment" placeholder="Called vet" /><SelectField name="status" label="Status" options={['Monitoring', 'Clear', 'Needs Vet', 'Recovered']} /></>;
  if (kind === 'feed') return <><TextField name="feedType" label="Feed type" placeholder="Layers Mash" /><TextField name="quantityKg" label="Quantity kg" type="number" placeholder="250" /><TextField name="cost" label="Cost" type="number" placeholder="12000" /><TextField name="supplier" label="Supplier" placeholder="Unga Farm Care" /><TextField name="date" label="Date" type="date" defaultValue={today} /></>;
  if (kind === 'inventory') return <><TextField name="item" label="Item" placeholder="Egg trays" /><TextField name="category" label="Category" placeholder="Packaging" /><TextField name="quantity" label="Quantity" type="number" placeholder="50" /><TextField name="unit" label="Unit" placeholder="trays" /><TextField name="reorderLevel" label="Reorder level" type="number" placeholder="20" /></>;
  if (kind === 'suppliers' || kind === 'vets') return <><TextField name="name" label="Name" placeholder="Contact name" /><TextField name="county" label="County" placeholder="Nyeri" /><TextField name="phone" label="Phone" placeholder="+254..." /><TextField name="specialty" label="Specialty" placeholder="Feed supply" /></>;
  if (kind === 'vaccination') return <><TextField name="vaccine" label="Vaccine" placeholder="Newcastle" /><TextField name="batchName" label="Batch" placeholder="Batch #042" /><TextField name="dueDate" label="Due date" type="date" defaultValue={today} /><SelectField name="status" label="Status" options={['Due', 'Scheduled', 'Done']} /></>;
  if (kind === 'mortality') return <><TextField name="batchName" label="Batch" placeholder="Batch #041" /><TextField name="date" label="Date" type="date" defaultValue={today} /><TextField name="count" label="Birds lost" type="number" placeholder="0" /><TextField name="cause" label="Cause" placeholder="Unknown" /></>;
  if (kind === 'maintenance') return <><TextField name="asset" label="Asset" placeholder="Water nipples" /><TextField name="date" label="Date" type="date" defaultValue={today} /><TextField name="action" label="Action" placeholder="Replace blocked nipples" /><TextField name="cost" label="Cost" type="number" placeholder="0" /><TextField name="status" label="Status" placeholder="Planned" /></>;
  if (kind === 'workers') return <><TextField name="name" label="Name" placeholder="Worker name" /><TextField name="role" label="Role" placeholder="Feeding" /><TextField name="phone" label="Phone" placeholder="+254..." /><SelectField name="attendance" label="Attendance" options={['Present', 'Absent', 'Leave']} /><TextField name="performance" label="Performance %" type="number" placeholder="80" /></>;
  if (kind === 'sms') return <><TextField name="alertType" label="Alert type" placeholder="Low feed stock" /><TextField name="recipient" label="Recipient" placeholder="Owner" /><TextField name="timing" label="Timing" placeholder="2 days before" /><SelectField name="enabled" label="Enabled" options={['true', 'false']} /></>;
  return <><TextField name="title" label="Task" placeholder="Clean footbath stations" /><TextField name="dueDate" label="Due date" type="date" defaultValue={today} /><SelectField name="priority" label="Priority" options={['Normal', 'High', 'Urgent']} /><TextField name="category" label="Category" placeholder="Biosecurity" /></>;
}

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

export function GenericList({ title, items, icon, entry }: { title: string; items: { title: string; meta: string; amount?: string; tone?: 'green' | 'yellow' | 'red' | 'plain' }[]; icon: JSX.Element; entry?: React.ReactNode }) {
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

export function MarketScreen({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
  return (
    <>
      <TitleBlock title="Marketplace" />
      <label className="relative mb-stack-lg block">
        <Search className="absolute left-4 top-3 text-outline" size={22} />
        <input className="h-touch-target w-full rounded-xl border border-outline-variant bg-white pl-12 pr-4 outline-none focus:border-primary" placeholder="Search buyers or commodities..." />
      </label>
      <button onClick={() => setCurrent('list_produce_for_sale_1')} className="mb-stack-lg flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary-container font-bold text-white">
        <ListPlus size={20} /> List Produce for Sale
      </button>
      <SectionHeader title="Live Market Prices" />
      <div className="mb-stack-lg grid grid-cols-2 gap-gutter-mobile md:grid-cols-4">
        {['Eggs (Tray)|KES 450|+2.4%', 'Broilers (kg)|KES 380|-1.1%', 'Manure (Bag)|KES 120|Stable', 'Layers (Live)|KES 850|+0.5%'].map((raw) => {
          const [label, price, trend] = raw.split('|');
          return <div className="record-card p-4" key={label}><p className="text-xs text-outline">{label}</p><p className="font-heading text-xl font-bold">{price}</p><p className={`text-xs font-bold ${trend.startsWith('-') ? 'text-error' : 'text-primary'}`}>{trend}</p></div>;
        })}
      </div>
      <GenericList title="Top Buyers Nearby" icon={<ShoppingCart size={22} />} items={data.buyers.map((buyer) => ({ title: buyer.name, meta: `${buyer.county} - ${buyer.specialty}`, amount: buyer.phone }))} />
    </>
  );
}

export function AccountSettings({ onLogout }: { onLogout: () => void }) {
  const [account, setAccount] = useState<AuthRecord | undefined>(() => getStoredAuthRecord());
  const [email, setEmail] = useState(account?.email ?? '');
  const [accountIcon, setAccountIcon] = useState<AccountIconKey>(account?.accountIcon ?? 'sprout');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'green' | 'red'>('green');
  const [saving, setSaving] = useState(false);

  function showMessage(nextMessage: string, nextTone: 'green' | 'red' = 'green') {
    setMessage(nextMessage);
    setTone(nextTone);
  }

  function saveProfile() {
    const record = getStoredAuthRecord();
    if (!record) {
      showMessage('No local tenant account found. Log out and create a tenant login.', 'red');
      return;
    }
    const cleanEmail = email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showMessage('Enter a valid email address.', 'red');
      return;
    }
    const updated = { ...record, email: cleanEmail, accountIcon };
    storeAuthRecord(updated);
    setAccount(updated);
    showMessage('Account profile updated.');
  }

  async function changePassword() {
    const record = getStoredAuthRecord();
    if (!record) {
      showMessage('No local tenant account found. Log out and create a tenant login.', 'red');
      return;
    }
    if (newPassword.length < 8) {
      showMessage('Use a new password with at least 8 characters.', 'red');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match.', 'red');
      return;
    }
    setSaving(true);
    try {
      const currentOk = await verifyLogin(record.tenantCode, record.username, currentPassword, record);
      if (!currentOk) {
        showMessage('Current password is incorrect.', 'red');
        return;
      }
      const credentials = await createPasswordCredentials(newPassword);
      const updated = { ...record, ...credentials };
      storeAuthRecord(updated);
      setAccount(updated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password updated.');
    } finally {
      setSaving(false);
    }
  }

  if (!account) {
    return (
      <section className="record-card mb-stack-lg p-stack-md">
        <h2 className="mb-2 font-heading text-xl font-semibold text-primary">User Account</h2>
        <p className="text-sm font-bold text-error">No local tenant account found.</p>
      </section>
    );
  }

  return (
    <section className="record-card mb-stack-lg p-stack-md">
      <div className="mb-stack-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            {accountIconFor(accountIcon, 24)}
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-primary">User Account</h2>
            <p className="text-sm text-on-surface-variant">{account.tenantCode} - {account.username}</p>
          </div>
        </div>
        <button type="button" onClick={() => confirmLogout(onLogout)} className="focus-ring flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-error px-4 font-bold text-error">
          <LogOut size={20} /> Log Out
        </button>
      </div>
      <div className="grid gap-stack-md md:grid-cols-2">
        <label className="flex flex-col gap-2 font-bold text-on-surface">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="owner@example.com"
            className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <div>
          <p className="mb-2 font-bold text-on-surface">Account icon</p>
          <div className="grid grid-cols-4 gap-2">
            {accountIconOptions.map((option) => {
              const selected = accountIcon === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAccountIcon(option.key)}
                  className={`focus-ring flex h-14 items-center justify-center rounded-lg border text-sm font-bold ${selected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-white text-on-surface-variant'}`}
                  aria-label={`Use ${option.label} account icon`}
                  title={option.label}
                >
                  {accountIconFor(option.key, 22)}
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" onClick={saveProfile} className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary md:col-span-2">
          <Save size={20} /> Save Account Profile
        </button>
      </div>
      <div className="mt-stack-lg border-t border-outline-variant pt-stack-md">
        <h3 className="mb-stack-md font-heading text-lg font-semibold text-on-surface">Change Password</h3>
        <div className="grid gap-stack-md md:grid-cols-3">
          <label className="flex flex-col gap-2 font-bold text-on-surface">
            Current password
            <div className="relative">
              <input
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="h-touch-target w-full rounded-lg border border-outline bg-white px-4 pr-12 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-2 font-bold text-on-surface">
            New password
            <div className="relative">
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="h-touch-target w-full rounded-lg border border-outline bg-white px-4 pr-12 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-2 font-bold text-on-surface">
            Confirm password
            <div className="relative">
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="h-touch-target w-full rounded-lg border border-outline bg-white px-4 pr-12 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          <button type="button" disabled={saving} onClick={changePassword} className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-primary font-bold text-primary disabled:opacity-60 md:col-span-3">
            <ShieldCheck size={20} /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
      {message && <p className={`mt-stack-md rounded-lg border px-4 py-3 text-sm font-bold ${tone === 'green' ? 'border-primary/30 bg-primary-fixed text-primary' : 'border-error/30 bg-error-container text-error'}`}>{message}</p>}
    </section>
  );
}

export function SettingsScreen({ data, onActivateModule, onLogout }: { data: ReturnType<typeof useFarmData>; onActivateModule: (activation: ModuleActivation, paymentReference: string) => void; onLogout: () => void }) {
  const [paymentReferences, setPaymentReferences] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState('');

  function activatePaidModule(activation: ModuleActivation) {
    const reference = (paymentReferences[activation.moduleId] ?? '').trim();
    if (reference.length < 6) {
      setPaymentError('Enter a valid payment reference for the requested module.');
      return;
    }
    setPaymentError('');
    onActivateModule(activation, reference);
  }

  return (
    <>
      <TitleBlock title="Farm Settings" chips={['Device local', 'No internet required']} />
      <AccountSettings onLogout={onLogout} />
      <section className="record-card mb-stack-lg p-stack-md">
        <h2 className="mb-2 font-heading text-xl font-semibold text-primary">Tenant</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Metric label="Farm" value={data.tenant?.name ?? 'No active tenant'} />
          <Metric label="Tenant Code" value={data.tenant?.code ?? 'Not assigned'} />
          <Metric label="County" value={data.tenant?.county ?? 'Not set'} />
          <Metric label="Owner" value={data.tenant?.ownerName ?? 'Not set'} />
        </div>
      </section>
      <section className="mb-stack-lg">
        <SectionHeader title="Module Activation" />
        <p className="mb-stack-sm text-sm font-bold text-on-surface-variant">New tenants start with Core only. Enter a payment reference to activate each requested module.</p>
        {paymentError && <p className="mb-stack-sm rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-bold text-error">{paymentError}</p>}
        <div className="space-y-stack-sm">
          {moduleCatalog.map((module) => {
            const activation = data.modules.find((item) => item.moduleId === module.moduleId);
            const active = activation?.active ?? false;
            const lockedCore = module.moduleId === 'core';
            const price = module.price ?? 0;
            return (
              <div key={module.moduleId} className="record-card grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <h3 className="font-bold">{module.label}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {lockedCore ? 'Included for every tenant' : active ? `Activated with ${activation?.paymentReference ?? 'payment reference'}` : `Requires payment of ${formatMoney(price)}`}
                  </p>
                </div>
                {lockedCore || active ? (
                  <Chip tone={lockedCore ? 'plain' : 'green'}>{lockedCore ? 'Required' : 'Active'}</Chip>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      value={paymentReferences[module.moduleId] ?? ''}
                      onChange={(event) => setPaymentReferences((current) => ({ ...current, [module.moduleId]: event.target.value }))}
                      placeholder="Payment reference"
                      className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      disabled={!activation}
                      onClick={() => activation && activatePaidModule(activation)}
                      className="focus-ring h-touch-target rounded-xl bg-primary px-4 text-sm font-bold text-on-primary disabled:opacity-60"
                    >
                      Pay & Activate
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <div className="space-y-stack-sm">
        {['Farm profile: Nyeri Smallholder Poultry', 'Default currency: KSh', 'Sync strategy: oldest queued first', `Pending sync items: ${data.queued}`, 'Language: English'].map((line) => (
          <div className="record-card flex items-center justify-between p-4" key={line}>
            <span className="font-bold">{line}</span>
            <Settings className="text-primary" size={20} />
          </div>
        ))}
      </div>
    </>
  );
}

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
