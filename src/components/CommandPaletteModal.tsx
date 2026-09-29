import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DossierPsychiatrique } from '../types';
import { RUBRIQUES_CONFIG } from '../utils/rules';
import {
  Search,
  User,
  FileText,
  Activity,
  Plus,
  ShieldCheck,
  Database,
  ArrowRight,
  CornerDownLeft,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossiers: DossierPsychiatrique[];
  onSelectDossier: (dossierId: string, targetRubriqueId?: string) => void;
  onOpenNewPatient: () => void;
  onChangeView: (view: 'DASHBOARD' | 'REGISTRE' | 'AUDIT' | 'REFERENTIELS') => void;
  activeDossierId: string | null;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  dossiers,
  onSelectDossier,
  onOpenNewPatient,
  onChangeView,
  activeDossierId,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // handled in parent or toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items: Array<{
      id: string;
      category: 'PATIENT' | 'RUBRIQUE' | 'NAVIGATION' | 'ACTION';
      title: string;
      subtitle: string;
      badge?: string;
      icon: React.ReactNode;
      action: () => void;
    }> = [];

    // Global actions
    items.push({
      id: 'action-new-patient',
      category: 'ACTION',
      title: 'Nouveau Dossier Patient',
      subtitle: 'Créer une nouvelle admission psychiatrique (S1 à S17)',
      badge: 'Action',
      icon: <Plus className="w-4 h-4 text-brand-600" />,
      action: () => {
        onClose();
        onOpenNewPatient();
      },
    });

    items.push({
      id: 'nav-dashboard',
      category: 'NAVIGATION',
      title: 'Tableau de Bord Clinique',
      subtitle: 'Surveillance des indicateurs, vigilance légale et bilans',
      badge: 'Vue',
      icon: <Activity className="w-4 h-4 text-brand-700" />,
      action: () => {
        onClose();
        onChangeView('DASHBOARD');
      },
    });

    items.push({
      id: 'nav-registre',
      category: 'NAVIGATION',
      title: 'Registre des Patients',
      subtitle: 'Liste complète des dossiers actifs et archivés',
      badge: 'Vue',
      icon: <User className="w-4 h-4 text-ink-900" />,
      action: () => {
        onClose();
        onChangeView('REGISTRE');
      },
    });

    items.push({
      id: 'nav-audit',
      category: 'NAVIGATION',
      title: 'Journal d’Audit & Traçabilité',
      subtitle: 'Historique légal des accès, validations et exports (BR-016)',
      badge: 'Audit',
      icon: <ShieldCheck className="w-4 h-4 text-violet-500" />,
      action: () => {
        onClose();
        onChangeView('AUDIT');
      },
    });

    items.push({
      id: 'nav-referentiels',
      category: 'NAVIGATION',
      title: 'Référentiels & Nomenclatures (CIM-10)',
      subtitle: 'Paramétrage des classifications médicales et listes de valeurs',
      badge: 'Admin',
      icon: <Database className="w-4 h-4 text-amber-500" />,
      action: () => {
        onClose();
        onChangeView('REFERENTIELS');
      },
    });

    // Rubriques (if active dossier or just rubrique navigation)
    RUBRIQUES_CONFIG.forEach((r) => {
      items.push({
        id: `rubrique-${r.id}`,
        category: 'RUBRIQUE',
        title: `${r.code} · ${r.titre}`,
        subtitle: r.description,
        badge: 'Rubrique',
        icon: <FileText className="w-4 h-4 text-brand-600" />,
        action: () => {
          onClose();
          if (activeDossierId) {
            onSelectDossier(activeDossierId, r.id);
          } else if (dossiers.length > 0) {
            onSelectDossier(dossiers[0].id, r.id);
          }
        },
      });
    });

    // Patients
    dossiers.forEach((d) => {
      const diagPrincipal = d.s12HypothesesDiag.hypotheses?.find((h) => h.type === 'Principale');
      items.push({
        id: `patient-${d.id}`,
        category: 'PATIENT',
        title: `${d.s1Identification.nom} ${d.s1Identification.prenoms}`,
        subtitle: `${d.s1Identification.numeroOrdre} · ${d.s1Identification.age} ans · ${
          diagPrincipal ? diagPrincipal.libelle : d.s2Modalites.modalite
        }`,
        badge: d.statut,
        icon: <User className="w-4 h-4 text-brand-700" />,
        action: () => {
          onClose();
          onSelectDossier(d.id, 's1');
        },
      });
    });

    if (!q) {
      // Prioritize actions, navigation, and first few patients
      return items.slice(0, 12);
    }

    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
      )
      .slice(0, 16);
  }, [query, dossiers, activeDossierId, onClose, onOpenNewPatient, onChangeView, onSelectDossier]);

  // Navigate with keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto no-print">
      <div
        className="w-full max-w-2xl bg-ink-800 rounded-2xl shadow-2xl border border-ink-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-ink-700 gap-3 bg-ink-950">
          <Search className="w-5 h-5 text-brand-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un patient, un N° d'ordre, une rubrique (S1..S17), ou une action..."
            className="w-full text-body font-medium text-white placeholder-slate-500 bg-transparent outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-body-sm text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-caption font-semibold text-slate-400 bg-ink-700 px-2 py-0.5 rounded border border-ink-600">
              ESC pour fermer
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-ink-700">
          {results.length > 0 ? (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-500/15 text-brand-600'
                      : 'hover:bg-ink-700 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-brand-500/20 text-brand-600'
                          : 'bg-ink-700 text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-body-sm font-bold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span
                            className={`text-caption font-medium px-1.5 py-0.2 rounded ${
                              item.badge === 'VALIDÉ'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : item.badge === 'EN_COURS'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-ink-700 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-caption text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    {isSelected && (
                      <span className="text-caption font-medium text-brand-600 flex items-center gap-1">
                        Ouvrir <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-body-sm text-slate-400">
              Aucun résultat trouvé pour « {query} ».
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-ink-950 border-t border-ink-700 flex items-center justify-between text-caption text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ pour naviguer</span>
            <span>↵ pour sélectionner</span>
            <span>ESC pour fermer</span>
          </div>
          <span className="font-bold text-brand-600">PsyDossier Navigation Rapide</span>
        </div>
      </div>
    </div>
  );
};
