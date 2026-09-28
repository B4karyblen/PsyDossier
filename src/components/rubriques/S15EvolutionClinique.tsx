import React, { useState } from 'react';
import { S15EvolutionData, EntreeEvolution, UserRole } from '../../types';
import { Save, ChevronRight, Plus, Clock, User, ShieldCheck } from 'lucide-react';

interface Props {
  data: S15EvolutionData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S15EvolutionData) => void;
  onNext: () => void;
}

export const S15EvolutionClinique: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S15EvolutionData>(data);
  const [newNote, setNewNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [rectifyingEntryId, setRectifyingEntryId] = useState<string | null>(null);
  const [rectificationText, setRectificationText] = useState('');

  const canAddEntry = ['PSYCHIATRE', 'PSYCHOLOGUE', 'INFIRMIER', 'ASSISTANT_SOCIAL', 'ADMIN'].includes(currentUserRole);

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
      entrees: [newEntry, ...(formData.entrees || [])]
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
      note: `[RECTIFICATION / ADDENDUM] : ${rectificationText.trim()}`,
      estAddendum: true,
      addendumParentId: parentId,
    };

    const updated = {
      ...formData,
      entrees: [addendumEntry, ...(formData.entrees || [])]
    };

    setFormData(updated);
    setRectifyingEntryId(null);
    setRectificationText('');
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const sortedEntrees = [...(formData.entrees || [])].sort((a, b) => {
    const timeA = new Date(a.dateHeure).getTime();
    const timeB = new Date(b.dateHeure).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S15 · SUIVI CLINIQUE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Évolution clinique
          </h2>
          <p className="text-xs text-[#64748B]">
            Journal d’observations datées inaltérables en ajout seul (BR-015)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="text-xs font-semibold px-2.5 py-1 bg-[#F1F5F7] hover:bg-[#D9E2E8] text-[#18243A] rounded-lg transition-colors"
          >
            {sortOrder === 'desc' ? '↓ Plus récent en haut' : '↑ Plus ancien en haut'}
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Entrée d’évolution enregistrée dans le journal.
        </div>
      )}

      {/* Formulaire d'ajout d'une nouvelle transmission clinique */}
      {canAddEntry && (
        <form onSubmit={handleAddEntry} className="mb-6 p-4 bg-[#F8FAFC] border border-[#10B9A9]/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#18243A] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#10B9A9]" />
              Nouvelle transmission clinique
            </span>
            <span className="text-[11px] text-[#64748B]">
              Signée en tant que : <strong className="text-[#18243A]">{currentUserName}</strong> ({currentUserRole})
            </span>
          </div>

          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Évolution de l'humeur, tolérance des traitements, propos du patient, comportements dans le service..."
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Consigner dans le journal
            </button>
          </div>
        </form>
      )}

      {/* Timeline des entrées d'évolution */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#64748B]" />
          Historique des transmissions ({sortedEntrees.length})
        </h3>

        {sortedEntrees.length > 0 ? (
          <div className="relative pl-4 border-l-2 border-[#D9E2E8] space-y-4 my-2">
            {sortedEntrees.map((entree) => {
              const dateObj = new Date(entree.dateHeure);
              const isAddendum = entree.estAddendum;

              return (
                <div key={entree.id} className="relative group">
                  {/* Point sur la ligne de temps */}
                  <div
                    className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                      isAddendum ? 'border-[#A855F7]' : 'border-[#10B9A9]'
                    }`}
                  />

                  <div className={`p-3.5 rounded-xl border ${
                    isAddendum
                      ? 'bg-[#F3E8FF]/30 border-[#A855F7]/30'
                      : 'bg-white border-[#D9E2E8]'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-[#E8EEF2]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#18243A]">
                          {entree.auteurNom}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F7] text-[#64748B]">
                          {entree.auteurRole}
                        </span>
                        {isAddendum && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F3E8FF] text-[#9333EA]">
                            Addendum
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-[#64748B]">
                        {dateObj.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        à {dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <p className="text-xs text-[#18243A] leading-relaxed whitespace-pre-wrap">
                      {entree.note}
                    </p>

                    {/* Rectification action */}
                    {!isAddendum && canAddEntry && (
                      <div className="mt-2 pt-1 border-t border-[#F1F5F7] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setRectifyingEntryId(rectifyingEntryId === entree.id ? null : entree.id)}
                          className="text-[11px] text-[#64748B] hover:text-[#07988D] underline"
                        >
                          {rectifyingEntryId === entree.id ? 'Annuler' : 'Ajouter une précision / rectification'}
                        </button>
                      </div>
                    )}

                    {rectifyingEntryId === entree.id && (
                      <div className="mt-2 p-2 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg space-y-2">
                        <input
                          type="text"
                          value={rectificationText}
                          onChange={(e) => setRectificationText(e.target.value)}
                          placeholder="Texte rectificatif qui sera consigné sous forme d’addendum..."
                          className="w-full text-xs bg-white border border-[#D9E2E8] rounded p-2"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddRectification(entree.id)}
                            className="px-3 py-1 text-xs font-semibold bg-[#10B9A9] text-white rounded hover:bg-[#07988D]"
                          >
                            Enregistrer rectification
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#D9E2E8] rounded-xl text-xs text-[#64748B]">
            Aucune transmission consignée pour le moment.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#E8EEF2]">
        <div className="text-[11px] text-[#64748B]">
          Chaque entrée est horodatée et signée nominativement
        </div>

        <button
          type="button"
          onClick={onNext}
          className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
        >
          Suivant (S16)
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
