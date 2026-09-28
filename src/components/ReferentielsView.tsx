import React, { useState } from 'react';
import { ReferenceLists, UserRole } from '../types';
import { Database, Plus, Trash2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'religions' | 'ethnies' | 'matrimoniales' | 'bilans' | 'syndromes' | 'cim'>('syndromes');
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
        [category]: [...current, newItemText.trim()]
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
        { code: newCimCode.trim().toUpperCase(), label: newCimLabel.trim() }
      ]
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
      [category]: referenceLists[category].filter(item => item !== val)
    };
    onUpdateReferenceLists(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#10B9A9]" />
            <h1 className="text-xl font-bold text-[#18243A] tracking-tight">
              Gestion des Référentiels Cliniques & Listes de Valeurs (F-24)
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Paramétrage des nomenclatures, ethnies, religions, syndromes et bilans types
          </p>
        </div>

        {!isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-[#FEF3C7] text-[#B45309] rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Consultation seule (Modification réservée ADMIN)</span>
            </div>
            {onSwitchToAdmin && (
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-[#D9E2E8] hover:border-[#10B9A9] text-[#18243A] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Basculer en Admin (M. Touré)
              </button>
            )}
          </div>
        )}
      </div>

      {isSaved && (
        <div className="p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Référentiel mis à jour avec succès.
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F7] rounded-xl border border-[#D9E2E8]">
        {[
          { id: 'syndromes', label: 'Syndromes Fréquents' },
          { id: 'cim', label: 'CIM-10 Diagnostic' },
          { id: 'bilans', label: 'Bilans Paracliniques' },
          { id: 'ethnies', label: 'Ethnies' },
          { id: 'religions', label: 'Religions' },
          { id: 'matrimoniales', label: 'Situations Matrimoniales' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#07988D] shadow-xs'
                : 'text-[#64748B] hover:text-[#18243A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs space-y-4">
        {/* SYNDROMES */}
        {activeTab === 'syndromes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF2]">
              <h2 className="text-sm font-bold text-[#18243A]">
                Référentiel des Syndromes Psychiatriques ({referenceLists.syndromesFrequents.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {referenceLists.syndromesFrequents.map((s) => (
                <div key={s} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg text-xs font-medium">
                  <span>{s}</span>
                  {isAdmin && (
                    <button onClick={() => removeItem('syndromesFrequents', s)} className="text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Intitulé du nouveau syndrome..."
                  className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 flex-1"
                />
                <button
                  onClick={() => handleAddItem('syndromesFrequents')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* CIM-10 */}
        {activeTab === 'cim' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF2]">
              <h2 className="text-sm font-bold text-[#18243A]">
                Classifications Diagnostiques CIM-10 / DSM-5 ({referenceLists.diagnosticClassifications.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {referenceLists.diagnosticClassifications.map((item) => (
                <div key={item.code} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#07988D] mr-2">[{item.code}]</span>
                    <span className="font-semibold text-[#18243A]">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                <input
                  type="text"
                  value={newCimCode}
                  onChange={(e) => setNewCimCode(e.target.value)}
                  placeholder="Code CIM (ex: F33.1)"
                  className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 font-mono"
                />
                <input
                  type="text"
                  value={newCimLabel}
                  onChange={(e) => setNewCimLabel(e.target.value)}
                  placeholder="Libellé nosologique complet..."
                  className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 md:col-span-1"
                />
                <button
                  onClick={handleAddCim}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter le code
                </button>
              </div>
            )}
          </div>
        )}

        {/* BILANS */}
        {activeTab === 'bilans' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#18243A] pb-2 border-b border-[#E8EEF2]">
              Types de Bilans Paracliniques ({referenceLists.typesBilans.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {referenceLists.typesBilans.map((b) => (
                <div key={b} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg text-xs font-medium">
                  <span>{b}</span>
                  {isAdmin && (
                    <button onClick={() => removeItem('typesBilans', b)} className="text-[#BE123C] p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Ex: Sérologie Paludisme, Scanner cérébral..."
                  className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 flex-1"
                />
                <button
                  onClick={() => handleAddItem('typesBilans')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* ETHNIES */}
        {activeTab === 'ethnies' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#18243A] pb-2 border-b border-[#E8EEF2]">
              Ethnies Référencées ({referenceLists.ethnies.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {referenceLists.ethnies.map((eth) => (
                <span key={eth} className="px-3 py-1.5 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg text-xs font-semibold text-[#18243A] flex items-center gap-2">
                  <span>{eth}</span>
                  {isAdmin && (
                    <button onClick={() => removeItem('ethnies', eth)} className="text-[#BE123C] hover:text-[#9F1239]">
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Nouvelle ethnie..."
                  className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 flex-1"
                />
                <button
                  onClick={() => handleAddItem('ethnies')}
                  className="px-3 py-2 text-xs font-semibold text-white bg-[#10B9A9] rounded-lg"
                >
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* RELIGIONS */}
        {activeTab === 'religions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#18243A] pb-2 border-b border-[#E8EEF2]">
              Religions Référencées ({referenceLists.religions.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {referenceLists.religions.map((rel) => (
                <span key={rel} className="px-3 py-1.5 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg text-xs font-semibold text-[#18243A] flex items-center gap-2">
                  <span>{rel}</span>
                  {isAdmin && (
                    <button onClick={() => removeItem('religions', rel)} className="text-[#BE123C] hover:text-[#9F1239]">
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Nouvelle religion..."
                  className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 flex-1"
                />
                <button
                  onClick={() => handleAddItem('religions')}
                  className="px-3 py-2 text-xs font-semibold text-white bg-[#10B9A9] rounded-lg"
                >
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* SITUATIONS MATRIMONIALES */}
        {activeTab === 'matrimoniales' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#18243A] pb-2 border-b border-[#E8EEF2]">
              Situations Matrimoniales ({referenceLists.situationsMatrimoniales.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {referenceLists.situationsMatrimoniales.map((mat) => (
                <span key={mat} className="px-3 py-1.5 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg text-xs font-semibold text-[#18243A]">
                  {mat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
