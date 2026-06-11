import { useEffect, useMemo, useState } from 'react';

import { ModuleActivation, db, queueChange } from './db';

import { AdminConsole } from './admin/AdminConsole';

import { getStoredAuthRecord, LoginGate } from './auth/auth';

import { BottomNav, DesktopSidebar, OfflineBanner, ScreenDrawer, TopBar } from './components/layout';

import { useFarmData, useOnlineStatus } from './app/hooks';

import { moduleForRoute, RouteKey, routes } from './app/routes';

import { Screen } from './screens/Screen';

import { modulePrice } from './admin/storage';

export default function App() {
  const [current, setCurrent] = useState<RouteKey>('farmer_dashboard_1');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authMode, setAuthMode] = useState<'checking' | 'setup' | 'login' | 'tenant_authenticated' | 'admin_authenticated'>('checking');
  const online = useOnlineStatus();
  const data = useFarmData(refreshKey, authMode === 'tenant_authenticated' || authMode === 'admin_authenticated');
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
  async function activateModuleWithPayment(activation: ModuleActivation, paymentReference: string) {
    if (!activation.id || activation.moduleId === 'core') return;
    const paidAt = new Date().toISOString();
    const updated: ModuleActivation = {
      ...activation,
      active: true,
      activatedAt: activation.activatedAt ?? paidAt,
      paidAt,
      paymentReference: paymentReference.trim(),
      amountPaid: modulePrice(activation.moduleId),
      updatedAt: paidAt
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
  if (authMode !== 'tenant_authenticated' && authMode !== 'admin_authenticated') {
    return <LoginGate mode={authMode} onTenantAuthenticated={() => setAuthMode('tenant_authenticated')} onAdminAuthenticated={() => setAuthMode('admin_authenticated')} />;
  }
  if (authMode === 'admin_authenticated') {
    return <AdminConsole data={data} onLogout={() => setAuthMode('login')} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }
  return (
    <div className="min-h-screen bg-background pb-28 font-body text-on-background lg:pb-0">
      <DesktopSidebar current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} />
      <TopBar route={route} onOpenMenu={() => setDrawerOpen(true)} onBack={() => setCurrent('farmer_dashboard_1')} onOpenSettings={() => setCurrent('farm_settings_1')} />
      <ScreenDrawer open={drawerOpen} current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} onClose={() => setDrawerOpen(false)} />
      <main className="w-full px-margin-mobile pt-20 transition-[margin,width] duration-200 ease-out lg:ml-72 lg:w-[calc(100%-18rem)]">
        <div className="mx-auto max-w-5xl">
          <OfflineBanner online={online} queued={data.queued} />
          <Screen route={route} data={data} setCurrent={setCurrent} refresh={() => setRefreshKey((key) => key + 1)} onActivateModule={activateModuleWithPayment} onLogout={() => setAuthMode('login')} />
        </div>
      </main>
      {!['batch-form', 'health-form', 'sale-form'].includes(route.kind) && <BottomNav current={current} setCurrent={setCurrent} activeModuleIds={activeModuleIds} />}
    </div>
  );
}
