import React from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { calculateDossierStats } from '../utils/rules';
import {
  Activity,
  Users,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  TrendingUp,
  Plus,
  HeartPulse,
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
      card: 'from-brand-50 to-white',
      onClick: () => onNavigateToFilteredRegistre?.({ status: 'TOUS_ACTIFS' }),
    },
    {
      label: 'Sans consentement',
      value: sansConsentement.length,
      hint: 'Régime médico-légal spécial',
      icon: ShieldAlert,
      tile: 'tile-rose',
      card: 'from-rose-50 to-white',
      onClick: () => onNavigateToFilteredRegistre?.({ modalite: 'Soins sans consentement' }),
    },
    {
      label: 'Hospitalisations',
      value: hospitalises.length,
      hint: `${ambulatoires.length} en ambulatoire`,
      icon: Building2,
      tile: 'tile-violet',
      card: 'from-violet-50 to-white',
      onClick: () => onNavigateToFilteredRegistre?.({ orientation: 'Hospitalisation' }),
    },
    {
      label: 'Complétude moyenne',
      value: `${avgCompleteness}%`,
      hint: 'Sur 17 rubriques',
      icon: CheckCircle2,
      tile: 'tile-amber',
      card: 'from-amber-50 to-white',
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
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`icon-tile ${tile} !w-9 !h-9`}>
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <h2 className="text-[15px] font-bold text-ink-900 truncate">
          {title}
          {count !== undefined && (
            <span className="ml-2 align-middle chip bg-ink-100 text-ink-600 tabular-nums">{count}</span>
          )}
        </h2>
      </div>
      <span className="text-xs font-semibold text-ink-400 shrink-0 hidden sm:inline">{meta}</span>
    </div>
  );

  const EmptyState = ({ children }: { children: React.ReactNode }) => (
    <div className="p-8 text-center text-body-sm text-ink-500 bg-ink-25 rounded-2xl border border-dashed border-ink-200">
      {children}
    </div>
  );

  const rowClass =
    'w-full text-left p-3.5 bg-white border border-ink-150 hover:border-brand-300 hover:bg-brand-50/40 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-colors group';

  const Avatar = ({ name, tone }: { name: string; tone: string }) => (
    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${tone}`}>
      {name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)}
    </span>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Hero */}
      <section className="hero-brand p-6 sm:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-white/75 first-letter:uppercase">{today}</p>
            <h1 className="mt-1 text-2xl sm:text-[32px] font-extrabold tracking-tight leading-tight">
              {greeting}, Dr {firstName}
            </h1>
            <p className="mt-1.5 text-sm text-white/80 font-medium max-w-xl">
              Service de psychiatrie universitaire · {currentUser.title}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="chip bg-white/15 text-white backdrop-blur-sm !py-1.5 !px-3">
                <HeartPulse className="w-3.5 h-3.5" /> {activeDossiers.length} patients suivis
              </span>
              <span className="chip bg-white/15 text-white backdrop-blur-sm !py-1.5 !px-3">
                <TrendingUp className="w-3.5 h-3.5" /> {avgCompleteness}% complétude
              </span>
              {bilansEnAttente.length > 0 && (
                <span className="chip bg-white text-brand-800 !py-1.5 !px-3">
                  <Clock className="w-3.5 h-3.5" /> {bilansEnAttente.length} bilan{bilansEnAttente.length > 1 ? 's' : ''} en attente
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewPatient}
            className="self-start lg:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-800 text-sm font-extrabold shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)] hover:bg-brand-50 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Admettre un patient
          </button>
        </div>
      </section>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              type="button"
              onClick={k.onClick}
              className={`text-left bg-gradient-to-b ${k.card} border border-ink-150 rounded-[20px] p-4 sm:p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:border-ink-200 transition-shadow cursor-pointer group`}
            >
              <div className="flex items-start justify-between">
                <span className={`icon-tile ${k.tile}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-ink-700 transition-colors" />
              </div>
              <div className="mt-4 text-[13px] font-semibold text-ink-500">{k.label}</div>
              <div className="mt-0.5 text-[28px] sm:text-[32px] font-extrabold text-ink-900 tabular-nums tracking-tight leading-none">
                {k.value}
              </div>
              <div className="mt-2.5 h-[18px] flex items-center">
                {k.progress !== undefined ? (
                  <div className="w-full h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${k.progress}%` }} />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-ink-500 truncate">{k.hint}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Soins sans consentement */}
        <section className="clinical-card p-5 sm:p-6 space-y-4">
          <SectionHeader
            icon={ShieldAlert}
            tile="tile-rose"
            title="Vigilance soins sans consentement"
            count={sscList.length}
            meta="Mali / UEMOA"
          />

          {sscList.length > 0 ? (
            <div className="space-y-2.5">
              {sscList.map((item) => (
                <button key={item.dossierId} type="button" onClick={() => onSelectDossier(item.dossierId, 's2')} className={rowClass}>
                  <Avatar name={item.nom} tone="bg-rose-100 text-rose-700" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <strong className="text-sm font-bold text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                        {item.nom}
                      </strong>
                      <span className="hidden sm:inline text-[11px] font-bold text-ink-400 tabular-nums shrink-0">{item.numeroOrdre}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 font-medium line-clamp-2">
                      <span className="text-rose-700 font-semibold">{item.type}</span> · {item.demandeur}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-brand-600 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState>Aucun patient sous régime de soins sans consentement actuellement.</EmptyState>
          )}
        </section>

        {/* Bilans en attente */}
        <section className="clinical-card p-5 sm:p-6 space-y-4">
          <SectionHeader
            icon={FileSpreadsheet}
            tile="tile-amber"
            title="Bilans paracliniques en attente"
            count={bilansEnAttente.length}
            meta="Biologie & imagerie"
          />

          {bilansEnAttente.length > 0 ? (
            <div className="space-y-2.5">
              {bilansEnAttente.map((bilan) => (
                <button key={bilan.id} type="button" onClick={() => onSelectDossier(bilan.dossierId, 's13')} className={rowClass}>
                  <Avatar name={bilan.patientNom} tone="bg-amber-100 text-amber-800" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <strong className="text-sm font-bold text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                        {bilan.patientNom}
                      </strong>
                      <span className="hidden sm:inline text-[11px] font-bold text-ink-400 tabular-nums shrink-0">{bilan.numeroOrdre}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 font-medium truncate">
                      <span className="text-ink-800 font-semibold">{bilan.type}</span> · Prescrit le {bilan.datePrescription}
                    </div>
                  </div>
                  <span className="chip bg-amber-100 text-amber-800 shrink-0">{bilan.statut}</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState>Tous les bilans paracliniques prescrits ont reçu leurs résultats.</EmptyState>
          )}
        </section>
      </div>

      {/* Diagnostics */}
      <section className="clinical-card p-5 sm:p-6 space-y-4">
        <SectionHeader
          icon={Activity}
          tile="tile-brand"
          title="Diagnostics prédominants"
          meta="CIM-10 / DSM-5 · dossiers actifs"
        />

        {sortedDiags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedDiags.map(([diag, count]) => {
              const percentage = Math.round((count / (activeDossiers.length || 1)) * 100);
              const code = diag.startsWith('[') ? diag.slice(1, diag.indexOf(']')) : null;
              const label = code ? diag.slice(diag.indexOf(']') + 2) : diag;
              return (
                <button
                  key={diag}
                  type="button"
                  onClick={() => onNavigateToFilteredRegistre?.({ search: label })}
                  className="text-left p-4 bg-ink-25 border border-ink-150 hover:border-brand-300 hover:bg-brand-50/50 rounded-2xl cursor-pointer transition-colors group"
                  title={`Filtrer les dossiers avec le diagnostic : ${diag}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {code && <span className="chip bg-brand-100 text-brand-800 tabular-nums">{code}</span>}
                      <p className="mt-2 text-sm font-bold text-ink-900 line-clamp-2 group-hover:text-brand-800">{label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-ink-900 tabular-nums leading-none">{count}</div>
                      <div className="text-[11px] font-semibold text-ink-400 mt-1">cas</div>
                    </div>
                  </div>
                  <div className="w-full bg-ink-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-gradient-to-r from-brand-400 to-brand-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
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
