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
  Layers
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
  const [sortBy, setSortBy] = useState<'dateModif' | 'dateCreation' | 'nom' | 'completude'>(initialFilters?.sortBy || 'dateModif');
  const [sortAsc, setSortAsc] = useState(false);

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

  // Filtered & sorted dossiers
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((d) => {
      // Status filter
      if (statusFilter === 'TOUS_ACTIFS' && d.statut === 'ARCHIVÉ') return false;
      if (statusFilter !== 'TOUS_ACTIFS' && statusFilter !== 'TOUS' && d.statut !== statusFilter) return false;

      // Sexe filter
      if (sexeFilter !== 'TOUS' && d.s1Identification.sexe !== sexeFilter) return false;

      // Modalité filter
      if (modaliteFilter !== 'TOUTES' && d.s2Modalites.modalite !== modaliteFilter) return false;

      // Orientation filter
      if (orientationFilter !== 'TOUTES' && d.s14PriseEnCharge.orientation !== orientationFilter) return false;

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
        const diag = (d.s12HypothesesDiag.hypotheses || []).map(h => h.libelle.toLowerCase()).join(' ');

        if (!num.includes(query) && !nom.includes(query) && !prenoms.includes(query) && !prof.includes(query) && !diag.includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
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
  }, [dossiers, searchTerm, statusFilter, sexeFilter, modaliteFilter, orientationFilter, trancheAgeFilter, sortBy, sortAsc]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sexeFilter, modaliteFilter, orientationFilter, trancheAgeFilter, sortBy, sortAsc]);

  // Pagination calculation
  const totalItems = filteredDossiers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedDossiers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDossiers.slice(startIndex, startIndex + pageSize);
  }, [filteredDossiers, currentPage, pageSize]);

  const activeCount = dossiers.filter(d => d.statut !== 'ARCHIVÉ').length;
  const archivedCount = dossiers.filter(d => d.statut === 'ARCHIVÉ').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Title & Key Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18243A] tracking-tight">
            Registre des Patients en Psychiatrie
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dossiers médicaux standardisés en 17 rubriques · {activeCount} actifs · {archivedCount} archivés
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Dossier Patient</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom, N° d'ordre (ex: PSY-2026-0001), diagnostic..."
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs rounded-lg pl-9 pr-4 py-2 text-[#18243A] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#18243A]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Status segmented buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F7] rounded-lg overflow-x-auto text-xs font-medium">
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
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
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

        {/* Secondary filters row (B4: Tranche d'âge, Sexe, Modalité, Orientation, Tri) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8EEF2] text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filtres :</span>
          </div>

          {/* Tranche d'âge (B4) */}
          <select
            value={trancheAgeFilter}
            onChange={(e) => setTrancheAgeFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#D9E2E8] rounded-md px-2 py-1 text-xs text-[#18243A] focus:outline-none"
          >
            <option value="TOUTES">Tous les âges</option>
            <option value="MINEUR">&lt; 18 ans (Mineur)</option>
            <option value="18_30">18 – 30 ans</option>
            <option value="31_50">31 – 50 ans</option>
            <option value="SENIOR">&gt; 50 ans</option>
          </select>

          {/* Sexe */}
          <select
            value={sexeFilter}
            onChange={(e) => setSexeFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#D9E2E8] rounded-md px-2 py-1 text-xs text-[#18243A] focus:outline-none"
          >
            <option value="TOUS">Tous sexes</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
          </select>

          {/* Modalité */}
          <select
            value={modaliteFilter}
            onChange={(e) => setModaliteFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#D9E2E8] rounded-md px-2 py-1 text-xs text-[#18243A] focus:outline-none"
          >
            <option value="TOUTES">Toutes modalités</option>
            <option value="Libre">Soins libres</option>
            <option value="Adressé par un tiers">Adressé par un tiers</option>
            <option value="Soins sans consentement">Soins sans consentement</option>
          </select>

          {/* Orientation */}
          <select
            value={orientationFilter}
            onChange={(e) => setOrientationFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#D9E2E8] rounded-md px-2 py-1 text-xs text-[#18243A] focus:outline-none"
          >
            <option value="TOUTES">Toutes orientations</option>
            <option value="Ambulatoire">Ambulatoire</option>
            <option value="Hospitalisation">Hospitalisation</option>
          </select>

          {/* Sort dropdown */}
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[11px] text-[#64748B]">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F8FAFC] border border-[#D9E2E8] rounded-md px-2 py-1 text-xs text-[#18243A] focus:outline-none"
            >
              <option value="dateModif">Dernière mise à jour</option>
              <option value="dateCreation">Date de création</option>
              <option value="nom">Nom alphabétique</option>
              <option value="completude">Taux de complétude</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1 text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F7] rounded"
              title={sortAsc ? 'Ordre croissant' : 'Ordre décroissant'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white border border-[#D9E2E8] rounded-xl shadow-xs overflow-hidden">
        {paginatedDossiers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#D9E2E8] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">N° d'Ordre</th>
                    <th className="py-3 px-4">Patient (Nom, Prénoms)</th>
                    <th className="py-3 px-4">Âge / Sexe</th>
                    <th className="py-3 px-4">Modalité & Orientation</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Complétude (17 Rubriques)</th>
                    <th className="py-3 px-4">Dernière MaJ</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF2] text-xs">
                  {paginatedDossiers.map((dossier) => {
                    const stats = calculateDossierStats(dossier);
                    const diagPrincipal = dossier.s12HypothesesDiag.hypotheses?.find(h => h.type === 'Principale');
                    const updatedDate = new Date(dossier.dateDerniereModification);

                    return (
                      <tr
                        key={dossier.id}
                        onClick={() => onSelectDossier(dossier.id)}
                        className="hover:bg-[#ECFBF9]/30 cursor-pointer transition-colors group"
                      >
                        {/* Numéro d'ordre */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#18243A]">
                          <span className="px-2 py-0.5 rounded bg-[#F1F5F7] border border-[#D9E2E8]">
                            {dossier.s1Identification.numeroOrdre}
                          </span>
                        </td>

                        {/* Nom & Prénoms */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#18243A] group-hover:text-[#07988D] transition-colors">
                            {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate max-w-xs mt-0.5">
                            {diagPrincipal ? (
                              <span className="text-[#07988D]">
                                {diagPrincipal.codeCimDsm ? `[${diagPrincipal.codeCimDsm}] ` : ''}{diagPrincipal.libelle}
                              </span>
                            ) : (
                              <span>{dossier.s1Identification.profession || 'Diagnostic en cours d’évaluation'}</span>
                            )}
                          </div>
                        </td>

                        {/* Âge / Sexe */}
                        <td className="py-3.5 px-4 text-[#18243A]">
                          <div className="tabular-nums font-medium">{dossier.s1Identification.age} ans</div>
                          <div className="text-[11px] text-[#64748B]">{dossier.s1Identification.sexe}</div>
                        </td>

                        {/* Modalité & Orientation */}
                        <td className="py-3.5 px-4">
                          <div className="text-[#18243A] font-medium">
                            {dossier.s2Modalites.modalite}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {dossier.s14PriseEnCharge.orientation ? `Orientation : ${dossier.s14PriseEnCharge.orientation}` : 'Orientation non définie'}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-4">
                          {dossier.statut === 'VALIDÉ' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D]">
                              <CheckCircle2 className="w-3 h-3" />
                              Validé
                            </span>
                          )}
                          {dossier.statut === 'EN_COURS' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                              <Clock className="w-3 h-3" />
                              En cours
                            </span>
                          )}
                          {dossier.statut === 'BROUILLON' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F7] text-[#64748B]">
                              Brouillon
                            </span>
                          )}
                          {dossier.statut === 'ARCHIVÉ' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFE4E6] text-[#BE123C]">
                              <Archive className="w-3 h-3" />
                              Archivé
                            </span>
                          )}
                        </td>

                        {/* Complétude */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#D9E2E8] h-1.5 rounded-full overflow-hidden">
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
                            <span className="font-mono text-[11px] font-bold text-[#18243A] tabular-nums">
                              {stats.percentage}%
                            </span>
                          </div>
                          <div className="text-[10px] text-[#64748B] mt-0.5">
                            {stats.completeCount} complètes · {stats.partialCount} part.
                          </div>
                        </td>

                        {/* Dernière mise à jour */}
                        <td className="py-3.5 px-4 text-[#64748B] text-[11px] tabular-nums">
                          <div>
                            {updatedDate.toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div>
                            {updatedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                            className="inline-flex items-center text-xs font-semibold text-[#07988D] hover:text-[#067A71] bg-[#ECFBF9] hover:bg-[#D9F7F3] border border-[#10B9A9]/20 px-2.5 py-1 rounded-md transition-all cursor-pointer group-hover:border-[#10B9A9]"
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

            {/* Pagination footer (B4) */}
            <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#D9E2E8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span>Afficher</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#D9E2E8] rounded px-2 py-1 text-xs text-[#18243A] focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>dossiers sur <strong>{totalItems}</strong> au total</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="tabular-nums">
                  Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-[#D9E2E8] bg-white text-[#18243A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F5F7]"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-[#D9E2E8] bg-white text-[#18243A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F5F7]"
                    title="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F7] flex items-center justify-center mx-auto text-[#64748B]">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#18243A]">
              Aucun dossier patient ne correspond aux critères
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Modifiez votre recherche ou vos filtres pour afficher des dossiers, ou créez un nouveau dossier patient.
            </p>
            <button
              onClick={onOpenNewPatient}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer un patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
