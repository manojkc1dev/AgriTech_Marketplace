import React from "react";
import { TrendingUp, Truck, ShieldCheck, DollarSign } from "lucide-react";
import {
  CropPriceIndex,
  ForwardContractRequirement,
  ColdChainRoute,
} from "../types";

interface AdminDashboardProps {
  crops: CropPriceIndex[];
  contracts: ForwardContractRequirement[];
  trucks: ColdChainRoute[];
  onNavigateToMarketRate: () => void;
  onNavigateToSupplyChain: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  crops,
  contracts,
  trucks,
  onNavigateToMarketRate,
  onNavigateToSupplyChain,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Crops Tracked
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">
            {crops.length} Staples
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
            ↑ 100% Bagmati Mandi coverage
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Bulk Contracts Open
            </span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">
            {contracts.length} Posts
          </div>
          <div className="text-[11px] text-sky-600 font-semibold mt-1">
            NRs. 4.2M total volume
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Cold-Chain Fleet
            </span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">
            {trucks.length} Units Active
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
            Average temp 4.8°C (Optimal)
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              KYC Queue Status
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">
            2 Pending
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Verification required
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          onClick={onNavigateToMarketRate}
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700">
              Daily Market Rate Tracker
            </h3>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              Explore →
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            View national market price index, historical price trend line
            charts, district volatility metrics, and multi-crop filters.
          </p>
        </div>

        <div
          onClick={onNavigateToSupplyChain}
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700">
              Supply Chain & Cold Logistics
            </h3>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              Explore →
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            B2B institutional forward contracts, Prithvi Highway cold-chain
            telemetry, and VAT split-settlement receipts generation.
          </p>
        </div>
      </div>
    </div>
  );
};
