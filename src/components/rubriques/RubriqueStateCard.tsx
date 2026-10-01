import React from 'react';
import { EyeOff, FilePlus2, FileText } from 'lucide-react';
import { RUBRIQUES_CONFIG } from '../../utils/rules';

/**
 * Shown in place of a rubrique form (PRD B4):
 * - 'restricted': the role has no access to this rubrique (B2 « X »).
 * - 'empty': nothing entered yet — « Non renseigné » + « Renseigner ».
 */
export const RubriqueStateCard: React.FC<{
  rubriqueId: string;
  kind: 'restricted' | 'empty';
  canEdit: boolean;
  onStart: () => void;
}> = ({ rubriqueId, kind, canEdit, onStart }) => {
  const rubrique = RUBRIQUES_CONFIG.find((r) => r.id === rubriqueId);
  const Icon = kind === 'restricted' ? EyeOff : FileText;

  return (
    <section className="clinical-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="chip chip-neutral tabular-nums">{rubrique?.code}</span>
        <span className="text-xs text-ink-500">{rubrique?.bloc}</span>
      </div>
      <h2 className="text-h2 text-ink-900 mt-2">{rubrique?.titre}</h2>
      <p className="text-base text-ink-500 mt-1">{rubrique?.description}</p>

      <div className="clinical-subcard mt-6 py-10 flex flex-col items-center text-center">
        <span className="icon-tile tile-ink !w-11 !h-11">
          <Icon className="w-5 h-5" />
        </span>
        {kind === 'restricted' ? (
          <>
            <p className="mt-4 text-lg font-bold text-ink-900">Accès restreint</p>
            <p className="mt-1 text-base text-ink-600 max-w-md">
              Votre rôle ne donne pas accès au contenu de cette rubrique (données de santé sensibles, BR-016).
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 text-lg font-bold text-ink-900">Non renseigné</p>
            <p className="mt-1 text-base text-ink-600 max-w-md">
              {canEdit
                ? 'Aucune information n’a encore été saisie dans cette rubrique.'
                : 'Aucune information n’a encore été saisie. Vous n’êtes pas autorisé à la renseigner.'}
            </p>
            {canEdit && (
              <button type="button" onClick={onStart} className="btn-primary mt-5">
                <FilePlus2 className="w-4 h-4" />
                Renseigner
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};
