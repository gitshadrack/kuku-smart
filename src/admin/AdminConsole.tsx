import { useEffect, useState } from 'react';

import { LogOut, Plus, Save, Settings, ShieldCheck, Sprout, Users, Wallet } from 'lucide-react';

import { ModuleActivation, db, moduleCatalog, queueChange } from '../db';

import { useFarmData } from '../app/hooks';

import { confirmLogout, getStoredAdminAuthRecord, normalizeTenantCode } from '../auth/auth';

import { defaultSuperPackages, ensureSuperadminData, modulePrice, readStorageList, storageId, superBusinessesStorageKey, superPackagesStorageKey, superSubscriptionsStorageKey, writeStorageList, type BillingInterval, type BusinessStatus, type SuperBusiness, type SuperPackage, type SuperSubscription } from './storage';

import { iconSize } from '../components/layout';
import { SelectField, TextField } from '../components/forms';
import { Chip, SectionHeader, StatCard, TitleBlock, formatMoney } from '../components/ui';

export function AdminConsole({ data, onLogout, onRefresh }: { data: ReturnType<typeof useFarmData>; onLogout: () => void; onRefresh: () => void }) {
  const admin = getStoredAdminAuthRecord();
  const [adminTab, setAdminTab] = useState<'businesses' | 'packages' | 'subscriptions'>('businesses');
  const [businesses, setBusinesses] = useState<SuperBusiness[]>([]);
  const [packages, setPackages] = useState<SuperPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<SuperSubscription[]>([]);
  const [message, setMessage] = useState('');
  const activeModules = data.modules.filter((module) => module.active).length;
  const paidModules = data.modules.filter((module) => module.paymentReference).length;
  const totalPaid = data.modules.reduce((sum, module) => sum + (module.amountPaid ?? 0), 0);

  function reloadSuperadminData() {
    ensureSuperadminData(data.tenant);
    setBusinesses(readStorageList<SuperBusiness>(superBusinessesStorageKey, []));
    setPackages(readStorageList<SuperPackage>(superPackagesStorageKey, defaultSuperPackages()));
    setSubscriptions(readStorageList<SuperSubscription>(superSubscriptionsStorageKey, []));
  }

  useEffect(() => {
    reloadSuperadminData();
  }, [data.tenant?.code]);

  function addBusiness(formData: FormData) {
    const stamp = new Date().toISOString();
    const code = normalizeTenantCode(String(formData.get('code') || ''));
    if (!code) {
      setMessage('Business code is required.');
      return;
    }
    if (businesses.some((business) => business.code === code)) {
      setMessage('Business code already exists.');
      return;
    }
    const next = [{
      id: storageId('business'),
      name: String(formData.get('name') || 'New Business'),
      code,
      ownerName: String(formData.get('ownerName') || 'Owner'),
      county: String(formData.get('county') || 'Nyeri'),
      status: 'Active' as BusinessStatus,
      createdAt: stamp,
      updatedAt: stamp
    }, ...businesses];
    writeStorageList(superBusinessesStorageKey, next);
    setBusinesses(next);
    setMessage('Business created.');
  }

  function toggleBusinessStatus(business: SuperBusiness) {
    const next = businesses.map((item) => item.id === business.id ? {
      ...item,
      status: item.status === 'Active' ? 'Inactive' as BusinessStatus : 'Active' as BusinessStatus,
      updatedAt: new Date().toISOString()
    } : item);
    writeStorageList(superBusinessesStorageKey, next);
    setBusinesses(next);
  }

  function addPackage(formData: FormData) {
    const stamp = new Date().toISOString();
    const moduleIds = moduleCatalog.filter((module) => module.moduleId !== 'core' && formData.get(module.moduleId) === 'on').map((module) => module.moduleId);
    if (moduleIds.length === 0) {
      setMessage('Select at least one paid module for the package.');
      return;
    }
    const next = [{
      id: storageId('package'),
      name: String(formData.get('name') || 'Custom Package'),
      price: Number(formData.get('price') || 0),
      interval: String(formData.get('interval') || 'Monthly') as BillingInterval,
      trialDays: Number(formData.get('trialDays') || 0),
      active: true,
      popular: formData.get('popular') === 'on',
      privatePackage: formData.get('privatePackage') === 'on',
      moduleIds,
      createdAt: stamp,
      updatedAt: stamp
    }, ...packages];
    writeStorageList(superPackagesStorageKey, next);
    setPackages(next);
    setMessage('Package created.');
  }

  async function addSubscription(formData: FormData) {
    const businessCode = normalizeTenantCode(String(formData.get('businessCode') || ''));
    const packageId = String(formData.get('packageId') || '');
    const paymentReference = String(formData.get('paymentReference') || '').trim();
    const selectedPackage = packages.find((item) => item.id === packageId);
    if (!businessCode || !selectedPackage || paymentReference.length < 6) {
      setMessage('Select business, package, and a valid payment reference.');
      return;
    }
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    if (selectedPackage.interval === 'Yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);
    const subscription: SuperSubscription = {
      id: storageId('subscription'),
      businessCode,
      packageId,
      status: 'Active',
      paymentReference,
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdAt: startsAt.toISOString()
    };
    const nextSubscriptions = [subscription, ...subscriptions];
    const nextBusinesses = businesses.map((business) => business.code === businessCode ? {
      ...business,
      status: 'Active' as BusinessStatus,
      currentPackageId: packageId,
      updatedAt: startsAt.toISOString()
    } : business);
    writeStorageList(superSubscriptionsStorageKey, nextSubscriptions);
    writeStorageList(superBusinessesStorageKey, nextBusinesses);
    setSubscriptions(nextSubscriptions);
    setBusinesses(nextBusinesses);
    if (normalizeTenantCode(data.tenant?.code ?? '') === businessCode) {
      for (const moduleId of selectedPackage.moduleIds) {
        const activation = data.modules.find((module) => module.moduleId === moduleId);
        if (activation?.id) {
          const updated: ModuleActivation = {
            ...activation,
            active: true,
            activatedAt: activation.activatedAt ?? startsAt.toISOString(),
            paidAt: startsAt.toISOString(),
            paymentReference,
            amountPaid: modulePrice(moduleId),
            updatedAt: startsAt.toISOString()
          };
          await db.module_activations.update(activation.id, updated);
          await queueChange('module_activations', activation.id, 'update', updated);
        }
      }
      onRefresh();
    }
    setMessage('Subscription allocated.');
  }

  return (
    <div className="min-h-screen bg-background font-body text-on-background">
      <header className="sticky top-0 z-40 flex h-touch-target items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile">
        <div className="flex items-center gap-2">
          <Settings className="text-primary" size={24} />
          <div>
            <h1 className="font-heading text-xl font-bold text-primary">Admin Console</h1>
            <p className="text-xs font-bold uppercase text-on-surface-variant">{admin?.adminId ?? 'admin'}</p>
          </div>
        </div>
        <button className="focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" onClick={() => confirmLogout(onLogout)} aria-label="Admin log out">
          <LogOut size={iconSize} />
        </button>
      </header>
      <main className="mx-auto max-w-5xl px-margin-mobile py-stack-lg">
        <TitleBlock title="Superadmin Module" chips={[`${businesses.length} Businesses`, `${packages.length} Packages`, formatMoney(totalPaid)]} />
        <section className="mb-stack-lg grid gap-gutter-mobile md:grid-cols-3">
          <StatCard icon={<Users size={20} />} label="Tenant" value={data.tenant?.name ?? 'No tenant'} note={data.tenant?.county ?? 'Not set'} />
          <StatCard icon={<ShieldCheck size={20} />} label="Modules" value={`${activeModules}/${moduleCatalog.length}`} note={`${paidModules} paid`} tone="secondary" />
          <StatCard icon={<Wallet size={20} />} label="Payments" value={formatMoney(totalPaid)} note="Recorded locally" tone="tertiary" />
        </section>
        <div className="mb-stack-lg grid grid-cols-3 gap-2 rounded-lg bg-surface-container p-1">
          {[
            ['businesses', 'Businesses'],
            ['packages', 'Packages'],
            ['subscriptions', 'Subscriptions']
          ].map(([key, label]) => (
            <button key={key} onClick={() => setAdminTab(key as typeof adminTab)} className={`h-11 rounded-md text-sm font-bold ${adminTab === key ? 'bg-white text-primary' : 'text-on-surface-variant'}`}>{label}</button>
          ))}
        </div>
        {message && <p className="mb-stack-md rounded-lg border border-primary/30 bg-primary-fixed px-4 py-3 text-sm font-bold text-primary">{message}</p>}
        {adminTab === 'businesses' && (
          <>
            <section className="record-card mb-stack-lg p-stack-md">
              <SectionHeader title="Create Business" />
              <form className="grid gap-stack-md md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); addBusiness(new FormData(event.currentTarget)); event.currentTarget.reset(); }}>
                <TextField name="name" label="Business Name" placeholder="Nyeri Poultry Group" />
                <TextField name="code" label="Business Code" placeholder="NYERI-KUKU-002" />
                <TextField name="ownerName" label="Owner" placeholder="Farm Owner" />
                <TextField name="county" label="County" placeholder="Nyeri" />
                <button className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary md:col-span-2"><Plus size={20} /> Create Business</button>
              </form>
            </section>
            <section>
              <SectionHeader title="All Businesses" />
              <div className="space-y-stack-sm">
                {businesses.map((business) => (
                  <div key={business.id} className="record-card grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <h3 className="font-bold">{business.name}</h3>
                      <p className="text-sm text-on-surface-variant">{business.code} - {business.ownerName} - {business.county}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip tone={business.status === 'Active' ? 'green' : 'plain'}>{business.status}</Chip>
                      <button onClick={() => toggleBusinessStatus(business)} className="h-touch-target rounded-xl border-2 border-primary px-4 text-sm font-bold text-primary">{business.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        {adminTab === 'packages' && (
          <>
            <section className="record-card mb-stack-lg p-stack-md">
              <SectionHeader title="Create Package" />
              <form className="grid gap-stack-md md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); addPackage(new FormData(event.currentTarget)); event.currentTarget.reset(); }}>
                <TextField name="name" label="Package Name" placeholder="Growth" />
                <TextField name="price" label="Price" type="number" placeholder="3200" />
                <SelectField name="interval" label="Interval" options={['Monthly', 'Yearly']} />
                <TextField name="trialDays" label="Trial Days" type="number" placeholder="7" />
                <div className="md:col-span-2">
                  <p className="mb-2 font-bold text-on-surface">Included modules</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {moduleCatalog.filter((module) => module.moduleId !== 'core').map((module) => (
                      <label key={module.moduleId} className="flex min-h-[48px] items-center gap-2 rounded-lg border border-outline-variant bg-white px-3 font-bold">
                        <input name={module.moduleId} type="checkbox" /> {module.label}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="flex min-h-[48px] items-center gap-2 font-bold"><input name="popular" type="checkbox" /> Popular</label>
                <label className="flex min-h-[48px] items-center gap-2 font-bold"><input name="privatePackage" type="checkbox" /> Superadmin only</label>
                <button className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary md:col-span-2"><Plus size={20} /> Create Package</button>
              </form>
            </section>
            <div className="space-y-stack-sm">
              {packages.map((item) => (
                <div key={item.id} className="record-card grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-on-surface-variant">{formatMoney(item.price)} / {item.interval} - {item.moduleIds.length} modules - {item.trialDays} trial days</p>
                  </div>
                  <div className="flex gap-2"><Chip tone={item.active ? 'green' : 'plain'}>{item.active ? 'Active' : 'Inactive'}</Chip>{item.popular && <Chip tone="yellow">Popular</Chip>}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {adminTab === 'subscriptions' && (
          <>
            <section className="record-card mb-stack-lg p-stack-md">
              <SectionHeader title="Allocate Subscription" />
              <form className="grid gap-stack-md md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); addSubscription(new FormData(event.currentTarget)); event.currentTarget.reset(); }}>
                <SelectField name="businessCode" label="Business" options={businesses.map((business) => business.code)} />
                <SelectField name="packageId" label="Package" options={packages.map((item) => item.id)} />
                <TextField name="paymentReference" label="Payment Reference" placeholder="MPESA-123456" />
                <button className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary md:col-span-2"><Wallet size={20} /> Allocate Subscription</button>
              </form>
            </section>
            <section>
              <SectionHeader title="Subscription Logs" />
              <div className="space-y-stack-sm">
                {subscriptions.map((subscription) => {
                  const item = packages.find((pkg) => pkg.id === subscription.packageId);
                  return (
                    <div key={subscription.id} className="record-card grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <h3 className="font-bold">{subscription.businessCode}</h3>
                        <p className="text-sm text-on-surface-variant">{item?.name ?? subscription.packageId} - Ref {subscription.paymentReference}</p>
                        <p className="text-xs font-bold text-on-surface-variant">Expires {subscription.expiresAt.slice(0, 10)}</p>
                      </div>
                      <Chip tone={subscription.status === 'Active' ? 'green' : 'yellow'}>{subscription.status}</Chip>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
        <section>
          <SectionHeader title="Module Payments" />
          <div className="space-y-stack-sm">
            {moduleCatalog.map((module) => {
              const activation = data.modules.find((item) => item.moduleId === module.moduleId);
              const active = activation?.active ?? module.defaultActive;
              return (
                <div key={module.moduleId} className="record-card grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h3 className="font-bold">{module.label}</h3>
                    <p className="text-sm text-on-surface-variant">
                      {module.price === 0 ? 'Included core module' : `${formatMoney(module.price)} requested payment`}
                    </p>
                    {activation?.paymentReference && <p className="mt-1 text-xs font-bold text-primary">Reference: {activation.paymentReference}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip tone={active ? 'green' : 'plain'}>{active ? 'Active' : 'Inactive'}</Chip>
                    {activation?.amountPaid ? <Chip tone="yellow">{formatMoney(activation.amountPaid)}</Chip> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
