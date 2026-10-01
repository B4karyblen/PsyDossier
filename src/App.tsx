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
} from './types';
import {
  CLINICAL_USERS,
  INITIAL_DOSSIERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REFERENCE_LISTS,
} from './data/initialData';
import { getRubriquePermission, RUBRIQUES_CONFIG } from './utils/rules';
import { AlertTriangle, HeartPulse } from 'lucide-react';
import { api } from './lib/api';
import { useServerSync } from './lib/useServerSync';
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(CLINICAL_USERS[0]); // Dr. Oumar Diallo (Psychiatre)

  // Data is persisted by the local server (SQLite). See server/index.ts.
  const [dossiers, setDossiers] = useState<DossierPsychiatrique[]>([]);

  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  const [activeRubriqueId, setActiveRubriqueId] = useState<string>('s1');
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS'>('DASHBOARD');
  const [registreFilters, setRegistreFilters] = useState<React.ComponentProps<typeof PatientList>['initialFilters']>(null);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [referenceLists, setReferenceLists] = useState<ReferenceLists>(INITIAL_REFERENCE_LISTS);

  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const { setBaseline, pendingCount } = useServerSync(dossiers, auditLogs, referenceLists, loadStatus === 'ready');

  const loadFromServer = React.useCallback(async () => {
    setLoadStatus('loading');
    try {
      const state = await api.loadState();
      setBaseline(state);
      const isNewDatabase = state.dossiers.length === 0 && state.auditLogs.length === 0 && !state.referenceLists;
      // Demo patients are only seeded in development; a fresh install starts with an empty registry.
      const seedDemo = isNewDatabase && import.meta.env.DEV;
      setDossiers(seedDemo ? INITIAL_DOSSIERS : state.dossiers);
      setAuditLogs(seedDemo ? INITIAL_AUDIT_LOGS : state.auditLogs);
      setReferenceLists(state.referenceLists ?? INITIAL_REFERENCE_LISTS);
      setLoadStatus('ready');
    } catch {
      setLoadStatus('error');
    }
  }, [setBaseline]);

  React.useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

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

  // Helper to log audit actions
  const logAudit = (
    action: AuditEntry['action'],
    patientNumeroOrdre: string,
    dossierId: string,
    details: string,
    rubriqueId?: string,
    rubriqueNom?: string
  ) => {
    const newLog: AuditEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      patientId: dossierId,
      patientNumeroOrdre,
      dossierId,
      action,
      rubriqueId,
      rubriqueNom,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Open a dossier
  const handleSelectDossier = (dossierId: string, targetRubriqueId?: string) => {
    const target = dossiers.find((d) => d.id === dossierId);
    if (!target) return;

    setActiveDossierId(dossierId);
    setActiveView('DOSSIER');
    setActiveRubriqueId(targetRubriqueId || 's1');

    // Audit log (BR-016: traçabilité de chaque consultation de dossier)
    logAudit(
      'LECTURE',
      target.s1Identification.numeroOrdre,
      target.id,
      `Consultation du dossier patient par ${currentUser.name} (${currentUser.role}).`
    );
  };

  // Create a new patient
  const handleCreateNewDossier = (newDossier: DossierPsychiatrique) => {
    setDossiers((prev) => [newDossier, ...prev]);
    setActiveDossierId(newDossier.id);
    setActiveView('DOSSIER');
    setActiveRubriqueId('s1');

    logAudit(
      'CREATION',
      newDossier.s1Identification.numeroOrdre,
      newDossier.id,
      `Création et ouverture du dossier patient pour ${newDossier.s1Identification.nom} ${newDossier.s1Identification.prenoms}.`
    );
  };

  // Update a specific rubrique
  const handleUpdateRubrique = (rubriqueKey: string, updatedData: any) => {
    if (!activeDossier) return;

    const now = new Date().toISOString();
    const targetRubrique = RUBRIQUES_CONFIG.find((r) => r.id === activeRubriqueId);
    const rubNom = targetRubrique ? `${targetRubrique.code} : ${targetRubrique.titre}` : activeRubriqueId;

    let newStatus = activeDossier.statut;
    // B3: Transition BROUILLON -> EN_COURS si S2 & S3 sont renseignés
    if (activeDossier.statut === 'BROUILLON') {
      const hasS2 = rubriqueKey === 's2Modalites' ? updatedData.modalite : activeDossier.s2Modalites.modalite;
      const hasS3 = rubriqueKey === 's3Motif' ? updatedData.plaintePrincipale : activeDossier.s3Motif.plaintePrincipale;
      if (hasS2 && hasS3) {
        newStatus = 'EN_COURS';
      }
    }

    const updatedDossier: DossierPsychiatrique = {
      ...activeDossier,
      [rubriqueKey]: updatedData,
      statut: newStatus,
      dateDerniereModification: now,
    };

    setDossiers((prev) => prev.map((d) => (d.id === activeDossier.id ? updatedDossier : d)));

    // Audit log with old/new values (BR-012)
    const oldData = (activeDossier as any)[rubriqueKey];
    const oldSummary = oldData ? JSON.stringify(oldData).slice(0, 120) : '(vide)';
    const newSummary = JSON.stringify(updatedData).slice(0, 120);
    logAudit(
      'MODIFICATION',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Mise à jour de la rubrique ${rubNom} par ${currentUser.name}.`,
      activeRubriqueId,
      rubNom
    );
    // Store old/new values in the last audit entry
    setAuditLogs((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[0];
      if (last.action === 'MODIFICATION' && last.rubriqueId === activeRubriqueId) {
        return [{ ...last, oldValueSummary: oldSummary, newValueSummary: newSummary }, ...prev.slice(1)];
      }
      return prev;
    });
  };

  // Navigate to next rubrique
  const handleNextRubrique = () => {
    const currentIndex = RUBRIQUES_CONFIG.findIndex((r) => r.id === activeRubriqueId);
    if (currentIndex >= 0 && currentIndex < RUBRIQUES_CONFIG.length - 1) {
      setActiveRubriqueId(RUBRIQUES_CONFIG[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous rubrique
  const handlePrevRubrique = () => {
    const currentIndex = RUBRIQUES_CONFIG.findIndex((r) => r.id === activeRubriqueId);
    if (currentIndex > 0) {
      setActiveRubriqueId(RUBRIQUES_CONFIG[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Validation of dossier (F-21 & B3)
  const handleConfirmValidation = (signataire: string) => {
    if (!activeDossier) return;

    // B3: Only EN_COURS can be validated (no skipping states)
    if (activeDossier.statut !== 'EN_COURS') {
      alert('Seul un dossier EN_COURS peut être validé.');
      return;
    }

    const now = new Date().toISOString();
    const updatedDossier: DossierPsychiatrique = {
      ...activeDossier,
      statut: 'VALIDÉ',
      dateDerniereModification: now,
      validationInfo: {
        dateHeure: now,
        valideParNom: currentUser.name,
        valideParRole: currentUser.role,
        signataire,
      },
    };

    setDossiers((prev) => prev.map((d) => (d.id === activeDossier.id ? updatedDossier : d)));

    logAudit(
      'VALIDATION',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Validation et verrouillage officiel du dossier médical par ${signataire}.`
    );
  };

  // Addendum on validated dossier (BR-013)
  const handleConfirmAddendum = (rubriqueId: string, rubriqueNom: string, contenu: string) => {
    if (!activeDossier) return;

    const now = new Date().toISOString();
    const newAddendum = {
      id: 'add-' + Date.now(),
      dateHeure: now,
      auteurNom: currentUser.name,
      auteurRole: currentUser.role,
      rubriqueId,
      rubriqueNom,
      contenu,
    };

    const updatedDossier: DossierPsychiatrique = {
      ...activeDossier,
      dateDerniereModification: now,
      addenda: [newAddendum, ...(activeDossier.addenda || [])],
    };

    setDossiers((prev) => prev.map((d) => (d.id === activeDossier.id ? updatedDossier : d)));

    logAudit(
      'ADDENDUM',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Addendum consigné sur ${rubriqueNom} : "${contenu.slice(0, 60)}..." par ${currentUser.name}.`,
      rubriqueId,
      rubriqueNom
    );
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
      alert('Seul un dossier VALIDÉ peut être archivé.');
      return;
    }

    const now = new Date().toISOString();
    const updatedDossier: DossierPsychiatrique = {
      ...activeDossier,
      statut: 'ARCHIVÉ',
      dateDerniereModification: now,
      archivageInfo: {
        dateHeure: now,
        archiveParNom: `${currentUser.name} (${currentUser.role})`,
        motif: motif.trim(),
      },
    };

    setDossiers((prev) => prev.map((d) => (d.id === activeDossier.id ? updatedDossier : d)));

    logAudit(
      'ARCHIVAGE',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Archivage du dossier médical. Motif : ${motif.trim()}`
    );
  };

  const handleConfirmReactivate = (motif: string) => {
    if (!activeDossier) return;

    // B3: Only ARCHIVÉ dossiers can be reactivated
    if (activeDossier.statut !== 'ARCHIVÉ') {
      alert('Seul un dossier ARCHIVÉ peut être réactivé.');
      return;
    }

    const now = new Date().toISOString();
    const updatedDossier: DossierPsychiatrique = {
      ...activeDossier,
      statut: 'EN_COURS',
      dateDerniereModification: now,
    };

    setDossiers((prev) => prev.map((d) => (d.id === activeDossier.id ? updatedDossier : d)));

    logAudit(
      'REACTIVATION',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Réactivation du dossier archivé. Motif : ${motif.trim()}`
    );
  };

  // Export audit log
  const handleLogExport = () => {
    if (!activeDossier) return;
    logAudit(
      'EXPORT',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Exportation / Impression clinique intégrale du dossier patient par ${currentUser.name}.`
    );
  };

  // Current permission for active rubrique
  const permission = activeDossier ? getRubriquePermission(currentUser.role, activeRubriqueId) : 'none';
  const isReadOnly = activeDossier ? activeDossier.statut === 'VALIDÉ' || activeDossier.statut === 'ARCHIVÉ' || permission === 'read' : true;
  const activeRubriqueConfig = RUBRIQUES_CONFIG.find((r) => r.id === activeRubriqueId);

  if (loadStatus !== 'ready') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 font-sans">
        <div className="clinical-card max-w-md w-full p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white">
            <HeartPulse className="w-6 h-6" strokeWidth={2.5} />
          </div>
          {loadStatus === 'loading' ? (
            <p className="mt-5 text-sm font-semibold text-ink-500" role="status">
              Chargement des dossiers…
            </p>
          ) : (
            <>
              <h1 className="mt-5 text-lg font-bold text-ink-900">Serveur local injoignable</h1>
              <p className="mt-2 text-sm text-ink-500">
                Vérifiez que la fenêtre « PsyDossier » est toujours ouverte, ou relancez
                « Demarrer PsyDossier ».
              </p>
              <button type="button" onClick={loadFromServer} className="btn-primary mt-6">
                Réessayer
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-900 flex antialiased font-sans">
      {pendingCount > 0 && (
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
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeDossier={activeDossier}
        activeRubriqueId={activeRubriqueId}
        onSelectRubrique={(rubId) => {
          setActiveRubriqueId(rubId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        dossiersCount={dossiers.length}
        auditCount={auditLogs.length}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
        onOpenQuickSearch={() => setIsCommandPaletteOpen(true)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
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
          onSelectUser={setCurrentUser}
          activeView={activeView}
          onChangeView={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
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
              onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
              onNavigateToFilteredRegistre={(filters) => {
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
              onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
              currentUserRole={currentUser.role}
              initialFilters={registreFilters}
              onClearInitialFilters={() => setRegistreFilters(null)}
            />
          )}

          {/* VIEW B: JOURNAL D'AUDIT */}
          {activeView === 'AUDIT' && (
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
                onCloseDossier={() => setActiveView('REGISTRE')}
              />

              {/* 2-Column Clinical Workspace */}
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
              {/* Left Column : 17 Rubriques Sidebar */}
              <RubriquesNav
                dossier={activeDossier}
                activeRubriqueId={activeRubriqueId}
                onSelectRubrique={(id) => {
                  setActiveRubriqueId(id);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                currentUserRole={currentUser.role}
              />

              {/* Right Column : Active Rubrique Form */}
              <div className="flex-1 min-w-0">
                {activeRubriqueId === 's1' && (
                  <S1Identification
                    data={activeDossier.s1Identification}
                    isReadOnly={isReadOnly}
                    onSave={(data: S1IdentificationData) => handleUpdateRubrique('s1Identification', data)}
                    onNext={handleNextRubrique}
                    referenceLists={referenceLists}
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
          <div className="flex items-center gap-3 text-[11px]">
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

      {/* Global Quick Actions Command Palette (Cmd+K / Ctrl+K / /) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        dossiers={dossiers}
        onSelectDossier={(dossierId, targetRubriqueId) => {
          handleSelectDossier(dossierId, targetRubriqueId);
        }}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
        onChangeView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeDossierId={activeDossierId}
      />
    </div>
  );
}
