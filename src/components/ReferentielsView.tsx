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
    const updated = {
      ...referenceLists,
      [category]: referenceLists[category].filter((item) => item !== val),
    };
    onUpdateReferenceLists(updated);
  };

  const removeCimItem = (code: string) => {
    if (!isAdmin) return;
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
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header */}
      <div className="clinical-card p-6 sm:p-7 bg-gradient-to-br from-white via-[#FCFDFE] to-[#F0FDFA] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ECFBF9] text-[#07988D] flex items-center justify-center border border-[#10B9A9]/20 shadow-xs">
              <Database className="w-5 h-5 text-[#07988D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#18243A] tracking-tight">
                  Gestion des Référentiels & Nomenclatures
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFBF9] text-[#07988D] border border-[#10B9A9]/30">
                  <Tag className="w-3 h-3" /> F-24
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
                Nomenclatures CIM-10 / DSM-5, syndromes, bilans paracliniques et listes de valeurs cliniques
              </p>
            </div>
          </div>
        </div>

        <div>
          {!isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 bg-[#FEF3C7] text-[#B45309] rounded-xl text-xs font-bold border border-[#FDE68A] flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Lecture seule (Modifications réservées ADMIN)</span>
              </div>
              {onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white border border-[#D9E2E8] hover:border-[#10B9A9] text-[#18243A] rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Basculer en Admin (M. Touré)
                </button>
              )}
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-[#DCFCE7] text-[#15803D] rounded-xl text-xs font-bold border border-[#86EFAC] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mode Administrateur actif : modifications autorisées</span>
            </div>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl text-xs text-[#15803D] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          Référentiel mis à jour et synchronisé avec succès.
        </div>
      )}

      {/* 2. Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F1F5F7] rounded-2xl border border-[#D9E2E8]">
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
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-[#07988D] shadow-xs border border-[#D9E2E8]'
                : 'text-[#64748B] hover:text-[#18243A] hover:bg-white/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                activeTab === tab.id ? 'bg-[#ECFBF9] text-[#07988D]' : 'bg-[#E2E8F0] text-[#64748B]'
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EEF2]">
          <div>
            <h2 className="text-base font-extrabold text-[#18243A]">
              {activeTab === 'syndromes' && 'Nomenclature des Syndromes Psychiatriques Fréquents'}
              {activeTab === 'cim' && 'Nomenclature CIM-10 / DSM-5'}
              {activeTab === 'bilans' && 'Référentiel des Bilans Paracliniques Types'}
              {activeTab === 'ethnies' && 'Référentiel des Groupes Ethniques'}
              {activeTab === 'religions' && 'Référentiel des Confessions Religieuses'}
              {activeTab === 'matrimoniales' && 'Référentiel des Statuts Matrimoniaux'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Éléments disponibles dans les sélecteurs de saisie des rubriques correspondantes
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrer la liste..."
              className="clinical-input pl-8 py-1.5 text-xs font-medium"
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
                  className="clinical-subcard p-3 flex items-center justify-between text-xs font-semibold hover:border-[#10B9A9]/40 transition-colors group"
                >
                  <span className="text-[#18243A]">{s}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('syndromesFrequents', s)}
                      className="text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé du nouveau syndrome (ex: Syndrome de Cotard)..."
                  className="clinical-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('syndromesFrequents')}
                  disabled={!newItemText.trim()}
                  className="clinical-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
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
                  className="clinical-subcard p-3.5 flex items-start justify-between text-xs hover:border-[#10B9A9]/40 transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-black text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded border border-[#10B9A9]/30 shrink-0">
                      {item.code}
                    </span>
                    <span className="font-bold text-[#18243A] leading-snug">{item.label}</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeCimItem(item.code)}
                      className="text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 ml-2"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                <input
                  type="text"
                  value={newCimCode}
                  onChange={(e) => setNewCimCode(e.target.value)}
                  placeholder="Code CIM (ex: F33.1)"
                  className="clinical-input font-mono text-xs uppercase"
                />
                <input
                  type="text"
                  value={newCimLabel}
                  onChange={(e) => setNewCimLabel(e.target.value)}
                  placeholder="Libellé nosologique complet..."
                  className="clinical-input text-xs sm:col-span-1"
                />
                <button
                  type="button"
                  onClick={handleAddCim}
                  disabled={!newCimCode.trim() || !newCimLabel.trim()}
                  className="clinical-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
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
                  className="clinical-subcard p-3 flex items-center justify-between text-xs font-semibold hover:border-[#10B9A9]/40 transition-colors group"
                >
                  <span className="text-[#18243A]">{b}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('typesBilans', b)}
                      className="text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Ex: TDM Cérébral sans injection, Bilan thyroïdien (TSH, T4L)..."
                  className="clinical-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('typesBilans')}
                  disabled={!newItemText.trim()}
                  className="clinical-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
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
                  className="clinical-subcard p-3 flex items-center justify-between text-xs font-semibold hover:border-[#10B9A9]/40 transition-colors group"
                >
                  <span className="text-[#18243A]">{e}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('ethnies', e)}
                      className="text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé du groupe ethnique..."
                  className="clinical-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('ethnies')}
                  disabled={!newItemText.trim()}
                  className="clinical-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
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
                  className="clinical-subcard p-3 flex items-center justify-between text-xs font-semibold hover:border-[#10B9A9]/40 transition-colors group"
                >
                  <span className="text-[#18243A]">{r}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('religions', r)}
                      className="text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé de la confession..."
                  className="clinical-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('religions')}
                  disabled={!newItemText.trim()}
                  className="clinical-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
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
                  className="clinical-subcard p-3 flex items-center justify-between text-xs font-semibold hover:border-[#10B9A9]/40 transition-colors group"
                >
                  <span className="text-[#18243A]">{m}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeItem('situationsMatrimoniales', m)}
                      className="text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé de la situation (ex: Concubinage, Marié(e) polygame)..."
                  className="clinical-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('situationsMatrimoniales')}
                  disabled={!newItemText.trim()}
                  className="clinical-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
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
