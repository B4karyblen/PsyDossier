import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, Eye, EyeOff, HeartPulse, KeyRound, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { ActivationInfo, api, ApiError, SessionUser } from '../../lib/api';
import { LicenceContext, LicenceNotice, PUBLISHER } from '../../lib/licence';

type OnAuth = (user: SessionUser) => void;

const AuthCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 py-10">
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white">
        <HeartPulse className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div>
        <div className="text-lg font-bold text-ink-900 leading-none">PsyDossier</div>
        <div className="text-xs font-medium text-ink-500 mt-1">Dossier patient en psychiatrie</div>
      </div>
    </div>
    <main className="clinical-card w-full max-w-md p-6 sm:p-8">
      <h1 className="text-h2 text-ink-900">{title}</h1>
      <p className="text-base text-ink-500 mt-1">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </main>
    <p className="mt-6 text-xs text-ink-500 flex items-center gap-1.5">
      <Lock className="w-3.5 h-3.5" />
      Données de santé confidentielles — accès nominatif et journalisé
    </p>
    <LicenceNotice className="mt-2 text-center max-w-md" />
  </div>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800">
    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
);

const PasswordInput: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
}> = ({ id, value, onChange, autoComplete, autoFocus }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        className="clinical-input !pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="btn-icon absolute right-0.5 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const errorText = (e: unknown) => (e instanceof ApiError ? e.message : 'Une erreur est survenue.');

// ── Login ───────────────────────────────────────────────────

export const LoginForm: React.FC<{
  onAuth: OnAuth;
  defaultLogin?: string;
  onActivate?: () => void;
  submitLabel?: string;
}> = ({ onAuth, defaultLogin = '', onActivate, submitLabel = 'Se connecter' }) => {
  const [login, setLogin] = useState(defaultLogin);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await api.login(login.trim(), password);
      onAuth(user);
    } catch (err) {
      setError(errorText(err));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorBox message={error} />}
      <div>
        <label htmlFor="login" className="field-label">Identifiant</label>
        <input
          id="login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          autoFocus={!defaultLogin}
          readOnly={Boolean(defaultLogin)}
          required
          className="clinical-input"
        />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Mot de passe</label>
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          autoFocus={Boolean(defaultLogin)}
        />
      </div>
      <button type="submit" disabled={busy} className="btn-primary btn-lg w-full">
        <LogIn className="w-4 h-4" />
        {busy ? 'Connexion…' : submitLabel}
      </button>
      {onActivate && (
        <p className="text-sm text-ink-600 text-center pt-1">
          Nouveau compte ?{' '}
          <button type="button" onClick={onActivate} className="font-semibold text-primary-700 hover:underline !min-h-0 !min-w-0">
            Activer avec mon code
          </button>
        </p>
      )}
    </form>
  );
};

// ── Activation (code given by the administrator) ────────────

const ActivateForm: React.FC<{ onAuth: OnAuth; onBack: () => void }> = ({ onAuth, onBack }) => {
  const [login, setLogin] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { user } = await api.activate(login.trim(), code, password);
      onAuth(user);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorBox message={error} />}
      <div>
        <label htmlFor="act-login" className="field-label">Identifiant</label>
        <input id="act-login" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" autoFocus required className="clinical-input" />
      </div>
      <div>
        <label htmlFor="act-code" className="field-label">Code d’activation</label>
        <input
          id="act-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="XXXX-XXXX"
          autoComplete="one-time-code"
          required
          className="clinical-input font-mono uppercase tracking-widest"
        />
        <span className="field-hint">Remis par l’administrateur, valable 7 jours.</span>
      </div>
      <div>
        <label htmlFor="act-pw" className="field-label">Nouveau mot de passe</label>
        <PasswordInput id="act-pw" value={password} onChange={setPassword} autoComplete="new-password" />
        <span className="field-hint">8 caractères minimum.</span>
      </div>
      <div>
        <label htmlFor="act-pw2" className="field-label">Confirmer le mot de passe</label>
        <PasswordInput id="act-pw2" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      </div>
      <button type="submit" disabled={busy} className="btn-primary btn-lg w-full">
        <KeyRound className="w-4 h-4" />
        {busy ? 'Activation…' : 'Activer mon compte'}
      </button>
      <p className="text-sm text-ink-600 text-center">
        <button type="button" onClick={onBack} className="font-semibold text-primary-700 hover:underline !min-h-0 !min-w-0">
          Retour à la connexion
        </button>
      </p>
    </form>
  );
};

export const SignInScreen: React.FC<{ onAuth: OnAuth }> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'activate'>('login');
  return mode === 'login' ? (
    <AuthCard title="Connexion" subtitle="Accès réservé au personnel autorisé.">
      <LoginForm onAuth={onAuth} onActivate={() => setMode('activate')} />
    </AuthCard>
  ) : (
    <AuthCard title="Activer mon compte" subtitle="Définissez votre mot de passe avec le code reçu.">
      <ActivateForm onAuth={onAuth} onBack={() => setMode('login')} />
    </AuthCard>
  );
};

// ── Activation of a licensed release on this computer ───────

export const ActivationScreen: React.FC<{
  info: ActivationInfo;
  onActivated: () => void;
  /** Present when the app is still usable (trial): lets the user go back. */
  onCancel?: () => void;
}> = ({ info, onActivated, onCancel }) => {
  const licence = React.useContext(LicenceContext);
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.machineCode ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the code stays selectable.
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.activateLicence(key);
      onActivated();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const [title, subtitle] = info.expired
    ? ['Période d’essai terminée', 'Vos dossiers sont intacts. Saisissez votre clé définitive pour continuer.']
    : onCancel
      ? ['Clé définitive', 'Remplacez votre clé d’essai par votre clé définitive.']
      : ['Activer PsyDossier', 'PsyDossier s’active une seule fois sur cet ordinateur.'];

  return (
    <AuthCard title={title} subtitle={subtitle}>
      <form onSubmit={submit} className="space-y-5">
        {error && <ErrorBox message={error} />}
        <div>
          <span className="field-label">1. Envoyez ce code machine à l’éditeur</span>
          <div className="flex items-center gap-2 mt-1">
            <output
              aria-label="Code machine"
              className="flex-1 px-3 py-2.5 rounded-lg bg-ink-50 border border-ink-150 font-mono text-lg font-bold tracking-widest text-ink-900 text-center select-all"
            >
              {info.machineCode}
            </output>
            <button type="button" onClick={copy} className="btn-secondary" aria-label="Copier le code machine">
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
          </div>
          <p className="field-hint">
            {PUBLISHER.name} · {PUBLISHER.phone}
            {licence && <> · licence {licence.id}</>}
          </p>
        </div>
        <div>
          <label htmlFor="activation-key" className="field-label">2. Collez la clé d’activation reçue</label>
          <textarea
            id="activation-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            rows={4}
            required
            spellCheck={false}
            autoFocus
            placeholder="AEAAAA-…"
            className="clinical-input font-mono text-sm break-all"
          />
        </div>
        <button type="submit" disabled={busy || !key.trim()} className="btn-primary btn-lg w-full">
          <KeyRound className="w-4 h-4" />
          {busy ? 'Vérification…' : 'Activer'}
        </button>
        {onCancel && (
          <p className="text-sm text-ink-600 text-center">
            <button type="button" onClick={onCancel} className="font-semibold text-primary-700 hover:underline !min-h-0 !min-w-0">
              Plus tard
            </button>
          </p>
        )}
      </form>
    </AuthCard>
  );
};

// ── First start: the doctor's own account ───────────────────

export const SetupScreen: React.FC<{ onAuth: OnAuth }> = ({ onAuth }) => {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { user } = await api.setup({ name: name.trim(), service: service.trim(), login: login.trim(), password });
      onAuth(user);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Bienvenue"
      subtitle="Créez votre compte. Il protège l’accès aux dossiers de vos patients sur ce poste."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-primary-50 border border-primary-100 text-sm text-primary-800">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Les données restent sur cet ordinateur. Notez votre mot de passe en lieu sûr : il ne peut pas être récupéré.</span>
        </div>
        {error && <ErrorBox message={error} />}
        <div>
          <label htmlFor="setup-name" className="field-label">Nom complet</label>
          <input id="setup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. : Dr Aminata Konaté" autoFocus required className="clinical-input" />
        </div>
        <div>
          <label htmlFor="setup-service" className="field-label">Cabinet ou service <span className="font-normal text-ink-500">(facultatif)</span></label>
          <input id="setup-service" value={service} onChange={(e) => setService(e.target.value)} placeholder="Ex. : Cabinet de psychiatrie, Bamako" className="clinical-input" />
        </div>
        <div>
          <label htmlFor="setup-login" className="field-label">Identifiant</label>
          <input id="setup-login" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required className="clinical-input" />
          <span className="field-hint">Lettres, chiffres, point, tiret ou soulignement (3 à 40).</span>
        </div>
        <div>
          <label htmlFor="setup-pw" className="field-label">Mot de passe</label>
          <PasswordInput id="setup-pw" value={password} onChange={setPassword} autoComplete="new-password" />
          <span className="field-hint">8 caractères minimum.</span>
        </div>
        <div>
          <label htmlFor="setup-pw2" className="field-label">Confirmer le mot de passe</label>
          <PasswordInput id="setup-pw2" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary btn-lg w-full">
          {busy ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </AuthCard>
  );
};

// ── Session expired: re-authenticate without losing unsaved work (PRD B5) ──

export const SessionExpiredDialog: React.FC<{
  login: string;
  onAuth: OnAuth;
  onSwitchUser: () => void;
}> = ({ login, onAuth, onSwitchUser }) => (
  <div className="fixed inset-0 z-[80] bg-ink-950/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
    <div className="clinical-card w-full max-w-sm p-6 !rounded-2xl shadow-[var(--shadow-float)]">
      <h2 id="session-expired-title" className="text-h3 text-ink-900">Session expirée</h2>
      <p className="text-sm text-ink-600 mt-1">
        Reconnectez-vous pour continuer. Vos saisies non enregistrées sont conservées.
      </p>
      <div className="mt-5">
        <LoginForm onAuth={onAuth} defaultLogin={login} submitLabel="Reprendre" />
      </div>
      <button type="button" onClick={onSwitchUser} className="btn-ghost w-full mt-2">
        Changer d’utilisateur
      </button>
    </div>
  </div>
);
