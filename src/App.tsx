/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DossierPsychiatrique,
  UserProfile,
  AuditEntry,
  ReferenceLists,
  S1IdentificationData,
  S2ModalitesData,
  S3MotifData,
  S4HistoireMaladieData,
  S5RepresentationData,
  S6AntecedentsData,
  S7BiographieData,
  S8EnqueteSocialeData,
  S9DemandeData,
  S10ExamenCliniqueData,
  S11ResumeSyndromiqueData,
  S12HypothesesDiagData,
  S13BilansData,
  S14PriseEnChargeData,
  S15EvolutionData,
  S16ProjetTherapeutiqueData,
  S17PronosticData,
  AppView,
} from './types';
import { INITIAL_REFERENCE_LISTS } from './data/initialData';
import { getRubriquePermission, RUBRIQUES_CONFIG } from './utils/rules';
import { ROLES_CAN_CREATE_DOSSIER, ROLES_CAN_EXPORT, ROLES_CAN_READ_AUDIT } from './utils/emptyDossier';
import { AlertTriangle, HeartPulse } from 'lucide-react';
import { api, ApiError, SessionUser } from './lib/api';
import { useServerSync } from './lib/useServerSync';
import { confirmDiscard } from './lib/dirtyGuard';
import { SessionExpiredDialog, SetupScreen, SignInScreen } from './components/auth/AuthScreens';
import { UsersView, ChangePasswordDialog } from './components/UsersView';
import { useToast } from './components/ui/Toaster';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PatientBanner } from './components/PatientBanner';
import { RubriquesNav } from './components/RubriquesNav';
import { PatientList } from './components/PatientList';
import { NewPatientModal } from './components/NewPatientModal';
import { ValidationModal } from './components/ValidationModal';
import { ExportDossierModal } from './components/ExportDossierModal';
import { AuditLogView } from './components/AuditLogView';
import { ReferentielsView } from './components/ReferentielsView';
import { ClinicalDashboard } from './components/ClinicalDashboard';
import { ArchiveModal } from './components/ArchiveModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';

// Rubriques components
import { S1Identification } from './components/rubriques/S1Identification';
import { S2Modalites } from './components/rubriques/S2Modalites';
import { S3Motif } from './components/rubriques/S3Motif';
import { S4HistoireMaladie } from './components/rubriques/S4HistoireMaladie';
import { S5RepresentationSocioCulturelle } from './components/rubriques/S5RepresentationSocioCulturelle';
import { S6Antecedents } from './components/rubriques/S6Antecedents';
import { S7Biographie } from './components/rubriques/S7Biographie';
import { S8EnqueteSociale } from './components/rubriques/S8EnqueteSociale';
import { S9Demande } from './components/rubriques/S9Demande';
import { S10ExamenClinique } from './components/rubriques/S10ExamenClinique';
import { S11ResumeSyndromique } from './components/rubriques/S11ResumeSyndromique';
import { S12HypothesesDiag } from './components/rubriques/S12HypothesesDiag';
import { S13BilansParacliniques } from './components/rubriques/S13BilansParacliniques';
import { S14PriseEnCharge } from './components/rubriques/S14PriseEnCharge';
import { S15EvolutionClinique } from './components/rubriques/S15EvolutionClinique';
import { S16ProjetTherapeutique } from './components/rubriques/S16ProjetTherapeutique';
import { S17Pronostic } from './components/rubriques/S17Pronostic';

const SplashCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-canvas flex items-center justify-center p-6 font-sans">
    <div className="clinical-card max-w-md w-full p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center text-white">
        <HeartPulse className="w-6 h-6" strokeWidth={2.5} />
      </div>
      {children}
    </div>
  </div>
);

/** Resolves the session before anything else is shown (PRD F-00). */
export default function App() {
  const [auth, setAuth] = useState<
    { status: 'checking' } | { status: 'unreachable' } | { status: 'setup' } | { status: 'signin' } | { status: 'ready'; user: SessionUser }
  >({ status: 'checking' });

  const check = React.useCallback(() => {
    setAuth({ status: 'checking' });
    api
      .status()
      .then((s) =>
        setAuth(s.user ? { status: 'ready', user: s.user } : s.setupRequired ? { status: 'setup' } : { status: 'signin' })
      )
      .catch(() => setAuth({ status: 'unreachable' }));
  }, []);

  React.useEffect(check, [check]);

  const onAuth = (user: SessionUser) => setAuth({ status: 'ready', user });

  switch (auth.status) {
    case 'checking':
      return (
        <SplashCard>
          <p className="mt-5 text-base font-semibold text-ink-600" role="status">Chargement…</p>
        </SplashCard>
      );
    case 'unreachable':
      return (
        <SplashCard>
          <h1 className="mt-5 text-lg font-bold text-ink-900">Serveur local injoignable</h1>
          <p className="mt-2 text-base text-ink-600">
            Vérifiez que la fenêtre « PsyDossier » est toujours ouverte, ou relancez « Demarrer PsyDossier ».
          </p>
          <button type="button" onClick={check} className="btn-primary mt-6">Réessayer</button>
        </SplashCard>
      );
    case 'setup':
      return <SetupScreen onAuth={onAuth} />;
    case 'signin':
      return <SignInScreen onAuth={onAuth} />;
    case 'ready':
      return <Workspace key={auth.user.id} user={auth.user} onSignedOut={() => setAuth({ status: 'signin' })} />;
  }
}

function Workspace({ user, onSignedOut }: { user: SessionUser; onSignedOut: () => void }) {
  const notify = useToast();
  const currentUser: UserProfile = React.useMemo(
    () => ({ id: user.id, name: user.name, role: user.role, title: user.title, service: user.service, email: '' }),
    [user]
  );
  const canReadAudit = ROLES_CAN_READ_AUDIT.includes(currentUser.role);
  const canCreateDossier = ROLES_CAN_CREATE_DOSSIER.includes(currentUser.role);
  const openNewPatient = canCreateDossier ? () => setIsNewPatientModalOpen(true) : undefined;

  // Data is persisted by the local server (SQLite), which enforces permissions. See server/.
  const [dossiers, setDossiers] = useState<DossierPsychiatrique[]>([]);

  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  const [activeRubriqueId, setActiveRubriqueId] = useState<string>('s1');
  const [activeView, setActiveView] = useState<AppView>(currentUser.role === 'ADMIN' ? 'UTILISATEURS' : 'DASHBOARD');
  const [registreFilters, setRegistreFilters] = useState<React.ComponentProps<typeof PatientList>['initialFilters']>(null);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [referenceLists, setReferenceLists] = useState<ReferenceLists>(INITIAL_REFERENCE_LISTS);
  const [referentielsUsage, setReferentielsUsage] = useState<Record<string, string[]>>({});

  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const appendAudit = React.useCallback(
    (entries: AuditEntry[]) => {
      if (canReadAudit && entries.length) setAuditLogs((prev) => [...entries, ...prev]);
    },
    [canReadAudit]
  );

  const replaceDossier = (d: DossierPsychiatrique) =>
    setDossiers((prev) => (prev.some((x) => x.id === d.id) ? prev.map((x) => (x.id === d.id ? d : x)) : [d, ...prev]));

  const { setBaseline, adoptServerCopy, adoptReferentiels, resume, pendingCount } = useServerSync(
    dossiers,
    referenceLists,
    loadStatus === 'ready',
    {
      onSaved: (result, superseded) => {
        if (!superseded) replaceDossier(result.dossier);
        appendAudit(result.audit);
        const saved = result.audit.filter((e) => e.action === 'MODIFICATION').map((e) => e.rubriqueNom);
        if (saved.length) notify({ title: 'Rubrique enregistrée', message: saved.join(', ') });
      },
      onRejected: async (dossierId, error) => {
        const missing = (error.body.missing as string[] | undefined)?.join(' · ');
        if (error.status === 409 && error.body.current) {
          const current = error.body.current as DossierPsychiatrique;
          adoptServerCopy(current);
          replaceDossier(current);
          notify({
            tone: 'error',
            title: 'Conflit de modification',
            message: 'Ce dossier a été modifié par un autre utilisateur. La version la plus récente a été rechargée ; ressaisissez vos changements.',
          });
          return;
        }
        notify({ tone: 'error', title: 'Enregistrement refusé', message: missing ? `${error.message} ${missing}` : error.message });
        // Restore the server's copy of the refused dossier.
        try {
          const state = await api.loadState();
          const server = state.dossiers.find((d) => d.id === dossierId);
          if (server) {
            adoptServerCopy(server);
            replaceDossier(server);
          } else {
            setDossiers((prev) => prev.filter((d) => d.id !== dossierId));
          }
          if (canReadAudit) setAuditLogs(state.auditLogs);
        } catch {
          /* next load will reconcile */
        }
      },
      onUnauthorized: () => setSessionExpired(true),
      onReferentielsRejected: async (error) => {
        notify({ tone: 'error', title: 'Référentiels non enregistrés', message: error.message });
        try {
          const state = await api.loadState();
          const refs = state.referenceLists ?? INITIAL_REFERENCE_LISTS;
          adoptReferentiels(refs);
          setReferenceLists(refs);
        } catch {
          /* ignore */
        }
      },
    }
  );

  const loadFromServer = React.useCallback(async () => {
    setLoadStatus('loading');
    try {
      const state = await api.loadState();
      setBaseline(state);
      const refs = state.referenceLists ?? INITIAL_REFERENCE_LISTS;
      adoptReferentiels(refs);
      setDossiers(state.dossiers);
      setAuditLogs(state.auditLogs);
      setReferenceLists(refs);
      setReferentielsUsage(state.referentielsUsage ?? {});
      setLoadStatus('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onSignedOut();
      else setLoadStatus('error');
    }
  }, [setBaseline, adoptReferentiels, onSignedOut]);

  React.useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  /** Client-reported audit events (dossier opened, export). */
  const logEvent = React.useCallback(
    async (action: 'LECTURE' | 'EXPORT', dossierId: string, rubriques?: string[]): Promise<boolean> => {
      try {
        const { entry } = await api.logEvent(action, dossierId, rubriques);
        appendAudit([entry]);
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) setSessionExpired(true);
        else if (err instanceof ApiError) notify({ tone: 'error', title: 'Action refusée', message: err.message });
        return false;
      }
    },
    [appendAudit, notify]
  );

  const handleLogout = async () => {
    if (pendingCount > 0 && !window.confirm('Des modifications ne sont pas encore enregistrées sur le serveur. Se déconnecter quand même ?')) {
      return;
    }
    try {
      await api.logout();
    } finally {
      onSignedOut();
    }
  };

  // Sidebar layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('psydossier_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem('psydossier_sidebar_collapsed', String(isSidebarCollapsed));
    } catch (e) {
      // ignore
    }
  }, [isSidebarCollapsed]);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [validationModalState, setValidationModalState] = useState<{ isOpen: boolean; mode: 'VALIDATION' | 'ADDENDUM' }>({
    isOpen: false,
    mode: 'VALIDATION',
  });
  const [archiveModalState, setArchiveModalState] = useState<{ isOpen: boolean; mode: 'ARCHIVER' | 'REACTIVER' }>({
    isOpen: false,
    mode: 'ARCHIVER',
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Global keyboard shortcuts (Cmd+K, Ctrl+K, or '/')
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea (unless Cmd/Ctrl key combo)
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!isInput && e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Currently active dossier
  const activeDossier = dossiers.find((d) => d.id === activeDossierId) || null;

  const updateActiveDossier = (patch: Partial<DossierPsychiatrique>) => {
    if (!activeDossier) return;
    const updated: DossierPsychiatrique = {
      ...activeDossier,
      ...patch,
      dateDerniereModification: new Date().toISOString(),
    };
    setDossiers((prev) => prev.map((d) => (d.id === activeDossier.id ? updated : d)));
  };

  // Open a dossier (BR-016: every consultation is journalised by the server)
  const handleSelectDossier = (dossierId: string, targetRubriqueId?: string) => {
    const target = dossiers.find((d) => d.id === dossierId);
    if (!target || !confirmDiscard()) return;

    setActiveDossierId(dossierId);
    setActiveView('DOSSIER');
    setActiveRubriqueId(targetRubriqueId || 's1');
    logEvent('LECTURE', target.id);
  };

  // Create a new patient (the server assigns the definitive N° d'ordre and logs the creation)
  const handleCreateNewDossier = (newDossier: DossierPsychiatrique) => {
    setDossiers((prev) => [newDossier, ...prev]);
    setActiveDossierId(newDossier.id);
    setActiveView('DOSSIER');
    setActiveRubriqueId('s2');
    notify({ title: 'Dossier créé', message: `${newDossier.s1Identification.nom} ${newDossier.s1Identification.prenoms}` });
  };

  // Update a specific rubrique (the server checks permissions and records old/new values, BR-012)
  const handleUpdateRubrique = (rubriqueKey: string, updatedData: any) => {
    if (!activeDossier) return;

    let newStatus = activeDossier.statut;
    // B3: Transition BROUILLON -> EN_COURS si S2 & S3 sont renseignés
    if (activeDossier.statut === 'BROUILLON') {
      const hasS2 = rubriqueKey === 's2Modalites' ? updatedData.modalite : activeDossier.s2Modalites.modalite;
      const hasS3 = rubriqueKey === 's3Motif' ? updatedData.plaintePrincipale : activeDossier.s3Motif.plaintePrincipale;
      if (hasS2 && hasS3) {
        newStatus = 'EN_COURS';
      }
    }

    updateActiveDossier({ [rubriqueKey]: updatedData, statut: newStatus } as Partial<DossierPsychiatrique>);
  };

  // Navigate to next rubrique
  const handleNextRubrique = () => {
    if (!confirmDiscard()) return;
    const currentIndex = RUBRIQUES_CONFIG.findIndex((r) => r.id === activeRubriqueId);
    if (currentIndex >= 0 && currentIndex < RUBRIQUES_CONFIG.length - 1) {
      setActiveRubriqueId(RUBRIQUES_CONFIG[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous rubrique
  const handlePrevRubrique = () => {
    if (!confirmDiscard()) return;
    const currentIndex = RUBRIQUES_CONFIG.findIndex((r) => r.id === activeRubriqueId);
    if (currentIndex > 0) {
      setActiveRubriqueId(RUBRIQUES_CONFIG[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Validation of dossier (F-21 & B3) — signatory, date and author are set by the server
  const handleConfirmValidation = (signataire: string) => {
    if (!activeDossier) return;
    if (activeDossier.statut !== 'EN_COURS') {
      notify({ tone: 'error', title: 'Validation impossible', message: 'Seul un dossier EN_COURS peut être validé.' });
      return;
    }
    const now = new Date().toISOString();
    updateActiveDossier({
      statut: 'VALIDÉ',
      validationInfo: { dateHeure: now, valideParNom: currentUser.name, valideParRole: currentUser.role, signataire },
    });
    notify({ title: 'Dossier validé et verrouillé' });
  };

  // Addendum on validated record (BR-013)
  const handleConfirmAddendum = (rubriqueId: string, rubriqueNom: string, contenu: string) => {
    if (!activeDossier) return;
    const newAddendum = {
      id: 'add-' + Date.now(),
      dateHeure: new Date().toISOString(),
      auteurNom: currentUser.name,
      auteurRole: currentUser.role,
      rubriqueId,
      rubriqueNom,
      contenu,
    };
    updateActiveDossier({ addenda: [newAddendum, ...(activeDossier.addenda || [])] });
    notify({ title: 'Addendum consigné', message: rubriqueNom });
  };

  // Archive & Reactivate triggers (ArchiveModal)
  const handleOpenArchiveModal = () => {
    setArchiveModalState({ isOpen: true, mode: 'ARCHIVER' });
  };

  const handleOpenReactivateModal = () => {
    setArchiveModalState({ isOpen: true, mode: 'REACTIVER' });
  };

  const handleConfirmArchive = (motif: string) => {
    if (!activeDossier) return;
    // B3: Only VALIDÉ dossiers can be archived (no skipping states)
    if (activeDossier.statut !== 'VALIDÉ') {
      notify({ tone: 'error', title: 'Archivage impossible', message: 'Seul un dossier VALIDÉ peut être archivé.' });
      return;
    }
    updateActiveDossier({
      statut: 'ARCHIVÉ',
      archivageInfo: {
        dateHeure: new Date().toISOString(),
        archiveParNom: `${currentUser.name} (${currentUser.role})`,
        motif: motif.trim(),
      },
    });
    notify({ title: 'Dossier archivé' });
  };

  const handleConfirmReactivate = (motif: string) => {
    if (!activeDossier) return;
    // B3: Only ARCHIVÉ dossiers can be reactivated
    if (activeDossier.statut !== 'ARCHIVÉ') {
      notify({ tone: 'error', title: 'Réactivation impossible', message: 'Seul un dossier ARCHIVÉ peut être réactivé.' });
      return;
    }
    updateActiveDossier({
      statut: 'EN_COURS',
      derniereReactivation: { dateHeure: new Date().toISOString(), parNom: currentUser.name, motif: motif.trim() },
    });
    notify({ title: 'Dossier réactivé' });
  };

  // Export: journalised by the server before printing (F-22)
  const handleLogExport = (rubriques: string[]) =>
    activeDossier ? logEvent('EXPORT', activeDossier.id, rubriques) : Promise.resolve(false);

  // BR-003 / F-04: data that depends on the patient's sex, for the S1 consistency warning
  const sexDependentFields = (d: DossierPsychiatrique) => {
    const fields: string[] = [];
    const gyneco = d.s6Antecedents.personnels.gynecoObstetricaux;
    if (gyneco && (gyneco.aucun || gyneco.details?.trim())) fields.push('S6 gynéco-obstétricaux');
    const sexuel = d.s7Biographie.developpementSexuelEtSentimentale;
    if (sexuel.menarcheAge?.trim()) fields.push('S7 ménarche');
    if (sexuel.spermarcheAge?.trim()) fields.push('S7 spermarche');
    return fields;
  };

  // Current permission for active rubrique
  const permission = activeDossier ? getRubriquePermission(currentUser.role, activeRubriqueId) : 'none';
  const isReadOnly = activeDossier ? activeDossier.statut === 'VALIDÉ' || activeDossier.statut === 'ARCHIVÉ' || permission === 'read' : true;
  const activeRubriqueConfig = RUBRIQUES_CONFIG.find((r) => r.id === activeRubriqueId);

  if (loadStatus !== 'ready') {
    return loadStatus === 'loading' ? (
      <SplashCard>
        <p className="mt-5 text-base font-semibold text-ink-600" role="status">Chargement des dossiers…</p>
      </SplashCard>
    ) : (
      <SplashCard>
        <h1 className="mt-5 text-lg font-bold text-ink-900">Serveur local injoignable</h1>
        <p className="mt-2 text-base text-ink-600">
          Vérifiez que la fenêtre « PsyDossier » est toujours ouverte, ou relancez « Demarrer PsyDossier ».
        </p>
        <button type="button" onClick={loadFromServer} className="btn-primary mt-6">Réessayer</button>
      </SplashCard>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-900 flex antialiased font-sans">
      {pendingCount > 0 && !sessionExpired && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] chip bg-amber-100 text-amber-900 !py-2.5 !px-4 shadow-[var(--shadow-float)] no-print"
        >
          <AlertTriangle className="w-4 h-4" />
          Enregistrement en attente ({pendingCount}) — le serveur local ne répond pas, nouvelle tentative…
        </div>
      )}
      {/* 1. Sleek Modern Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onChangeView={(view) => {
          if (!confirmDiscard()) return;
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeDossier={activeDossier}
        activeRubriqueId={activeRubriqueId}
        onSelectRubrique={(rubId) => {
          if (!confirmDiscard()) return;
          setActiveRubriqueId(rubId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        dossiersCount={dossiers.length}
        auditCount={auditLogs.length}
        onOpenNewPatient={openNewPatient}
        onOpenQuickSearch={() => setIsCommandPaletteOpen(true)}
        currentUser={currentUser}
        canReadAudit={canReadAudit}
        onLogout={handleLogout}
        onChangePassword={() => setIsPasswordDialogOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header (Breadcrumbs, Command Search & Quick Actions) */}
        <Header
          currentUser={currentUser}
          activeView={activeView}
          onChangeView={(view) => {
            if (!confirmDiscard()) return;
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenNewPatient={openNewPatient}
          onOpenQuickSearch={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          activeDossier={activeDossier}
          activeRubriqueTitle={activeRubriqueConfig ? `${activeRubriqueConfig.code} : ${activeRubriqueConfig.titre}` : undefined}
          onOpenExport={() => setIsExportModalOpen(true)}
        />

        {/* 2. Main Content View */}
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {/* VIEW 0: TABLEAU DE BORD CLINIQUE (M4) */}
          {activeView === 'DASHBOARD' && (
            <ClinicalDashboard
              dossiers={dossiers}
              currentUser={currentUser}
              onSelectDossier={handleSelectDossier}
              onOpenNewPatient={openNewPatient}
              onNavigateToFilteredRegistre={(filters) => {
                if (!confirmDiscard()) return;
                setRegistreFilters(filters);
                setActiveView('REGISTRE');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW A: REGISTRE DES PATIENTS */}
          {activeView === 'REGISTRE' && (
            <PatientList
              dossiers={dossiers}
              onSelectDossier={handleSelectDossier}
              onOpenNewPatient={openNewPatient}
              currentUserRole={currentUser.role}
              initialFilters={registreFilters}
              onClearInitialFilters={() => setRegistreFilters(null)}
            />
          )}

          {/* VIEW B: JOURNAL D'AUDIT */}
          {activeView === 'UTILISATEURS' && currentUser.role === 'ADMIN' && <UsersView currentUserId={currentUser.id} />}

          {activeView === 'AUDIT' && canReadAudit && (
            <AuditLogView
              logs={auditLogs}
              onSelectDossier={(dossierId) => {
                handleSelectDossier(dossierId);
              }}
            />
          )}

          {/* VIEW C: GESTION DES RÉFÉRENTIELS */}
          {activeView === 'REFERENTIELS' && (
            <ReferentielsView
              referenceLists={referenceLists}
              onUpdateReferenceLists={setReferenceLists}
              currentUserRole={currentUser.role}
              usage={referentielsUsage}
            />
          )}

          {/* VIEW D: DOSSIER PATIENT (17 RUBRIQUES) */}
          {activeView === 'DOSSIER' && activeDossier && (
            <div className="flex flex-col">
              {/* Sticky Patient Banner */}
              <PatientBanner
                dossier={activeDossier}
                currentUser={currentUser}
                onValidateDossier={() => setValidationModalState({ isOpen: true, mode: 'VALIDATION' })}
                onOpenAddendumModal={() => setValidationModalState({ isOpen: true, mode: 'ADDENDUM' })}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onArchiveDossier={handleOpenArchiveModal}
                onReactivateDossier={handleOpenReactivateModal}
                onCloseDossier={() => confirmDiscard() && setActiveView('REGISTRE')}
              />

              {/* 2-Column Clinical Workspace */}
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
              {/* Left Column : 17 Rubriques Sidebar */}
              <RubriquesNav
                dossier={activeDossier}
                activeRubriqueId={activeRubriqueId}
                onSelectRubrique={(id) => {
                  if (!confirmDiscard()) return;
                  setActiveRubriqueId(id);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                currentUserRole={currentUser.role}
              />

              {/* Right Column : Active Rubrique Form (remounted per dossier) */}
              <div className="flex-1 min-w-0" key={activeDossier.id}>
                {activeRubriqueId === 's1' && (
                  <S1Identification
                    data={activeDossier.s1Identification}
                    isReadOnly={isReadOnly}
                    onSave={(data: S1IdentificationData) => handleUpdateRubrique('s1Identification', data)}
                    onNext={handleNextRubrique}
                    referenceLists={referenceLists}
                    sexDependentFields={sexDependentFields(activeDossier)}
                  />
                )}

                {activeRubriqueId === 's2' && (
                  <S2Modalites
                    data={activeDossier.s2Modalites}
                    isReadOnly={isReadOnly}
                    onSave={(data: S2ModalitesData) => handleUpdateRubrique('s2Modalites', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's3' && (
                  <S3Motif
                    data={activeDossier.s3Motif}
                    isReadOnly={isReadOnly}
                    onSave={(data: S3MotifData) => handleUpdateRubrique('s3Motif', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's4' && (
                  <S4HistoireMaladie
                    data={activeDossier.s4HistoireMaladie}
                    isReadOnly={isReadOnly}
                    onSave={(data: S4HistoireMaladieData) => handleUpdateRubrique('s4HistoireMaladie', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's5' && (
                  <S5RepresentationSocioCulturelle
                    data={activeDossier.s5Representation}
                    isReadOnly={isReadOnly}
                    onSave={(data: S5RepresentationData) => handleUpdateRubrique('s5Representation', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's6' && (
                  <S6Antecedents
                    data={activeDossier.s6Antecedents}
                    patientSexe={activeDossier.s1Identification.sexe}
                    isReadOnly={isReadOnly}
                    onSave={(data: S6AntecedentsData) => handleUpdateRubrique('s6Antecedents', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's7' && (
                  <S7Biographie
                    data={activeDossier.s7Biographie}
                    patientSexe={activeDossier.s1Identification.sexe}
                    isReadOnly={isReadOnly}
                    onSave={(data: S7BiographieData) => handleUpdateRubrique('s7Biographie', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's8' && (
                  <S8EnqueteSociale
                    data={activeDossier.s8EnqueteSociale}
                    isReadOnly={isReadOnly}
                    onSave={(data: S8EnqueteSocialeData) => handleUpdateRubrique('s8EnqueteSociale', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's9' && (
                  <S9Demande
                    data={activeDossier.s9Demande}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S9DemandeData) => handleUpdateRubrique('s9Demande', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's10' && (
                  <S10ExamenClinique
                    data={activeDossier.s10ExamenClinique}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S10ExamenCliniqueData) => handleUpdateRubrique('s10ExamenClinique', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's11' && (
                  <S11ResumeSyndromique
                    data={activeDossier.s11ResumeSyndromique}
                    isReadOnly={isReadOnly}
                    onSave={(data: S11ResumeSyndromiqueData) => handleUpdateRubrique('s11ResumeSyndromique', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                    referenceLists={referenceLists}
                  />
                )}

                {activeRubriqueId === 's12' && (
                  <S12HypothesesDiag
                    data={activeDossier.s12HypothesesDiag}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S12HypothesesDiagData) => handleUpdateRubrique('s12HypothesesDiag', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                    referenceLists={referenceLists}
                  />
                )}

                {activeRubriqueId === 's13' && (
                  <S13BilansParacliniques
                    data={activeDossier.s13Bilans}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    currentUserName={currentUser.name}
                    onSave={(data: S13BilansData) => handleUpdateRubrique('s13Bilans', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                    referenceLists={referenceLists}
                  />
                )}

                {activeRubriqueId === 's14' && (
                  <S14PriseEnCharge
                    data={activeDossier.s14PriseEnCharge}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    currentUserName={currentUser.name}
                    onSave={(data: S14PriseEnChargeData) => handleUpdateRubrique('s14PriseEnCharge', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's15' && (
                  <S15EvolutionClinique
                    data={activeDossier.s15Evolution}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    currentUserName={currentUser.name}
                    onSave={(data: S15EvolutionData) => handleUpdateRubrique('s15Evolution', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's16' && (
                  <S16ProjetTherapeutique
                    data={activeDossier.s16ProjetTherapeutique}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    currentUserName={currentUser.name}
                    onSave={(data: S16ProjetTherapeutiqueData) => handleUpdateRubrique('s16ProjetTherapeutique', data)}
                    onNext={handleNextRubrique}
                    onPrev={handlePrevRubrique}
                  />
                )}

                {activeRubriqueId === 's17' && (
                  <S17Pronostic
                    data={activeDossier.s17Pronostic}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S17PronosticData) => handleUpdateRubrique('s17Pronostic', data)}
                    onPrevious={handlePrevRubrique}
                    onOpenValidation={() => setValidationModalState({ isOpen: true, mode: 'VALIDATION' })}
                    onOpenExport={() => setIsExportModalOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-ink-150 py-4 px-6 text-center text-xs text-ink-500 no-print mt-auto">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PsyDossier EHR © {new Date().getFullYear()} · Plan type de dossier patient en psychiatrie (17 rubriques)
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>Session active : <strong className="text-ink-900">{currentUser.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Rôle : <span className="font-mono text-primary-700">{currentUser.role}</span></span>
          </div>
        </div>
      </footer>
      </div>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        existingDossiers={dossiers}
        onCreateDossier={handleCreateNewDossier}
        onSelectExistingDossier={handleSelectDossier}
        referenceLists={referenceLists}
        currentUserName={currentUser.name}
        canWriteMotif={getRubriquePermission(currentUser.role, 's3') === 'write'}
      />

      {activeDossier && (
        <ValidationModal
          isOpen={validationModalState.isOpen}
          onClose={() => setValidationModalState({ ...validationModalState, isOpen: false })}
          dossier={activeDossier}
          currentUser={currentUser}
          mode={validationModalState.mode}
          onConfirmValidation={handleConfirmValidation}
          onConfirmAddendum={handleConfirmAddendum}
        />
      )}

      {activeDossier && (
        <ExportDossierModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          dossier={activeDossier}
          currentUser={currentUser}
          onLogExport={handleLogExport}
        />
      )}

      {activeDossier && (
        <ArchiveModal
          isOpen={archiveModalState.isOpen}
          onClose={() => setArchiveModalState({ ...archiveModalState, isOpen: false })}
          dossier={activeDossier}
          currentUser={currentUser}
          mode={archiveModalState.mode}
          onConfirmArchive={handleConfirmArchive}
          onConfirmReactivate={handleConfirmReactivate}
        />
      )}

      {isPasswordDialogOpen && <ChangePasswordDialog onClose={() => setIsPasswordDialogOpen(false)} />}

      {sessionExpired && (
        <SessionExpiredDialog
          login={user.login}
          onAuth={(u) => {
            if (u.id !== user.id) {
              // Another person signed in: start a fresh workspace for them.
              window.location.reload();
              return;
            }
            setSessionExpired(false);
            resume();
          }}
          onSwitchUser={() => {
            api.logout().finally(onSignedOut);
          }}
        />
      )}

      {/* Global Quick Actions Command Palette (Cmd+K / Ctrl+K / /) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        dossiers={dossiers}
        onSelectDossier={(dossierId, targetRubriqueId) => {
          handleSelectDossier(dossierId, targetRubriqueId);
        }}
        onOpenNewPatient={openNewPatient}
        onChangeView={(view) => {
          if (!confirmDiscard()) return;
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeDossierId={activeDossierId}
        canCreateDossier={canCreateDossier}
        canReadAudit={canReadAudit}
      />
    </div>
  );
}
