import React, { useState } from 'react';
import { S15EvolutionData, EntreeEvolution, UserRole } from '../../types';
import { Plus, Clock, User, ShieldCheck, CornerDownRight, Sparkles } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S15EvolutionData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S15EvolutionData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S15EvolutionClinique: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S15EvolutionData>(data);
  const [newNote, setNewNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [rectifyingEntryId, setRectifyingEntryId] = useState<string | null>(null);
  const [rectificationText, setRectificationText] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const canAddEntry = [
    'PSYCHIATRE',
    'PSYCHOLOGUE',
    'INFIRMIER',
    'ASSISTANT_SOCIAL',
    'ADMIN',
  ].includes(currentUserRole);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: EntreeEvolution = {
      id: 'evo-' + Date.now(),
      dateHeure: new Date().toISOString(),
      auteurNom: currentUserName,
      auteurRole: currentUserRole,
      note: newNote.trim(),
    };

    const updated = {
      ...formData,
      entrees: [newEntry, ...(formData.entrees || [])],
    };

    setFormData(updated);
    setNewNote('');
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddRectification = (parentId: string) => {
    if (!rectificationText.trim()) return;

    const addendumEntry: EntreeEvolution = {
      id: 'evo-add-' + Date.now(),
      dateHeure: new Date().toISOString(),
      auteurNom: currentUserName,
      auteurRole: currentUserRole,
      note: `[RECTIFICATION/ADDENDUM] : ${rectificationText.trim()}`,
      estAddendum: true,
      addendumParentId: parentId,
    };

    const updated = {
      ...formData,
      entrees: [addendumEntry, ...(formData.entrees || [])],
    };

    setFormData(updated);
    setRectificationText('');
    setRectifyingEntryId(null);
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const filteredEntrees = (formData.entrees || []).filter((entree) => {
    if (filterAuthor && !entree.auteurNom.toLowerCase().includes(filterAuthor.toLowerCase())) return false;
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      if (new Date(entree.dateHeure) < from) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(entree.dateHeure) > to) return false;
    }
    return true;
  });

  const sortedEntrees = [...filteredEntrees].sort((a, b) => {
    const timeA = new Date(a.dateHeure).getTime();
    const timeB = new Date(b.dateHeure).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const totalPages = Math.max(1, Math.ceil(sortedEntrees.length / entriesPerPage));
  const paginatedEntrees = sortedEntrees.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="clinical-card p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip bg-brand-100 text-brand-800 tabular-nums">
              S15 · SUIVI
            </span>
            <span className="text-xs text-ink-500">Journal clinique</span>
          </div>
          <h2 className="text-xl font-extrabold text-ink-900 tracking-tight mt-2">
            Évolution Clinique & Transmissions
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Historique inaltérable et horodaté des transmissions interdisciplinaires (BR-012 & BR-013)
          </p>
        </div>
      </div>

      {/* New Note Input Form */}
      {canAddEntry && (
        <form
          onSubmit={handleAddEntry}
          className="bg-ink-25 border border-ink-150 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-brand-600" />
              Nouvelle Transmission Clinique
            </label>
            <span className="text-[11px] text-ink-500">
              Signé : <strong className="text-ink-900">{currentUserName}</strong> ({currentUserRole})
            </span>
          </div>

          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Consigner l'état clinique du jour, comportement, tolérance thérapeutique, événements intercurrents..."
            className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-xl p-3 focus:outline-none leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Consigner au dossier
            </button>
          </div>
        </form>
      )}

      {/* Transmissions Timeline */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Filtrer par auteur..."
            value={filterAuthor}
            onChange={(e) => { setFilterAuthor(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-white border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 w-40"
          />
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-white border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
            title="Date de début"
          />
          <span className="text-xs text-ink-500">→</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-white border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
            title="Date de fin"
          />
          {(filterAuthor || filterDateFrom || filterDateTo) && (
            <button
              type="button"
              onClick={() => { setFilterAuthor(''); setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }}
              className="text-xs text-brand-700 hover:underline cursor-pointer font-semibold"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-ink-900">
            Historique des Transmissions ({sortedEntrees.length})
          </span>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="text-xs text-brand-700 hover:underline cursor-pointer font-semibold"
          >
            {sortOrder === 'desc' ? "Plus récentes d'abord ↓" : "Plus anciennes d'abord ↑"}
          </button>
        </div>

        {paginatedEntrees.length > 0 ? (
          <div className="space-y-3">
            {paginatedEntrees.map((entree) => {
              const dt = new Date(entree.dateHeure);
              return (
                <div
                  key={entree.id}
                  className={`p-4 rounded-xl border transition-all ${
                    entree.estAddendum
                      ? 'bg-amber-100/30 border-amber-500/40'
                      : 'bg-ink-25 border-ink-150'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-ink-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-900">{entree.auteurNom}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-ink-200 text-brand-700">
                        {entree.auteurRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-ink-500">
                      <Clock className="w-3 h-3 text-ink-400" />
                      <span className="tabular-nums">
                        {dt.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        à {dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-900 font-medium mt-2.5 leading-relaxed whitespace-pre-wrap">
                    {entree.note}
                  </p>

                  {/* Rectification / Addendum button */}
                  {!entree.estAddendum && !isReadOnly && (
                    <div className="mt-3 pt-2 border-t border-ink-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setRectifyingEntryId(
                            rectifyingEntryId === entree.id ? null : entree.id
                          )
                        }
                        className="text-[11px] text-brand-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        Ajouter un rectificatif / addendum
                      </button>
                    </div>
                  )}

                  {rectifyingEntryId === entree.id && (
                    <div className="mt-2.5 p-3 bg-white border border-ink-200 rounded-xl space-y-2 animate-in fade-in">
                      <input
                        type="text"
                        value={rectificationText}
                        onChange={(e) => setRectificationText(e.target.value)}
                        placeholder="Texte rectificatif qui sera consigné sous forme d’addendum..."
                        className="w-full text-xs bg-ink-25 border border-ink-200 rounded-lg p-2.5 outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRectifyingEntryId(null)}
                          className="px-3 py-1 text-xs text-ink-500 hover:bg-ink-100 rounded-lg"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddRectification(entree.id)}
                          className="px-3.5 py-1.5 text-body-sm font-bold bg-ink-800 text-white rounded-lg hover:bg-ink-950 cursor-pointer"
                        >
                          Consigner addendum
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-ink-25 border border-dashed border-ink-200 rounded-xl text-xs text-ink-500">
            Aucune transmission consignée pour le moment.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold text-ink-900 bg-white border border-ink-200 hover:bg-ink-25 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Précédent
            </button>
            <span className="text-xs text-ink-500 font-medium">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold text-ink-900 bg-white border border-ink-200 hover:bg-ink-25 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <RubriqueFooterNav
        currentRubriqueId="s15"
        isReadOnly={isReadOnly}
        isSaved={isSaved}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
};
