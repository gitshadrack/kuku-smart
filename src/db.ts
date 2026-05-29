import Dexie, { Table } from 'dexie';

export type SyncStatus = 'queued' | 'syncing' | 'failed' | 'accepted';

export interface BaseRecord {
  id?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Batch extends BaseRecord {
  name: string;
  breed: string;
  quantity: number;
  arrivalDate: string;
  supplier: string;
  status: 'Healthy' | 'At Risk' | 'Watch' | 'Sold';
  cost: number;
}

export interface EggRecord extends BaseRecord {
  batchName: string;
  date: string;
  trays: number;
  looseEggs: number;
  damaged: number;
}

export interface HealthRecord extends BaseRecord {
  batchName: string;
  date: string;
  issue: string;
  treatment: string;
  status: string;
}

export interface FeedRecord extends BaseRecord {
  feedType: string;
  quantityKg: number;
  cost: number;
  supplier: string;
  date: string;
}

export interface Sale extends BaseRecord {
  item: string;
  buyer: string;
  quantity: string;
  amount: number;
  date: string;
  type: 'Income' | 'Expense';
}

export interface InventoryItem extends BaseRecord {
  item: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
}

export interface Task extends BaseRecord {
  title: string;
  dueDate: string;
  priority: 'Urgent' | 'High' | 'Normal';
  category: string;
  done: boolean;
}

export interface Worker extends BaseRecord {
  name: string;
  role: string;
  phone: string;
  attendance: string;
  performance: number;
}

export interface ContactRecord extends BaseRecord {
  name: string;
  county: string;
  phone: string;
  specialty: string;
}

export interface VaccinationRecord extends BaseRecord {
  vaccine: string;
  batchName: string;
  dueDate: string;
  status: 'Due' | 'Scheduled' | 'Done';
}

export interface MortalityRecord extends BaseRecord {
  batchName: string;
  date: string;
  count: number;
  cause: string;
}

export interface MaintenanceRecord extends BaseRecord {
  asset: string;
  date: string;
  action: string;
  cost: number;
  status: string;
}

export interface SmsAlertSetting extends BaseRecord {
  alertType: string;
  enabled: boolean;
  recipient: string;
  timing: string;
}

export interface TenantProfile extends BaseRecord {
  name: string;
  code: string;
  county: string;
  ownerName: string;
  active: boolean;
}

export interface ModuleActivation extends BaseRecord {
  tenantId: number;
  moduleId: string;
  label: string;
  active: boolean;
  activatedAt?: string;
  expiresAt?: string;
  paymentReference?: string;
  paidAt?: string;
  amountPaid?: number;
}

export interface SyncQueueItem extends BaseRecord {
  tableName: string;
  recordId: number;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  status: SyncStatus;
  attempts: number;
  nextRetryAt?: string;
  lastError?: string;
}

const now = () => new Date().toISOString();

export class KukuSmartDb extends Dexie {
  batches!: Table<Batch, number>;
  egg_records!: Table<EggRecord, number>;
  health_records!: Table<HealthRecord, number>;
  feed_records!: Table<FeedRecord, number>;
  sales!: Table<Sale, number>;
  inventory_items!: Table<InventoryItem, number>;
  tasks!: Table<Task, number>;
  workers!: Table<Worker, number>;
  suppliers!: Table<ContactRecord, number>;
  buyers!: Table<ContactRecord, number>;
  vets!: Table<ContactRecord, number>;
  vaccination_records!: Table<VaccinationRecord, number>;
  mortality_records!: Table<MortalityRecord, number>;
  equipment_maintenance!: Table<MaintenanceRecord, number>;
  sms_alert_settings!: Table<SmsAlertSetting, number>;
  tenant_profiles!: Table<TenantProfile, number>;
  module_activations!: Table<ModuleActivation, number>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('kuku_smart_offline_db');
    this.version(1).stores({
      batches: '++id, name, breed, status, updatedAt',
      egg_records: '++id, batchName, date, updatedAt',
      health_records: '++id, batchName, date, status, updatedAt',
      feed_records: '++id, feedType, supplier, date, updatedAt',
      sales: '++id, item, buyer, date, type, updatedAt',
      inventory_items: '++id, item, category, updatedAt',
      tasks: '++id, dueDate, priority, done, updatedAt',
      workers: '++id, name, role, updatedAt',
      suppliers: '++id, name, county, updatedAt',
      buyers: '++id, name, county, updatedAt',
      vets: '++id, name, county, updatedAt',
      vaccination_records: '++id, vaccine, batchName, dueDate, status, updatedAt',
      mortality_records: '++id, batchName, date, updatedAt',
      equipment_maintenance: '++id, asset, date, status, updatedAt',
      sms_alert_settings: '++id, alertType, enabled, updatedAt',
      sync_queue: '++id, tableName, recordId, status, createdAt, nextRetryAt'
    });
    this.version(2).stores({
      batches: '++id, name, breed, status, updatedAt',
      egg_records: '++id, batchName, date, updatedAt',
      health_records: '++id, batchName, date, status, updatedAt',
      feed_records: '++id, feedType, supplier, date, updatedAt',
      sales: '++id, item, buyer, date, type, updatedAt',
      inventory_items: '++id, item, category, updatedAt',
      tasks: '++id, dueDate, priority, done, updatedAt',
      workers: '++id, name, role, updatedAt',
      suppliers: '++id, name, county, updatedAt',
      buyers: '++id, name, county, updatedAt',
      vets: '++id, name, county, updatedAt',
      vaccination_records: '++id, vaccine, batchName, dueDate, status, updatedAt',
      mortality_records: '++id, batchName, date, updatedAt',
      equipment_maintenance: '++id, asset, date, status, updatedAt',
      sms_alert_settings: '++id, alertType, enabled, updatedAt',
      tenant_profiles: '++id, code, active, updatedAt',
      module_activations: '++id, tenantId, moduleId, active, updatedAt',
      sync_queue: '++id, tableName, recordId, status, createdAt, nextRetryAt'
    });
  }
}

export const db = new KukuSmartDb();

export const moduleCatalog = [
  { moduleId: 'core', label: 'Core Operations', defaultActive: true, price: 0 },
  { moduleId: 'farm_records', label: 'Farm Records', defaultActive: false, price: 1200 },
  { moduleId: 'feed_suppliers', label: 'Feed and Suppliers', defaultActive: false, price: 900 },
  { moduleId: 'health', label: 'Health', defaultActive: false, price: 1000 },
  { moduleId: 'market_sales', label: 'Market and Sales', defaultActive: false, price: 1500 },
  { moduleId: 'workers_alerts', label: 'Workers and Alerts', defaultActive: false, price: 800 }
];

export async function queueChange<T extends BaseRecord>(
  tableName: keyof KukuSmartDb,
  recordId: number,
  operation: SyncQueueItem['operation'],
  payload: T
) {
  await db.sync_queue.add({
    tableName: String(tableName),
    recordId,
    operation,
    payload,
    status: 'queued',
    attempts: 0,
    createdAt: now(),
    updatedAt: now()
  });
}

export async function createRecord<T extends BaseRecord>(
  table: Table<T, number>,
  tableName: keyof KukuSmartDb,
  value: Omit<T, 'createdAt' | 'updatedAt' | 'id'>
) {
  const stamped = { ...value, createdAt: now(), updatedAt: now() } as T;
  const id = await table.add(stamped);
  await queueChange(tableName, id, 'create', { ...stamped, id });
  return id;
}

export async function seedDatabase() {
  const stamp = now();
  let tenantId = (await db.tenant_profiles.where('active').equals(1).first())?.id;
  if (!tenantId) {
    tenantId = await db.tenant_profiles.add({
      name: 'Nyeri Smallholder Poultry',
      code: 'NYERI-KUKU-001',
      county: 'Nyeri',
      ownerName: 'Farm Owner',
      active: true,
      createdAt: stamp,
      updatedAt: stamp
    });
  }
  for (const module of moduleCatalog) {
    const existing = await db.module_activations
      .where('tenantId')
      .equals(tenantId)
      .and((activation) => activation.moduleId === module.moduleId)
      .first();
    if (!existing) {
      await db.module_activations.add({
        tenantId,
        moduleId: module.moduleId,
        label: module.label,
        active: module.defaultActive,
        activatedAt: module.defaultActive ? stamp : undefined,
        createdAt: stamp,
        updatedAt: stamp
      });
    } else if (existing.id && module.price > 0 && existing.active && !existing.paymentReference) {
      await db.module_activations.update(existing.id, {
        active: false,
        activatedAt: undefined,
        updatedAt: stamp
      });
    }
  }
  if ((await db.batches.count()) > 0) return;
  await db.transaction(
    'rw',
    [
      db.batches,
      db.egg_records,
      db.health_records,
      db.feed_records,
      db.sales,
      db.inventory_items,
      db.tasks,
      db.workers,
      db.suppliers,
      db.buyers,
      db.vets,
      db.vaccination_records,
      db.mortality_records,
      db.equipment_maintenance,
      db.sms_alert_settings,
      db.tenant_profiles,
      db.module_activations,
      db.sync_queue
    ],
    async () => {
      await db.batches.bulkAdd([
        { name: 'Batch #042', breed: 'Improved Kienyeji', quantity: 300, arrivalDate: '2026-04-18', supplier: 'Kenchic Nyeri Depot', status: 'Healthy', cost: 45000, createdAt: stamp, updatedAt: stamp },
        { name: 'Batch #041', breed: 'Kuroiler', quantity: 250, arrivalDate: '2026-03-01', supplier: 'Kuku Hatcheries Ltd', status: 'At Risk', cost: 37500, createdAt: stamp, updatedAt: stamp },
        { name: 'Batch #040', breed: 'Broilers', quantity: 180, arrivalDate: '2026-02-14', supplier: 'Juja Poultry Centre', status: 'Healthy', cost: 27000, createdAt: stamp, updatedAt: stamp },
        { name: 'Batch #039', breed: 'Layers', quantity: 120, arrivalDate: '2025-11-02', supplier: 'Muguka Agrovet', status: 'Watch', cost: 24000, createdAt: stamp, updatedAt: stamp }
      ]);
      await db.egg_records.bulkAdd([
        { batchName: 'Batch #039', date: '2026-05-26', trays: 4, looseEggs: 22, damaged: 3, createdAt: stamp, updatedAt: stamp },
        { batchName: 'Batch #039', date: '2026-05-25', trays: 4, looseEggs: 15, damaged: 2, createdAt: stamp, updatedAt: stamp }
      ]);
      await db.health_records.bulkAdd([
        { batchName: 'Batch #041', date: '2026-05-24', issue: 'Coughing in one coop', treatment: 'Isolated and called vet', status: 'Monitoring', createdAt: stamp, updatedAt: stamp },
        { batchName: 'Batch #042', date: '2026-05-22', issue: 'Routine inspection', treatment: 'No action required', status: 'Clear', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.feed_records.bulkAdd([
        { feedType: 'Layers Mash', quantityKg: 700, cost: 24500, supplier: 'Unga Farm Care', date: '2026-05-20', createdAt: stamp, updatedAt: stamp },
        { feedType: 'Broiler Starter', quantityKg: 250, cost: 11250, supplier: 'Pembe Feeds', date: '2026-05-18', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.sales.bulkAdd([
        { item: '50 Broilers Sold', buyer: 'Market Gate Sale', quantity: '50 birds', amount: 35000, date: '2026-05-24', type: 'Income', createdAt: stamp, updatedAt: stamp },
        { item: 'Layers Mash (10 Bags)', buyer: 'Kenchic Supplies', quantity: '700 kg', amount: 24500, date: '2026-05-22', type: 'Expense', createdAt: stamp, updatedAt: stamp },
        { item: '20 Trays of Eggs', buyer: 'Mama Mboga Retail', quantity: '20 trays', amount: 12000, date: '2026-05-18', type: 'Income', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.inventory_items.bulkAdd([
        { item: 'Layers Mash', category: 'Feed', quantity: 250, unit: 'kg', reorderLevel: 160, createdAt: stamp, updatedAt: stamp },
        { item: 'Egg Trays', category: 'Packaging', quantity: 86, unit: 'trays', reorderLevel: 40, createdAt: stamp, updatedAt: stamp },
        { item: 'Disinfectant', category: 'Biosecurity', quantity: 12, unit: 'litres', reorderLevel: 8, createdAt: stamp, updatedAt: stamp }
      ]);
      await db.tasks.bulkAdd([
        { title: 'Newcastle vaccination', dueDate: '2026-05-28', priority: 'Urgent', category: 'Health', done: false, createdAt: stamp, updatedAt: stamp },
        { title: 'Replenish broiler starter', dueDate: '2026-05-29', priority: 'High', category: 'Feed', done: false, createdAt: stamp, updatedAt: stamp },
        { title: 'Clean footbath stations', dueDate: '2026-05-26', priority: 'Normal', category: 'Biosecurity', done: true, createdAt: stamp, updatedAt: stamp }
      ]);
      await db.workers.bulkAdd([
        { name: 'Grace Wanjiru', role: 'Egg collection', phone: '+254 712 345 901', attendance: 'Present', performance: 94, createdAt: stamp, updatedAt: stamp },
        { name: 'Peter Mwangi', role: 'Feeding and cleaning', phone: '+254 733 115 420', attendance: 'Present', performance: 88, createdAt: stamp, updatedAt: stamp }
      ]);
      await db.suppliers.bulkAdd([
        { name: 'Unga Farm Care', county: 'Nairobi', phone: '+254 700 112 233', specialty: 'Feed supply', createdAt: stamp, updatedAt: stamp },
        { name: 'Kenchic Nyeri Depot', county: 'Nyeri', phone: '+254 722 900 500', specialty: 'Chicks and vaccines', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.buyers.bulkAdd([
        { name: 'Nyeri Town Hotel', county: 'Nyeri', phone: '+254 711 222 333', specialty: 'Eggs and dressed chicken', createdAt: stamp, updatedAt: stamp },
        { name: 'Mama Mboga Retail', county: 'Nyeri', phone: '+254 745 400 211', specialty: 'Egg trays', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.vets.bulkAdd([
        { name: 'Dr. Achieng Otieno', county: 'Nyeri', phone: '+254 701 333 222', specialty: 'Poultry vaccination', createdAt: stamp, updatedAt: stamp },
        { name: 'Dr. Kamau Njoroge', county: 'Kirinyaga', phone: '+254 722 600 118', specialty: 'Flock diagnostics', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.vaccination_records.bulkAdd([
        { vaccine: 'Newcastle', batchName: 'Batch #042', dueDate: '2026-05-28', status: 'Due', createdAt: stamp, updatedAt: stamp },
        { vaccine: 'Gumboro', batchName: 'Batch #041', dueDate: '2026-06-03', status: 'Scheduled', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.mortality_records.bulkAdd([
        { batchName: 'Batch #041', date: '2026-05-23', count: 3, cause: 'Suspected respiratory stress', createdAt: stamp, updatedAt: stamp },
        { batchName: 'Batch #040', date: '2026-05-16', count: 1, cause: 'Transport stress', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.equipment_maintenance.bulkAdd([
        { asset: 'Solar brooder', date: '2026-05-21', action: 'Thermostat checked', cost: 1200, status: 'Complete', createdAt: stamp, updatedAt: stamp },
        { asset: 'Water nipples', date: '2026-05-27', action: 'Replace blocked nipples', cost: 850, status: 'Planned', createdAt: stamp, updatedAt: stamp }
      ]);
      await db.sms_alert_settings.bulkAdd([
        { alertType: 'Vaccination reminders', enabled: true, recipient: 'Owner and worker', timing: '2 days before', createdAt: stamp, updatedAt: stamp },
        { alertType: 'Low feed stock', enabled: true, recipient: 'Owner', timing: 'When below reorder level', createdAt: stamp, updatedAt: stamp }
      ]);
    }
  );
}

export async function getOldestQueuedSyncItems(limit = 10) {
  return db.sync_queue.where('status').equals('queued').sortBy('createdAt').then((items) => items.slice(0, limit));
}
