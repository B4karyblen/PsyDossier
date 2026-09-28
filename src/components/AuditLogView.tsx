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
        return 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]';
      case 'MODIFICATION':
        return 'bg-[#ECFBF9] text-[#07988D] border-[#99F6E4]';
      case 'CREATION':
        return 'bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]';
      case 'ADDENDUM':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'ARCHIVAGE':
        return 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]';
      case 'REACTIVATION':
        return 'bg-[#D9F7F3] text-[#0F766E] border-[#5EEAD4]';
      case 'EXPORT':
        return 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]';
      case 'LECTURE':
        return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
      default:
        return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="clinical-card p-6 sm:p-7 bg-gradient-to-br from-white via-[#FCFDFE] to-[#F0FDFA] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ECFBF9] text-[#07988D] flex items-center justify-center border border-[#10B9A9]/20 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#07988D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#18243A] tracking-tight">
                  Journal d’Audit & Traçabilité Clinique
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFBF9] text-[#07988D] border border-[#10B9A9]/30">
                  <Lock className="w-3 h-3" /> Inaltérable
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
                Règles de conformité légale <strong className="text-[#18243A]">BR-012</strong> & <strong className="text-[#18243A]">BR-016</strong> · Journal médico-légal horodaté
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI stats pill row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 bg-white rounded-xl border border-[#D9E2E8] shadow-xs flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#10B9A9]" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block leading-none">Événements</span>
              <span className="text-xs font-black font-mono text-[#18243A] leading-tight">{metrics.total}</span>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-[#DCFCE7]/70 rounded-xl border border-[#86EFAC] shadow-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D] block leading-none">Validations</span>
              <span className="text-xs font-black font-mono text-[#15803D] leading-tight">{metrics.validations}</span>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-[#ECFBF9] rounded-xl border border-[#99F6E4] shadow-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#07988D]" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#07988D] block leading-none">Mises à jour</span>
              <span className="text-xs font-black font-mono text-[#07988D] leading-tight">{metrics.modifications}</span>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-white rounded-xl border border-[#D9E2E8] shadow-xs flex items-center gap-2">
            <Printer className="w-3.5 h-3.5 text-[#64748B]" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block leading-none">Exports</span>
              <span className="text-xs font-black font-mono text-[#18243A] leading-tight">{metrics.exports}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Action Filter Controls */}
      <div className="clinical-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par praticien, N° patient (PSY-...), libellé rubrique ou mot-clé..."
              className="clinical-input pl-10 pr-4 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="clinical-input pr-8 text-xs font-semibold bg-white cursor-pointer"
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
                className="px-3 py-2 text-xs font-bold text-[#64748B] hover:text-[#18243A] bg-[#F1F5F7] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Quick filter pill buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E8EEF2]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mr-1">Raccourcis :</span>
          {(['TOUTES', 'VALIDATION', 'MODIFICATION', 'ADDENDUM', 'EXPORT', 'ARCHIVAGE'] as const).map((act) => {
            const count = act === 'TOUTES' ? logs.length : logs.filter((l) => l.action === act).length;
            const isSelected = actionFilter === act;
            return (
              <button
                key={act}
                type="button"
                onClick={() => setActionFilter(act)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18243A] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E8EEF2] hover:text-[#18243A] border border-[#E2E8F0]'
                }`}
              >
                {act === 'TOUTES' ? 'Tous' : act}
                <span className={`ml-1.5 text-[10px] font-mono ${isSelected ? 'text-[#10B9A9]' : 'text-[#94A3B8]'}`}>
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#D9E2E8] text-[11px] font-extrabold text-[#475569] uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Date & Horodatage</th>
                <th className="py-3.5 px-4 sm:px-6">Praticien / Rôle</th>
                <th className="py-3.5 px-4 sm:px-6">Patient Réf.</th>
                <th className="py-3.5 px-4 sm:px-6">Action</th>
                <th className="py-3.5 px-4 sm:px-6">Rubrique</th>
                <th className="py-3.5 px-4 sm:px-6">Détails & Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF2]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#F1F5F7] flex items-center justify-center mx-auto text-[#94A3B8]">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-[#18243A]">Aucun événement ne correspond à ce filtre</p>
                      <p className="text-xs text-[#64748B]">Modifiez votre recherche ou réinitialisez les filtres.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setActionFilter('TOUTES');
                        }}
                        className="mt-2 px-3 py-1.5 text-xs font-bold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] rounded-lg transition-colors cursor-pointer"
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
                    <tr key={log.id} className="hover:bg-[#F8FAFC]/80 transition-colors group">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-[#475569] whitespace-nowrap tabular-nums">
                        <div className="flex items-center gap-1.5 font-bold text-[#18243A]">
                          <Calendar className="w-3 h-3 text-[#94A3B8]" />
                          {dateObj.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-[10px] text-[#64748B] pl-4 flex items-center gap-1">
                          {dateObj.toLocaleTimeString('fr-FR')}
                          {isRecent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B9A9] animate-pulse" title="Récemment consigné" />
                          )}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#F1F5F7] text-[#18243A] flex items-center justify-center text-[10px] font-black border border-[#D9E2E8]">
                            {log.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#18243A] leading-tight">{log.userName}</div>
                            <div className="text-[10px] text-[#07988D] font-mono font-semibold">{log.userRole}</div>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectDossier?.(log.dossierId)}
                          className="font-mono text-xs font-bold text-[#18243A] hover:text-[#07988D] hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                          title="Ouvrir le dossier patient"
                        >
                          <span>{log.patientNumeroOrdre}</span>
                          <ArrowRight className="w-3 h-3 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wide border shadow-2xs ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Rubrique */}
                      <td className="py-3.5 px-4 sm:px-6 text-[#475569] font-medium whitespace-nowrap text-xs">
                        {log.rubriqueNom ? (
                          <span className="px-2 py-0.5 rounded bg-[#F1F5F7] border border-[#E2E8F0] text-[11px] font-semibold text-[#18243A]">
                            {log.rubriqueNom}
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 sm:px-6 text-[#18243A] font-medium max-w-lg text-xs leading-relaxed">
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
