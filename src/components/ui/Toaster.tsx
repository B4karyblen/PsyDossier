import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  tone: Tone;
  title: string;
  message?: string;
}
type Notify = (t: { tone?: Tone; title: string; message?: string }) => void;

const ToastContext = createContext<Notify>(() => {});

export const useToast = () => useContext(ToastContext);

const TONES: Record<Tone, { icon: React.ElementType; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'text-emerald-600' },
  error: { icon: AlertTriangle, cls: 'text-rose-600' },
  info: { icon: Info, cls: 'text-primary-600' },
};

/** Transient notifications (PRD B4: success toast, error message). */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback<Notify>(
    ({ tone = 'success', title, message }) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, tone, title, message }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 8000 : 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm no-print"
      >
        {toasts.map((t) => {
          const { icon: Icon, cls } = TONES[t.tone];
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="flex items-start gap-3 bg-white border border-ink-200 rounded-xl shadow-[var(--shadow-float)] px-4 py-3"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cls}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-900">{t.title}</p>
                {t.message && <p className="text-sm text-ink-600 mt-0.5">{t.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Fermer la notification"
                className="btn-icon !w-8 !h-8 !min-h-8 !min-w-8 -mr-1.5 -mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
