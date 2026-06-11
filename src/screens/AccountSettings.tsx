import { useState } from 'react';

import { Eye, EyeOff, LogOut, Save, ShieldCheck } from 'lucide-react';

import { accountIconFor, accountIconOptions, confirmLogout, createPasswordCredentials, getStoredAuthRecord, storeAuthRecord, verifyLogin, type AccountIconKey, type AuthRecord } from '../auth/auth';

export function AccountSettings({ onLogout }: { onLogout: () => void }) {
  const [account, setAccount] = useState<AuthRecord | undefined>(() => getStoredAuthRecord());
  const [email, setEmail] = useState(account?.email ?? '');
  const [accountIcon, setAccountIcon] = useState<AccountIconKey>(account?.accountIcon ?? 'sprout');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'green' | 'red'>('green');
  const [saving, setSaving] = useState(false);

  function showMessage(nextMessage: string, nextTone: 'green' | 'red' = 'green') {
    setMessage(nextMessage);
    setTone(nextTone);
  }

  function saveProfile() {
    const record = getStoredAuthRecord();
    if (!record) {
      showMessage('No local tenant account found. Log out and create a tenant login.', 'red');
      return;
    }
    const cleanEmail = email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showMessage('Enter a valid email address.', 'red');
      return;
    }
    const updated = { ...record, email: cleanEmail, accountIcon };
    storeAuthRecord(updated);
    setAccount(updated);
    showMessage('Account profile updated.');
  }

  async function changePassword() {
    const record = getStoredAuthRecord();
    if (!record) {
      showMessage('No local tenant account found. Log out and create a tenant login.', 'red');
      return;
    }
    if (newPassword.length < 8) {
      showMessage('Use a new password with at least 8 characters.', 'red');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match.', 'red');
      return;
    }
    setSaving(true);
    try {
      const currentOk = await verifyLogin(record.tenantCode, record.username, currentPassword, record);
      if (!currentOk) {
        showMessage('Current password is incorrect.', 'red');
        return;
      }
      const credentials = await createPasswordCredentials(newPassword);
      const updated = { ...record, ...credentials };
      storeAuthRecord(updated);
      setAccount(updated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password updated.');
    } finally {
      setSaving(false);
    }
  }

  if (!account) {
    return (
      <section className="record-card mb-stack-lg p-stack-md">
        <h2 className="mb-2 font-heading text-xl font-semibold text-primary">User Account</h2>
        <p className="text-sm font-bold text-error">No local tenant account found.</p>
      </section>
    );
  }

  return (
    <section className="record-card mb-stack-lg p-stack-md">
      <div className="mb-stack-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            {accountIconFor(accountIcon, 24)}
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-primary">User Account</h2>
            <p className="text-sm text-on-surface-variant">{account.tenantCode} - {account.username}</p>
          </div>
        </div>
        <button type="button" onClick={() => confirmLogout(onLogout)} className="focus-ring flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-error px-4 font-bold text-error">
          <LogOut size={20} /> Log Out
        </button>
      </div>
      <div className="grid gap-stack-md md:grid-cols-2">
        <label className="flex flex-col gap-2 font-bold text-on-surface">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="owner@example.com"
            className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <div>
          <p className="mb-2 font-bold text-on-surface">Account icon</p>
          <div className="grid grid-cols-4 gap-2">
            {accountIconOptions.map((option) => {
              const selected = accountIcon === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAccountIcon(option.key)}
                  className={`focus-ring flex h-14 items-center justify-center rounded-lg border text-sm font-bold ${selected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-white text-on-surface-variant'}`}
                  aria-label={`Use ${option.label} account icon`}
                  title={option.label}
                >
                  {accountIconFor(option.key, 22)}
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" onClick={saveProfile} className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary md:col-span-2">
          <Save size={20} /> Save Account Profile
        </button>
      </div>
      <div className="mt-stack-lg border-t border-outline-variant pt-stack-md">
        <h3 className="mb-stack-md font-heading text-lg font-semibold text-on-surface">Change Password</h3>
        <div className="grid gap-stack-md md:grid-cols-3">
          <label className="flex flex-col gap-2 font-bold text-on-surface">
            Current password
            <div className="relative">
              <input
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="h-touch-target w-full rounded-lg border border-outline bg-white px-4 pr-12 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-2 font-bold text-on-surface">
            New password
            <div className="relative">
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="h-touch-target w-full rounded-lg border border-outline bg-white px-4 pr-12 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-2 font-bold text-on-surface">
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
          <button type="button" disabled={saving} onClick={changePassword} className="focus-ring flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-primary font-bold text-primary disabled:opacity-60 md:col-span-3">
            <ShieldCheck size={20} /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
      {message && <p className={`mt-stack-md rounded-lg border px-4 py-3 text-sm font-bold ${tone === 'green' ? 'border-primary/30 bg-primary-fixed text-primary' : 'border-error/30 bg-error-container text-error'}`}>{message}</p>}
    </section>
  );
}
