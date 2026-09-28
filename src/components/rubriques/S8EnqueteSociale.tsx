import React, { useState } from 'react';
import { S8EnqueteSocialeData } from '../../types';
import { Save, ChevronRight } from 'lucide-react';

interface Props {
  data: S8EnqueteSocialeData;
  isReadOnly: boolean;
  onSave: (data: S8EnqueteSocialeData) => void;
  onNext: () => void;
}

export const S8EnqueteSociale: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S8EnqueteSocialeData>(data);
  const [isSaved, setIsSaved] = useState(false);

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
            S8 · SOCIAL & ENVIRONNEMENT
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Enquête sociale
          </h2>
          <p className="text-xs text-[#64748B]">
            Autodescription, hétérodescription par l’entourage, insertion relationnelle et loisirs
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Enquête sociale enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Autodescription */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Autodescription (Comment le patient se décrit-il lui-même ?)
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.autodescription || ''}
            onChange={(e) => setFormData({ ...formData, autodescription: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Traits de caractère exprimés, estime de soi, valeurs, tempérament perçu..."
          />
        </div>

        {/* Hétérodescription */}
        <div className="p-3 bg-[#F1F5F7] rounded-xl border border-[#D9E2E8] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Source de l’hétérodescription
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.heterodescriptionSource || ''}
                onChange={(e) => setFormData({ ...formData, heterodescriptionSource: e.target.value })}
                className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Ex: Époux, Frère, Voisinage..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Hétérodescription (Description du patient par l’entourage)
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={formData.heterodescription || ''}
                onChange={(e) => setFormData({ ...formData, heterodescription: e.target.value })}
                className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
                placeholder="Comment l’entourage dépeint-il le patient avant et pendant les troubles ?"
              />
            </div>
          </div>
        </div>

        {/* Relations sociales */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Relations sociales & insertion dans la communauté
          </label>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={formData.relationsSociales || ''}
            onChange={(e) => setFormData({ ...formData, relationsSociales: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Isolement, repli relationnel, conflits de voisinage, participation aux rassemblements..."
          />
        </div>

        {/* Loisirs */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Loisirs, centres d’intérêt et activités culturelles ou sportives
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.loisirs || ''}
            onChange={(e) => setFormData({ ...formData, loisirs: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ex: Football, lecture, chant, artisanat, associations caritatives..."
          />
        </div>

        {/* Conduites addictives */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Conduites addictives & environnement toxique
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.conduitesAddictives || ''}
            onChange={(e) => setFormData({ ...formData, conduitesAddictives: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Fréquentation de grins de thé avec stupéfiants, consommation festive ou solitaire..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            Section rédigée par l'équipe clinique et l'assistant de service social
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S8
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S9)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
