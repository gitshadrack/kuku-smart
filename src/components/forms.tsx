import { createContext, useContext, useState, type ReactNode } from 'react';

import { ShieldCheck } from 'lucide-react';

export type LiveFormState = {
  values: Record<string, string>;
  setValue: (name: string, value: string) => void;
  reset: () => void;
};

export const LiveFormContext = createContext<LiveFormState | undefined>(undefined);

export function useLiveFormState() {
  const [values, setValues] = useState<Record<string, string>>({});
  return {
    values,
    setValue: (name: string, value: string) => {
      setValues((current) => ({ ...current, [name]: value }));
    },
    reset: () => setValues({})
  };
}

export function FormShell({ title, note, children, onSubmit, submitLabel, icon }: { title: string; note: string; children: ReactNode; onSubmit: (formData: FormData) => void; submitLabel: string; icon: JSX.Element }) {
  const form = useLiveFormState();
  return (
    <LiveFormContext.Provider value={form}>
      <form className="space-y-stack-md" onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
        form.reset();
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
    </LiveFormContext.Provider>
  );
}

export function TextField({ name, label, type = 'text', placeholder, defaultValue }: { name: string; label: string; type?: string; placeholder?: string; defaultValue?: string }) {
  const liveForm = useContext(LiveFormContext);
  const liveProps = liveForm
    ? {
        value: liveForm.values[name] ?? defaultValue ?? '',
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => liveForm.setValue(name, event.target.value)
      }
    : { defaultValue };
  return (
    <label className="flex flex-col gap-2 font-bold text-on-surface">
      {label}
      <input name={name} type={type} placeholder={placeholder} className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary" {...liveProps} />
    </label>
  );
}

export function SelectField({ name, label, options }: { name: string; label: string; options: string[] }) {
  const liveForm = useContext(LiveFormContext);
  const liveProps = liveForm
    ? {
        value: liveForm.values[name] ?? options[0] ?? '',
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) => liveForm.setValue(name, event.target.value)
      }
    : {};
  return (
    <label className="flex flex-col gap-2 font-bold text-on-surface">
      {label}
      <select name={name} className="h-touch-target rounded-lg border border-outline bg-white px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary" {...liveProps}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
