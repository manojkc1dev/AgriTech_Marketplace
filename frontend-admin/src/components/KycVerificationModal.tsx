import React, { useState } from "react";
import { X, CheckCircle2, XCircle, ShieldCheck, FileText } from "lucide-react";
import { KycVerificationUser } from "../types";

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: KycVerificationUser[];
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  isOpen,
  onClose,
  users,
  onVerify,
  onReject,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSelectedUser =
    users.find((u) => u.id === selectedId) || users[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                KYC Verification Queue
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Review cooperative & wholesaler registration credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800">
          {/* User List Column */}
          <div className="md:col-span-5 p-4 space-y-2.5 overflow-y-auto max-h-[60vh] md:max-h-none">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2">
              Pending Applications (
              {users.filter((u) => u.status === "Pending").length})
            </div>
            {users.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                No pending KYC applications
              </div>
            ) : (
              users.map((u) => {
                const isSelected = currentSelectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-500"
                        : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {u.roleType}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          u.status === "Verified"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : u.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-white mt-1.5">
                      {u.entityName}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {u.fullName} • {u.district}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* User Details Column */}
          <div className="md:col-span-7 p-6 space-y-6">
            {currentSelectedUser ? (
              <>
                <div>
                  <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                    {currentSelectedUser.entityName}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Submitted on {currentSelectedUser.submittedDate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                    <div className="text-stone-400 mb-1">
                      Authorized Contact
                    </div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      {currentSelectedUser.fullName}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                    <div className="text-stone-400 mb-1">District / Region</div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      {currentSelectedUser.district}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                    <div className="text-stone-400 mb-1">Citizenship No.</div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                      {currentSelectedUser.citizenshipNumber}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                    <div className="text-stone-400 mb-1">
                      Registration / PAN No.
                    </div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                      {currentSelectedUser.panNumber}
                    </div>
                  </div>
                </div>

                {/* Submitted Documents */}
                <div>
                  <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-400" />
                    Uploaded Document Proofs
                  </div>
                  <div className="space-y-2">
                    {currentSelectedUser.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-xs"
                      >
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {doc}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline">
                          View File
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {currentSelectedUser.status === "Pending" && (
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex gap-3">
                    <button
                      onClick={() => onVerify(currentSelectedUser.id)}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Grant Wholesale Portal Access
                    </button>
                    <button
                      onClick={() => onReject(currentSelectedUser.id)}
                      className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-stone-400 text-sm">
                Select a user to review verification details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
