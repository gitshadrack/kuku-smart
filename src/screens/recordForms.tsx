import { useState } from 'react';

import { ChevronRight, HeartPulse, Plus, Save, ShoppingCart } from 'lucide-react';

import { Sale, Task, VaccinationRecord, createRecord, db } from '../db';

import { FormShell, LiveFormContext, SelectField, TextField, useLiveFormState } from '../components/forms';

import { InfoCard } from '../components/ui';

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
          onSubmit={async (event) => {
            event.preventDefault();
            await submit(new FormData(event.currentTarget));
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
