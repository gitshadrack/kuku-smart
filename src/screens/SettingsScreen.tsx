import { useState } from 'react';

import { Settings } from 'lucide-react';

import { ModuleActivation, moduleCatalog } from '../db';

import { modulePrice } from '../admin/storage';

import { useFarmData } from '../app/hooks';

import { Chip, Metric, SectionHeader, TitleBlock, formatMoney } from '../components/ui';

import { AccountSettings } from './AccountSettings';

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
