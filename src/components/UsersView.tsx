import React, { useEffect, useState } from 'react';
import { Copy, KeyRound, Pencil, Plus, Power, RefreshCw, UserPlus, X } from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { api, ApiError } from '../lib/api';
import { useToast } from './ui/Toaster';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  PSYCHIATRE: 'Psychiatre',
  PSYCHOLOGUE: 'Psychologue',
  INFIRMIER: 'Infirmier(e)',
  ASSISTANT_SOCIAL: 'Assistant(e) social(e)',
  SECRETARIAT: 'Secrétariat',
  LECTEUR: 'Lecteur',
};
const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

// ── Dialogs ────────────────────────────────────────────────

const Dialog: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; labelledBy: string }> = ({
  title,
  onClose,
  children,
  labelledBy,
}) => (
  <div className="fixed inset-0 z-50 bg-ink-950/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
    <div className="clinical-card w-full max-w-lg !rounded-2xl shadow-[var(--shadow-float)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-150">
        <h2 id={labelledBy} className="text-lg font-bold text-ink-900">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Fermer" className="btn-icon">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const SetupCodeDialog: React.FC<{ account: UserAccount; code: string; onClose: () => void }> = ({ account, code, onClose }) => {
  const notify = useToast();
  return (
    <Dialog title="Code d’activation" onClose={onClose} labelledBy="setup-code-title">
      <p className="text-base text-ink-700">
        Transmettez ce code à <strong>{account.name}</strong>. Il permet de définir le mot de passe du compte
        <strong> « {account.login} »</strong> depuis l’écran de connexion (« Activer avec mon code »).
      </p>
      <div className="clinical-subcard mt-5 flex items-center justify-between gap-3">
        <span className="font-mono text-2xl font-bold tracking-[0.2em] text-ink-900">{code}</span>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            notify({ title: 'Code copié' });
          }}
        >
          <Copy className="w-4 h-4" />
          Copier
        </button>
      </div>
      <p className="text-sm text-ink-500 mt-3">Valable 7 jours. Il ne sera plus affiché : notez-le maintenant.</p>
      <div className="flex justify-end mt-6">
        <button type="button" className="btn-primary" onClick={onClose}>
          J’ai transmis le code
        </button>
      </div>
    </Dialog>
  );
};

const AccountForm: React.FC<{
  account?: UserAccount;
  onClose: () => void;
  onSaved: (u: UserAccount, setupCode?: string) => void;
}> = ({ account, onClose, onSaved }) => {
  const [name, setName] = useState(account?.name ?? '');
  const [login, setLogin] = useState(account?.login ?? '');
  const [role, setRole] = useState<UserRole>(account?.role ?? 'PSYCHIATRE');
  const [title, setTitle] = useState(account?.title ?? '');
  const [service, setService] = useState(account?.service ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (account) {
        const { user } = await api.updateUser(account.id, { name, role, title, service });
        onSaved(user);
      } else {
        const { user, setupCode } = await api.createUser({ login, name, role, title, service });
        onSaved(user, setupCode);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title={account ? 'Modifier le compte' : 'Nouveau compte'} onClose={onClose} labelledBy="account-form-title">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div role="alert" className="px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="acc-name" className="field-label">Nom complet *</label>
            <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="clinical-input" />
          </div>
          <div>
            <label htmlFor="acc-login" className="field-label">Identifiant *</label>
            <input
              id="acc-login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              readOnly={Boolean(account)}
              className="clinical-input"
            />
            {!account && <span className="field-hint">Ex. : a.traore — non modifiable ensuite.</span>}
          </div>
          <div>
            <label htmlFor="acc-role" className="field-label">Rôle *</label>
            <select id="acc-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="clinical-input">
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="acc-title" className="field-label">Fonction</label>
            <input id="acc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : Médecin psychiatre" className="clinical-input" />
          </div>
          <div>
            <label htmlFor="acc-service" className="field-label">Service</label>
            <input id="acc-service" value={service} onChange={(e) => setService(e.target.value)} className="clinical-input" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
          <button type="submit" disabled={busy} className="btn-primary">
            {account ? 'Enregistrer' : 'Créer le compte'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export const ChangePasswordDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const notify = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.changePassword(current, next);
      notify({ title: 'Mot de passe modifié' });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Modification impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Changer mon mot de passe" onClose={onClose} labelledBy="change-pw-title">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div role="alert" className="px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="pw-current" className="field-label">Mot de passe actuel</label>
          <input id="pw-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required autoFocus className="clinical-input" />
        </div>
        <div>
          <label htmlFor="pw-next" className="field-label">Nouveau mot de passe</label>
          <input id="pw-next" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required className="clinical-input" />
          <span className="field-hint">8 caractères minimum.</span>
        </div>
        <div>
          <label htmlFor="pw-confirm" className="field-label">Confirmer</label>
          <input id="pw-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required className="clinical-input" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
          <button type="submit" disabled={busy} className="btn-primary">Enregistrer</button>
        </div>
      </form>
    </Dialog>
  );
};

// ── View ────────────────────────────────────────────────────

export const UsersView: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const notify = useToast();
  const [users, setUsers] = useState<UserAccount[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<UserAccount | 'new' | null>(null);
  const [issuedCode, setIssuedCode] = useState<{ account: UserAccount; code: string } | null>(null);

  const load = () => {
    setLoadError('');
    api
      .listUsers()
      .then(setUsers)
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'Chargement impossible.'));
  };
  useEffect(load, []);

  const replace = (u: UserAccount) =>
    setUsers((prev) => (prev ? (prev.some((x) => x.id === u.id) ? prev.map((x) => (x.id === u.id ? u : x)) : [...prev, u]) : [u]));

  const toggleActive = async (u: UserAccount) => {
    const verb = u.active ? 'Désactiver' : 'Réactiver';
    if (!window.confirm(`${verb} le compte « ${u.login} » (${u.name}) ?${u.active ? '\n\nSes sessions seront fermées. Le compte et son historique sont conservés.' : ''}`)) return;
    try {
      const { user } = await api.updateUser(u.id, { active: !u.active });
      replace(user);
      notify({ title: user.active ? 'Compte réactivé' : 'Compte désactivé', message: user.name });
    } catch (e) {
      notify({ tone: 'error', title: 'Action refusée', message: e instanceof ApiError ? e.message : undefined });
    }
  };

  const resetAccess = async (u: UserAccount) => {
    if (!window.confirm(`Réinitialiser l’accès de « ${u.login} » ?\n\nSon mot de passe actuel ne fonctionnera plus et un nouveau code d’activation sera généré.`)) return;
    try {
      const { user, setupCode } = await api.resetAccess(u.id);
      replace(user);
      setIssuedCode({ account: user, code: setupCode });
    } catch (e) {
      notify({ tone: 'error', title: 'Action refusée', message: e instanceof ApiError ? e.message : undefined });
    }
  };

  const activeCount = users?.filter((u) => u.active).length ?? 0;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <header className="page-header">
        <div>
          <h2 className="page-title">Utilisateurs & rôles</h2>
          <p className="page-subtitle">
            Comptes nominatifs du personnel · {activeCount} actif{activeCount > 1 ? 's' : ''} · les comptes sont désactivés, jamais supprimés
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nouveau compte
        </button>
      </header>

      <div className="clinical-card overflow-hidden">
        {loadError ? (
          <div className="p-10 text-center">
            <p className="text-base text-ink-700">{loadError}</p>
            <button type="button" className="btn-secondary mt-4" onClick={load}>
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        ) : !users ? (
          <div className="p-5 space-y-3" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-ink-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.active ? '' : 'opacity-70'}>
                    <td>
                      <div className="font-semibold text-ink-900">
                        {u.name}
                        {u.id === currentUserId && <span className="chip chip-neutral ml-2">Vous</span>}
                        {u.isOwner && <span className="chip bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200 ml-2">Médecin titulaire</span>}
                      </div>
                      <div className="text-sm text-ink-500">
                        {u.login}
                        {u.title ? ` · ${u.title}` : ''}
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-medium">{ROLE_LABELS[u.role]}</td>
                    <td>
                      {!u.active ? (
                        <span className="chip bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"><span className="dot" />Désactivé</span>
                      ) : !u.hasPassword ? (
                        <span className="chip bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"><span className="dot" />En attente d’activation</span>
                      ) : (
                        <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"><span className="dot" />Actif</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap tabular-nums">{formatDate(u.lastLoginAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="btn-icon" onClick={() => setEditing(u)} aria-label={`Modifier ${u.name}`} title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u.id !== currentUserId && !u.isOwner && (
                          <>
                            <button type="button" className="btn-icon" onClick={() => resetAccess(u)} aria-label={`Réinitialiser l’accès de ${u.name}`} title="Nouveau code d’activation">
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className={`btn-icon ${u.active ? 'hover:!text-rose-700 hover:!bg-rose-50' : ''}`}
                              onClick={() => toggleActive(u)}
                              aria-label={`${u.active ? 'Désactiver' : 'Réactiver'} ${u.name}`}
                              title={u.active ? 'Désactiver' : 'Réactiver'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="clinical-subcard flex items-start gap-3 text-sm text-ink-700">
        <UserPlus className="w-5 h-5 text-ink-500 shrink-0 mt-0.5" />
        <p>
          À la création d’un compte, un <strong>code d’activation</strong> est généré. La personne choisit son mot de passe
          sur l’écran de connexion avec « Activer avec mon code ». Toutes les opérations sur les comptes sont journalisées.
        </p>
      </div>

      {editing && (
        <AccountForm
          account={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(u, code) => {
            replace(u);
            setEditing(null);
            if (code) setIssuedCode({ account: u, code });
            else notify({ title: 'Compte mis à jour', message: u.name });
          }}
        />
      )}
      {issuedCode && (
        <SetupCodeDialog account={issuedCode.account} code={issuedCode.code} onClose={() => setIssuedCode(null)} />
      )}
    </div>
  );
};
