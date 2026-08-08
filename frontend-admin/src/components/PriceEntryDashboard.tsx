import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Plus,
  Calendar,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  UserPlus,
  Star,
  XCircle,
} from "lucide-react";
import {
  CropPriceIndex,
  UserAccount,
  KycVerificationUser,
  PlatformFeedbackItem,
} from "../types";
import { UserManagementView } from "./UserManagementView";
import { SupplyDemandHeatmap } from "./SupplyDemandHeatmap";

interface PriceEntryDashboardProps {
  onPublishPrice: (newCrop: Partial<CropPriceIndex>) => void;
  onOpenKycModal: () => void;
  onOpenFeedbackModal: () => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  kycUsers?: KycVerificationUser[];
  onVerifyKyc?: (id: string) => void;
  onRejectKyc?: (id: string) => void;
  feedbackItems?: PlatformFeedbackItem[];
  onToggleResolveFeedback?: (id: string) => void;
}

export const PriceEntryDashboard: React.FC<PriceEntryDashboardProps> = ({
  onPublishPrice,
  onOpenKycModal,
  activeSubTab,
  setActiveSubTab,
  users,
  setUsers,
  kycUsers = [],
  onVerifyKyc,
  onRejectKyc,
  feedbackItems = [],
  onToggleResolveFeedback,
}) => {
  // Form State
  const [cropName, setCropName] = useState("Tomato (Golbheda)");
  const [region, setRegion] = useState("Kathmandu");
  const [rateNrs, setRateNrs] = useState("72");
  const [sourceMarket, setSourceMarket] = useState("Kalimati Market");
  const [loggingDate, setLoggingDate] = useState("2026-08-08");
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateNrs || isNaN(Number(rateNrs))) return;

    onPublishPrice({
      cropName,
      region,
      rateNrs: Number(rateNrs),
      sourceMarket,
      loggingDate,
      unit: "KG",
    });

    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  const pendingKycCount = kycUsers.filter((u) => u.status === "Pending").length;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 1. Add User & Account Management (PRIMARY DEFAULT) */}
        <button
          onClick={() => setActiveSubTab("User Management")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
            activeSubTab === "User Management" || activeSubTab === "Add User"
              ? "bg-emerald-700 text-white shadow-emerald-900/10"
              : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Add User & Accounts ({users.length})
        </button>

        {/* 2. Verification Queue */}
        <button
          onClick={() => setActiveSubTab("Verification")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "Verification"
              ? "bg-emerald-700 text-white shadow-emerald-900/10"
              : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification Queue ({pendingKycCount})
          {pendingKycCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        {/* 3. Price Entry */}
        <button
          onClick={() => setActiveSubTab("Price Entry")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "Price Entry"
              ? "bg-emerald-700 text-white shadow-emerald-900/10"
              : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Daily Price Entry
        </button>

        {/* 4. Market Analysis */}
        <button
          onClick={() => setActiveSubTab("Market Analysis")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "Market Analysis"
              ? "bg-emerald-700 text-white shadow-emerald-900/10"
              : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Market Analysis
        </button>

        {/* 5. Feedback */}
        <button
          onClick={() => setActiveSubTab("Feedback")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "Feedback"
              ? "bg-emerald-700 text-white shadow-emerald-900/10"
              : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Feedback ({feedbackItems.length})
        </button>
      </div>

      {/* RENDER VIEW BASED ON ACTIVE SUBTAB */}
      {activeSubTab === "User Management" || activeSubTab === "Add User" ? (
        <UserManagementView
          users={users}
          setUsers={setUsers}
          onOpenKycModal={onOpenKycModal}
        />
      ) : activeSubTab === "Verification" ? (
        /* DEDICATED VERIFICATION QUEUE SUBTAB VIEW */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>KYC Credentials Approval Center</span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Pending Verification Queue
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Review registration credentials submitted by agricultural
                cooperatives and institutional wholesalers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800">
                {pendingKycCount} Pending Approvals
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {kycUsers.map((u) => (
              <div
                key={u.id}
                className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 space-y-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {u.roleType}
                    </span>
                    <h4 className="font-extrabold text-base text-stone-900 dark:text-white mt-2">
                      {u.entityName}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {u.fullName} • {u.district}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      u.status === "Verified"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : u.status === "Rejected"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-2 border-t border-stone-200/60 dark:border-stone-800">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-bold">
                      National Identity / Citizenship
                    </div>
                    <div className="font-mono text-stone-800 dark:text-stone-200 mt-0.5">
                      {u.citizenshipNumber}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-bold">
                      PAN / Tax Registration
                    </div>
                    <div className="font-mono text-stone-800 dark:text-stone-200 mt-0.5">
                      {u.panNumber}
                    </div>
                  </div>
                </div>

                {u.status === "Pending" && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onVerifyKyc && onVerifyKyc(u.id)}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Grant Role
                    </button>
                    <button
                      onClick={() => onRejectKyc && onRejectKyc(u.id)}
                      className="px-3 py-2 border border-rose-200 dark:border-rose-800 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === "Feedback" ? (
        /* DEDICATED PLATFORM FEEDBACK SUBTAB VIEW */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>Field Stakeholder Feedback & Reports</span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Platform Feedback Directory
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Direct ratings and recommendations from market supervisors,
                farmers, and wholesale managers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {feedbackItems.map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                      {fb.userName}
                    </h4>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {fb.userRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < fb.rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {fb.message}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 dark:border-stone-800 text-xs text-stone-500">
                  <span>
                    Category:{" "}
                    <strong className="text-stone-800 dark:text-stone-200 font-semibold">
                      {fb.category}
                    </strong>{" "}
                    • Submitted {fb.date}
                  </span>
                  <button
                    onClick={() =>
                      onToggleResolveFeedback && onToggleResolveFeedback(fb.id)
                    }
                    className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                      fb.resolved
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {fb.resolved ? "Resolved" : "Mark Resolved"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === "Market Analysis" ? (
        <SupplyDemandHeatmap />
      ) : (
        /* Price Entry View ONLY when 'Price Entry' tab is selected */
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Card: LOG DAILY CROP INDICES */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <Plus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Log Daily Crop Indices
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-xs font-semibold"
            >
              {/* CROP NAME */}
              <div className="space-y-1.5">
                <label className="text-stone-500 uppercase tracking-wider text-[10px]">
                  Crop Name
                </label>
                <div className="relative">
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full appearance-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Tomato (Golbheda)">Tomato (Golbheda)</option>
                    <option value="Ginger (Aduwa)">Ginger (Aduwa)</option>
                    <option value="Red Potato (Rato Aalu)">
                      Red Potato (Rato Aalu)
                    </option>
                    <option value="Dry Onion (Dry Pyaj)">
                      Dry Onion (Dry Pyaj)
                    </option>
                    <option value="Cauliflower (Local Kauli)">
                      Cauliflower (Local Kauli)
                    </option>
                    <option value="Green Chilli (Akbare Khursani)">
                      Green Chilli (Akbare Khursani)
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* REGION and RATE (NRS/KG) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-stone-500 uppercase tracking-wider text-[10px]">
                    Region
                  </label>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full appearance-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Kathmandu">Kathmandu</option>
                      <option value="Dhading">Dhading</option>
                      <option value="Makwanpur">Makwanpur</option>
                      <option value="Chitwan">Chitwan</option>
                      <option value="Kavre">Kavre</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-500 uppercase tracking-wider text-[10px]">
                    Rate (NRs/KG)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 72"
                    value={rateNrs}
                    onChange={(e) => setRateNrs(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* SOURCE MARKET ORIGIN */}
              <div className="space-y-1.5">
                <label className="text-stone-500 uppercase tracking-wider text-[10px]">
                  Source Market Origin
                </label>
                <div className="relative">
                  <select
                    value={sourceMarket}
                    onChange={(e) => setSourceMarket(e.target.value)}
                    className="w-full appearance-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Kalimati Market">Kalimati Market</option>
                    <option value="Balkhu Wholesale Yard">
                      Balkhu Wholesale Yard
                    </option>
                    <option value="Dhading Besi Mandi">
                      Dhading Besi Mandi
                    </option>
                    <option value="Palung Collection Hub">
                      Palung Collection Hub
                    </option>
                    <option value="Narayangarh Mandi">Narayangarh Mandi</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* LOGGING DATE */}
              <div className="space-y-1.5">
                <label className="text-stone-500 uppercase tracking-wider text-[10px]">
                  Logging Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={loggingDate}
                    onChange={(e) => setLoggingDate(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {publishedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Wholesale Price Index Published!
                  </>
                ) : (
                  "Publish Wholesale Price"
                )}
              </button>
            </form>
          </div>

          {/* Right Card: LIGHT CODE INTERNAL ENTRY GUILD */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between min-h-[420px] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Light Code Internal Entry Guild
                </h3>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                As the authorized administrative lead, you are responsible for
                updating daily market price indexes. These values immediately
                populate the{" "}
                <strong className="text-stone-900 dark:text-white font-semibold">
                  Price Directory Trend Visualizers
                </strong>
                , allowing regional co-ops and smallholder farmers to list and
                price their harvests with maximum leverage.
              </p>

              {/* Index list box */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800 text-xs space-y-2.5 text-stone-700 dark:text-stone-300">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900 dark:text-white shrink-0">
                    • Kathmandu Index:
                  </span>
                  <span>Collected from Kalimati wholesale yard.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900 dark:text-white shrink-0">
                    • Hill Index:
                  </span>
                  <span>
                    Collected from Dhading Besi and Makwanpur local Mandis.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900 dark:text-white shrink-0">
                    • Terai Index:
                  </span>
                  <span>Collected from Itahari and Birgunj bulk yards.</span>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono text-stone-500">
              <div>
                AUTHORIZED SESSION ROLE:{" "}
                <strong className="text-stone-800 dark:text-stone-200">
                  admin
                </strong>
              </div>
              <button
                onClick={() => alert("Index queue reloaded successfully!")}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-1.5 font-semibold text-xs cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                Reload Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
