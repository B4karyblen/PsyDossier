import React, { useState, useMemo } from 'react';
import { DossierPsychiatrique, DossierStatus, UserRole } from '../types';
import { calculateDossierStats } from '../utils/rules';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Archive,
  Clock,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  User,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

interface PatientListProps {
  dossiers: DossierPsychiatrique[];
  onSelectDossier: (dossierId: string, targetRubriqueId?: string) => void;
  onOpenNewPatient: () => void;
  currentUserRole: UserRole;
  initialFilters?: {
    status?: string;
    modalite?: string;
    orientation?: string;
    search?: string;
    sortBy?: 'dateModif' | 'dateCreation' | 'nom' | 'completude';
  } | null;
  onClearInitialFilters?: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  dossiers,
  onSelectDossier,
  onOpenNewPatient,
  currentUserRole,
  initialFilters,
  onClearInitialFilters,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || 'TOUS_ACTIFS');
  const [sexeFilter, setSexeFilter] = useState<string>('TOUS');
  const [modaliteFilter, setModaliteFilter] = useState<string>(initialFilters?.modalite || 'TOUTES');
  const [orientationFilter, setOrientationFilter] = useState<string>(initialFilters?.orientation || 'TOUTES');
  const [trancheAgeFilter, setTrancheAgeFilter] = useState<string>('TOUTES');
  const [sortBy, setSortBy] = useState<'dateModif' | 'dateCreation' | 'nom' | 'completude'>(
    initialFilters?.sortBy || 'dateModif'
  );
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Sync when initialFilters changes
  React.useEffect(() => {
    if (initialFilters) {
      if (initialFilters.status !== undefined) setStatusFilter(initialFilters.status);
      if (initialFilters.modalite !== undefined) setModaliteFilter(initialFilters.modalite);
      if (initialFilters.orientation !== undefined) setOrientationFilter(initialFilters.orientation);
      if (initialFilters.search !== undefined) setSearchTerm(initialFilters.search);
      if (initialFilters.sortBy !== undefined) setSortBy(initialFilters.sortBy);
      setCurrentPage(1);
    }
  }, [initialFilters]);

  // Pagination state (B4)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('TOUS_ACTIFS');
    setSexeFilter('TOUS');
    setModaliteFilter('TOUTES');
    setOrientationFilter('TOUTES');
    setTrancheAgeFilter('TOUTES');
    setSortBy('dateModif');
    setSortAsc(false);
    setCurrentPage(1);
    onClearInitialFilters?.();
  };

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== 'TOUS_ACTIFS' ||
    sexeFilter !== 'TOUS' ||
    modaliteFilter !== 'TOUTES' ||
    orientationFilter !== 'TOUTES' ||
    trancheAgeFilter !== 'TOUTES';

  // Filtered & sorted dossiers
  const filteredDossiers = useMemo(() => {
    return dossiers
      .filter((d) => {
        // Status filter
        if (statusFilter === 'TOUS_ACTIFS' && d.statut === 'ARCHIVÉ') return false;
        if (statusFilter !== 'TOUS_ACTIFS' && statusFilter !== 'TOUS' && d.statut !== statusFilter)
          return false;

        // Sexe filter
        if (sexeFilter !== 'TOUS' && d.s1Identification.sexe !== sexeFilter) return false;

        // Modalité filter
        if (modaliteFilter !== 'TOUTES' && d.s2Modalites.modalite !== modaliteFilter) return false;

        // Orientation filter
        if (orientationFilter !== 'TOUTES' && d.s14PriseEnCharge.orientation !== orientationFilter)
          return false;

        // Tranche d'âge filter (B4)
        const age = d.s1Identification.age;
        if (trancheAgeFilter === 'MINEUR' && age >= 18) return false;
        if (trancheAgeFilter === '18_30' && (age < 18 || age > 30)) return false;
        if (trancheAgeFilter === '31_50' && (age < 31 || age > 50)) return false;
        if (trancheAgeFilter === 'SENIOR' && age <= 50) return false;

        // Search term (accent-insensitive per PRD F-03)
        if (searchTerm.trim()) {
          const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const query = normalize(searchTerm.trim());
          const num = normalize(d.s1Identification.numeroOrdre);
          const nom = normalize(d.s1Identification.nom);
          const prenoms = normalize(d.s1Identification.prenoms);
          const prof = normalize(d.s1Identification.profession || '');
          const diag = (d.s12HypothesesDiag.hypotheses || []).map((h) => normalize(h.libelle)).join(' ');

          if (
            !num.includes(query) &&
            !nom.includes(query) &&
            !prenoms.includes(query) &&
            !prof.includes(query) &&
            !diag.includes(query)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nom') {
          const comp = a.s1Identification.nom.localeCompare(b.s1Identification.nom);
          return sortAsc ? comp : -comp;
        }
        if (sortBy === 'completude') {
          const statA = calculateDossierStats(a).percentage;
          const statB = calculateDossierStats(b).percentage;
          return sortAsc ? statA - statB : statB - statA;
        }
        if (sortBy === 'dateCreation') {
          const dateA = new Date(a.dateCreation).getTime();
          const dateB = new Date(b.dateCreation).getTime();
          return sortAsc ? dateA - dateB : dateB - dateA;
        }
        // dateModif
        const dateA = new Date(a.dateDerniereModification).getTime();
        const dateB = new Date(b.dateDerniereModification).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      });
  }, [
    dossiers,
    searchTerm,
    statusFilter,
    sexeFilter,
    modaliteFilter,
    orientationFilter,
    trancheAgeFilter,
    sortBy,
    sortAsc,
  ]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    sexeFilter,
    modaliteFilter,
    orientationFilter,
    trancheAgeFilter,
    sortBy,
    sortAsc,
  ]);

  // Pagination calculation
  const totalItems = filteredDossiers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedDossiers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDossiers.slice(startIndex, startIndex + pageSize);
  }, [filteredDossiers, currentPage, pageSize]);

  const activeCount = dossiers.filter((d) => d.statut !== 'ARCHIVÉ').length;
  const archivedCount = dossiers.filter((d) => d.statut === 'ARCHIVÉ').length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">
      {/* Title & Key Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-900 tracking-tight">
            Registre des patients
          </h2>
          <p className="text-sm text-ink-500 mt-1 font-medium">
            Dossiers standardisés en 17 rubriques · <strong className="text-ink-900">{activeCount}</strong> actifs · <strong className="text-ink-900">{archivedCount}</strong> archivés
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="segmented">
            <button
              onClick={() => setViewMode('table')}
              aria-label="Vue tableau"
              aria-pressed={viewMode === 'table'}
              className={`w-10 h-10 !min-h-0 !min-w-0 flex items-center justify-center rounded-[10px] transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-ink-900 shadow-xs font-bold'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Vue Tableur Clinique"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              aria-label="Vue cartes"
              aria-pressed={viewMode === 'cards'}
              className={`w-10 h-10 !min-h-0 !min-w-0 flex items-center justify-center rounded-[10px] transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-ink-900 shadow-xs font-bold'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Vue Cartes Patients"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewPatient}
            className="btn-primary whitespace-nowrap"
          >
            <Plus className="w-4 h-4" strokeWidth={2.75} />
            <span>Nouveau dossier</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="clinical-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom, N° d'ordre (PSY-2026-0001), diagnostic CIM-10..."
              aria-label="Rechercher un patient"
              className="clinical-input w-full !pl-10 !pr-10 !py-2.5 !bg-ink-25 focus:!bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Effacer la recherche"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-ink-400 hover:text-ink-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Status Segmented Tabs */}
          <div className="segmented overflow-x-auto text-[13px] font-semibold">
            {[
              { id: 'TOUS_ACTIFS', label: 'Actifs' },
              { id: 'EN_COURS', label: 'En cours' },
              { id: 'VALIDÉ', label: 'Validés' },
              { id: 'BROUILLON', label: 'Brouillons' },
              { id: 'ARCHIVÉ', label: 'Archivés' },
              { id: 'TOUS', label: 'Tous' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3.5 !min-h-9 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-white text-ink-900 font-bold shadow-[var(--shadow-soft)]'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deep Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
          <div className="flex items-center gap-1.5 text-ink-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-bold text-xs">Filtres</span>
          </div>

          {/* Tranche d'âge */}
          <select
            value={trancheAgeFilter}
            onChange={(e) => setTrancheAgeFilter(e.target.value)}
            className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-800 hover:border-ink-300 focus:outline-none focus:border-brand-500 cursor-pointer transition-colors"
          >
            <option value="TOUTES">Âges : Tous</option>
            <option value="MINEUR">&lt; 18 ans (Mineur)</option>
            <option value="18_30">18 – 30 ans</option>
            <option value="31_50">31 – 50 ans</option>
            <option value="SENIOR">&gt; 50 ans</option>
          </select>

          {/* Sexe */}
          <select
            value={sexeFilter}
            onChange={(e) => setSexeFilter(e.target.value)}
            className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-800 hover:border-ink-300 focus:outline-none focus:border-brand-500 cursor-pointer transition-colors"
          >
            <option value="TOUS">Sexe : Tous</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
          </select>

          {/* Modalité */}
          <select
            value={modaliteFilter}
            onChange={(e) => setModaliteFilter(e.target.value)}
            className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-800 hover:border-ink-300 focus:outline-none focus:border-brand-500 cursor-pointer transition-colors"
          >
            <option value="TOUTES">Modalité : Toutes</option>
            <option value="Libre">Soins libres</option>
            <option value="Adressé par un tiers">Adressé par un tiers</option>
            <option value="Soins sans consentement">Soins sans consentement</option>
          </select>

          {/* Orientation */}
          <select
            value={orientationFilter}
            onChange={(e) => setOrientationFilter(e.target.value)}
            className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-800 hover:border-ink-300 focus:outline-none focus:border-brand-500 cursor-pointer transition-colors"
          >
            <option value="TOUTES">Orientation : Toutes</option>
            <option value="Ambulatoire">Ambulatoire</option>
            <option value="Hospitalisation">Hospitalisation</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-medium ml-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}

          {/* Sort dropdown */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-ink-500 font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-800 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="dateModif">Dernière mise à jour</option>
              <option value="dateCreation">Date d'admission</option>
              <option value="nom">Nom alphabétique</option>
              <option value="completude">Taux de complétude</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1.5 text-ink-500 hover:text-ink-900 hover:bg-ink-100 rounded-lg cursor-pointer"
              title={sortAsc ? 'Ordre croissant' : 'Ordre décroissant'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards Deck */}
      {paginatedDossiers.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="clinical-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink-25 border-b border-ink-150 text-xs font-bold text-ink-500">
                    <th className="py-3.5 px-4">N° d'Ordre</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Âge / Sexe</th>
                    <th className="py-3.5 px-4">Modalité & Orientation</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4">Complétude</th>
                    <th className="py-3.5 px-4">Dernière MaJ</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 text-body-sm">
                  {paginatedDossiers.map((dossier) => {
                    const stats = calculateDossierStats(dossier);
                    const diagPrincipal = dossier.s12HypothesesDiag.hypotheses?.find(
                      (h) => h.type === 'Principale'
                    );
                    const updatedDate = new Date(dossier.dateDerniereModification);

                    return (
                      <tr
                        key={dossier.id}
                        onClick={() => onSelectDossier(dossier.id)}
                        className="hover:bg-brand-50/50 cursor-pointer transition-colors group"
                      >
                        {/* Numéro d'ordre */}
                        <td className="py-4 px-4 text-[13px] font-bold tabular-nums text-ink-500 whitespace-nowrap">
                          {dossier.s1Identification.numeroOrdre}
                        </td>

                        {/* Nom & Prénoms */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-extrabold shrink-0">
                            {`${dossier.s1Identification.nom?.[0] || ''}${dossier.s1Identification.prenoms?.[0] || ''}`.toUpperCase()}
                          </span>
                          <div className="min-w-0">
                          <div className="font-bold text-ink-900 group-hover:text-brand-700 transition-colors">
                            {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                          </div>
                          <div className="text-caption text-ink-600 truncate max-w-xs mt-0.5">
                            {diagPrincipal ? (
                              <span className="text-brand-700 font-medium">
                                {diagPrincipal.codeCimDsm ? `[${diagPrincipal.codeCimDsm}] ` : ''}
                                {diagPrincipal.libelle}
                              </span>
                            ) : (
                              <span>
                                {dossier.s1Identification.profession ||
                                  'Diagnostic en cours d’évaluation'}
                              </span>
                            )}
                          </div>
                          </div>
                          </div>
                        </td>

                        {/* Âge / Sexe */}
                        <td className="py-4 px-4 text-ink-900">
                          <div className="tabular-nums font-semibold">{dossier.s1Identification.age} ans</div>
                          <div className="text-caption text-ink-500">{dossier.s1Identification.sexe}</div>
                        </td>

                        {/* Modalité & Orientation */}
                        <td className="py-4 px-4">
                          <div className="text-ink-900 font-medium">
                            {dossier.s2Modalites.modalite}
                          </div>
                          <div className="text-caption text-ink-500">
                            {dossier.s14PriseEnCharge.orientation
                              ? `Orientation : ${dossier.s14PriseEnCharge.orientation}`
                              : 'Orientation non définie'}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-4 px-4">
                          {dossier.statut === 'VALIDÉ' && (
                            <span className="chip bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Validé
                            </span>
                          )}
                          {dossier.statut === 'EN_COURS' && (
                            <span className="chip bg-amber-100 text-amber-700">
                              <Clock className="w-3 h-3" />
                              En cours
                            </span>
                          )}
                          {dossier.statut === 'BROUILLON' && (
                            <span className="chip bg-ink-100 text-ink-500">
                              Brouillon
                            </span>
                          )}
                          {dossier.statut === 'ARCHIVÉ' && (
                            <span className="chip bg-rose-100 text-rose-700">
                              <Archive className="w-3 h-3" />
                              Archivé
                            </span>
                          )}
                        </td>

                        {/* Complétude */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-ink-150 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  stats.percentage === 100
                                    ? 'bg-emerald-500'
                                    : stats.percentage >= 60
                                    ? 'bg-brand-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>
                            <span className="text-mono font-bold text-ink-900 tabular-nums">
                              {stats.percentage}%
                            </span>
                          </div>
                          <div className="text-caption text-ink-500 mt-0.5">
                            {stats.completeCount} complètes · {stats.partialCount} part.
                          </div>
                        </td>

                        {/* Dernière mise à jour */}
                        <td className="py-4 px-4 text-ink-500 text-caption tabular-nums">
                          <div className="font-medium text-ink-900">
                            {updatedDate.toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div>
                            {updatedDate.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDossier(dossier.id);
                            }}
                            className="inline-flex items-center text-[13px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 rounded-xl transition-colors cursor-pointer"
                          >
                            Ouvrir <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 bg-ink-25 border-t border-ink-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
              <div className="flex items-center gap-2">
                <span>Afficher</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-ink-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-ink-900 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>
                  dossiers sur <strong className="text-ink-900">{totalItems}</strong> au total
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="tabular-nums font-medium">
                  Page <strong className="text-ink-900">{currentPage}</strong> sur{' '}
                  <strong className="text-ink-900">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-ink-200 bg-white text-ink-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-100 cursor-pointer"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-ink-200 bg-white text-ink-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-100 cursor-pointer"
                    title="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDossiers.map((dossier) => {
                const stats = calculateDossierStats(dossier);
                const diagPrincipal = dossier.s12HypothesesDiag.hypotheses?.find(
                  (h) => h.type === 'Principale'
                );
                const initials = `${dossier.s1Identification.nom?.[0] || 'P'}${
                  dossier.s1Identification.prenoms?.[0] || 'T'
                }`.toUpperCase();

                return (
                  <div
                    key={dossier.id}
                    onClick={() => onSelectDossier(dossier.id)}
                    className="clinical-card p-5 hover:border-brand-300 transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row: Avatar + Order + Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-extrabold text-xs">
                            {initials}
                          </div>
                          <span className="text-xs font-bold tabular-nums text-ink-500">
                            {dossier.s1Identification.numeroOrdre}
                          </span>
                        </div>

                        {dossier.statut === 'VALIDÉ' && (
                          <span className="chip bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Validé
                          </span>
                        )}
                        {dossier.statut === 'EN_COURS' && (
                          <span className="chip bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" /> En cours
                          </span>
                        )}
                        {dossier.statut === 'BROUILLON' && (
                          <span className="chip bg-ink-100 text-ink-500">
                            Brouillon
                          </span>
                        )}
                        {dossier.statut === 'ARCHIVÉ' && (
                          <span className="chip bg-rose-100 text-rose-700">
                            <Archive className="w-3 h-3" /> Archivé
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-bold text-ink-900 group-hover:text-brand-700 transition-colors leading-tight">
                        {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                      </h3>

                      {/* Diagnostic highlight */}
                      <div className="mt-2 p-2.5 bg-ink-25 border border-ink-150 rounded-xl text-xs">
                        <span className="text-[11px] font-bold text-ink-400 block">
                          Diagnostic principal
                        </span>
                        <span className="text-xs font-semibold text-brand-700 truncate block mt-0.5">
                          {diagPrincipal ? diagPrincipal.libelle : 'Évaluation en cours'}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-[11px] text-ink-500 mt-2.5">
                        <span className="font-semibold text-ink-900">{dossier.s1Identification.age} ans</span>
                        <span>·</span>
                        <span>{dossier.s1Identification.sexe}</span>
                        <span>·</span>
                        <span className="truncate">{dossier.s2Modalites.modalite}</span>
                      </div>
                    </div>

                    {/* Bottom: Completeness & button */}
                    <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-ink-150 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              stats.percentage === 100
                                ? 'bg-emerald-500'
                                : stats.percentage >= 60
                                ? 'bg-brand-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-ink-900">
                          {stats.percentage}%
                        </span>
                      </div>

                      <span className="text-xs font-bold text-brand-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Consulter <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cards Pagination */}
            <div className="flex items-center justify-between px-4 py-2 clinical-card text-xs text-ink-500">
              <span>
                Affichage de {paginatedDossiers.length} dossiers sur {totalItems}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-ink-200 bg-white text-ink-900 disabled:opacity-40"
                >
                  Précédent
                </button>
                <span className="font-semibold text-ink-900">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-ink-200 bg-white text-ink-900 disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="clinical-card p-12 text-center space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink-900">
            Aucun dossier patient ne correspond à vos critères
          </h3>
          <p className="text-xs text-ink-500 max-w-sm mx-auto">
            Ajustez votre recherche ou vos filtres, ou créez directement une nouvelle admission pour enregistrer un patient.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-3.5 py-2 text-xs font-semibold text-ink-900 bg-ink-100 hover:bg-ink-150 rounded-xl transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              onClick={onOpenNewPatient}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Nouveau patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
