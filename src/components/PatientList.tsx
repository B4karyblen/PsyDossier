import React, { useState, useMemo } from 'react';
import { DossierPsychiatrique, DossierStatus, UserRole } from '../types';
import { calculateDossierStats } from '../utils/rules';
import { StatusBadge } from './ui/StatusBadge';
import {
  Search,
  Plus,
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

  const selectCls =
    'bg-white border border-ink-200 rounded-lg pl-2.5 pr-7 !min-h-8 py-1 text-sm font-medium text-ink-700 shadow-[var(--shadow-soft)] hover:border-ink-300 focus:outline-none focus:border-primary-500 focus:shadow-[var(--shadow-focus)] cursor-pointer transition-colors';

  const statusCounts: Record<string, number> = {
    TOUS_ACTIFS: activeCount,
    EN_COURS: dossiers.filter((d) => d.statut === 'EN_COURS').length,
    VALIDÉ: dossiers.filter((d) => d.statut === 'VALIDÉ').length,
    BROUILLON: dossiers.filter((d) => d.statut === 'BROUILLON').length,
    ARCHIVÉ: archivedCount,
    TOUS: dossiers.length,
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">
      {/* Page header */}
      <header className="page-header">
        <div>
          <h2 className="text-h1 text-ink-900">Registre des patients</h2>
          <p className="text-sm text-ink-500 mt-1">
            Dossiers standardisés en 17 rubriques · {activeCount} actifs · {archivedCount} archivés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="segmented" role="group" aria-label="Mode d'affichage">
            <button
              onClick={() => setViewMode('table')}
              aria-label="Vue tableau"
              aria-pressed={viewMode === 'table'}
              className={`w-8 h-8 !min-h-0 !min-w-0 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-ink-900 shadow-[var(--shadow-soft)]' : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Vue tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              aria-label="Vue cartes"
              aria-pressed={viewMode === 'cards'}
              className={`w-8 h-8 !min-h-0 !min-w-0 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-ink-900 shadow-[var(--shadow-soft)]' : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Vue cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button onClick={onOpenNewPatient} className="btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Nouveau dossier</span>
          </button>
        </div>
      </header>

      {/* Status tabs */}
      <div role="tablist" aria-label="Filtrer par statut" className="flex items-center gap-5 border-b border-ink-150 overflow-x-auto">
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
            role="tab"
            aria-selected={statusFilter === st.id}
            onClick={() => setStatusFilter(st.id)}
            className="tab !min-h-0 -mb-px whitespace-nowrap"
          >
            {st.label}
            <span className="text-xs font-medium text-ink-400 tabular-nums">{statusCounts[st.id]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom, N° d'ordre, diagnostic…"
            aria-label="Rechercher un patient"
            className="clinical-input w-full !pl-9 !pr-9 !py-1 !min-h-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Effacer la recherche"
              className="absolute right-0 top-1/2 -translate-y-1/2 !min-h-8 flex items-center justify-center text-ink-400 hover:text-ink-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Tranche d'âge" value={trancheAgeFilter} onChange={(e) => setTrancheAgeFilter(e.target.value)} className={selectCls}>
            <option value="TOUTES">Âge : tous</option>
            <option value="MINEUR">&lt; 18 ans (Mineur)</option>
            <option value="18_30">18 – 30 ans</option>
            <option value="31_50">31 – 50 ans</option>
            <option value="SENIOR">&gt; 50 ans</option>
          </select>
          <select aria-label="Sexe" value={sexeFilter} onChange={(e) => setSexeFilter(e.target.value)} className={selectCls}>
            <option value="TOUS">Sexe : tous</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
          </select>
          <select aria-label="Modalité" value={modaliteFilter} onChange={(e) => setModaliteFilter(e.target.value)} className={selectCls}>
            <option value="TOUTES">Modalité : toutes</option>
            <option value="Libre">Soins libres</option>
            <option value="Adressé par un tiers">Adressé par un tiers</option>
            <option value="Soins sans consentement">Soins sans consentement</option>
          </select>
          <select aria-label="Orientation" value={orientationFilter} onChange={(e) => setOrientationFilter(e.target.value)} className={selectCls}>
            <option value="TOUTES">Orientation : toutes</option>
            <option value="Ambulatoire">Ambulatoire</option>
            <option value="Hospitalisation">Hospitalisation</option>
          </select>
          {hasActiveFilters && (
            <button onClick={resetAllFilters} className="btn-ghost btn-sm !min-h-8">
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <label htmlFor="registre-sort" className="sr-only">Trier par</label>
          <select id="registre-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={selectCls}>
            <option value="dateModif">Tri : mise à jour</option>
            <option value="dateCreation">Tri : admission</option>
            <option value="nom">Tri : nom</option>
            <option value="completude">Tri : complétude</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="btn-icon !w-8 !h-8 !min-h-8 !min-w-8"
            title={sortAsc ? 'Ordre croissant' : 'Ordre décroissant'}
            aria-label={sortAsc ? 'Ordre croissant' : 'Ordre décroissant'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Table or Cards Deck */}
      {paginatedDossiers.length > 0 ? (
        viewMode === 'table' ? (
          <div className="clinical-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Âge / Sexe</th>
                    <th>Modalité</th>
                    <th>Statut</th>
                    <th>Complétude</th>
                    <th>Mis à jour</th>
                    <th className="w-10"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDossiers.map((dossier) => {
                    const stats = calculateDossierStats(dossier);
                    const diagPrincipal = dossier.s12HypothesesDiag.hypotheses?.find(
                      (h) => h.type === 'Principale'
                    );
                    const updatedDate = new Date(dossier.dateDerniereModification);

                    return (
                      <tr key={dossier.id} onClick={() => onSelectDossier(dossier.id)} className="cursor-pointer group">
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
                              {`${dossier.s1Identification.nom?.[0] || ''}${dossier.s1Identification.prenoms?.[0] || ''}`.toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-ink-900 whitespace-nowrap">
                                  {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                                </span>
                                <span className="text-xs font-medium tabular-nums text-ink-400 whitespace-nowrap">
                                  {dossier.s1Identification.numeroOrdre}
                                </span>
                              </div>
                              <div className="text-xs text-ink-500 truncate max-w-xs mt-0.5">
                                {diagPrincipal
                                  ? `${diagPrincipal.codeCimDsm ? `${diagPrincipal.codeCimDsm} · ` : ''}${diagPrincipal.libelle}`
                                  : dossier.s1Identification.profession || 'Diagnostic en cours d’évaluation'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="tabular-nums font-medium text-ink-900">{dossier.s1Identification.age} ans</div>
                          <div className="text-xs text-ink-500">{dossier.s1Identification.sexe}</div>
                        </td>
                        <td>
                          <div className="text-ink-900 font-medium whitespace-nowrap">{dossier.s2Modalites.modalite}</div>
                          <div className="text-xs text-ink-500 whitespace-nowrap">
                            {dossier.s14PriseEnCharge.orientation || 'Orientation non définie'}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={dossier.statut} />
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="progress w-20">
                              <span style={{ width: `${stats.percentage}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-ink-900 tabular-nums">{stats.percentage}%</span>
                          </div>
                          <div className="text-xs text-ink-500 mt-0.5 tabular-nums">
                            {stats.completeCount}/17 rubriques
                          </div>
                        </td>
                        <td className="whitespace-nowrap tabular-nums">
                          <div className="font-medium text-ink-900">
                            {updatedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-ink-500">
                            {updatedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDossier(dossier.id);
                            }}
                            aria-label={`Ouvrir le dossier de ${dossier.s1Identification.nom} ${dossier.s1Identification.prenoms}`}
                            className="btn-icon !w-8 !h-8 !min-h-8 !min-w-8 text-ink-400 group-hover:text-ink-900"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-2.5 border-t border-ink-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <label htmlFor="registre-page-size">Lignes par page</label>
                <select
                  id="registre-page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={selectCls}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="tabular-nums">· {totalItems} dossier{totalItems > 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="tabular-nums">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary btn-sm !px-2 !min-w-8 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary btn-sm !px-2 !min-w-8 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                    className="clinical-card p-5 hover:border-ink-300 transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row: Avatar + Order + Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-semibold text-[11px]">
                            {initials}
                          </div>
                          <span className="text-xs font-bold tabular-nums text-ink-500">
                            {dossier.s1Identification.numeroOrdre}
                          </span>
                        </div>

                        <StatusBadge status={dossier.statut} />
                      </div>

                      {/* Name */}
                      <h3 className="text-[15px] font-semibold text-ink-900 leading-tight">
                        {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                      </h3>

                      {/* Diagnostic highlight */}
                      <div className="mt-1.5 text-xs">
                        <span className="sr-only">Diagnostic principal : </span>
                        <span className="text-sm text-ink-600 truncate block">
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
                        <div className="progress w-16">
                          <span style={{ width: `${stats.percentage}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold text-ink-900">
                          {stats.percentage}%
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-ink-700 group-hover:text-ink-900 flex items-center gap-1">
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
                  className="btn-secondary btn-sm disabled:opacity-40"
                >
                  Précédent
                </button>
                <span className="font-semibold text-ink-900">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary btn-sm disabled:opacity-40"
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
          <div className="w-10 h-10 rounded-lg bg-ink-100 text-ink-500 flex items-center justify-center mx-auto">
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
                className="btn-secondary"
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
