import { useState } from 'react';

import { Eye, EyeOff, Settings, ShieldCheck, Sprout, Users, Wallet } from 'lucide-react';

export const authStorageKey = 'kuku_smart_local_login_v1';

export const adminAuthStorageKey = 'kuku_smart_admin_login_v1';

export const defaultTenantCode = 'NYERI-KUKU-001';

export type AuthRecord = {
  tenantCode: string;
  username: string;
  email?: string;
  accountIcon?: AccountIconKey;
  salt: string;
  passwordHash: string;
  iterations: number;
  createdAt: string;
  updatedAt?: string;
};

export type AdminAuthRecord = {
  adminId: string;
  email?: string;
  salt: string;
  passwordHash: string;
  iterations: number;
  createdAt: string;
  updatedAt?: string;
};

export type AccountIconKey = 'sprout' | 'shield' | 'users' | 'wallet';

export const accountIconOptions: { key: AccountIconKey; label: string }[] = [
  { key: 'sprout', label: 'Farm' },
  { key: 'shield', label: 'Secure' },
  { key: 'users', label: 'Team' },
  { key: 'wallet', label: 'Finance' }
];

export const authEncoder = new TextEncoder();

export function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToBytes(value: string) {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function normalizeAdminId(adminId: string) {
  return adminId.trim().toLowerCase();
}

export function normalizeTenantCode(tenantCode: string) {
  return tenantCode.trim().toUpperCase();
}

export async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
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

export async function createAuthRecord(tenantCode: string, username: string, email: string, password: string): Promise<AuthRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 210000;
  return {
    tenantCode: normalizeTenantCode(tenantCode),
    username: normalizeUsername(username),
    email: email.trim(),
    accountIcon: 'sprout',
    salt: bytesToBase64(salt),
    passwordHash: await derivePasswordHash(password, salt, iterations),
    iterations,
    createdAt: new Date().toISOString()
  };
}

export async function createAdminAuthRecord(adminId: string, email: string, password: string): Promise<AdminAuthRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 210000;
  return {
    adminId: normalizeAdminId(adminId),
    email: email.trim(),
    salt: bytesToBase64(salt),
    passwordHash: await derivePasswordHash(password, salt, iterations),
    iterations,
    createdAt: new Date().toISOString()
  };
}

export async function verifyLogin(tenantCode: string, username: string, password: string, record: AuthRecord) {
  if (normalizeTenantCode(tenantCode) !== record.tenantCode) return false;
  if (normalizeUsername(username) !== record.username) return false;
  const passwordHash = await derivePasswordHash(password, base64ToBytes(record.salt), record.iterations);
  return passwordHash === record.passwordHash;
}

export async function verifyAdminLogin(adminId: string, password: string, record: AdminAuthRecord) {
  if (normalizeAdminId(adminId) !== record.adminId) return false;
  const passwordHash = await derivePasswordHash(password, base64ToBytes(record.salt), record.iterations);
  return passwordHash === record.passwordHash;
}

export function getStoredAuthRecord() {
  const raw = localStorage.getItem(authStorageKey);
  if (!raw) return undefined;
  try {
    const record = JSON.parse(raw) as AuthRecord;
    if (!record.tenantCode || !record.username || !record.passwordHash || !record.salt || !record.iterations) {
      localStorage.removeItem(authStorageKey);
      return undefined;
    }
    return record;
  } catch {
    localStorage.removeItem(authStorageKey);
    return undefined;
  }
}

export function getStoredAdminAuthRecord() {
  const raw = localStorage.getItem(adminAuthStorageKey);
  if (!raw) return undefined;
  try {
    const record = JSON.parse(raw) as AdminAuthRecord;
    if (!record.adminId || !record.passwordHash || !record.salt || !record.iterations) {
      localStorage.removeItem(adminAuthStorageKey);
      return undefined;
    }
    return record;
  } catch {
    localStorage.removeItem(adminAuthStorageKey);
    return undefined;
  }
}

export function storeAuthRecord(record: AuthRecord) {
  localStorage.setItem(authStorageKey, JSON.stringify({ ...record, updatedAt: new Date().toISOString() }));
}

export function storeAdminAuthRecord(record: AdminAuthRecord) {
  localStorage.setItem(adminAuthStorageKey, JSON.stringify({ ...record, updatedAt: new Date().toISOString() }));
}

export async function createPasswordCredentials(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 210000;
  return {
    salt: bytesToBase64(salt),
    passwordHash: await derivePasswordHash(password, salt, iterations),
    iterations
  };
}

export function accountIconFor(key: AccountIconKey | undefined, size = 22) {
  if (key === 'shield') return <ShieldCheck size={size} />;
  if (key === 'users') return <Users size={size} />;
  if (key === 'wallet') return <Wallet size={size} />;
  return <Sprout size={size} />;
}

export function confirmLogout(onLogout: () => void) {
  if (window.confirm('Log out of Kuku Smart?')) {
    onLogout();
  }
}

export function LoginGate({ mode, onTenantAuthenticated, onAdminAuthenticated }: { mode: 'setup' | 'login'; onTenantAuthenticated: () => void; onAdminAuthenticated: () => void }) {
  const [activeRole, setActiveRole] = useState<'tenant' | 'admin'>('tenant');
  const [tenantCode, setTenantCode] = useState(defaultTenantCode);
  const [username, setUsername] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isAdmin = activeRole === 'admin';
  const adminExists = Boolean(getStoredAdminAuthRecord());
  const isSetup = isAdmin ? !adminExists : mode === 'setup';

  async function submit() {
    setMessage('');
    if (!crypto.subtle) {
      setMessage('This browser cannot create a secure local login. Use HTTPS or localhost.');
      return;
    }
    if (isAdmin && normalizeAdminId(adminId).length < 3) {
      setMessage('Use an admin ID with at least 3 characters.');
      return;
    }
    if (!isAdmin && normalizeTenantCode(tenantCode).length < 5) {
      setMessage('Enter a valid tenant code.');
      return;
    }
    if (!isAdmin && normalizeUsername(username).length < 3) {
      setMessage('Use a username with at least 3 characters.');
      return;
    }
    if (isAdmin && isSetup && adminEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      setMessage('Enter a valid admin email address.');
      return;
    }
    if (!isAdmin && isSetup && tenantEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantEmail.trim())) {
      setMessage('Enter a valid email address.');
      return;
    }
    if (recoveryMode) {
      if (!password) {
        setMessage('Enter a new password.');
        return;
      }
      if (password.length < 8) {
        setMessage('Use a password with at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }
      if (isAdmin && !adminEmail.trim()) {
        setMessage('Enter your registered admin email.');
        return;
      }
      if (!isAdmin && !tenantEmail.trim()) {
        setMessage('Enter your registered tenant email.');
        return;
      }
    } else {
      if (password.length < 8) {
        setMessage('Use a password with at least 8 characters.');
        return;
      }
      if (isSetup && password !== confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }
    }
    setBusy(true);
    try {
      if (recoveryMode) {
        if (isAdmin) {
          const record = getStoredAdminAuthRecord();
          if (!record) {
            setMessage('No admin account found.');
            return;
          }
          if (normalizeAdminId(adminId) !== record.adminId || adminEmail.trim().toLowerCase() !== (record.email ?? '').trim().toLowerCase()) {
            setMessage('Admin ID or email does not match.');
            return;
          }
          const credentials = await createPasswordCredentials(password);
          storeAdminAuthRecord({ ...record, ...credentials });
          onAdminAuthenticated();
          return;
        }

        const record = getStoredAuthRecord();
        if (!record) {
          setMessage('No tenant account found.');
          return;
        }
        if (
          normalizeTenantCode(tenantCode) !== record.tenantCode ||
          normalizeUsername(username) !== record.username ||
          !(record.email ?? '').trim() ||
          tenantEmail.trim().toLowerCase() !== (record.email ?? '').trim().toLowerCase()
        ) {
          setMessage('Tenant login or email does not match.');
          return;
        }
        const credentials = await createPasswordCredentials(password);
        storeAuthRecord({ ...record, ...credentials });
        onTenantAuthenticated();
        return;
      }

      if (isAdmin) {
        if (isSetup) {
          const record = await createAdminAuthRecord(adminId, adminEmail, password);
          storeAdminAuthRecord(record);
          onAdminAuthenticated();
          return;
        }
        const record = getStoredAdminAuthRecord();
        if (record && await verifyAdminLogin(adminId, password, record)) {
          onAdminAuthenticated();
          return;
        }
        setMessage('Incorrect admin ID or password.');
        return;
      }
      if (isSetup) {
        const record = await createAuthRecord(tenantCode, username, tenantEmail, password);
        storeAuthRecord(record);
        onTenantAuthenticated();
        return;
      }
      const record = getStoredAuthRecord();
      if (record && await verifyLogin(tenantCode, username, password, record)) {
        onTenantAuthenticated();
        return;
      }
      setMessage('Incorrect tenant, username, or password.');
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
            {isAdmin ? <Settings size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary">{isAdmin ? (isSetup ? 'Create Admin Login' : 'Admin Login') : (isSetup ? 'Create Tenant Login' : 'Tenant Login')}</h1>
            <p className="text-sm text-on-surface-variant">{isAdmin ? 'Use the admin account for system oversight.' : isSetup ? 'Set up the tenant account for this device.' : 'Enter tenant account credentials.'}</p>
          </div>
        </div>
        <div className="mb-stack-md grid grid-cols-2 gap-2 rounded-lg bg-surface-container p-1">
          <button
            type="button"
            onClick={() => {
              setActiveRole('tenant');
              setRecoveryMode(false);
              setMessage('');
              setPassword('');
              setConfirmPassword('');
              setTenantEmail('');
            }}
            className={`h-11 rounded-md font-bold ${!isAdmin ? 'bg-white text-primary' : 'text-on-surface-variant'}`}
          >
            Tenant
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setRecoveryMode(false);
              setMessage('');
              setPassword('');
              setConfirmPassword('');
              setAdminEmail('');
            }}
            className={`h-11 rounded-md font-bold ${isAdmin ? 'bg-white text-primary' : 'text-on-surface-variant'}`}
          >
            Admin
          </button>
        </div>
        {isAdmin ? (
          <>
            <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
              Admin ID
              <input
                value={adminId}
                onChange={(event) => setAdminId(event.target.value)}
                type="text"
                autoComplete="username"
                className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>
            {(isSetup || recoveryMode) && (
              <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
                {recoveryMode ? 'Registered admin email' : 'Admin email'}
                <input
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </label>
            )}
          </>
        ) : (
          <>
            <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
              Tenant code
              <input
                value={tenantCode}
                onChange={(event) => setTenantCode(event.target.value)}
                type="text"
                autoComplete="organization"
                className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>
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
            {(isSetup || recoveryMode) && (
              <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
                {isSetup ? 'Email address (optional)' : 'Registered email'}
                <input
                  value={tenantEmail}
                  onChange={(event) => setTenantEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </label>
            )}
          </>
        )}
        <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
          {recoveryMode ? 'New password' : 'Password'}
          <div className="relative">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? 'text' : 'password'}
              autoComplete={recoveryMode || isSetup ? 'new-password' : 'current-password'}
              className="h-touch-target w-full rounded-lg border border-outline bg-white px-4 pr-12 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>
        {(isSetup || recoveryMode) && (
          <label className="mb-stack-md flex flex-col gap-2 font-bold text-on-surface">
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
        )}
        {!isSetup && (
          <div className="mb-stack-md text-right">
            {recoveryMode ? (
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode(false);
                  setMessage('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm font-bold text-on-surface-variant underline"
              >
                Back to login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode(true);
                  setMessage('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm font-bold text-primary underline"
              >
                Forgot password?
              </button>
            )}
          </div>
        )}
        {message && <p className="mb-stack-md rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-bold text-error">{message}</p>}
        <button disabled={busy} className="focus-ring flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-on-primary disabled:opacity-60">
          <ShieldCheck size={20} /> {busy ? 'Checking...' : recoveryMode ? 'Reset Password' : isAdmin ? (isSetup ? 'Create Admin Account' : 'Admin Log In') : isSetup ? 'Create Tenant Account' : 'Log In'}
        </button>
      </form>
    </main>
  );
}
