import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
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
  const [formData, setFormData, form] = useRubriqueForm<S16ProjetTherapeutiqueData>(data);
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
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ink-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S16 · PROJET
            </span>
            <span className="text-xs text-ink-500">Objectifs & Planification</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Projet Thérapeutique Personnalisé
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Objectifs à court, moyen et long terme, moyens d'action et planification des réévaluations
          </p>
        </div>

        {/* Version Badge & History toggle */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-500/25 shadow-2xs">
            Version {formData.versionCourante}.0
          </span>
          {formData.historiqueVersions && formData.historiqueVersions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary btn-sm"
            >
              <History className="w-3.5 h-3.5 text-primary-700" />
              <span>Historique ({formData.historiqueVersions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* History Drawer if open */}
      {showHistory && formData.historiqueVersions && (
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <span className="text-sm font-bold text-ink-900 block">
            Versions Antérieures du Projet Thérapeutique
          </span>
          <div className="space-y-2">
            {formData.historiqueVersions.map((v) => (
              <div
                key={v.version}
                className="p-3 bg-white border border-ink-150 rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-ink-900">
                  <span>Version {v.version}.0</span>
                  <span className="text-ink-500 font-normal">
                    Archivée le {new Date(v.dateHeure).toLocaleDateString('fr-FR')} par {v.auteurNom}
                  </span>
                </div>
                <div className="text-xs text-ink-600">
                  Court terme : {v.objectifsCourtTerme || 'Non précisé'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Objectifs court & moyen terme */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Target className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              Objectifs Thérapeutiques Définis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">
                Objectifs à court terme (Hospitalisation / Phase aiguë)
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.objectifsCourtTerme}
                onChange={(e) => setFormData({ ...formData, objectifsCourtTerme: e.target.value })}
                className="clinical-input w-full"
                placeholder="Ex: Sédation de l'angoisse, rupture du délire, reprise du sommeil, apaisement de l'agitation..."
              />
            </div>

            <div>
              <label className="field-label">
                Objectifs à moyen et long terme (Réhabilitation / Autonomie)
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.objectifsMoyenTerme}
                onChange={(e) => setFormData({ ...formData, objectifsMoyenTerme: e.target.value })}
                className="clinical-input w-full"
                placeholder="Ex: Insight, prévention de la rechute, autonomie quotidienne, reprise d'une formation..."
              />
            </div>
          </div>
        </div>

        {/* Subcard 2: Moyens & Stratégies */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div>
            <label className="field-label">
              Moyens et Stratégies Thérapeutiques Mobilisés
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={formData.moyensEtStrategies}
              onChange={(e) => setFormData({ ...formData, moyensEtStrategies: e.target.value })}
              className="clinical-input w-full"
              placeholder="Psychopharmacologie, entretiens réguliers, ateliers thérapeutiques, guidance parentale..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">
                Échéances & Révisions programmées
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.echeancesEtRevisions}
                onChange={(e) => setFormData({ ...formData, echeancesEtRevisions: e.target.value })}
                className="clinical-input w-full"
                placeholder="Ex: Évaluation clinique hebdomadaire, bilan à 3 mois"
              />
            </div>

            <div>
              <label className="field-label">
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
                className="clinical-input w-full"
                placeholder="Ex: Dr. Diallo, Psychologue Traoré, Infirmier Coulibaly..."
              />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
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
