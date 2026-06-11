import { TenantProfile, moduleCatalog } from '../db';

import { defaultTenantCode, normalizeTenantCode } from '../auth/auth';

export const superBusinessesStorageKey = 'kuku_smart_super_businesses_v1';

export const superPackagesStorageKey = 'kuku_smart_super_packages_v1';

export const superSubscriptionsStorageKey = 'kuku_smart_super_subscriptions_v1';

export type BillingInterval = 'Monthly' | 'Yearly';

export type BusinessStatus = 'Active' | 'Inactive';

export type SubscriptionStatus = 'Active' | 'Waiting' | 'Declined';

export type SuperBusiness = {
  id: string;
  name: string;
  code: string;
  ownerName: string;
  county: string;
  status: BusinessStatus;
  currentPackageId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SuperPackage = {
  id: string;
  name: string;
  price: number;
  interval: BillingInterval;
  trialDays: number;
  active: boolean;
  popular: boolean;
  privatePackage: boolean;
  moduleIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type SuperSubscription = {
  id: string;
  businessCode: string;
  packageId: string;
  status: SubscriptionStatus;
  paymentReference: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
};

export function modulePrice(moduleId: string) {
  return moduleCatalog.find((module) => module.moduleId === moduleId)?.price ?? 0;
}

export function storageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readStorageList<T>(key: string, fallback: T[]) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T[];
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function writeStorageList<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function defaultSuperPackages() {
  const stamp = new Date().toISOString();
  return [
    {
      id: 'starter',
      name: 'Starter',
      price: 1200,
      interval: 'Monthly' as BillingInterval,
      trialDays: 7,
      active: true,
      popular: false,
      privatePackage: false,
      moduleIds: ['farm_records'],
      createdAt: stamp,
      updatedAt: stamp
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 3200,
      interval: 'Monthly' as BillingInterval,
      trialDays: 7,
      active: true,
      popular: true,
      privatePackage: false,
      moduleIds: ['farm_records', 'health', 'feed_suppliers'],
      createdAt: stamp,
      updatedAt: stamp
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 5200,
      interval: 'Monthly' as BillingInterval,
      trialDays: 14,
      active: true,
      popular: false,
      privatePackage: true,
      moduleIds: ['farm_records', 'health', 'feed_suppliers', 'market_sales', 'workers_alerts'],
      createdAt: stamp,
      updatedAt: stamp
    }
  ];
}

export function ensureSuperadminData(tenant?: TenantProfile) {
  const stamp = new Date().toISOString();
  const businesses = readStorageList<SuperBusiness>(superBusinessesStorageKey, []);
  if (businesses.length === 0) {
    writeStorageList<SuperBusiness>(superBusinessesStorageKey, [{
      id: storageId('business'),
      name: tenant?.name ?? 'Nyeri Smallholder Poultry',
      code: normalizeTenantCode(tenant?.code ?? defaultTenantCode),
      ownerName: tenant?.ownerName ?? 'Farm Owner',
      county: tenant?.county ?? 'Nyeri',
      status: 'Active',
      createdAt: stamp,
      updatedAt: stamp
    }]);
  }
  if (readStorageList<SuperPackage>(superPackagesStorageKey, []).length === 0) {
    writeStorageList<SuperPackage>(superPackagesStorageKey, defaultSuperPackages());
  }
  if (!localStorage.getItem(superSubscriptionsStorageKey)) {
    writeStorageList<SuperSubscription>(superSubscriptionsStorageKey, []);
  }
}
