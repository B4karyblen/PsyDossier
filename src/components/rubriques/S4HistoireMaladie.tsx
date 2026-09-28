import React, { useState } from 'react';
import { S4HistoireMaladieData } from '../../types';
import { Save, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  data: S4HistoireMaladieData;
  isReadOnly: boolean;
  onSave: (data: S4HistoireMaladieData) => void;
  onNext: () => void;
}

const FACTEURS_OPTIONS = [
  'Stress',
  'Deuil',
  'Rupture sentimentale',
  'Échec',
  'Perte d’emploi',
  'Autre'
];

export const S4HistoireMaladie: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S4HistoireMaladieData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const toggleFacteur = (facteur: string) => {
    if (isReadOnly) return;
    const current = formData.facteursDeclenchants || [];
    if (current.includes(facteur)) {
      setFormData({
        ...formData,
        facteursDeclenchants: current.filter(f => f !== facteur),
        facteursDeclenchantsAutrePrecision: facteur === 'Autre' ? '' : formData.facteursDeclenchantsAutrePrecision
      });
    } else {
      setFormData({
        ...formData,
        facteursDeclenchants: [...current, facteur]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dateDebut) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.dateDebut > today) {
        setError('La date de début des troubles ne peut pas être située dans le futur.');
        return;
      }
    }
    if (formData.facteursDeclenchants.includes('Autre') && !formData.facteursDeclenchantsAutrePrecision?.trim()) {
      setError('Veuillez préciser le facteur déclenchant « Autre » coché (BR-008).');
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
            S4 · ANAMNÈSE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Histoire de la maladie
          </h2>
          <p className="text-xs text-[#64748B]">
            Chronologie de l’épisode actuel, mode d’installation, facteurs déclenchants et itinéraire
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
          Histoire de la maladie enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Date de début et Mode d'installation (BR-007) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Date ou période de début de l’épisode
            </label>
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.dateDebut || ''}
              onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            />
            <span className="text-[11px] text-[#64748B] mt-0.5 block">
              Ne peut pas être postérieure à la date du jour
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Mode d'installation <span className="text-[#F43F5E]">*</span> (BR-007)
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['Brutal', 'Progressif'] as const).map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    formData.modeInstallation === mode
                      ? 'border-[#10B9A9] bg-[#ECFBF9] text-[#07988D] font-bold'
                      : 'border-[#D9E2E8] bg-[#F8FAFC] text-[#18243A] hover:bg-[#F1F5F7]'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <input
                    type="radio"
                    name="modeInstallation"
                    disabled={isReadOnly}
                    checked={formData.modeInstallation === mode}
                    onChange={() => setFormData({ ...formData, modeInstallation: mode })}
                    className="text-[#10B9A9] focus:ring-[#10B9A9]"
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Facteurs déclenchants (BR-008) */}
        <div className="p-4 bg-[#F1F5F7] rounded-xl border border-[#D9E2E8] space-y-3">
          <label className="block text-xs font-bold text-[#18243A]">
            Facteurs déclenchants (Choix multiple - BR-008)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FACTEURS_OPTIONS.map((facteur) => {
              const checked = formData.facteursDeclenchants?.includes(facteur);
              return (
                <label
                  key={facteur}
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
                    onChange={() => toggleFacteur(facteur)}
                    className="rounded text-[#10B9A9] focus:ring-[#10B9A9]"
                  />
                  <span>{facteur}</span>
                </label>
              );
            })}
          </div>

          {formData.facteursDeclenchants?.includes('Autre') && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Préciser le facteur « Autre » <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.facteursDeclenchantsAutrePrecision || ''}
                onChange={(e) => setFormData({ ...formData, facteursDeclenchantsAutrePrecision: e.target.value })}
                className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Ex: Conflit de terre, faillite, accouchement récent..."
              />
            </div>
          )}
        </div>

        {/* Facteurs aggravants */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Facteurs aggravants
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.facteursAggravants || ''}
            onChange={(e) => setFormData({ ...formData, facteursAggravants: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ex: Insomnie invincible, prise de toxiques, tensions relationnelles..."
          />
        </div>

        {/* Itinéraire thérapeutique */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Itinéraire thérapeutique (structures consultées, tradipraticiens, ordre chronologique)
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.itineraireTherapeutique || ''}
            onChange={(e) => setFormData({ ...formData, itineraireTherapeutique: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Ex: 1. Guérisseur traditionnel (fumigations) ; 2. CSCOM de Daoudabougou ; 3. Orientation en psychiatrie..."
          />
        </div>

        {/* Évolution avec / sans traitement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Évolution avec traitement
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={formData.evolutionAvecTraitement || ''}
              onChange={(e) => setFormData({ ...formData, evolutionAvecTraitement: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
              placeholder="Réponse observée lors de traitements antérieurs..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Évolution sans traitement
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={formData.evolutionSansTraitement || ''}
              onChange={(e) => setFormData({ ...formData, evolutionSansTraitement: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
              placeholder="Aggravation, chronicisation, passages à l'acte..."
            />
          </div>
        </div>

        {/* Retentissement socio-professionnel */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Retentissement socio-professionnel
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.retentissementSocioProfessionnel || ''}
            onChange={(e) => setFormData({ ...formData, retentissementSocioProfessionnel: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ex: Arrêt de travail, déscolarisation, rupture des liens familiaux..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            * Mode d'installation obligatoire
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S4
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S5)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
