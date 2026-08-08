import React, { useState } from 'react';
import { X, Shield, Download, Search, Filter } from 'lucide-react';
import { AuditLogItem } from '../types';
import { exportAuditLogsToCSV } from '../utils/pdfExport';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ isOpen, onClose, logs }) => {
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchesRole = filterRole === 'ALL' || log.role === filterRole;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">System Audit Trail Logs</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Immutable record of wholesale index modifications, contract postings, and admin operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAuditLogsToCSV(filteredLogs)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, user, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500">Filter Role:</span>
            {['ALL', 'ADMIN', 'SYSTEM', 'BUYER', 'COOP'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterRole === role
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 dark:bg-stone-800/60 sticky top-0 border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold text-stone-500 uppercase">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 dark:divide-stone-800/80 text-xs text-stone-700 dark:text-stone-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 font-mono text-[11px]">
                  <td className="py-2.5 px-4 text-stone-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-semibold text-stone-900 dark:text-white">{log.actor}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-sans text-[10px] font-bold">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">{log.action}</td>
                  <td className="py-2.5 px-4 font-sans text-xs max-w-xs truncate">{log.details}</td>
                  <td className="py-2.5 px-4 text-stone-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
