import React from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { calculateDossierStats } from '../utils/rules';
import {
  Activity,
  Users,
  CheckCircle2,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  ChevronRight,
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
  const activeDossiers = dossiers.filter((d) => d.statut !== 'ARCHIVÉ');
  const valides = dossiers.filter((d) => d.statut === 'VALIDÉ');
  const enCours = dossiers.filter((d) => d.statut === 'EN_COURS');
  const brouillons = dossiers.filter((d) => d.statut === 'BROUILLON');
  const sansConsentement = activeDossiers.filter((d) => d.s2Modalites.modalite === 'Soins sans consentement');
  const hospitalises = activeDossiers.filter((d) => d.s14PriseEnCharge.orientation === 'Hospitalisation');
  const ambulatoires = activeDossiers.filter((d) => d.s14PriseEnCharge.orientation === 'Ambulatoire');

  // Complétude moyenne
  const avgCompleteness =
    activeDossiers.length > 0
      ? Math.round(
          activeDossiers.reduce((acc, d) => acc + calculateDossierStats(d).percentage, 0) /
            activeDossiers.length
        )
      : 0;

  // Bilans en attente
  const bilansEnAttente = activeDossiers.flatMap((d) =>
    (d.s13Bilans.bilans || [])
      .filter((b) => b.statut === 'Prescrit' || b.statut === 'Réalisé')
      .map((b) => ({
        ...b,
        patientNom: `${d.s1Identification.nom} ${d.s1Identification.prenoms}`,
        dossierId: d.id,
        numeroOrdre: d.s1Identification.numeroOrdre,
      }))
  );

  // Soins sans consentement actifs
  const sscList = sansConsentement.map((d) => ({
    dossierId: d.id,
    numeroOrdre: d.s1Identification.numeroOrdre,
    nom: `${d.s1Identification.nom} ${d.s1Identification.prenoms}`,
    type: d.s2Modalites.soinsSansConsentementType || 'Non précisé',
    demandeur: d.s2Modalites.soinsSansConsentementDemandeur || 'Autorité administrative',
    dateDecision: d.s2Modalites.dateDecisionOuCertificat || d.dateCreation.split('T')[0],
  }));

  // Diagnostic distribution
  const diagCountMap: Record<string, number> = {};
  activeDossiers.forEach((d) => {
    const p = d.s12HypothesesDiag.hypotheses?.find((h) => h.type === 'Principale');
    if (p) {
      const key = p.codeCimDsm ? `[${p.codeCimDsm}] ${p.libelle}` : p.libelle;
      diagCountMap[key] = (diagCountMap[key] || 0) + 1;
    }
  });
  const sortedDiags = Object.entries(diagCountMap).sort((a, b) => b[1] - a[1]);

  const firstName = currentUser.name.replace(/^Dr\.?\s*/i, '').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const kpis = [
    {
      label: 'Patients actifs',
      value: activeDossiers.length,
      hint: `${valides.length} validés · ${enCours.length} en cours`,
      icon: Users,
      tile: 'tile-brand',
      onClick: () => onNavigateToFilteredRegistre?.({ status: 'TOUS_ACTIFS' }),
    },
    {
      label: 'Sans consentement',
      value: sansConsentement.length,
      hint: 'Régime médico-légal spécial',
      icon: ShieldAlert,
      tile: 'tile-rose',
      onClick: () => onNavigateToFilteredRegistre?.({ modalite: 'Soins sans consentement' }),
    },
    {
      label: 'Hospitalisations',
      value: hospitalises.length,
      hint: `${ambulatoires.length} en ambulatoire`,
      icon: Building2,
      tile: 'tile-violet',
      onClick: () => onNavigateToFilteredRegistre?.({ orientation: 'Hospitalisation' }),
    },
    {
      label: 'Complétude moyenne',
      value: `${avgCompleteness}%`,
      hint: 'Sur 17 rubriques',
      icon: CheckCircle2,
      tile: 'tile-amber',
      onClick: () => onNavigateToFilteredRegistre?.({ sortBy: 'completude' }),
      progress: avgCompleteness,
    },
  ];

  const SectionHeader = ({
    icon: Icon,
    tile,
    title,
    count,
    meta,
  }: {
    icon: React.ElementType;
    tile: string;
    title: string;
    count?: number;
    meta: string;
  }) => (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-150">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`icon-tile ${tile} !w-7 !h-7`}>
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-semibold text-ink-900 truncate">{title}</h2>
        {count !== undefined && (
          <span className="chip bg-ink-100 text-ink-600 tabular-nums">{count}</span>
        )}
      </div>
      <span className="text-xs font-medium text-ink-500 shrink-0 hidden sm:inline">{meta}</span>
    </div>
  );

  const EmptyState = ({ children }: { children: React.ReactNode }) => (
    <div className="px-5 py-10 text-center text-sm text-ink-500">{children}</div>
  );

  const rowClass =
    'w-full text-left px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-ink-50 group';

  const Avatar = ({ name }: { name: string }) => (
    <span className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
      {name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)}
    </span>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Page header */}
      <header className="page-header">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-500 first-letter:uppercase">{today}</p>
          <h1 className="mt-1 text-h1 text-ink-900">
            {greeting}, Dr {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Service de psychiatrie universitaire · {currentUser.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToFilteredRegistre?.({ status: 'TOUS_ACTIFS' })}
            className="btn-secondary"
          >
            <Users className="w-4 h-4 text-ink-500" />
            Registre
          </button>
          <button type="button" onClick={onOpenNewPatient} className="btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Admettre un patient
          </button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="clinical-card grid grid-cols-2 xl:grid-cols-4 overflow-hidden">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              type="button"
              onClick={k.onClick}
              className={`text-left p-5 hover:bg-ink-50 transition-colors cursor-pointer group border-ink-150 ${
                i % 2 === 1 ? 'border-l' : ''
              } ${i >= 2 ? 'border-t xl:border-t-0' : ''} ${i === 2 ? 'xl:border-l' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-ink-500">
                  <Icon className="w-4 h-4 text-ink-400" />
                  {k.label}
                </span>
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-ink-700 transition-colors" />
              </div>
              <div className="mt-3 text-[28px] font-bold text-ink-900 tabular-nums tracking-tight leading-none">
                {k.value}
              </div>
              <div className="mt-3 h-[18px] flex items-center">
                {k.progress !== undefined ? (
                  <div className="progress w-full">
                    <span style={{ width: `${k.progress}%` }} />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-ink-500 truncate">{k.hint}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soins sans consentement */}
        <section className="clinical-card overflow-hidden">
          <SectionHeader
            icon={ShieldAlert}
            tile="tile-rose"
            title="Soins sans consentement"
            count={sscList.length}
            meta="Mali / UEMOA"
          />

          {sscList.length > 0 ? (
            <div className="divide-y divide-ink-100">
              {sscList.map((item) => (
                <button key={item.dossierId} type="button" onClick={() => onSelectDossier(item.dossierId, 's2')} className={rowClass}>
                  <Avatar name={item.nom} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <strong className="text-sm font-semibold text-ink-900 truncate">{item.nom}</strong>
                      <span className="hidden sm:inline text-xs font-medium text-ink-400 tabular-nums shrink-0">{item.numeroOrdre}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 line-clamp-1">
                      <span className="text-rose-700 font-medium">{item.type}</span> · {item.demandeur}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-700 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState>Aucun patient sous régime de soins sans consentement actuellement.</EmptyState>
          )}
        </section>

        {/* Bilans en attente */}
        <section className="clinical-card overflow-hidden">
          <SectionHeader
            icon={FileSpreadsheet}
            tile="tile-amber"
            title="Bilans en attente"
            count={bilansEnAttente.length}
            meta="Biologie & imagerie"
          />

          {bilansEnAttente.length > 0 ? (
            <div className="divide-y divide-ink-100">
              {bilansEnAttente.map((bilan) => (
                <button key={bilan.id} type="button" onClick={() => onSelectDossier(bilan.dossierId, 's13')} className={rowClass}>
                  <Avatar name={bilan.patientNom} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <strong className="text-sm font-semibold text-ink-900 truncate">{bilan.patientNom}</strong>
                      <span className="hidden sm:inline text-xs font-medium text-ink-400 tabular-nums shrink-0">{bilan.numeroOrdre}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 truncate">
                      <span className="text-ink-700 font-medium">{bilan.type}</span> · Prescrit le {bilan.datePrescription}
                    </div>
                  </div>
                  <span className="chip bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 shrink-0">
                    <span className="dot" />
                    {bilan.statut}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState>Tous les bilans paracliniques prescrits ont reçu leurs résultats.</EmptyState>
          )}
        </section>
      </div>

      {/* Diagnostics */}
      <section className="clinical-card overflow-hidden">
        <SectionHeader
          icon={Activity}
          tile="tile-ink"
          title="Diagnostics prédominants"
          meta="CIM-10 / DSM-5 · dossiers actifs"
        />

        {sortedDiags.length > 0 ? (
          <div className="divide-y divide-ink-100">
            {sortedDiags.map(([diag, count]) => {
              const percentage = Math.round((count / (activeDossiers.length || 1)) * 100);
              const code = diag.startsWith('[') ? diag.slice(1, diag.indexOf(']')) : null;
              const label = code ? diag.slice(diag.indexOf(']') + 2) : diag;
              return (
                <button
                  key={diag}
                  type="button"
                  onClick={() => onNavigateToFilteredRegistre?.({ search: label })}
                  className="w-full text-left px-5 py-3 grid grid-cols-[4.5rem_1fr_auto] sm:grid-cols-[4.5rem_1fr_10rem_3rem] items-center gap-4 hover:bg-ink-50 cursor-pointer transition-colors"
                  title={`Filtrer les dossiers avec le diagnostic : ${diag}`}
                >
                  <span className="chip bg-ink-100 text-ink-700 tabular-nums justify-self-start">{code || '—'}</span>
                  <span className="text-sm font-medium text-ink-900 truncate">{label}</span>
                  <span className="progress hidden sm:block">
                    <span style={{ width: `${percentage}%` }} />
                  </span>
                  <span className="text-sm font-semibold text-ink-900 tabular-nums text-right">
                    {count} <span className="text-xs font-medium text-ink-500">cas</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState>Aucun diagnostic n'a encore été formalisé sur les dossiers en cours.</EmptyState>
        )}
      </section>
    </div>
  );
};
