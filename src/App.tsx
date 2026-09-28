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

  // LocalStorage-backed state with initial fallback
  const [dossiers, setDossiers] = useState<DossierPsychiatrique[]>(() => {
    try {
      const saved = localStorage.getItem('psydossier_patients');
      return saved ? JSON.parse(saved) : INITIAL_DOSSIERS;
    } catch {
      return INITIAL_DOSSIERS;
    }
  });

  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  const [activeRubriqueId, setActiveRubriqueId] = useState<string>('s1');
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS'>('DASHBOARD');

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem('psydossier_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [referenceLists, setReferenceLists] = useState<ReferenceLists>(() => {
    try {
      const saved = localStorage.getItem('psydossier_referentiels');
      return saved ? JSON.parse(saved) : INITIAL_REFERENCE_LISTS;
    } catch {
      return INITIAL_REFERENCE_LISTS;
    }
  });

  // Save to localStorage on changes
  React.useEffect(() => {
    try {
      localStorage.setItem('psydossier_patients', JSON.stringify(dossiers));
    } catch (e) {
      console.warn('Storage limit reached', e);
    }
  }, [dossiers]);

  React.useEffect(() => {
    try {
      localStorage.setItem('psydossier_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage limit reached', e);
    }
  }, [auditLogs]);

  React.useEffect(() => {
    try {
      localStorage.setItem('psydossier_referentiels', JSON.stringify(referenceLists));
    } catch (e) {
      console.warn('Storage limit reached', e);
    }
  }, [referenceLists]);

  // Modals state
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
  const handleSelectDossier = (dossierId: string) => {
    const target = dossiers.find((d) => d.id === dossierId);
    if (!target) return;

    setActiveDossierId(dossierId);
    setActiveView('DOSSIER');
    setActiveRubriqueId('s1');

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

    // Audit log
    logAudit(
      'MODIFICATION',
      activeDossier.s1Identification.numeroOrdre,
      activeDossier.id,
      `Mise à jour de la rubrique ${rubNom} par ${currentUser.name}.`,
      activeRubriqueId,
      rubNom
    );
  };

  // Navigate to next rubrique
  const handleNextRubrique = () => {
    const currentIndex = RUBRIQUES_CONFIG.findIndex((r) => r.id === activeRubriqueId);
    if (currentIndex >= 0 && currentIndex < RUBRIQUES_CONFIG.length - 1) {
      setActiveRubriqueId(RUBRIQUES_CONFIG[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Validation of dossier (F-21 & B3)
  const handleConfirmValidation = (signataire: string) => {
    if (!activeDossier) return;

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

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#18243A] flex flex-col font-sans">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
        hasActiveDossier={Boolean(activeDossier)}
        activeDossierPatientName={
          activeDossier ? `${activeDossier.s1Identification.nom} ${activeDossier.s1Identification.prenoms}` : undefined
        }
        onReturnToDossier={() => setActiveView('DOSSIER')}
      />

      {/* 2. Main Content View */}
      <main className="flex-1">
        {/* VIEW 0: TABLEAU DE BORD CLINIQUE (M4) */}
        {activeView === 'DASHBOARD' && (
          <ClinicalDashboard
            dossiers={dossiers}
            currentUser={currentUser}
            onSelectDossier={handleSelectDossier}
            onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
          />
        )}

        {/* VIEW A: REGISTRE DES PATIENTS */}
        {activeView === 'REGISTRE' && (
          <PatientList
            dossiers={dossiers}
            onSelectDossier={handleSelectDossier}
            onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
            currentUserRole={currentUser.role}
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
            <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
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
                  />
                )}

                {activeRubriqueId === 's3' && (
                  <S3Motif
                    data={activeDossier.s3Motif}
                    isReadOnly={isReadOnly}
                    onSave={(data: S3MotifData) => handleUpdateRubrique('s3Motif', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's4' && (
                  <S4HistoireMaladie
                    data={activeDossier.s4HistoireMaladie}
                    isReadOnly={isReadOnly}
                    onSave={(data: S4HistoireMaladieData) => handleUpdateRubrique('s4HistoireMaladie', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's5' && (
                  <S5RepresentationSocioCulturelle
                    data={activeDossier.s5Representation}
                    isReadOnly={isReadOnly}
                    onSave={(data: S5RepresentationData) => handleUpdateRubrique('s5Representation', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's6' && (
                  <S6Antecedents
                    data={activeDossier.s6Antecedents}
                    patientSexe={activeDossier.s1Identification.sexe}
                    isReadOnly={isReadOnly}
                    onSave={(data: S6AntecedentsData) => handleUpdateRubrique('s6Antecedents', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's7' && (
                  <S7Biographie
                    data={activeDossier.s7Biographie}
                    patientSexe={activeDossier.s1Identification.sexe}
                    isReadOnly={isReadOnly}
                    onSave={(data: S7BiographieData) => handleUpdateRubrique('s7Biographie', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's8' && (
                  <S8EnqueteSociale
                    data={activeDossier.s8EnqueteSociale}
                    isReadOnly={isReadOnly}
                    onSave={(data: S8EnqueteSocialeData) => handleUpdateRubrique('s8EnqueteSociale', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's9' && (
                  <S9Demande
                    data={activeDossier.s9Demande}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S9DemandeData) => handleUpdateRubrique('s9Demande', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's10' && (
                  <S10ExamenClinique
                    data={activeDossier.s10ExamenClinique}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S10ExamenCliniqueData) => handleUpdateRubrique('s10ExamenClinique', data)}
                    onNext={handleNextRubrique}
                  />
                )}

                {activeRubriqueId === 's11' && (
                  <S11ResumeSyndromique
                    data={activeDossier.s11ResumeSyndromique}
                    isReadOnly={isReadOnly}
                    onSave={(data: S11ResumeSyndromiqueData) => handleUpdateRubrique('s11ResumeSyndromique', data)}
                    onNext={handleNextRubrique}
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
                  />
                )}

                {activeRubriqueId === 's17' && (
                  <S17Pronostic
                    data={activeDossier.s17Pronostic}
                    isReadOnly={isReadOnly}
                    currentUserRole={currentUser.role}
                    onSave={(data: S17PronosticData) => handleUpdateRubrique('s17Pronostic', data)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D9E2E8] py-4 px-6 text-center text-xs text-[#64748B] no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PsyDossier © {new Date().getFullYear()} · Plan type de dossier patient en psychiatrie (17 rubriques)
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Session active : <strong className="text-[#18243A]">{currentUser.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Rôle : <span className="font-mono text-[#07988D]">{currentUser.role}</span></span>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
