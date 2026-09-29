import React, { useState, useMemo } from 'react';
import { AuditEntry, AuditAction } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditEntry[];
  onSelectDossier?: (dossierId: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onSelectDossier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('TOUTES');

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (actionFilter !== 'TOUTES' && log.action !== actionFilter) return false;
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchesUser = log.userName.toLowerCase().includes(query);
          const matchesOrder = log.patientNumeroOrdre.toLowerCase().includes(query);
          const matchesDetails = log.details.toLowerCase().includes(query);
          const matchesRubrique = (log.rubriqueNom || '').toLowerCase().includes(query);
          if (!matchesUser && !matchesOrder && !matchesDetails && !matchesRubrique) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, actionFilter]);

  // Metrics for top status chips
  const metrics = useMemo(() => {
    const total = logs.length;
    const validations = logs.filter((l) => l.action === 'VALIDATION').length;
    const modifications = logs.filter((l) => l.action === 'MODIFICATION').length;
    const exports = logs.filter((l) => l.action === 'EXPORT').length;
    const creations = logs.filter((l) => l.action === 'CREATION').length;
    return { total, validations, modifications, exports, creations };
  }, [logs]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'VALIDATION':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'MODIFICATION':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'CREATION':
        return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'ADDENDUM':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ARCHIVAGE':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'REACTIVATION':
        return 'bg-brand-100 text-brand-800 border-brand-300';
      case 'EXPORT':
        return 'bg-ink-100 text-ink-700 border-ink-200';
      case 'LECTURE':
        return 'bg-ink-25 text-ink-500 border-ink-150';
      default:
        return 'bg-ink-25 text-ink-500 border-ink-150';
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-ink-900 tracking-tight">Journal d'audit & traçabilité</h2>
            <span className="chip bg-brand-100 text-brand-800">
              <Lock className="w-3 h-3" /> Inaltérable
            </span>
          </div>
          <p className="text-sm text-ink-500 font-medium mt-1">
            Règles de conformité légale <strong className="text-ink-800">BR-012</strong> &{' '}
            <strong className="text-ink-800">BR-016</strong> · journal médico-légal horodaté
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Événements', value: metrics.total, icon: Activity, tile: 'tile-ink' },
          { label: 'Validations', value: metrics.validations, icon: CheckCircle2, tile: 'tile-brand' },
          { label: 'Mises à jour', value: metrics.modifications, icon: Clock, tile: 'tile-sky' },
          { label: 'Exports', value: metrics.exports, icon: Printer, tile: 'tile-violet' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="clinical-card p-4 flex items-center gap-3.5">
              <span className={`icon-tile ${m.tile}`}>
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink-500">{m.label}</div>
                <div className="text-2xl font-extrabold text-ink-900 tabular-nums leading-tight">{m.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Search & Action Filter Controls */}
      <div className="clinical-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par praticien, N° patient (PSY-...), libellé rubrique ou mot-clé..."
              aria-label="Rechercher dans le journal"
              className="clinical-input w-full pl-10 pr-4 text-body-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="clinical-input pr-8 text-body-sm font-semibold bg-white cursor-pointer"
              >
                <option value="TOUTES">Toutes les actions ({logs.length})</option>
                <option value="VALIDATION">Validation officielle</option>
                <option value="MODIFICATION">Mise à jour rubrique</option>
                <option value="CREATION">Création de dossier</option>
                <option value="ADDENDUM">Addendum consigné</option>
                <option value="ARCHIVAGE">Archivage</option>
                <option value="REACTIVATION">Réactivation</option>
                <option value="EXPORT">Exportation / Impression</option>
                <option value="LECTURE">Consultation / Lecture</option>
              </select>
            </div>

            {(searchTerm || actionFilter !== 'TOUTES') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter('TOUTES');
                }}
                className="px-3 py-2 text-body-sm font-bold text-ink-500 hover:text-ink-900 bg-ink-100 hover:bg-ink-150 rounded-xl transition-colors cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Quick filter pill buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-ink-100">
          <span className="text-xs font-bold text-ink-400 mr-1">Raccourcis</span>
          {(['TOUTES', 'VALIDATION', 'MODIFICATION', 'ADDENDUM', 'EXPORT', 'ARCHIVAGE'] as const).map((act) => {
            const count = act === 'TOUTES' ? logs.length : logs.filter((l) => l.action === act).length;
            const isSelected = actionFilter === act;
            return (
              <button
                key={act}
                type="button"
                onClick={() => setActionFilter(act)}
                className={`px-3.5 !min-h-9 rounded-full text-[13px] font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-ink-900 text-white shadow-xs'
                    : 'bg-ink-25 text-ink-500 hover:bg-ink-100 hover:text-ink-900 border border-ink-150'
                }`}
              >
                {act === 'TOUTES' ? 'Tous' : act.charAt(0) + act.slice(1).toLowerCase()}
                <span className={`ml-1.5 text-caption font-mono ${isSelected ? 'text-brand-300' : 'text-ink-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Audit Log Entries Table */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-ink-25 border-b border-ink-150 text-xs font-bold text-ink-500">
                <th className="py-3.5 px-4 sm:px-6">Date & Horodatage</th>
                <th className="py-3.5 px-4 sm:px-6">Praticien / Rôle</th>
                <th className="py-3.5 px-4 sm:px-6">Patient Réf.</th>
                <th className="py-3.5 px-4 sm:px-6">Action</th>
                <th className="py-3.5 px-4 sm:px-6">Rubrique</th>
                <th className="py-3.5 px-4 sm:px-6">Détails & Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center mx-auto text-ink-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-body text-ink-900">Aucun événement ne correspond à ce filtre</p>
                      <p className="text-body-sm text-ink-500">Modifiez votre recherche ou réinitialisez les filtres.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setActionFilter('TOUTES');
                        }}
                        className="mt-2 px-3 py-1.5 text-body-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Afficher tout le journal
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const isRecent = Date.now() - dateObj.getTime() < 3600000; // less than 1 hour

                  return (
                    <tr key={log.id} className="hover:bg-ink-25/80 transition-colors group">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 sm:px-6 text-mono text-caption text-ink-600 whitespace-nowrap tabular-nums">
                        <div className="flex items-center gap-1.5 font-bold text-ink-900">
                          <Calendar className="w-3 h-3 text-ink-400" />
                          {dateObj.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-caption text-ink-500 pl-4 flex items-center gap-1">
                          {dateObj.toLocaleTimeString('fr-FR')}
                          {isRecent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" title="Récemment consigné" />
                          )}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-ink-100 text-ink-900 flex items-center justify-center text-caption font-extrabold border border-ink-150">
                            {log.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-ink-900 leading-tight">{log.userName}</div>
                            <div className="text-caption text-brand-700 font-mono font-semibold">{log.userRole}</div>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectDossier?.(log.dossierId)}
                          className="text-mono font-bold text-ink-900 hover:text-brand-700 hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                          title="Ouvrir le dossier patient"
                        >
                          <span>{log.patientNumeroOrdre}</span>
                          <ArrowRight className="w-3 h-3 text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-caption font-extrabold tracking-wide border shadow-2xs ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Rubrique */}
                      <td className="py-3.5 px-4 sm:px-6 text-ink-600 font-medium whitespace-nowrap text-body-sm">
                        {log.rubriqueNom ? (
                          <span className="px-2 py-0.5 rounded bg-ink-100 border border-ink-150 text-body-sm font-semibold text-ink-900">
                            {log.rubriqueNom}
                          </span>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 sm:px-6 text-ink-900 font-medium max-w-lg text-body-sm leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
