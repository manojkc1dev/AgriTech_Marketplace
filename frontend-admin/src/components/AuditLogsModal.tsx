import { useState, useEffect, useCallback } from "react";
import type { AuditLog } from "../../../frontend/src/types";
import { X, Search, Filter, History } from "lucide-react";
import { useLanguage } from "../../../frontend/src/context/LanguageContext";

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export default function AuditLogsModal({
  isOpen,
  onClose,
  token,
}: AuditLogsModalProps) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      queueMicrotask(() => {
        if (isMounted) {
          fetchAuditLogs();
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, fetchAuditLogs]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      filterCategory === "all" || log.category === filterCategory;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t("Regulatory Audit Trail & Log Compliance")} (अनुगमन र अडिट
                लग)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable system event history for B2B contract verification and
                dispute tracking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            >
              <option value="all">All Categories</option>
              <option value="order">Orders & Contracts</option>
              <option value="negotiation">Bids & Negotiations</option>
              <option value="dispatch">Highway Cold-Chain Logistics</option>
              <option value="inventory">Harvest & Stock</option>
              <option value="kyc">KYC Identity Verification</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading audit trail...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching audit events recorded.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User & Role</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Event Details</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.userName}
                        </span>
                        <span className="ml-1.5 text-[9px] uppercase px-1.5 py-0.25 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                        {log.action}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {log.details}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {log.ipAddress || "202.45.140.12"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
