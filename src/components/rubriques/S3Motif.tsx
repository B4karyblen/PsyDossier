import React, { useState } from 'react';
import { S3MotifData } from '../../types';
import { AlertCircle, MessageSquareQuote, Users, HelpCircle } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S3MotifData;
  isReadOnly: boolean;
  onSave: (data: S3MotifData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S3Motif: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S3 · ANAMNÈSE
            </span>
            <span className="text-xs text-[#64748B]">Obligatoire pour validation</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Motif de Consultation Actuel
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Plainte principale formulée par le patient et/ou son entourage
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#BE123C] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Source de formulation */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
          <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
            Origine de la formulation de la plainte <span className="text-[#F43F5E]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Patient', 'Entourage', 'Patient et entourage'] as const).map((source) => (
              <label
                key={source}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.sourcePlainte === source
                    ? 'border-[#10B9A9] bg-white ring-2 ring-[#10B9A9]/20 font-bold text-[#18243A]'
                    : 'border-[#CBD5E1] bg-white text-[#475569] hover:border-[#10B9A9]/50'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <input
                  type="radio"
                  name="sourcePlainte"
                  disabled={isReadOnly}
                  checked={formData.sourcePlainte === source}
                  onChange={() => setFormData({ ...formData, sourcePlainte: source })}
                  className="text-[#10B9A9] focus:ring-[#10B9A9] w-4 h-4"
                />
                <span className="text-xs font-semibold">{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subcard 2: Plainte Principale in extenso */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <MessageSquareQuote className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Plainte Principale (In Extenso) <span className="text-[#F43F5E]">*</span>
            </h3>
          </div>
          <textarea
            rows={5}
            disabled={isReadOnly}
            value={formData.plaintePrincipale}
            onChange={(e) => setFormData({ ...formData, plaintePrincipale: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3.5 focus:outline-none leading-relaxed"
            placeholder="Noter fidèlement les propos du patient et/ou de la famille expliquant la venue en consultation psychiatrique..."
          />
          <span className="text-[11px] text-[#64748B] block font-medium">
            Exemple : « Propos incohérents depuis 3 jours, agitation nocturne, refus de s'alimenter, insomnie totale... »
          </span>
        </div>

        {/* Subcard 3: Accompagnateurs */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <Users className="w-4 h-4 text-[#10B9A9]" />
            <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Accompagnateurs Présents lors de la Consultation
            </label>
          </div>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.accompagnateurs || ''}
            onChange={(e) => setFormData({ ...formData, accompagnateurs: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none"
            placeholder="Ex: Venu accompagné de son frère aîné et de sa mère"
          />
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s3"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
