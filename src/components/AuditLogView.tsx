import React, { useState, useMemo } from 'react';
import { AuditEntry, AuditAction } from '../types';
import { ShieldCheck, Search, Filter, Clock, User, FileText, ArrowUpDown } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditEntry[];
  onSelectDossier?: (dossierId: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onSelectDossier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('TOUTES');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
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
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, actionFilter]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'VALIDATION':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#10B981]/30';
      case 'MODIFICATION':
        return 'bg-[#ECFBF9] text-[#07988D] border-[#10B9A9]/30';
      case 'CREATION':
        return 'bg-[#F3E8FF] text-[#9333EA] border-[#A855F7]/30';
      case 'ADDENDUM':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/30';
      case 'ARCHIVAGE':
        return 'bg-[#FFE4E6] text-[#BE123C] border-[#F43F5E]/30';
      case 'REACTIVATION':
        return 'bg-[#D9F7F3] text-[#07988D] border-[#10B9A9]/30';
      case 'EXPORT':
        return 'bg-[#F1F5F7] text-[#18243A] border-[#D9E2E8]';
      default:
        return 'bg-[#F8FAFC] text-[#64748B] border-[#D9E2E8]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#10B9A9]" />
            <h1 className="text-xl font-bold text-[#18243A] tracking-tight">
              Journal d’Audit & Traçabilité Clinique
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Règles BR-012 & BR-016 : Registre inaltérable de chaque consultation, saisie, validation et export
          </p>
        </div>

        <div className="font-mono text-xs font-bold text-[#18243A] px-3 py-1.5 bg-white border border-[#D9E2E8] rounded-lg shadow-xs">
          Total : {logs.length} événements tracés
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par utilisateur, N° d'ordre patient, action ou détail..."
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs rounded-lg pl-9 pr-4 py-2 text-[#18243A] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#64748B]" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg px-3 py-2 text-xs font-semibold text-[#18243A] focus:outline-none"
          >
            <option value="TOUTES">Toutes les actions</option>
            <option value="VALIDATION">Validation</option>
            <option value="MODIFICATION">Modification</option>
            <option value="CREATION">Création</option>
            <option value="ADDENDUM">Addendum</option>
            <option value="ARCHIVAGE">Archivage</option>
            <option value="REACTIVATION">Réactivation</option>
            <option value="EXPORT">Export / Impression</option>
            <option value="LECTURE">Lecture</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9E2E8] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#D9E2E8] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Utilisateur / Praticien</th>
                <th className="py-3 px-4">Patient / Dossier</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Rubrique Cible</th>
                <th className="py-3 px-4">Détails de l'événement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF2]">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                return (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap tabular-nums">
                      <div>{dateObj.toLocaleDateString('fr-FR')}</div>
                      <div>{dateObj.toLocaleTimeString('fr-FR')}</div>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#18243A]">{log.userName}</div>
                      <div className="text-[10px] text-[#07988D] font-mono">{log.userRole}</div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectDossier?.(log.dossierId)}
                        className="font-mono text-xs font-bold text-[#18243A] hover:text-[#07988D] hover:underline"
                        title="Ouvrir le dossier patient"
                      >
                        {log.patientNumeroOrdre}
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Rubrique */}
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {log.rubriqueNom || '—'}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-[#18243A] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
