import React, { useState } from 'react';
import { S16ProjetTherapeutiqueData, ProjetTherapeutiqueVersion, UserRole } from '../../types';
import { Save, ChevronRight, GitBranch, History, Plus } from 'lucide-react';

interface Props {
  data: S16ProjetTherapeutiqueData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S16ProjetTherapeutiqueData) => void;
  onNext: () => void;
}

export const S16ProjetTherapeutique: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S16ProjetTherapeutiqueData>(data);
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [revisionSummary, setRevisionSummary] = useState('');
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);

  const canEdit = ['PSYCHIATRE', 'PSYCHOLOGUE', 'ADMIN'].includes(currentUserRole) && !isReadOnly;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateNewVersion = () => {
    if (!revisionSummary.trim()) return;

    // Archive current version
    const archived: ProjetTherapeutiqueVersion = {
      version: formData.versionCourante,
      dateHeure: new Date().toISOString(),
      auteurNom: currentUserName,
      auteurRole: currentUserRole,
      objectifsCourtTerme: formData.objectifsCourtTerme,
      objectifsMoyenTerme: formData.objectifsMoyenTerme,
      moyensEtStrategies: formData.moyensEtStrategies,
      echeancesEtRevisions: formData.echeancesEtRevisions,
      intervenants: formData.intervenants || [],
    };

    const newVersion = formData.versionCourante + 1;
    const updated: S16ProjetTherapeutiqueData = {
      ...formData,
      versionCourante: newVersion,
      historiqueVersions: [archived, ...(formData.historiqueVersions || [])]
    };

    setFormData(updated);
    setIsCreatingRevision(false);
    setRevisionSummary('');
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S16 · PLANIFICATION
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-base font-bold text-[#18243A]">
              Projet thérapeutique individualisé
            </h2>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F1F5F7] text-[#07988D] border border-[#D9E2E8]">
              Version {formData.versionCourante}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Objectifs partagés, moyens déployés, échéances et versioning pluridisciplinaire
          </p>
        </div>

        <div className="flex items-center gap-2">
          {formData.historiqueVersions?.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="px-2.5 py-1.5 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-[#64748B]" />
              Historique ({formData.historiqueVersions.length})
            </button>
          )}

          {canEdit && !isCreatingRevision && (
            <button
              type="button"
              onClick={() => setIsCreatingRevision(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] border border-[#10B9A9]/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Réviser (v{formData.versionCourante + 1})
            </button>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Projet thérapeutique enregistré avec succès.
        </div>
      )}

      {/* Modal / Banner de création de nouvelle révision */}
      {isCreatingRevision && (
        <div className="mb-5 p-4 bg-[#ECFBF9] border border-[#10B9A9] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#07988D] flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" />
              Création d'une nouvelle version révisée (Version {formData.versionCourante + 1})
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingRevision(false)}
              className="text-xs text-[#64748B] hover:text-[#18243A]"
            >
              Annuler
            </button>
          </div>
          <p className="text-xs text-[#18243A]">
            La version actuelle v{formData.versionCourante} sera archivée dans l'historique inaltérable avec la date et le signataire.
          </p>
          <input
            type="text"
            value={revisionSummary}
            onChange={(e) => setRevisionSummary(e.target.value)}
            placeholder="Motif de la révision (ex: Réévaluation suite à sortie d'hospitalisation)..."
            className="w-full text-xs bg-white border border-[#D9E2E8] rounded-lg p-2.5"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCreateNewVersion}
              disabled={!revisionSummary.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] disabled:opacity-50 rounded-lg"
            >
              Confirmer et incrémenter la version
            </button>
          </div>
        </div>
      )}

      {/* Historique des versions */}
      {showHistory && (
        <div className="mb-6 p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            Historique des versions archivées
          </h3>
          <div className="space-y-2">
            {formData.historiqueVersions.map((hist) => (
              <div key={hist.version} className="p-3 bg-white border border-[#D9E2E8] rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#18243A]">Version {hist.version}</span>
                  <span className="text-[11px] text-[#64748B]">
                    Archivée le {new Date(hist.dateHeure).toLocaleDateString('fr-FR')} par {hist.auteurNom}
                  </span>
                </div>
                <p className="text-[#64748B] italic">Court terme : {hist.objectifsCourtTerme}</p>
                <p className="text-[#64748B] italic">Moyens : {hist.moyensEtStrategies}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Objectifs court terme */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Objectifs thérapeutiques à court terme (0 - 3 mois)
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={formData.objectifsCourtTerme}
            onChange={(e) => setFormData({ ...formData, objectifsCourtTerme: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Ex: Réduction de l’angoisse, normalisation du rythme veille-sommeil, consolidation de l'alliance..."
          />
        </div>

        {/* Objectifs moyen terme */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Objectifs thérapeutiques à moyen et long terme (6 - 12 mois)
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={formData.objectifsMoyenTerme}
            onChange={(e) => setFormData({ ...formData, objectifsMoyenTerme: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Ex: Réinsertion professionnelle, prévention des rechutes, autonomisation sociale..."
          />
        </div>

        {/* Moyens et stratégies */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Moyens, dispositifs et stratégies thérapeutiques mobilisés
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={formData.moyensEtStrategies}
            onChange={(e) => setFormData({ ...formData, moyensEtStrategies: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Ex: Consultations médicales régulières, entretiens psychologiques, médiation familiale, accompagnement social..."
          />
        </div>

        {/* Échéances et révisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Échéances prévues & date de révision programmée
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.echeancesEtRevisions}
              onChange={(e) => setFormData({ ...formData, echeancesEtRevisions: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ex: Évaluation semestrielle en décembre 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Intervenants clés impliqués
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.intervenants?.join(', ') || ''}
              onChange={(e) => setFormData({
                ...formData,
                intervenants: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ex: Dr. Diallo, K. Traoré, F. Coulibaly..."
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            Projet thérapeutique pluridisciplinaire versionné
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S16
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S17)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
