import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
import { S7BiographieData, FratrieItem, ConjointItem, EnfantItem } from '../../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S7BiographieData;
  patientSexe: 'Masculin' | 'Féminin';
  isReadOnly: boolean;
  onSave: (data: S7BiographieData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S7Biographie: React.FC<Props> = ({
  data,
  patientSexe,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
}) => {

  const [formData, setFormData, form] = useRubriqueForm<S7BiographieData>(data);
  const [isSaved, setIsSaved] = useState(false);
  const [newPositif, setNewPositif] = useState('');
  const [newNegatif, setNewNegatif] = useState('');

  // Fratrie helpers
  const addFrereSoeur = () => {
    if (isReadOnly) return;
    const newItem: FratrieItem = {
      id: 'fr-' + Date.now(),
      nom: '',
      age: undefined,
      sexe: 'M',
      rang: (formData.collateraux.fratrie?.length || 0) + 1,
      profession: '',
      vivant: true,
    };
    setFormData((prev) => ({
      ...prev,
      collateraux: {
        ...prev.collateraux,
        fratrie: [...(prev.collateraux.fratrie || []), newItem],
      },
    }));
  };

  const removeFrereSoeur = (id: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      collateraux: {
        ...prev.collateraux,
        fratrie: prev.collateraux.fratrie.filter((f) => f.id !== id),
      },
    }));
  };

  const updateFrereSoeur = (id: string, updates: Partial<FratrieItem>) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      collateraux: {
        ...prev.collateraux,
        fratrie: prev.collateraux.fratrie.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      },
    }));
  };

  // Conjoint helpers
  const addConjoint = () => {
    if (isReadOnly) return;
    const newItem: ConjointItem = {
      id: 'conj-' + Date.now(),
      nom: '',
      statut: 'Actuel',
      dureeUnion: '',
    };
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        conjoints: [...(prev.developpementSexuelEtSentimentale.conjoints || []), newItem],
      },
    }));
  };

  const removeConjoint = (id: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        conjoints: prev.developpementSexuelEtSentimentale.conjoints.filter((c) => c.id !== id),
      },
    }));
  };

  // Enfant helpers
  const addEnfant = () => {
    if (isReadOnly) return;
    const newItem: EnfantItem = {
      id: 'enf-' + Date.now(),
      nom: '',
      age: undefined,
      sexe: 'M',
    };
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        enfants: [...(prev.developpementSexuelEtSentimentale.enfants || []), newItem],
      },
    }));
  };

  const removeEnfant = (id: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        enfants: prev.developpementSexuelEtSentimentale.enfants.filter((e) => e.id !== id),
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const declaredBroCount = formData.collateraux.nombreFreresSoeursDeclares || 0;
  const listBroCount = formData.collateraux.fratrie?.length || 0;
  const hasFratrieMismatch = declaredBroCount > 0 && listBroCount > 0 && declaredBroCount !== listBroCount;

  return (
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S7 · DÉVELOPPEMENT
            </span>
            <span className="text-xs text-ink-500">8 sections de vie</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Éléments de Biographie Clinique
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Histoire de vie, ascendants, collatéraux, scolarité, parcours affectif et événements marquants
          </p>
        </div>
      </div>


      {isSaved && (
        <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-500/30 rounded-lg text-xs text-emerald-700 font-medium">
          Biographie enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Ascendants */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <h3 className="text-base font-bold text-ink-900">
            1. Ascendants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Père */}
            <div className="p-3 bg-white border border-ink-150 rounded-lg space-y-2">
              <span className="text-xs font-bold text-ink-900">Père</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.pere.nom}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      pere: { ...formData.ascendants.pere, nom: e.target.value }
                    }
                  })}
                  className="clinical-input"
                  placeholder="Nom & prénom du père"
                />
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={formData.ascendants.pere.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      pere: { ...formData.ascendants.pere, age: parseInt(e.target.value) || undefined }
                    }
                  })}
                  className="clinical-input"
                  placeholder="Âge"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.pere.profession || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      pere: { ...formData.ascendants.pere, profession: e.target.value }
                    }
                  })}
                  className="clinical-input"
                  placeholder="Profession"
                />
                <label className="flex items-center gap-2 text-xs text-ink-900">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={formData.ascendants.pere.vivant}
                    onChange={(e) => setFormData({
                      ...formData,
                      ascendants: {
                        ...formData.ascendants,
                        pere: { ...formData.ascendants.pere, vivant: e.target.checked }
                      }
                    })}
                    className="rounded text-primary-600"
                  />
                  <span>Vivant</span>
                </label>
              </div>
            </div>

            {/* Mère */}
            <div className="p-3 bg-white border border-ink-150 rounded-lg space-y-2">
              <span className="text-xs font-bold text-ink-900">Mère</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.mere.nom}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      mere: { ...formData.ascendants.mere, nom: e.target.value }
                    }
                  })}
                  className="clinical-input"
                  placeholder="Nom & prénom de la mère"
                />
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={formData.ascendants.mere.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      mere: { ...formData.ascendants.mere, age: parseInt(e.target.value) || undefined }
                    }
                  })}
                  className="clinical-input"
                  placeholder="Âge"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.mere.profession || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      mere: { ...formData.ascendants.mere, profession: e.target.value }
                    }
                  })}
                  className="clinical-input"
                  placeholder="Profession"
                />
                <label className="flex items-center gap-2 text-xs text-ink-900">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={formData.ascendants.mere.vivant}
                    onChange={(e) => setFormData({
                      ...formData,
                      ascendants: {
                        ...formData.ascendants,
                        mere: { ...formData.ascendants.mere, vivant: e.target.checked }
                      }
                    })}
                    className="rounded text-primary-600"
                  />
                  <span>Vivante</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Collatéraux & Fratrie utérine */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink-900">
              2. Collatéraux & Fratrie utérine
            </h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addFrereSoeur}
                className="text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ajouter un frère/sœur
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="field-label">
                Place du patient dans la fratrie utérine (rang)
              </label>
              <input
                type="number"
                min="1"
                disabled={isReadOnly}
                value={formData.collateraux.placeFratrieUterine || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  collateraux: {
                    ...formData.collateraux,
                    placeFratrieUterine: parseInt(e.target.value) || undefined
                  }
                })}
                className="clinical-input w-full"
                placeholder="Ex: 2 (cadet, aîné...)"
              />
            </div>

            <div>
              <label className="field-label">
                Nombre total de frères et sœurs déclarés
              </label>
              <input
                type="number"
                min="0"
                disabled={isReadOnly}
                value={formData.collateraux.nombreFreresSoeursDeclares || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  collateraux: {
                    ...formData.collateraux,
                    nombreFreresSoeursDeclares: parseInt(e.target.value) || undefined
                  }
                })}
                className="clinical-input w-full"
                placeholder="Ex: 4"
              />
            </div>
          </div>

          {hasFratrieMismatch && (
            <div className="p-2 bg-amber-100 border border-amber-500/30 rounded text-xs text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Attention : {declaredBroCount} frères et sœurs déclarés, mais {listBroCount} répertoriés ci-dessous (avertissement non bloquant).
              </span>
            </div>
          )}

          {/* Liste répétable de la fratrie */}
          {formData.collateraux.fratrie && formData.collateraux.fratrie.length > 0 && (
            <div className="space-y-2 mt-2">
              {formData.collateraux.fratrie.map((frere) => (
                <div key={frere.id} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={frere.nom}
                    onChange={(e) => updateFrereSoeur(frere.id, { nom: e.target.value })}
                    className="clinical-input flex-1 min-w-[160px]"
                    placeholder="Nom du frère / sœur"
                  />
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={frere.age || ''}
                    onChange={(e) => updateFrereSoeur(frere.id, { age: parseInt(e.target.value) || undefined })}
                    className="clinical-input !w-20 shrink-0"
                    placeholder="Âge"
                  />
                  <select
                    disabled={isReadOnly}
                    value={frere.sexe}
                    onChange={(e) => updateFrereSoeur(frere.id, { sexe: e.target.value as 'M' | 'F' })}
                    className="clinical-input !w-20 shrink-0"
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={frere.profession || ''}
                    onChange={(e) => updateFrereSoeur(frere.id, { profession: e.target.value })}
                    className="clinical-input flex-1 min-w-[100px]"
                    placeholder="Profession"
                  />
                  <label className="flex items-center gap-1 text-xs text-ink-500">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={frere.vivant}
                      onChange={(e) => updateFrereSoeur(frere.id, { vivant: e.target.checked })}
                      className="rounded text-primary-600"
                    />
                    <span>Vivant</span>
                  </label>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeFrereSoeur(frere.id)}
                      className="text-rose-700 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Conception, grossesse & accouchement */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-2">
          <h3 className="text-base font-bold text-ink-900">
            3. Conception, grossesse et accouchement du patient
          </h3>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={formData.conceptionGrossesseAccouchement || ''}
            onChange={(e) => setFormData({ ...formData, conceptionGrossesseAccouchement: e.target.value })}
            className="clinical-input w-full"
            placeholder="Désir d'enfant, déroulement de la grossesse, terme, voie basse/césarienne, réanimation néonatale..."
          />
        </div>

        {/* 4. Développement psychomoteur */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <h3 className="text-base font-bold text-ink-900">
            4. Développement psychomoteur
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="field-label">
                Âge de la marche
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementPsychomoteur?.marche || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementPsychomoteur: { ...formData.developpementPsychomoteur, marche: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: 12-14 mois"
              />
            </div>
            <div>
              <label className="field-label">
                Âge d'acquisition du langage
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementPsychomoteur?.langage || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementPsychomoteur: { ...formData.developpementPsychomoteur, langage: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: Phrases vers 2 ans"
              />
            </div>
            <div>
              <label className="field-label">
                Propreté sphinctérienne
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementPsychomoteur?.proprete || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementPsychomoteur: { ...formData.developpementPsychomoteur, proprete: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: Vers 2 ans et demi"
              />
            </div>
          </div>
        </div>

        {/* 5. Scolarité */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <h3 className="text-base font-bold text-ink-900">
            5. Scolarité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="field-label">
                Âge de début de scolarisation
              </label>
              <input
                type="number"
                disabled={isReadOnly}
                value={formData.scolarite.debutAge || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, debutAge: parseInt(e.target.value) || undefined }
                })}
                className="clinical-input w-full"
                placeholder="Ex: 6 ans"
              />
            </div>
            <div>
              <label className="field-label">
                Niveau scolaire atteint
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.niveauAtteint || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, niveauAtteint: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: Terminale, Université..."
              />
            </div>
            <div>
              <label className="field-label">
                Diplômes obtenus
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.diplomes || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, diplomes: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: DEF, Bac, Licence..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="field-label">
                Échecs ou redoublements
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.echecsScolaires || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, echecsScolaires: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Classes redoublées, abandons..."
              />
            </div>
            <div>
              <label className="field-label">
                Vécu psychologique des échecs
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.vecuDesEchecs || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, vecuDesEchecs: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Réaction familiale, dévalorisation..."
              />
            </div>
          </div>
        </div>

        {/* 6. Développement ultérieur et parcours professionnel */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-2">
          <h3 className="text-base font-bold text-ink-900">
            6. Développement ultérieur et parcours professionnel
          </h3>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={formData.developpementProfessionnel || ''}
            onChange={(e) => setFormData({ ...formData, developpementProfessionnel: e.target.value })}
            className="clinical-input w-full"
            placeholder="Historique des emplois, stabilité, relations avec collègues et hiérarchie..."
          />
        </div>

        {/* 7. Développement sexuel et sentimental (BR-003: Ménarche vs Spermarche) */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink-900">
              7. Développement sexuel et adaptation sentimentale
            </h3>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    onClick={addConjoint}
                    className="text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded"
                  >
                    + Conjoint(e)
                  </button>
                  <button
                    type="button"
                    onClick={addEnfant}
                    className="text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded"
                  >
                    + Enfant
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Conditionnel au sexe (BR-003) */}
            {patientSexe === 'Féminin' ? (
              <div>
                <label className="field-label">
                  Âge de la ménarche (premières règles) <span className="text-primary-700 font-mono text-xs">(Féminin)</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.developpementSexuelEtSentimentale.menarcheAge || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    developpementSexuelEtSentimentale: {
                      ...formData.developpementSexuelEtSentimentale,
                      menarcheAge: e.target.value
                    }
                  })}
                  className="clinical-input w-full"
                  placeholder="Ex: 13 ans"
                />
              </div>
            ) : (
              <div>
                <label className="field-label">
                  Âge de la spermarche (premières éjaculations) <span className="text-primary-700 font-mono text-xs">(Masculin)</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.developpementSexuelEtSentimentale.spermarcheAge || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    developpementSexuelEtSentimentale: {
                      ...formData.developpementSexuelEtSentimentale,
                      spermarcheAge: e.target.value
                    }
                  })}
                  className="clinical-input w-full"
                  placeholder="Ex: 14 ans"
                />
              </div>
            )}

            <div>
              <label className="field-label">
                Premier rapport sexuel (conditions & vécu)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementSexuelEtSentimentale.premierRapportConditionsVecu || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementSexuelEtSentimentale: {
                    ...formData.developpementSexuelEtSentimentale,
                    premierRapportConditionsVecu: e.target.value
                  }
                })}
                className="clinical-input w-full"
                placeholder="Consentement, âge, traumatisme éventuel..."
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              Principales relations amoureuses et histoire du couple
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.developpementSexuelEtSentimentale.principalesRelationsAmoureuses || ''}
              onChange={(e) => setFormData({
                ...formData,
                developpementSexuelEtSentimentale: {
                  ...formData.developpementSexuelEtSentimentale,
                  principalesRelationsAmoureuses: e.target.value
                }
              })}
              className="clinical-input w-full"
              placeholder="Ex: Marié depuis 8 ans, vie conjugale harmonieuse..."
            />
          </div>

          {/* Conjoints */}
          {formData.developpementSexuelEtSentimentale.conjoints?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-ink-500">Conjoint(e)s identifié(e)s :</span>
              {formData.developpementSexuelEtSentimentale.conjoints.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={c.nom}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.conjoints.map(x => x.id === c.id ? { ...x, nom: e.target.value } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, conjoints: updated } });
                    }}
                    className="clinical-input flex-1"
                    placeholder="Nom du conjoint"
                  />
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={c.statut}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.conjoints.map(x => x.id === c.id ? { ...x, statut: e.target.value } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, conjoints: updated } });
                    }}
                    className="clinical-input w-28"
                    placeholder="Statut (Actuel, Ex...)"
                  />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeConjoint(c.id)} className="text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Enfants */}
          {formData.developpementSexuelEtSentimentale.enfants?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-ink-500">Enfants identifiés :</span>
              {formData.developpementSexuelEtSentimentale.enfants.map((enf) => (
                <div key={enf.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={enf.nom}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.enfants.map(x => x.id === enf.id ? { ...x, nom: e.target.value } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, enfants: updated } });
                    }}
                    className="clinical-input flex-1"
                    placeholder="Nom / Prénom de l’enfant"
                  />
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={enf.age || ''}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.enfants.map(x => x.id === enf.id ? { ...x, age: parseInt(e.target.value) || undefined } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, enfants: updated } });
                    }}
                    className="clinical-input !w-20 shrink-0"
                    placeholder="Âge"
                  />
                  <select
                    disabled={isReadOnly}
                    value={enf.sexe}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.enfants.map(x => x.id === enf.id ? { ...x, sexe: e.target.value as 'M' | 'F' } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, enfants: updated } });
                    }}
                    className="clinical-input !w-20 shrink-0"
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeEnfant(enf.id)} className="text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Événements marquants positifs et négatifs */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <h3 className="text-base font-bold text-ink-900">
            8. Événements marquants de la vie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positifs */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-700 block">Événements positifs</span>
              <ul className="space-y-1">
                {formData.evenementsMarquants.positifs?.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-ink-150">
                    <span>• {item}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            positifs: formData.evenementsMarquants.positifs.filter((_, i) => i !== idx)
                          }
                        })}
                        className="text-ink-400 hover:text-rose-700"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {!isReadOnly && (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newPositif}
                    onChange={(e) => setNewPositif(e.target.value)}
                    className="clinical-input flex-1"
                    placeholder="Ajouter un événement positif..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPositif.trim()) {
                        setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            positifs: [...(formData.evenementsMarquants.positifs || []), newPositif.trim()]
                          }
                        });
                        setNewPositif('');
                      }
                    }}
                    className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 font-semibold rounded hover:bg-emerald-200"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Négatifs */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-rose-700 block">Événements négatifs / traumatismes</span>
              <ul className="space-y-1">
                {formData.evenementsMarquants.negatifs?.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-ink-150">
                    <span>• {item}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            negatifs: formData.evenementsMarquants.negatifs.filter((_, i) => i !== idx)
                          }
                        })}
                        className="text-ink-400 hover:text-rose-700"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {!isReadOnly && (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newNegatif}
                    onChange={(e) => setNewNegatif(e.target.value)}
                    className="clinical-input flex-1"
                    placeholder="Ajouter un événement négatif..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newNegatif.trim()) {
                        setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            negatifs: [...(formData.evenementsMarquants.negatifs || []), newNegatif.trim()]
                          }
                        });
                        setNewNegatif('');
                      }
                    }}
                    className="px-2 py-1 text-xs bg-rose-100 text-rose-700 font-semibold rounded hover:bg-rose-200"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
          currentRubriqueId="s7"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};

