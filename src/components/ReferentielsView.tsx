import React, { useState, useMemo } from 'react';
import { ReferenceLists, UserRole } from '../types';
import {
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
  BookOpen,
  Tag,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

interface ReferentielsViewProps {
  referenceLists: ReferenceLists;
  onUpdateReferenceLists: (updated: ReferenceLists) => void;
  currentUserRole: UserRole;
  onSwitchToAdmin?: () => void;
}

export const ReferentielsView: React.FC<ReferentielsViewProps> = ({
  referenceLists,
  onUpdateReferenceLists,
  currentUserRole,
  onSwitchToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'syndromes' | 'cim' | 'bilans' | 'ethnies' | 'religions' | 'matrimoniales'>('syndromes');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newCimCode, setNewCimCode] = useState('');
  const [newCimLabel, setNewCimLabel] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const isAdmin = currentUserRole === 'ADMIN';

  const handleAddItem = (category: 'religions' | 'ethnies' | 'situationsMatrimoniales' | 'typesBilans' | 'syndromesFrequents') => {
    if (!isAdmin || !newItemText.trim()) return;
    const current = referenceLists[category] || [];
    if (!current.includes(newItemText.trim())) {
      const updated = {
        ...referenceLists,
        [category]: [...current, newItemText.trim()],
      };
      onUpdateReferenceLists(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
    setNewItemText('');
  };

  const handleAddCim = () => {
    if (!isAdmin || !newCimCode.trim() || !newCimLabel.trim()) return;
    const updated = {
      ...referenceLists,
      diagnosticClassifications: [
        ...referenceLists.diagnosticClassifications,
        { code: newCimCode.trim().toUpperCase(), label: newCimLabel.trim() },
      ],
    };
    onUpdateReferenceLists(updated);
    setNewCimCode('');
    setNewCimLabel('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const removeItem = (category: 'religions' | 'ethnies' | 'situationsMatrimoniales' | 'typesBilans' | 'syndromesFrequents', val: string) => {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      `Supprimer "${val}" de la liste ?\n\nAttention : si cette valeur est utilisée dans des dossiers existants, elle y restera mais ne sera plus disponible pour les nouvelles sélections.`
    );
    if (!confirmed) return;
    const updated = {
      ...referenceLists,
      [category]: referenceLists[category].filter((item) => item !== val),
    };
    onUpdateReferenceLists(updated);
  };

  const removeCimItem = (code: string) => {
    if (!isAdmin) return;
    const item = referenceLists.diagnosticClassifications.find((c) => c.code === code);
    const confirmed = window.confirm(
      `Supprimer [${code}] ${item?.label || ''} de la classification ?\n\nAttention : si ce code est utilisé dans des dossiers existants, il y restera mais ne sera plus disponible pour les nouvelles sélections.`
    );
    if (!confirmed) return;
    const updated = {
      ...referenceLists,
      diagnosticClassifications: referenceLists.diagnosticClassifications.filter((item) => item.code !== code),
    };
    onUpdateReferenceLists(updated);
  };

  // Filter items based on search term
  const filteredSyndromes = useMemo(() => {
    return referenceLists.syndromesFrequents.filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [referenceLists.syndromesFrequents, searchTerm]);

  const filteredCim = useMemo(() => {
    return referenceLists.diagnosticClassifications.filter(
      (c) => c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [referenceLists.diagnosticClassifications, searchTerm]);

  const filteredBilans = useMemo(() => {
    return referenceLists.typesBilans.filter((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [referenceLists.typesBilans, searchTerm]);

  const filteredEthnies = useMemo(() => {
    return referenceLists.ethnies.filter((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [referenceLists.ethnies, searchTerm]);

  const filteredReligions = useMemo(() => {
    return referenceLists.religions.filter((r) => r.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [referenceLists.religions, searchTerm]);

  const filteredMatrimoniales = useMemo(() => {
    return referenceLists.situationsMatrimoniales.filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [referenceLists.situationsMatrimoniales, searchTerm]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-ink-900 tracking-tight">
                  Référentiels & nomenclatures
                </h2>
                <span className="hidden sm:inline-flex chip chip-neutral">
                  <Tag className="w-3 h-3" /> F-24
                </span>
              </div>
              <p className="text-sm text-ink-500 font-medium mt-1">
                Nomenclatures CIM-10 / DSM-5, syndromes, bilans paracliniques et listes de valeurs cliniques
              </p>
            </div>
          </div>
        </div>

        <div>
          {!isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="chip bg-amber-100 text-amber-800 !py-2 !px-3.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Lecture seule · modifications réservées à l'administrateur</span>
              </div>
              {onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="btn-secondary !py-2"
                >
                  Basculer en Admin (M. Touré)
                </button>
              )}
            </div>
          ) : (
            <div className="chip bg-emerald-100 text-emerald-800 !py-2 !px-3.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mode Administrateur actif : modifications autorisées</span>
            </div>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-body-sm text-emerald-700 font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Référentiel mis à jour et synchronisé avec succès.
        </div>
      )}

      {/* 2. Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-ink-100 rounded-xl border border-ink-150">
        {[
          { id: 'syndromes', label: 'Syndromes Fréquents', count: referenceLists.syndromesFrequents.length },
          { id: 'cim', label: 'Classifications CIM-10', count: referenceLists.diagnosticClassifications.length },
          { id: 'bilans', label: 'Bilans Paracliniques', count: referenceLists.typesBilans.length },
          { id: 'ethnies', label: 'Ethnies', count: referenceLists.ethnies.length },
          { id: 'religions', label: 'Religions', count: referenceLists.religions.length },
          { id: 'matrimoniales', label: 'Situations Matrimoniales', count: referenceLists.situationsMatrimoniales.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 text-body-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-xs border border-ink-150'
                : 'text-ink-500 hover:text-ink-900 hover:bg-white/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-caption font-mono font-bold ${
                activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'bg-ink-150 text-ink-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Tab Contents Container */}
      <div className="clinical-card p-6 sm:p-7 space-y-5">
        {/* Category Header + Search Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-100">
          <div>
            <h2 className="text-h2 font-bold text-ink-900">
              {activeTab === 'syndromes' && 'Nomenclature des Syndromes Psychiatriques Fréquents'}
              {activeTab === 'cim' && 'Nomenclature CIM-10 / DSM-5'}
              {activeTab === 'bilans' && 'Référentiel des Bilans Paracliniques Types'}
              {activeTab === 'ethnies' && 'Référentiel des Groupes Ethniques'}
              {activeTab === 'religions' && 'Référentiel des Confessions Religieuses'}
              {activeTab === 'matrimoniales' && 'Référentiel des Statuts Matrimoniaux'}
            </h2>
            <p className="text-body-sm text-ink-500 mt-0.5">
              Éléments disponibles dans les sélecteurs de saisie des rubriques correspondantes
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrer la liste..."
              className="clinical-input pl-8 py-1.5 text-body-sm font-medium"
            />
          </div>
        </div>

        {/* --- SYNDROMES --- */}
        {activeTab === 'syndromes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredSyndromes.map((s) => (
                <div
                  key={s}
                  className="clinical-subcard p-3 flex items-center justify-between text-body-sm font-semibold hover:border-primary-500/40 transition-colors group"
                >
                  <span className="text-ink-900">{s}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('syndromesFrequents', s)}
                      className="text-ink-400 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-ink-25 border border-dashed border-ink-200 rounded-xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé du nouveau syndrome (ex: Syndrome de Cotard)..."
                  className="clinical-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('syndromesFrequents')}
                  disabled={!newItemText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter au référentiel
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- CIM-10 --- */}
        {activeTab === 'cim' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCim.map((item) => (
                <div
                  key={item.code}
                  className="clinical-subcard p-3.5 flex items-start justify-between text-body-sm hover:border-primary-500/40 transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-500/30 shrink-0">
                      {item.code}
                    </span>
                    <span className="font-bold text-ink-900 leading-snug">{item.label}</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeCimItem(item.code)}
                      className="text-ink-400 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 ml-2"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-ink-25 border border-dashed border-ink-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                <input
                  type="text"
                  value={newCimCode}
                  onChange={(e) => setNewCimCode(e.target.value)}
                  placeholder="Code CIM (ex: F33.1)"
                  className="clinical-input text-mono uppercase"
                />
                <input
                  type="text"
                  value={newCimLabel}
                  onChange={(e) => setNewCimLabel(e.target.value)}
                  placeholder="Libellé nosologique complet..."
                  className="clinical-input text-body-sm sm:col-span-1"
                />
                <button
                  type="button"
                  onClick={handleAddCim}
                  disabled={!newCimCode.trim() || !newCimLabel.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter le code
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- BILANS --- */}
        {activeTab === 'bilans' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredBilans.map((b) => (
                <div
                  key={b}
                  className="clinical-subcard p-3 flex items-center justify-between text-body-sm font-semibold hover:border-primary-500/40 transition-colors group"
                >
                  <span className="text-ink-900">{b}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('typesBilans', b)}
                      className="text-ink-400 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-ink-25 border border-dashed border-ink-200 rounded-xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Ex: TDM Cérébral sans injection, Bilan thyroïdien (TSH, T4L)..."
                  className="clinical-input flex-1 text-body-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('typesBilans')}
                  disabled={!newItemText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter le bilan
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- ETHNIES --- */}
        {activeTab === 'ethnies' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {filteredEthnies.map((e) => (
                <div
                  key={e}
                  className="clinical-subcard p-3 flex items-center justify-between text-body-sm font-semibold hover:border-primary-500/40 transition-colors group"
                >
                  <span className="text-ink-900">{e}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('ethnies', e)}
                      className="text-ink-400 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-ink-25 border border-dashed border-ink-200 rounded-xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé du groupe ethnique..."
                  className="clinical-input flex-1 text-body-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('ethnies')}
                  disabled={!newItemText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- RELIGIONS --- */}
        {activeTab === 'religions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {filteredReligions.map((r) => (
                <div
                  key={r}
                  className="clinical-subcard p-3 flex items-center justify-between text-body-sm font-semibold hover:border-primary-500/40 transition-colors group"
                >
                  <span className="text-ink-900">{r}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('religions', r)}
                      className="text-ink-400 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-ink-25 border border-dashed border-ink-200 rounded-xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé de la confession..."
                  className="clinical-input flex-1 text-body-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('religions')}
                  disabled={!newItemText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- MATRIMONIALES --- */}
        {activeTab === 'matrimoniales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {filteredMatrimoniales.map((m) => (
                <div
                  key={m}
                  className="clinical-subcard p-3 flex items-center justify-between text-body-sm font-semibold hover:border-primary-500/40 transition-colors group"
                >
                  <span className="text-ink-900">{m}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('situationsMatrimoniales', m)}
                      className="text-ink-400 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-ink-25 border border-dashed border-ink-200 rounded-xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé de la situation (ex: Concubinage, Marié(e) polygame)..."
                  className="clinical-input flex-1 text-body-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('situationsMatrimoniales')}
                  disabled={!newItemText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
