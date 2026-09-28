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

        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const num = d.s1Identification.numeroOrdre.toLowerCase();
          const nom = d.s1Identification.nom.toLowerCase();
          const prenoms = d.s1Identification.prenoms.toLowerCase();
          const prof = (d.s1Identification.profession || '').toLowerCase();
          const diag = (d.s12HypothesesDiag.hypotheses || []).map((h) => h.libelle.toLowerCase()).join(' ');

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
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Title & Key Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#18243A] tracking-tight">
            Registre des Patients en Psychiatrie
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Dossiers standardisés en 17 rubriques · <strong className="text-[#18243A]">{activeCount}</strong> actifs · <strong className="text-[#18243A]">{archivedCount}</strong> archivés
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#18243A] shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#18243A]'
              }`}
              title="Vue Tableur Clinique"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#18243A] shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#18243A]'
              }`}
              title="Vue Cartes Patients"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewPatient}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] active:scale-98 rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-[#10B9A9]/20 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Dossier</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom, N° d'ordre (PSY-2026-0001), diagnostic CIM-10..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#10B9A9] focus:bg-white text-xs font-medium rounded-xl pl-9.5 pr-4 py-2.5 text-[#18243A] focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#18243A]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Status Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl overflow-x-auto text-xs font-medium border border-[#E2E8F0]">
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
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-white text-[#18243A] font-bold shadow-xs'
                    : 'text-[#64748B] hover:text-[#18243A]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deep Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EDF2F7] text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Filtres :</span>
          </div>

          {/* Tranche d'âge */}
          <select
            value={trancheAgeFilter}
            onChange={(e) => setTrancheAgeFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#18243A] focus:outline-none"
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
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#18243A] focus:outline-none"
          >
            <option value="TOUS">Sexe : Tous</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
          </select>

          {/* Modalité */}
          <select
            value={modaliteFilter}
            onChange={(e) => setModaliteFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#18243A] focus:outline-none"
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
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#18243A] focus:outline-none"
          >
            <option value="TOUTES">Orientation : Toutes</option>
            <option value="Ambulatoire">Ambulatoire</option>
            <option value="Hospitalisation">Hospitalisation</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#BE123C] hover:bg-[#FFE4E6] rounded-lg transition-colors font-medium ml-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}

          {/* Sort dropdown */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#18243A] focus:outline-none"
            >
              <option value="dateModif">Dernière mise à jour</option>
              <option value="dateCreation">Date d'admission</option>
              <option value="nom">Nom alphabétique</option>
              <option value="completude">Taux de complétude</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1.5 text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F9] rounded-lg cursor-pointer"
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
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">N° d'Ordre</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Âge / Sexe</th>
                    <th className="py-3 px-4">Modalité & Orientation</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Complétude</th>
                    <th className="py-3 px-4">Dernière MaJ</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7] text-xs">
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
                        className="hover:bg-[#F0FDFA]/50 cursor-pointer transition-colors group"
                      >
                        {/* Numéro d'ordre */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#18243A]">
                          <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#CBD5E1]">
                            {dossier.s1Identification.numeroOrdre}
                          </span>
                        </td>

                        {/* Nom & Prénoms */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#18243A] group-hover:text-[#07988D] transition-colors">
                            {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                          </div>
                          <div className="text-[11px] text-[#475569] truncate max-w-xs mt-0.5">
                            {diagPrincipal ? (
                              <span className="text-[#07988D] font-medium">
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
                        </td>

                        {/* Âge / Sexe */}
                        <td className="py-3.5 px-4 text-[#18243A]">
                          <div className="tabular-nums font-semibold">{dossier.s1Identification.age} ans</div>
                          <div className="text-[11px] text-[#64748B]">{dossier.s1Identification.sexe}</div>
                        </td>

                        {/* Modalité & Orientation */}
                        <td className="py-3.5 px-4">
                          <div className="text-[#18243A] font-medium">
                            {dossier.s2Modalites.modalite}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {dossier.s14PriseEnCharge.orientation
                              ? `Orientation : ${dossier.s14PriseEnCharge.orientation}`
                              : 'Orientation non définie'}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-4">
                          {dossier.statut === 'VALIDÉ' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D]">
                              <CheckCircle2 className="w-3 h-3" />
                              Validé
                            </span>
                          )}
                          {dossier.statut === 'EN_COURS' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#B45309]">
                              <Clock className="w-3 h-3" />
                              En cours
                            </span>
                          )}
                          {dossier.statut === 'BROUILLON' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">
                              Brouillon
                            </span>
                          )}
                          {dossier.statut === 'ARCHIVÉ' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE4E6] text-[#BE123C]">
                              <Archive className="w-3 h-3" />
                              Archivé
                            </span>
                          )}
                        </td>

                        {/* Complétude */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  stats.percentage === 100
                                    ? 'bg-[#10B981]'
                                    : stats.percentage >= 60
                                    ? 'bg-[#10B9A9]'
                                    : 'bg-[#F59E0B]'
                                }`}
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold text-[#18243A] tabular-nums">
                              {stats.percentage}%
                            </span>
                          </div>
                          <div className="text-[10px] text-[#64748B] mt-0.5">
                            {stats.completeCount} complètes · {stats.partialCount} part.
                          </div>
                        </td>

                        {/* Dernière mise à jour */}
                        <td className="py-3.5 px-4 text-[#64748B] text-[11px] tabular-nums">
                          <div className="font-medium text-[#18243A]">
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
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDossier(dossier.id);
                            }}
                            className="inline-flex items-center text-xs font-semibold text-[#07988D] hover:text-[#067A71] bg-[#ECFBF9] hover:bg-[#D9F7F3] border border-[#10B9A9]/20 px-3 py-1 rounded-lg transition-all cursor-pointer group-hover:border-[#10B9A9]"
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
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span>Afficher</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#18243A] focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>
                  dossiers sur <strong className="text-[#18243A]">{totalItems}</strong> au total
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="tabular-nums font-medium">
                  Page <strong className="text-[#18243A]">{currentPage}</strong> sur{' '}
                  <strong className="text-[#18243A]">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#18243A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F5F9] cursor-pointer"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#18243A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F5F9] cursor-pointer"
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
                    className="clinical-card p-5 hover:border-[#10B9A9] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row: Avatar + Order + Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#18243A] text-white flex items-center justify-center font-bold text-xs tracking-wider">
                            {initials}
                          </div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] text-[#18243A]">
                            {dossier.s1Identification.numeroOrdre}
                          </span>
                        </div>

                        {dossier.statut === 'VALIDÉ' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                            <CheckCircle2 className="w-3 h-3" /> Validé
                          </span>
                        )}
                        {dossier.statut === 'EN_COURS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">
                            <Clock className="w-3 h-3" /> En cours
                          </span>
                        )}
                        {dossier.statut === 'BROUILLON' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#64748B]">
                            Brouillon
                          </span>
                        )}
                        {dossier.statut === 'ARCHIVÉ' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE4E6] text-[#BE123C]">
                            <Archive className="w-3 h-3" /> Archivé
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-bold text-[#18243A] group-hover:text-[#07988D] transition-colors leading-tight">
                        {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                      </h3>

                      {/* Diagnostic highlight */}
                      <div className="mt-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                          Diagnostic principal
                        </span>
                        <span className="text-xs font-semibold text-[#07988D] truncate block mt-0.5">
                          {diagPrincipal ? diagPrincipal.libelle : 'Évaluation en cours'}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-2.5">
                        <span className="font-semibold text-[#18243A]">{dossier.s1Identification.age} ans</span>
                        <span>·</span>
                        <span>{dossier.s1Identification.sexe}</span>
                        <span>·</span>
                        <span className="truncate">{dossier.s2Modalites.modalite}</span>
                      </div>
                    </div>

                    {/* Bottom: Completeness & button */}
                    <div className="mt-4 pt-3 border-t border-[#EDF2F7] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              stats.percentage === 100
                                ? 'bg-[#10B981]'
                                : stats.percentage >= 60
                                ? 'bg-[#10B9A9]'
                                : 'bg-[#F59E0B]'
                            }`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#18243A]">
                          {stats.percentage}%
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#07988D] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Consulter <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cards Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#64748B]">
              <span>
                Affichage de {paginatedDossiers.length} dossiers sur {totalItems}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#18243A] disabled:opacity-40"
                >
                  Précédent
                </button>
                <span className="font-semibold text-[#18243A]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#18243A] disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFBF9] text-[#10B9A9] flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#18243A]">
            Aucun dossier patient ne correspond à vos critères
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Ajustez votre recherche ou vos filtres, ou créez directement une nouvelle admission pour enregistrer un patient.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              onClick={onOpenNewPatient}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm shadow-[#10B9A9]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
