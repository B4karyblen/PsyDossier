import React from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { calculateDossierStats, checkDossierValidationPreconditions } from '../utils/rules';
import {
  Activity,
  Users,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ClinicalDashboardProps {
  dossiers: DossierPsychiatrique[];
  currentUser: UserProfile;
  onSelectDossier: (dossierId: string, targetRubriqueId?: string) => void;
  onOpenNewPatient: () => void;
  onNavigateToFilteredRegistre?: (filters: {
    status?: string;
    modalite?: string;
    orientation?: string;
    search?: string;
    sortBy?: 'dateModif' | 'dateCreation' | 'nom' | 'completude';
  }) => void;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({
  dossiers,
  currentUser,
  onSelectDossier,
  onOpenNewPatient,
  onNavigateToFilteredRegistre,
}) => {
  const activeDossiers = dossiers.filter(d => d.statut !== 'ARCHIVÉ');
  const valides = dossiers.filter(d => d.statut === 'VALIDÉ');
  const enCours = dossiers.filter(d => d.statut === 'EN_COURS');
  const brouillons = dossiers.filter(d => d.statut === 'BROUILLON');
  const sansConsentement = activeDossiers.filter(d => d.s2Modalites.modalite === 'Soins sans consentement');
  const hospitalises = activeDossiers.filter(d => d.s14PriseEnCharge.orientation === 'Hospitalisation');
  const ambulatoires = activeDossiers.filter(d => d.s14PriseEnCharge.orientation === 'Ambulatoire');

  // Complétude moyenne
  const avgCompleteness = activeDossiers.length > 0
    ? Math.round(
        activeDossiers.reduce((acc, d) => acc + calculateDossierStats(d).percentage, 0) / activeDossiers.length
      )
    : 0;

  // Bilans en attente
  const bilansEnAttente = activeDossiers.flatMap(d =>
    (d.s13Bilans.bilans || [])
      .filter(b => b.statut === 'Prescrit' || b.statut === 'Réalisé')
      .map(b => ({ ...b, patientNom: `${d.s1Identification.nom} ${d.s1Identification.prenoms}`, dossierId: d.id, numeroOrdre: d.s1Identification.numeroOrdre }))
  );

  // Soins sans consentement actifs
  const sscList = sansConsentement.map(d => ({
    dossierId: d.id,
    numeroOrdre: d.s1Identification.numeroOrdre,
    nom: `${d.s1Identification.nom} ${d.s1Identification.prenoms}`,
    type: d.s2Modalites.soinsSansConsentementType || 'Non précisé',
    demandeur: d.s2Modalites.soinsSansConsentementDemandeur || 'Autorité administrative',
    dateDecision: d.s2Modalites.dateDecisionOuCertificat || d.dateCreation.split('T')[0],
  }));

  // Diagnostic distribution
  const diagCountMap: Record<string, number> = {};
  activeDossiers.forEach(d => {
    const p = d.s12HypothesesDiag.hypotheses?.find(h => h.type === 'Principale');
    if (p) {
      const key = p.codeCimDsm ? `[${p.codeCimDsm}] ${p.libelle}` : p.libelle;
      diagCountMap[key] = (diagCountMap[key] || 0) + 1;
    }
  });
  const sortedDiags = Object.entries(diagCountMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded">
              TABLEAU DE BORD CLINIQUE (M4)
            </span>
            <span className="text-xs text-[#64748B]">Service de Psychiatrie Universitaire</span>
          </div>
          <h1 className="text-xl font-bold text-[#18243A] tracking-tight mt-1">
            Activité & Surveillance des Dossiers Patients
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Bienvenue, <strong>{currentUser.name}</strong> ({currentUser.title})
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs self-start md:self-auto"
        >
          + Nouveau Patient
        </button>
      </div>

      {/* KPI Cards (4 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Actifs */}
        <div
          onClick={() => onNavigateToFilteredRegistre?.({ status: 'TOUS_ACTIFS' })}
          className="bg-white border border-[#D9E2E8] hover:border-[#10B9A9] hover:shadow-md cursor-pointer rounded-xl p-4 transition-all group"
          title="Afficher tous les patients actifs dans le Registre"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#18243A]">Patients Actifs</span>
            <div className="w-7 h-7 rounded-lg bg-[#ECFBF9] text-[#10B9A9] flex items-center justify-center group-hover:bg-[#D9F7F3]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#18243A] mt-2 tabular-nums">
            {activeDossiers.length}
          </div>
          <div className="text-[11px] text-[#07988D] font-medium mt-1 flex items-center gap-1">
            <span>{valides.length} validés · {enCours.length} en cours</span>
            <span className="text-[10px]">→</span>
          </div>
        </div>

        {/* Soins sans consentement */}
        <div
          onClick={() => onNavigateToFilteredRegistre?.({ modalite: 'Soins sans consentement' })}
          className="bg-white border border-[#D9E2E8] hover:border-[#F43F5E] hover:shadow-md cursor-pointer rounded-xl p-4 transition-all group"
          title="Filtrer les patients sous soins sans consentement"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#BE123C]">Sans Consentement</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFE4E6] text-[#BE123C] flex items-center justify-center group-hover:bg-[#FECDD3]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#BE123C] mt-2 tabular-nums">
            {sansConsentement.length}
          </div>
          <div className="text-[11px] text-[#BE123C] font-medium mt-1 flex items-center gap-1">
            <span>Régime juridique spécial</span>
            <span className="text-[10px]">→</span>
          </div>
        </div>

        {/* Hospitalisations actives */}
        <div
          onClick={() => onNavigateToFilteredRegistre?.({ orientation: 'Hospitalisation' })}
          className="bg-white border border-[#D9E2E8] hover:border-[#10B9A9] hover:shadow-md cursor-pointer rounded-xl p-4 transition-all group"
          title="Filtrer les patients en hospitalisation complète"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#18243A]">Hospitalisations</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F7] text-[#18243A] flex items-center justify-center group-hover:bg-[#E8EEF2]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#18243A] mt-2 tabular-nums">
            {hospitalises.length}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
            <span>{ambulatoires.length} en ambulatoire</span>
            <span className="text-[10px]">→</span>
          </div>
        </div>

        {/* Complétude moyenne */}
        <div
          onClick={() => onNavigateToFilteredRegistre?.({ sortBy: 'completude' })}
          className="bg-white border border-[#D9E2E8] hover:border-[#10B981] hover:shadow-md cursor-pointer rounded-xl p-4 transition-all group"
          title="Trier les patients par taux de complétude"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#15803D]">Complétude Moyenne</span>
            <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center group-hover:bg-[#BBF7D0]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#10B981] mt-2 tabular-nums">
            {avgCompleteness}%
          </div>
          <div className="text-[11px] text-[#15803D] font-medium mt-1 flex items-center gap-1">
            <span>Sur 17 rubriques</span>
            <span className="text-[10px]">→</span>
          </div>
        </div>
      </div>

      {/* Grid: Alertes cliniques prioritaires & Répartitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soins sans consentement sous surveillance */}
        <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF2]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#BE123C]" />
              <h2 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                Vigilance Soins Sans Consentement ({sscList.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Mali / Afrique de l'Ouest</span>
          </div>

          {sscList.length > 0 ? (
            <div className="space-y-2.5">
              {sscList.map((item) => (
                <div
                  key={item.dossierId}
                  onClick={() => onSelectDossier(item.dossierId, 's2')}
                  className="p-3 bg-[#F8FAFC] border border-[#D9E2E8] hover:border-[#10B9A9] rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#18243A]">
                        {item.numeroOrdre}
                      </span>
                      <strong className="text-xs text-[#18243A] group-hover:text-[#07988D] transition-colors">
                        {item.nom}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Sous-type : <strong className="text-[#BE123C]">{item.type}</strong> ({item.demandeur})
                    </div>
                  </div>

                  <span className="text-xs text-[#07988D] font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Dossier <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg">
              Aucun patient sous régime de soins sans consentement actuellement.
            </div>
          )}
        </div>

        {/* Bilans paracliniques en attente de résultat */}
        <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF2]">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                Bilans Paracliniques en Attente ({bilansEnAttente.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Biologie & Imagerie</span>
          </div>

          {bilansEnAttente.length > 0 ? (
            <div className="space-y-2.5">
              {bilansEnAttente.map((bilan) => (
                <div
                  key={bilan.id}
                  onClick={() => onSelectDossier(bilan.dossierId, 's13')}
                  className="p-3 bg-[#F8FAFC] border border-[#D9E2E8] hover:border-[#10B9A9] rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#18243A]">
                        {bilan.numeroOrdre}
                      </span>
                      <strong className="text-xs text-[#18243A] group-hover:text-[#07988D]">
                        {bilan.patientNom}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Examen : <strong>{bilan.type}</strong> · Prescrit le {bilan.datePrescription}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/30">
                    {bilan.statut}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg">
              Tous les bilans paracliniques prescrits ont reçu leurs résultats.
            </div>
          )}
        </div>
      </div>

      {/* Diagnostics principaux fréquents */}
      <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF2]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B9A9]" />
            <h2 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Pathologies & Diagnostics Prédominants (CIM-10)
            </h2>
          </div>
          <span className="text-[11px] text-[#64748B]">Dossiers actifs documentés</span>
        </div>

        {sortedDiags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedDiags.map(([diag, count]) => (
                <div
                  key={diag}
                  onClick={() => onNavigateToFilteredRegistre?.({ search: diag.split('] ')[1] || diag })}
                  className="p-3 bg-[#F8FAFC] border border-[#D9E2E8] hover:border-[#10B9A9] hover:bg-[#ECFBF9]/30 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                  title={`Filtrer les dossiers avec le diagnostic : ${diag}`}
                >
                  <span className="text-xs font-medium text-[#18243A] group-hover:text-[#07988D] truncate pr-2" title={diag}>
                    {diag}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#D9E2E8] text-[#07988D] shrink-0">
                    {count} cas
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#64748B]">
            Aucun diagnostic n'a encore été formalisé sur les dossiers en cours.
          </div>
        )}
      </div>
    </div>
  );
};
