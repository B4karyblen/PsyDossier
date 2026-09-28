import React, { useState } from 'react';
import { S3MotifData } from '../../types';
import { Save, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  data: S3MotifData;
  isReadOnly: boolean;
  onSave: (data: S3MotifData) => void;
  onNext: () => void;
}

export const S3Motif: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S3MotifData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plaintePrincipale.trim()) {
      setError('La plainte principale (motif de consultation actuel) est obligatoire.');
      return;
    }
    setError(null);
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S3 · ANAMNÈSE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Motif de consultation actuel
          </h2>
          <p className="text-xs text-[#64748B]">
            Plainte principale formulée par le patient ou son entourage
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-lg flex items-center gap-2 text-xs text-[#BE123C]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Motif de consultation enregistré avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source de la plainte */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Origine de la formulation de la plainte <span className="text-[#F43F5E]">*</span>
          </label>
          <div className="flex flex-wrap gap-4 pt-1">
            {(['Patient', 'Entourage', 'Patient et entourage'] as const).map((source) => (
              <label key={source} className="flex items-center gap-2 text-xs text-[#18243A] cursor-pointer">
                <input
                  type="radio"
                  name="sourcePlainte"
                  disabled={isReadOnly}
                  checked={formData.sourcePlainte === source}
                  onChange={() => setFormData({ ...formData, sourcePlainte: source })}
                  className="text-[#10B9A9] focus:ring-[#10B9A9]"
                />
                <span>{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Plainte principale */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Plainte principale (in extenso) <span className="text-[#F43F5E]">*</span>
          </label>
          <textarea
            rows={5}
            disabled={isReadOnly}
            value={formData.plaintePrincipale}
            onChange={(e) => setFormData({ ...formData, plaintePrincipale: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none leading-relaxed"
            placeholder="Noter fidèlement les propos du patient et/ou de la famille expliquant la venue en consultation psychiatrique..."
          />
          <span className="text-[11px] text-[#64748B] mt-1 block">
            Exemple : « Angoisse intense, insomnie, conviction d’être persécuté... »
          </span>
        </div>

        {/* Accompagnateurs */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Accompagnateurs présents lors de la consultation
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.accompagnateurs || ''}
            onChange={(e) => setFormData({ ...formData, accompagnateurs: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ex: Venu accompagné de son frère aîné et de son oncle paternel"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            * Champ requis pour la validation du dossier
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S3
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S4)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
