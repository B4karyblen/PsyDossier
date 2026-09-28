import React, { useState } from 'react';
import { S16ProjetTherapeutiqueData, ProjetTherapeutiqueVersion, UserRole } from '../../types';
import { GitBranch, History, Plus, Target, Users, Calendar } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S16ProjetTherapeutiqueData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S16ProjetTherapeutiqueData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S16ProjetTherapeutique: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S16ProjetTherapeutiqueData>(data);
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [revisionSummary, setRevisionSummary] = useState('');
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);

  const canEdit =
    ['PSYCHIATRE', 'PSYCHOLOGUE', 'ADMIN'].includes(currentUserRole) && !isReadOnly;

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
    // Clear form fields for new version input (keep version history)
    const updated: S16ProjetTherapeutiqueData = {
      ...formData,
      versionCourante: newVersion,
      historiqueVersions: [archived, ...(formData.historiqueVersions || [])],
      objectifsCourtTerme: '',
      objectifsMoyenTerme: '',
      moyensEtStrategies: '',
      echeancesEtRevisions: '',
      intervenants: [],
    };

    setFormData(updated);
    setIsCreatingRevision(false);
    setRevisionSummary('');
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EDF2F7] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S16 · PROJET
            </span>
            <span className="text-xs text-[#64748B]">Objectifs & Planification</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Projet Thérapeutique Personnalisé
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Objectifs à court, moyen et long terme, moyens d'action et planification des réévaluations
          </p>
        </div>

        {/* Version Badge & History toggle */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-extrabold text-[#07988D] bg-[#ECFBF9] px-3 py-1 rounded-xl border border-[#10B9A9]/25 shadow-2xs">
            Version {formData.versionCourante}.0
          </span>
          {formData.historiqueVersions && formData.historiqueVersions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#18243A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#07988D]" />
              <span>Historique ({formData.historiqueVersions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* History Drawer if open */}
      {showHistory && formData.historiqueVersions && (
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider block">
            Versions Antérieures du Projet Thérapeutique
          </span>
          <div className="space-y-2">
            {formData.historiqueVersions.map((v) => (
              <div
                key={v.version}
                className="p-3 bg-white border border-[#E2E8F0] rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-[#18243A]">
                  <span>Version {v.version}.0</span>
                  <span className="text-[#64748B] font-normal">
                    Archivée le {new Date(v.dateHeure).toLocaleDateString('fr-FR')} par {v.auteurNom}
                  </span>
                </div>
                <div className="text-[11px] text-[#475569]">
                  Court terme : {v.objectifsCourtTerme || 'Non précisé'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Objectifs court & moyen terme */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <Target className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Objectifs Thérapeutiques Définis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Objectifs à court terme (Hospitalisation / Phase aiguë)
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.objectifsCourtTerme}
                onChange={(e) => setFormData({ ...formData, objectifsCourtTerme: e.target.value })}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-xl p-3 focus:outline-none"
                placeholder="Ex: Sédation de l'angoisse, rupture du délire, reprise du sommeil, apaisement de l'agitation..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Objectifs à moyen et long terme (Réhabilitation / Autonomie)
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.objectifsMoyenTerme}
                onChange={(e) => setFormData({ ...formData, objectifsMoyenTerme: e.target.value })}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-xl p-3 focus:outline-none"
                placeholder="Ex: Insight, prévention de la rechute, autonomie quotidienne, reprise d'une formation..."
              />
            </div>
          </div>
        </div>

        {/* Subcard 2: Moyens & Stratégies */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider mb-1">
              Moyens et Stratégies Thérapeutiques Mobilisés
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={formData.moyensEtStrategies}
              onChange={(e) => setFormData({ ...formData, moyensEtStrategies: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-xl p-3 focus:outline-none"
              placeholder="Psychopharmacologie, entretiens réguliers, ateliers thérapeutiques, guidance parentale..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Échéances & Révisions programmées
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.echeancesEtRevisions}
                onChange={(e) => setFormData({ ...formData, echeancesEtRevisions: e.target.value })}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none"
                placeholder="Ex: Évaluation clinique hebdomadaire, bilan à 3 mois"
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intervenants: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none"
                placeholder="Ex: Dr. Diallo, Psychologue Traoré, Infirmier Coulibaly..."
              />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s16"
          isReadOnly={!canEdit}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
