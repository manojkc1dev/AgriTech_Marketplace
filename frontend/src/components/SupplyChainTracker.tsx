import React, { useState } from "react";
import { Order, OrderStatus } from "../types";
import { CheckCircle2, Clock, Truck, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, MapPin, PackageCheck, FileText, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface SupplyChainTrackerProps {
  order: Order;
  compact?: boolean;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  userRole?: "farmer" | "buyer" | "cooperative" | "admin";
}

export interface FulfillmentStep {
  id: number;
  key: string;
  title: string;
  nepaliTitle: string;
  description: string;
  nepaliDescription: string;
  icon: React.ElementType;
  estTime: string;
}

export const FULFILLMENT_STEPS: FulfillmentStep[] = [
  {
    id: 1,
    key: "proposal",
    title: "Order & Price Agreement",
    nepaliTitle: "माँग र मूल्य सहमति",
    description: "Initial proposal submitted & price terms negotiated via JWT authorization.",
    nepaliDescription: "माँग पेस गरी JWT प्रमाणीकरण मार्फत मूल्य निर्धारण भयो।",
    icon: FileText,
    estTime: "Step 1 of 4"
  },
  {
    id: 2,
    key: "qc_staging",
    title: "QC Crate Staging & Packaging",
    nepaliTitle: "गुणस्तर जाँच र क्रेट प्याकिङ",
    description: "Produce quality checked, graded & loaded into ventilated crates at District Hub.",
    nepaliDescription: "कृषि उपजको गुणस्तर जाँच र जिल्ला हबमा क्रेटमा भण्डारण।",
    icon: PackageCheck,
    estTime: "Step 2 of 4"
  },
  {
    id: 3,
    key: "transit",
    title: "Highway Cold-Chain Logistics",
    nepaliTitle: "राजमार्ग तरकारी ढुवानी",
    description: "In transit via Prithvi/Arniko Highway to Kalimati or Buyer's Distribution Center.",
    nepaliDescription: "काठमाडौँ/कालिमाटी थोक बजार तर्फ राजमार्ग ढुवानी भइरहेको।",
    icon: Truck,
    estTime: "Step 3 of 4"
  },
  {
    id: 4,
    key: "settlement",
    title: "Mandi Handover & Settlement",
    nepaliTitle: "हस्तान्तरण र भुक्तानी फछ्र्यौट",
    description: "Produce delivered, weigh-in verified, and final payment settled to Farmer.",
    nepaliDescription: "तौल प्रमाणीकरण पछि किसानको खातामा भुक्तानी सम्पन्न।",
    icon: ShieldCheck,
    estTime: "Step 4 of 4"
  }
];

export function getStatusProgressDetails(status: OrderStatus): {
  percentage: number;
  currentStepIndex: number; // 0, 1, 2, 3
  statusBadgeColor: string;
  statusLabel: string;
  statusNepaliLabel: string;
} {
  switch (status) {
    case "pending":
      return {
        percentage: 25,
        currentStepIndex: 0,
        statusBadgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700",
        statusLabel: "Order Pending Confirmation",
        statusNepaliLabel: "स्वीकृतिको पर्खाइमा"
      };
    case "negotiating":
      return {
        percentage: 35,
        currentStepIndex: 0,
        statusBadgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
        statusLabel: "Price Counter-Offer Negotiating",
        statusNepaliLabel: "मूल्य छलफल भइरहेको"
      };
    case "confirmed":
      return {
        percentage: 70,
        currentStepIndex: 2, // QC done, staging & highway transit active
        statusBadgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-700",
        statusLabel: "Confirmed & In-Transit Logistics",
        statusNepaliLabel: "स्वीकृत र ढुवानी सुरु"
      };
    case "completed":
      return {
        percentage: 100,
        currentStepIndex: 3,
        statusBadgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
        statusLabel: "Order Fully Delivered & Settled",
        statusNepaliLabel: "सफलतापूर्वक हस्तान्तरण सम्पन्न"
      };
    case "cancelled":
      return {
        percentage: 0,
        currentStepIndex: -1,
        statusBadgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700",
        statusLabel: "Order Cancelled",
        statusNepaliLabel: "कारोबार रद्द गरिएको"
      };
    default:
      return {
        percentage: 10,
        currentStepIndex: 0,
        statusBadgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
        statusLabel: status,
        statusNepaliLabel: status
      };
  }
}

export default function SupplyChainTracker({
  order,
  compact = false,
  onUpdateStatus,
  userRole
}: SupplyChainTrackerProps) {
  const { language, t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  const { percentage, currentStepIndex, statusBadgeColor, statusLabel, statusNepaliLabel } =
    getStatusProgressDetails(order.status);

  const totalValue = order.quantity * order.agreed_price;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3.5 transition-all duration-200">
      
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white font-display">
              {order.crop}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {order.quantity} {order.unit} @ NRs. {order.agreed_price}/{order.unit}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3">
            <span>
              {t("Farmer")}: <strong className="text-slate-700 dark:text-slate-300">{order.farmerName || "Farmer"}</strong>
            </span>
            <span>&bull;</span>
            <span>
              {t("Buyer")}: <strong className="text-slate-700 dark:text-slate-300">{order.buyerName || "Buyer"}</strong>
            </span>
            <span>&bull;</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              Total: NRs. {totalValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Current Fulfillment Status Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border shadow-2xs ${statusBadgeColor}`}>
            {language === "ne" ? statusNepaliLabel : statusLabel}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Toggle fulfillment log details"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Cancelled Alert Banner */}
      {order.status === "cancelled" ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>
            {language === "ne"
              ? "यो अर्डर रद्द गरिएको छ। आपूर्ति श्रृंखला प्रक्रिया रोकियो।"
              : "This order has been cancelled. Supply-chain logistics and fulfillment tracking are stopped."}
          </span>
        </div>
      ) : (
        /* Animated Supply-Chain Progress Bar Area */
        <div className="space-y-3">
          
          {/* Main Animated Progress Bar Track */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t("Fulfillment Progress")}</span>
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                {percentage}% {percentage === 100 ? "✓ Delivered" : "In Pipeline"}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700 relative shadow-inner">
              {/* Animated Progress Fill */}
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                  percentage === 100
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
                    : percentage >= 60
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500"
                    : "bg-gradient-to-r from-amber-500 to-emerald-500"
                }`}
                style={{ width: `${percentage}%` }}
              >
                {/* Shimmer overlay animation */}
                <div className="absolute inset-0 bg-white/25 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* 4-Step Milestone Node Icons Line */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            {FULFILLMENT_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPassed = currentStepIndex > idx || order.status === "completed";
              const isCurrent = currentStepIndex === idx && order.status !== "completed";

              return (
                <div key={step.id} className="flex flex-col items-center text-center group">
                  {/* Step Node Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border font-bold text-xs ${
                      isPassed
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : isCurrent
                        ? "bg-amber-500 text-white border-amber-500 ring-4 ring-amber-500/20 animate-pulse shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[10px] font-semibold mt-1.5 leading-tight ${
                      isPassed
                        ? "text-emerald-700 dark:text-emerald-400 font-bold"
                        : isCurrent
                        ? "text-amber-700 dark:text-amber-400 font-bold"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {language === "ne" ? step.nepaliTitle : step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded Details Panel: Step Logs & Quick Status Controls */}
      {showDetails && order.status !== "cancelled" && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-fade-in">
          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Supply-Chain Logistics Breakdown</span>
            </h5>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              {FULFILLMENT_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex > idx || order.status === "completed";
                const isCurrent = currentStepIndex === idx && order.status !== "completed";

                return (
                  <div
                    key={step.id}
                    className={`p-2 rounded-lg border flex items-start space-x-2.5 transition ${
                      isCurrent
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                        : isPassed
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-300"
                        : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] flex items-center justify-center font-bold">
                          {step.id}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>{language === "ne" ? step.nepaliTitle : step.title}</span>
                        <span className="text-[10px] opacity-75 font-mono">{step.estTime}</span>
                      </div>
                      <p className="text-[10px] opacity-90 mt-0.5 leading-relaxed">
                        {language === "ne" ? step.nepaliDescription : step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Status Transition Action Buttons (if callback provided) */}
          {onUpdateStatus && order.status !== "completed" && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Advance Supply-Chain Status:
              </span>

              <div className="flex flex-wrap gap-1.5">
                {order.status !== "confirmed" && (
                  <button
                    onClick={() => onUpdateStatus(order.id, "confirmed")}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Dispatch</span>
                  </button>
                )}

                {order.status === "confirmed" && (
                  <button
                    onClick={() => onUpdateStatus(order.id, "completed")}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Mark Fully Delivered</span>
                  </button>
                )}

                <button
                  onClick={() => onUpdateStatus(order.id, "cancelled")}
                  className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold rounded-lg hover:bg-rose-100 transition cursor-pointer"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
