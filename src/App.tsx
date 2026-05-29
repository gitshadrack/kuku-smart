import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Egg,
  HeartPulse,
  Home,
  ListPlus,
  LogOut,
  Menu,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Stethoscope,
  Users,
  Wallet,
  X
} from 'lucide-react';
import {
  Batch,
  ContactRecord,
  EggRecord,
  FeedRecord,
  HealthRecord,
  InventoryItem,
  MaintenanceRecord,
  MortalityRecord,
  ModuleActivation,
  Sale,
  SmsAlertSetting,
  Task,
  TenantProfile,
  VaccinationRecord,
  Worker,
  createRecord,
  db,
  moduleCatalog,
  queueChange,
  seedDatabase
} from './db';

type RouteKey =
  | 'farmer_dashboard_1' | 'farmer_dashboard_2' | 'farm_activity_log_1' | 'farm_activity_log_2'
  | 'farm_performance_report_1' | 'farm_performance_report_2' | 'farm_settings_1' | 'farm_settings_2'
  | 'health_dashboard_1' | 'health_dashboard_2' | 'market_trends_dashboard_1' | 'market_trends_dashboard_2'
  | 'worker_performance_report' | 'add_new_batch_1' | 'add_new_batch_2' | 'bird_batches_1' | 'bird_batches_2'
  | 'egg_production_records_1' | 'egg_production_records_2' | 'equipment_maintenance_log_1' | 'equipment_maintenance_log_2'
  | 'feed_inventory_replenishment_1' | 'feed_inventory_replenishment_2' | 'inventory_management_1' | 'inventory_management_2'
  | 'spare_parts_tools_inventory_1' | 'spare_parts_tools_inventory_2' | 'feed_management_1' | 'feed_management_2'
  | 'feed_cost_analysis_1' | 'feed_cost_analysis_2' | 'supplier_directory_1' | 'supplier_directory_2'
  | 'biosecurity_checklist_1' | 'biosecurity_checklist_2' | 'log_health_record_1' | 'log_health_record_2'
  | 'mortality_analysis_1' | 'mortality_analysis_2' | 'treatment_history_report_1' | 'treatment_history_report_2'
  | 'vaccination_schedule_1' | 'vaccination_schedule_2' | 'vet_directory_1' | 'vet_directory_2'
  | 'buyer_offer_management_1' | 'buyer_offer_management_2' | 'list_produce_for_sale_1' | 'list_produce_for_sale_2'
  | 'market_connectivity_1' | 'market_connectivity_2' | 'predictive_revenue_forecast_1' | 'predictive_revenue_forecast_2'
  | 'sales_market_ledger_1' | 'sales_market_ledger_2' | 'worker_attendance_tracker_1' | 'worker_attendance_tracker_2'
  | 'worker_shift_scheduling' | 'sms_alert_configuration_1' | 'sms_alert_configuration_2';

const routes: { key: RouteKey; label: string; group: string; kind: string }[] = [
  ['farmer_dashboard_1', 'Farmer Dashboard', 'Core', 'dashboard'],
  ['farm_activity_log_1', 'Farm Activity Log', 'Core', 'activity'],
  ['farm_performance_report_1', 'Performance Report', 'Core', 'report'],
  ['farm_settings_1', 'Farm Settings', 'Core', 'settings'],
  ['health_dashboard_1', 'Health Dashboard', 'Core', 'health'],
  ['market_trends_dashboard_1', 'Market Trends', 'Core', 'market'],
  ['worker_performance_report', 'Worker Performance', 'Core', 'workers'],
  ['add_new_batch_1', 'Add New Batch', 'Farm Records', 'batch-form'],
  ['bird_batches_1', 'Bird Batches', 'Farm Records', 'batches'],
  ['egg_production_records_1', 'Egg Production', 'Farm Records', 'eggs'],
  ['equipment_maintenance_log_1', 'Equipment Maintenance', 'Farm Records', 'maintenance'],
  ['feed_inventory_replenishment_1', 'Feed Replenishment', 'Farm Records', 'feed'],
  ['inventory_management_1', 'Inventory Management', 'Farm Records', 'inventory'],
  ['spare_parts_tools_inventory_1', 'Spare Parts & Tools', 'Farm Records', 'inventory'],
  ['feed_management_1', 'Feed Management', 'Feed and Suppliers', 'feed'],
  ['feed_cost_analysis_1', 'Feed Cost Analysis', 'Feed and Suppliers', 'report'],
  ['supplier_directory_1', 'Supplier Directory', 'Feed and Suppliers', 'suppliers'],
  ['biosecurity_checklist_1', 'Biosecurity Checklist', 'Health', 'checklist'],
  ['log_health_record_1', 'Log Health Record', 'Health', 'health-form'],
  ['mortality_analysis_1', 'Mortality Analysis', 'Health', 'mortality'],
  ['treatment_history_report_1', 'Treatment History', 'Health', 'treatments'],
  ['vaccination_schedule_1', 'Vaccination Schedule', 'Health', 'vaccination'],
  ['vet_directory_1', 'Vet Directory', 'Health', 'vets'],
  ['buyer_offer_management_1', 'Buyer Offers', 'Market and Sales', 'offers'],
  ['list_produce_for_sale_1', 'List Produce', 'Market and Sales', 'sale-form'],
  ['market_connectivity_1', 'Market Connectivity', 'Market and Sales', 'market'],
  ['predictive_revenue_forecast_1', 'Revenue Forecast', 'Market and Sales', 'forecast'],
  ['sales_market_ledger_1', 'Sales & Market Ledger', 'Market and Sales', 'sales'],
  ['worker_attendance_tracker_1', 'Worker Attendance', 'Workers and Alerts', 'workers'],
  ['worker_shift_scheduling', 'Shift Scheduling', 'Workers and Alerts', 'workers'],
  ['sms_alert_configuration_1', 'SMS Alerts', 'Workers and Alerts', 'sms']
].map(([key, label, group, kind]) => ({ key: key as RouteKey, label, group, kind }));

function moduleForRoute(route: { label: string; group: string; kind: string }) {
  if (route.kind === 'dashboard' || route.kind === 'settings' || route.kind === 'activity' || route.kind === 'report') return 'core';
  if (route.group === 'Farm Records' || ['batches', 'batch-form', 'eggs', 'inventory', 'maintenance'].includes(route.kind)) return 'farm_records';
  if (route.group === 'Feed and Suppliers' || route.kind === 'feed' || route.kind === 'suppliers') return 'feed_suppliers';
  if (route.group === 'Health' || ['health', 'health-form', 'mortality', 'treatments', 'vaccination', 'vets', 'checklist'].includes(route.kind)) return 'health';
  if (route.group === 'Market and Sales' || ['sales', 'market', 'offers', 'forecast', 'sale-form'].includes(route.kind)) return 'market_sales';
  if (route.group === 'Workers and Alerts' || ['workers', 'sms'].includes(route.kind)) return 'workers_alerts';
  return 'core';
}

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

function useFarmData(refreshKey: number, enabled = true) {
  const [data, setData] = useState({
    batches: [] as Batch[],
    eggs: [] as EggRecord[],
    health: [] as HealthRecord[],
    feed: [] as FeedRecord[],
    sales: [] as Sale[],
    inventory: [] as InventoryItem[],
    tasks: [] as Task[],
    workers: [] as Worker[],
    suppliers: [] as ContactRecord[],
    buyers: [] as ContactRecord[],
    vets: [] as ContactRecord[],
    vaccinations: [] as VaccinationRecord[],
    mortality: [] as MortalityRecord[],
    maintenance: [] as MaintenanceRecord[],
    sms: [] as SmsAlertSetting[],
    tenant: undefined as TenantProfile | undefined,
    modules: [] as ModuleActivation[],
    queued: 0
  });
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    seedDatabase().then(async () => {
      const result = {
        batches: await db.batches.toArray(),
        eggs: await db.egg_records.reverse().toArray(),
        health: await db.health_records.reverse().toArray(),
        feed: await db.feed_records.reverse().toArray(),
        sales: await db.sales.reverse().toArray(),
        inventory: await db.inventory_items.toArray(),
        tasks: await db.tasks.toArray(),
        workers: await db.workers.toArray(),
        suppliers: await db.suppliers.toArray(),
        buyers: await db.buyers.toArray(),
        vets: await db.vets.toArray(),
        vaccinations: await db.vaccination_records.toArray(),
        mortality: await db.mortality_records.reverse().toArray(),
        maintenance: await db.equipment_maintenance.reverse().toArray(),
        sms: await db.sms_alert_settings.toArray(),
        tenant: await db.tenant_profiles.where('active').equals(1).first(),
        modules: await db.module_activations.toArray(),
        queued: await db.sync_queue.where('status').anyOf('queued', 'failed').count()
      };
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, [enabled, refreshKey]);
  return data;
}

const formatMoney = (value: number) => `KSh ${value.toLocaleString('en-KE')}`;
const iconSize = 22;
const authStorageKey = 'kuku_smart_local_login_v1';

type AuthRecord = {
  username: string;
  salt: string;
  passwordHash: string;
  iterations: number;
  createdAt: string;
};

const authEncoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', authEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations },
    key,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function createAuthRecord(username: string, password: string): Promise<AuthRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 210000;
  return {
    username: normalizeUsername(username),
    salt: bytesToBase64(salt),
    passwordHash: await derivePasswordHash(password, salt, iterations),
    iterations,
    createdAt: new Date().toISOString()
  };
}

async function verifyLogin(username: string, password: string, record: AuthRecord) {
  if (normalizeUsername(username) !== record.username) return false;
  const passwordHash = await derivePasswordHash(password, base64ToBytes(record.salt), record.iterations);
  return passwordHash === record.passwordHash;
}

function getStoredAuthRecord() {
  const raw = localStorage.getItem(authStorageKey);
  if (!raw) return undefined;
  try {
    const record = JSON.parse(raw) as AuthRecord;
    if (!record.username || !record.passwordHash || !record.salt || !record.iterations) {
      localStorage.removeItem(authStorageKey);
      return undefined;
    }
    return record;
  } catch {
    localStorage.removeItem(authStorageKey);
    return undefined;
  }
}

function TopBar({ route, onOpenMenu, onBack, onLogout }: { route: { label: string }; onOpenMenu: () => void; onBack: () => void; onLogout: () => void }) {
  const isHome = route.label.includes('Dashboard') || route.label === 'Farmer Dashboard';
  return (
    <header className="fixed left-0 top-0 z-40 flex h-touch-target w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile transition-[left,width] duration-200 ease-out lg:left-72 lg:w-[calc(100%-18rem)]">
      <div className="flex items-center gap-3">
        {isHome ? (
          <button className="focus-ring flex h-12 w-12 items-center justify-center rounded-full text-primary lg:hidden" onClick={onOpenMenu} aria-label="Open screen menu">
            <Menu size={iconSize} />
          </button>
        ) : (
          <button className="focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" onClick={onBack} aria-label="Back">
            <ArrowLeft size={iconSize} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Sprout className="text-primary" size={24} />
          <h1 className="font-heading text-xl font-bold text-primary">Kuku Smart</h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" aria-label="Notifications">
          <Bell size={iconSize} />
        </button>
        <button className="focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" onClick={onLogout} aria-label="Log out">
          <LogOut size={iconSize} />
        </button>
      </div>
    </header>
  );
}

function OfflineBanner({ online, queued }: { online: boolean; queued: number }) {
  return (
    <div className={`mb-stack-md flex items-center justify-between rounded-xl border px-4 py-3 ${online ? 'border-primary/30 bg-primary-fixed text-primary' : 'border-secondary bg-secondary-container text-on-secondary-container'}`}>
      <div className="flex items-center gap-2">
        {online ? <Check size={18} /> : <AlertTriangle size={18} />}
        <span className="text-sm font-bold">{online ? 'Online: local-first mode' : 'Offline: records still save here'}</span>
      </div>
      <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">{queued} queued</span>
    </div>
  );
}

function BottomNav({ current, setCurrent, activeModuleIds }: { current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[] }) {
  const baseItems: [RouteKey, string, JSX.Element][] = [
    ['farmer_dashboard_1', 'Home', <Home size={22} />],
    ['bird_batches_1', 'Records', <Package size={22} />],
    ['sales_market_ledger_1', 'Sales', <Wallet size={22} />],
    ['health_dashboard_1', 'Health', <HeartPulse size={22} />]
  ];
  const items = baseItems.filter(([key]) => activeModuleIds.includes(moduleForRoute(routes.find((route) => route.key === key) ?? routes[0])));
  const currentRoute = routes.find((r) => r.key === current);
  const navSection = currentRoute?.group === 'Farm Records' || ['batches', 'eggs', 'inventory', 'maintenance', 'feed'].includes(currentRoute?.kind ?? '')
    ? 'Records'
    : currentRoute?.group === 'Market and Sales' || ['sales', 'market', 'offers', 'forecast', 'sale-form'].includes(currentRoute?.kind ?? '')
      ? 'Sales'
      : currentRoute?.group === 'Health' || ['health', 'health-form', 'mortality', 'treatments', 'vaccination', 'vets', 'checklist'].includes(currentRoute?.kind ?? '')
        ? 'Health'
        : 'Home';
  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-20 w-full items-center justify-around rounded-t-xl border-t border-outline-variant bg-surface px-2 py-2 shadow-[0_-2px_8px_rgba(22,26,50,0.10)] lg:hidden">
      {items.map(([key, label, icon]) => {
        const active = navSection === label;
        return (
          <button key={key} onClick={() => setCurrent(key)} className={`focus-ring flex min-w-[68px] flex-col items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'}`}>
            {icon}
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function routeIcon(kind: string) {
  const className = 'shrink-0';
  if (kind === 'dashboard') return <Home className={className} size={20} />;
  if (kind === 'batches' || kind === 'batch-form') return <Sprout className={className} size={20} />;
  if (kind === 'eggs') return <Egg className={className} size={20} />;
  if (kind === 'health' || kind === 'health-form' || kind === 'treatments') return <HeartPulse className={className} size={20} />;
  if (kind === 'vaccination' || kind === 'checklist') return <ShieldCheck className={className} size={20} />;
  if (kind === 'vets') return <Stethoscope className={className} size={20} />;
  if (kind === 'sales' || kind === 'forecast' || kind === 'offers' || kind === 'sale-form') return <Wallet className={className} size={20} />;
  if (kind === 'market') return <ShoppingCart className={className} size={20} />;
  if (kind === 'workers') return <Users className={className} size={20} />;
  if (kind === 'sms') return <Bell className={className} size={20} />;
  if (kind === 'settings') return <Settings className={className} size={20} />;
  if (kind === 'report') return <BarChart3 className={className} size={20} />;
  return <Package className={className} size={20} />;
}

function NavigationPanel({ current, setCurrent, activeModuleIds, onNavigate }: { current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[]; onNavigate?: () => void }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRoutes = routes.filter((route) => activeModuleIds.includes(moduleForRoute(route))).filter((route) => {
    if (!normalizedQuery) return true;
    return `${route.label} ${route.group} ${route.kind}`.toLowerCase().includes(normalizedQuery);
  });
  const groups = [...new Set(visibleRoutes.map((r) => r.group))];
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="border-b border-outline-variant p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sprout className="text-primary" size={26} />
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">Kuku Smart</h2>
            <p className="text-xs font-bold uppercase text-on-surface-variant">Farm modules</p>
          </div>
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-3 text-outline" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-touch-target w-full rounded-lg border border-outline-variant bg-white pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search records, health, sales..."
          />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <section key={group} className="mb-5">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">{group}</h3>
            <div className="space-y-1">
              {visibleRoutes.filter((r) => r.group === group).map((route) => {
                const active = current === route.key;
                return (
                  <button
                    key={route.key}
                    onClick={() => {
                      setCurrent(route.key);
                      onNavigate?.();
                    }}
                    className={`focus-ring flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${active ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
                  >
                    {routeIcon(route.kind)}
                    <span className="flex-1">{route.label}</span>
                    {active && <ChevronRight size={18} />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <div className="rounded-lg border border-outline-variant bg-white p-4 text-sm font-bold text-on-surface-variant">
            No matching module found.
          </div>
        )}
      </div>
      <div className="border-t border-outline-variant p-4">
        <div className="rounded-lg bg-primary-fixed px-3 py-2 text-sm font-bold text-primary">Offline-first records are saved on this device.</div>
      </div>
    </div>
  );
}

function DesktopSidebar({ current, setCurrent, activeModuleIds }: { current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[] }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-dvh w-72 border-r border-outline-variant bg-surface transition-transform duration-200 ease-out lg:block">
      <NavigationPanel current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} />
    </aside>
  );
}

function ScreenDrawer({ open, current, setCurrent, activeModuleIds, onClose }: { open: boolean; current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[]; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-on-surface/30 transition-opacity duration-200 ease-out lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <aside
        className={`relative h-full w-[88vw] max-w-sm overflow-hidden bg-surface shadow-[2px_0_12px_rgba(22,26,50,0.18)] transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="focus-ring absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-on-surface-variant" onClick={onClose} aria-label="Close navigation">
          <X size={22} />
        </button>
        <NavigationPanel current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} onNavigate={onClose} />
      </aside>
    </div>
  );
}

function StatCard({ icon, label, value, note, tone = 'primary' }: { icon: JSX.Element; label: string; value: string; note: string; tone?: 'primary' | 'secondary' | 'tertiary' | 'error' }) {
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

function Chip({ children, tone = 'green' }: { children: string; tone?: 'green' | 'yellow' | 'red' | 'plain' }) {
  const styles = {
    green: 'bg-primary-fixed text-primary',
    yellow: 'bg-secondary-container text-on-secondary-container',
    red: 'bg-error-container text-error',
    plain: 'bg-surface-container text-on-surface-variant'
  }[tone];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>{children}</span>;
}

function Dashboard({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
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

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-stack-sm flex items-center justify-between">
      <h2 className="font-heading text-xl font-semibold text-on-surface">{title}</h2>
      {action && <button onClick={onAction} className="min-h-0 rounded-lg px-2 py-1 text-sm font-bold text-primary">{action}</button>}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
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

function BatchForm({ onSaved }: { onSaved: () => void }) {
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

function HealthForm({ onSaved }: { onSaved: () => void }) {
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

function SaleForm({ onSaved }: { onSaved: () => void }) {
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

function LiveRecordForm({ kind, onSaved }: { kind: string; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
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
      <form
        className="mt-stack-md grid gap-stack-md md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit(new FormData(event.currentTarget));
          event.currentTarget.reset();
        }}
      >
        <LiveFields kind={kind} today={today} />
        <button className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-on-primary md:col-span-2">
          <Save size={20} /> Save locally
        </button>
      </form>
    </details>
  );
}

function LiveFields({ kind, today }: { kind: string; today: string }) {
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

function FormShell({ title, note, children, onSubmit, submitLabel, icon }: { title: string; note: string; children: React.ReactNode; onSubmit: (formData: FormData) => void; submitLabel: string; icon: JSX.Element }) {
  return (
    <form className="space-y-stack-md" onSubmit={(event) => {
      event.preventDefault();
      onSubmit(new FormData(event.currentTarget));
      event.currentTarget.reset();
    }}>
      <div className="mb-stack-lg">
        <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">{title}</h2>
        <p className="text-on-surface-variant">{note}</p>
      </div>
      {children}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center border-t border-outline-variant bg-surface p-4 md:px-margin-mobile">
        <button className="focus-ring flex h-14 w-full max-w-2xl items-center justify-center gap-2 rounded-full bg-primary font-bold text-on-primary shadow-[0_2px_8px_rgba(22,26,50,0.25)]">
          {icon}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function TextField({ name, label, type = 'text', placeholder, defaultValue }: { name: string; label: string; type?: string; placeholder?: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-2 font-bold text-on-surface">
      {label}
      <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
    </label>
  );
}

function SelectField({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-2 font-bold text-on-surface">
      {label}
      <select name={name} className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
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

function BatchesScreen({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
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

function BatchCard({ batch }: { batch: Batch }) {
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function TitleBlock({ title, chips = [] }: { title: string; chips?: string[] }) {
  return (
    <section className="mb-stack-lg">
      <h1 className="mb-stack-sm font-heading text-2xl font-bold text-on-surface">{title}</h1>
      {chips.length > 0 && <div className="flex flex-wrap gap-2">{chips.map((chip) => <Chip key={chip} tone="plain">{chip}</Chip>)}</div>}
    </section>
  );
}

function GenericList({ title, items, icon, entry }: { title: string; items: { title: string; meta: string; amount?: string; tone?: 'green' | 'yellow' | 'red' | 'plain' }[]; icon: JSX.Element; entry?: React.ReactNode }) {
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

function ReportScreen({ title, data }: { title: string; data: ReturnType<typeof useFarmData> }) {
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

function MarketScreen({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
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

function SettingsScreen({ data, onToggleModule }: { data: ReturnType<typeof useFarmData>; onToggleModule: (activation: ModuleActivation) => void }) {
  return (
    <>
      <TitleBlock title="Farm Settings" chips={['Device local', 'No internet required']} />
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
        <div className="space-y-stack-sm">
          {moduleCatalog.map((module) => {
            const activation = data.modules.find((item) => item.moduleId === module.moduleId);
            const active = activation?.active ?? false;
            const lockedCore = module.moduleId === 'core';
            return (
              <div key={module.moduleId} className="record-card flex items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="font-bold">{module.label}</h3>
                  <p className="text-sm text-on-surface-variant">{active ? 'Activated for this tenant' : 'Hidden until activated'}</p>
                </div>
                <button
                  disabled={!activation || lockedCore}
                  onClick={() => activation && onToggleModule(activation)}
                  className={`h-touch-target min-w-28 rounded-xl px-4 text-sm font-bold ${active ? 'bg-primary text-on-primary' : 'border-2 border-primary text-primary'} disabled:opacity-60`}
                >
                  {lockedCore ? 'Required' : active ? 'Active' : 'Activate'}
                </button>
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

function Screen({ route, data, setCurrent, refresh, onToggleModule }: { route: { key: RouteKey; label: string; group: string; kind: string }; data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void; refresh: () => void; onToggleModule: (activation: ModuleActivation) => void }) {
  const liveEntry = <LiveRecordForm kind={route.kind} onSaved={refresh} />;
  if (route.kind === 'dashboard') return <Dashboard data={data} setCurrent={setCurrent} />;
  if (route.kind === 'batch-form') return <BatchForm onSaved={() => { refresh(); setCurrent('bird_batches_1'); }} />;
  if (route.kind === 'health-form') return <HealthForm onSaved={refresh} />;
  if (route.kind === 'sale-form') return <SaleForm onSaved={() => { refresh(); setCurrent('market_connectivity_1'); }} />;
  if (route.kind === 'batches') return <BatchesScreen data={data} setCurrent={setCurrent} />;
  if (route.kind === 'market') return <MarketScreen data={data} setCurrent={setCurrent} />;
  if (route.kind === 'report' || route.kind === 'forecast') return <ReportScreen title={route.label} data={data} />;
  if (route.kind === 'settings') return <SettingsScreen data={data} onToggleModule={onToggleModule} />;
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

function LoginGate({ mode, onAuthenticated }: { mode: 'setup' | 'login'; onAuthenticated: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isSetup = mode === 'setup';

  async function submit() {
    setMessage('');
    if (!crypto.subtle) {
      setMessage('This browser cannot create a secure local login. Use HTTPS or localhost.');
      return;
    }
    if (normalizeUsername(username).length < 3) {
      setMessage('Use a username with at least 3 characters.');
      return;
    }
    if (password.length < 8) {
      setMessage('Use a password with at least 8 characters.');
      return;
    }
    if (isSetup && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (isSetup) {
        const record = await createAuthRecord(username, password);
        localStorage.setItem(authStorageKey, JSON.stringify(record));
        onAuthenticated();
        return;
      }
      const record = getStoredAuthRecord();
      if (record && await verifyLogin(username, password, record)) {
        onAuthenticated();
        return;
      }
      setMessage('Incorrect username or password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile font-body text-on-background">
      <form
        className="w-full max-w-md rounded-lg border border-outline-variant bg-surface p-stack-lg shadow-[0_4px_16px_rgba(22,26,50,0.12)]"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="mb-stack-lg flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary">{isSetup ? 'Create Login' : 'Log In'}</h1>
            <p className="text-sm text-on-surface-variant">{isSetup ? 'Set up the local owner account for this device.' : 'Enter your local account credentials.'}</p>
          </div>
        </div>
        <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            autoComplete={isSetup ? 'username' : 'username'}
            className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete={isSetup ? 'new-password' : 'current-password'}
            className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        {isSetup && (
          <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
            Confirm password
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
        )}
        {message && <p className="mb-stack-md rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-bold text-error">{message}</p>}
        <button disabled={busy} className="focus-ring flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-on-primary disabled:opacity-60">
          <ShieldCheck size={20} /> {busy ? 'Checking...' : isSetup ? 'Create Account' : 'Log In'}
        </button>
      </form>
    </main>
  );
}

export default function App() {
  const [current, setCurrent] = useState<RouteKey>('farmer_dashboard_1');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authMode, setAuthMode] = useState<'checking' | 'setup' | 'login' | 'authenticated'>('checking');
  const online = useOnlineStatus();
  const data = useFarmData(refreshKey, authMode === 'authenticated');
  const route = useMemo(() => routes.find((r) => r.key === current) ?? routes[0], [current]);
  const activeModuleIds = useMemo(
    () => data.modules.length > 0 ? data.modules.filter((module) => module.active).map((module) => module.moduleId) : ['core'],
    [data.modules]
  );
  useEffect(() => {
    if (data.modules.length > 0 && !activeModuleIds.includes(moduleForRoute(route))) {
      setCurrent('farmer_dashboard_1');
    }
  }, [activeModuleIds, data.modules.length, route]);
  useEffect(() => {
    setAuthMode(getStoredAuthRecord() ? 'login' : 'setup');
  }, []);
  async function toggleModuleActivation(activation: ModuleActivation) {
    if (!activation.id || activation.moduleId === 'core') return;
    const updated: ModuleActivation = {
      ...activation,
      active: !activation.active,
      activatedAt: !activation.active ? new Date().toISOString() : activation.activatedAt,
      updatedAt: new Date().toISOString()
    };
    await db.module_activations.update(activation.id, updated);
    await queueChange('module_activations', activation.id, 'update', updated);
    setRefreshKey((key) => key + 1);
  }
  if (authMode === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background font-body text-on-background">
        <p className="font-bold text-primary">Loading login...</p>
      </main>
    );
  }
  if (authMode !== 'authenticated') {
    return <LoginGate mode={authMode} onAuthenticated={() => setAuthMode('authenticated')} />;
  }
  return (
    <div className="min-h-screen bg-background pb-28 font-body text-on-background lg:pb-0">
      <DesktopSidebar current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} />
      <TopBar route={route} onOpenMenu={() => setDrawerOpen(true)} onBack={() => setCurrent('farmer_dashboard_1')} onLogout={() => setAuthMode('login')} />
      <ScreenDrawer open={drawerOpen} current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} onClose={() => setDrawerOpen(false)} />
      <main className="w-full px-margin-mobile pt-20 transition-[margin,width] duration-200 ease-out lg:ml-72 lg:w-[calc(100%-18rem)]">
        <div className="mx-auto max-w-5xl">
          <OfflineBanner online={online} queued={data.queued} />
          <Screen route={route} data={data} setCurrent={setCurrent} refresh={() => setRefreshKey((key) => key + 1)} onToggleModule={toggleModuleActivation} />
        </div>
      </main>
      {!['batch-form', 'health-form', 'sale-form'].includes(route.kind) && <BottomNav current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} />}
    </div>
  );
}
