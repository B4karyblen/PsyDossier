import React, { useState } from 'react';
import { S5RepresentationData } from '../../types';
import { Save, ChevronRight } from 'lucide-react';

interface Props {
  data: S5RepresentationData;
  isReadOnly: boolean;
  onSave: (data: S5RepresentationData) => void;
  onNext: () => void;
}

const CATEGORIES_SOCIO = [
  'Sorcellerie',
  'Envoûtement',
  'Djinn',
  'Mauvais œil',
  'Sortilège',
  'Rupture d’interdit / Tabou',
  'Autre'
];

export const S5RepresentationSocioCulturelle: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S5RepresentationData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const toggleCategory = (cat: string) => {
    if (isReadOnly) return;
    const current = formData.categories || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, categories: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...current, cat] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S5 · ANAMNÈSE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Représentation socio-culturelle de la maladie
          </h2>
          <p className="text-xs text-[#64748B]">
            Approche transculturelle : compréhension profane, étiologies traditionnelles formulées par le patient et son entourage
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Représentation socio-culturelle enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Catégories étiologiques perçues */}
        <div className="p-4 bg-[#F1F5F7] rounded-xl border border-[#D9E2E8] space-y-3">
          <label className="block text-xs font-bold text-[#18243A]">
            Modèles explicatifs traditionnels & catégories évoquées
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES_SOCIO.map((cat) => {
              const checked = formData.categories?.includes(cat);
              return (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                    checked
                      ? 'border-[#10B9A9] bg-white text-[#07988D] font-semibold'
                      : 'border-[#D9E2E8] bg-white text-[#18243A] hover:bg-[#F8FAFC]'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className="rounded text-[#10B9A9] focus:ring-[#10B9A9]"
                  />
                  <span>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Explication perçue par le patient */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Explication formulée par le patient (son propre vécu et sens donné)
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.explicationPatient || ''}
            onChange={(e) => setFormData({ ...formData, explicationPatient: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Comment le patient explique-t-il sa souffrance ? (punition, sorcellerie, ondes, destin, épreuve divine...)"
          />
        </div>

        {/* Explication perçue par la famille */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Explication formulée par la famille et le milieu d’appartenance
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.explicationFamille || ''}
            onChange={(e) => setFormData({ ...formData, explicationFamille: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Quel sens la famille donne-t-elle au trouble ? Quelles démarches rituelles ont été engagées ou envisagées ?"
          />
        </div>

        {/* Précisions et alliance thérapeutique */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Précisions sur la compatibilité avec la prise en charge médicale
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.precisions || ''}
            onChange={(e) => setFormData({ ...formData, precisions: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ex: Acceptation conjointe du traitement médicamenteux et de pratiques de Roqya (prières coraniques sans blessure)..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            Saisie clinique descriptive sans jugement dépréciatif
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S5
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S6)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
