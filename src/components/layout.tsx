import { useState } from 'react';

import { Activity, AlertTriangle, ArrowLeft, BarChart3, Bell, CalendarDays, Check, ChevronRight, ClipboardCheck, Egg, HeartPulse, Home, ListPlus, Menu, Package, Search, Settings, ShieldCheck, ShoppingCart, Sprout, Stethoscope, Users, Wallet, X } from 'lucide-react';

import { moduleCatalog } from '../db';

import { moduleForRoute, RouteKey, routes } from '../app/routes';

export const iconSize = 22;

export function TopBar({ route, onOpenMenu, onBack, onOpenSettings }: { route: { label: string }; onOpenMenu: () => void; onBack: () => void; onOpenSettings: () => void }) {
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
        <button className="focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" onClick={onOpenSettings} aria-label="Farm settings">
          <Settings size={iconSize} />
        </button>
      </div>
    </header>
  );
}

export function OfflineBanner({ online, queued }: { online: boolean; queued: number }) {
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

export function BottomNav({ current, setCurrent, activeModuleIds }: { current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[] }) {
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

export function routeIcon(kind: string) {
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

export function NavigationPanel({ current, setCurrent, activeModuleIds, onNavigate }: { current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[]; onNavigate?: () => void }) {
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

export function DesktopSidebar({ current, setCurrent, activeModuleIds }: { current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[] }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-dvh w-72 border-r border-outline-variant bg-surface transition-transform duration-200 ease-out lg:block">
      <NavigationPanel current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} />
    </aside>
  );
}

export function ScreenDrawer({ open, current, setCurrent, activeModuleIds, onClose }: { open: boolean; current: RouteKey; setCurrent: (r: RouteKey) => void; activeModuleIds: string[]; onClose: () => void }) {
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
