import { useEffect, useState } from 'react';

import { Batch, ContactRecord, EggRecord, FeedRecord, HealthRecord, InventoryItem, MaintenanceRecord, ModuleActivation, MortalityRecord, Sale, SmsAlertSetting, Task, TenantProfile, VaccinationRecord, Worker, db, seedDatabase } from '../db';

export function useOnlineStatus() {
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

export function useFarmData(refreshKey: number, enabled = true) {
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
