import React from "react";
import { Layers, MapPin } from "lucide-react";

interface HeatmapCell {
  region: string;
  crop: string;
  supplyTons: number;
  demandTons: number;
  priceIndexNrs: number;
  status: "Surplus" | "Balanced" | "Deficit";
}

const HEATMAP_DATA: HeatmapCell[] = [
  {
    region: "Kathmandu",
    crop: "Tomato (Golbheda)",
    supplyTons: 120,
    demandTons: 380,
    priceIndexNrs: 83,
    status: "Deficit",
  },
  {
    region: "Kathmandu",
    crop: "Ginger (Aduwa)",
    supplyTons: 40,
    demandTons: 95,
    priceIndexNrs: 110,
    status: "Deficit",
  },
  {
    region: "Kathmandu",
    crop: "Red Potato",
    supplyTons: 300,
    demandTons: 450,
    priceIndexNrs: 54,
    status: "Deficit",
  },
  {
    region: "Dhading",
    crop: "Tomato (Golbheda)",
    supplyTons: 280,
    demandTons: 90,
    priceIndexNrs: 68,
    status: "Surplus",
  },
  {
    region: "Dhading",
    crop: "Cauliflower",
    supplyTons: 190,
    demandTons: 70,
    priceIndexNrs: 50,
    status: "Surplus",
  },
  {
    region: "Makwanpur",
    crop: "Red Potato",
    supplyTons: 520,
    demandTons: 110,
    priceIndexNrs: 42,
    status: "Surplus",
  },
  {
    region: "Chitwan",
    crop: "Green Chilli",
    supplyTons: 150,
    demandTons: 140,
    priceIndexNrs: 210,
    status: "Balanced",
  },
  {
    region: "Kavre",
    crop: "Fresh Milk / Dairy",
    supplyTons: 220,
    demandTons: 200,
    priceIndexNrs: 95,
    status: "Balanced",
  },
];

export const SupplyDemandHeatmap: React.FC = () => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Regional Supply & Demand Heatmap
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Real-time agricultural deficit & surplus distribution across Bagmati
            Province hubs
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-stone-600 dark:text-stone-300 font-medium">
              Surplus (Co-op Export)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500"></span>
            <span className="text-stone-600 dark:text-stone-300 font-medium">
              Balanced
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-stone-600 dark:text-stone-300 font-medium">
              Deficit (Inflow Demand)
            </span>
          </div>
        </div>
      </div>

      {/* Grid of regional cells */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HEATMAP_DATA.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all ${
              item.status === "Surplus"
                ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60"
                : item.status === "Deficit"
                  ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/60"
                  : "bg-sky-50/50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800/60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {item.region}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === "Surplus"
                    ? "bg-emerald-200/80 text-emerald-900"
                    : item.status === "Deficit"
                      ? "bg-amber-200/80 text-amber-900"
                      : "bg-sky-200/80 text-sky-900"
                }`}
              >
                {item.status}
              </span>
            </div>

            <h4 className="font-semibold text-sm text-stone-800 dark:text-stone-100">
              {item.crop}
            </h4>

            <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex justify-between">
                <span>Supply Volume:</span>
                <strong className="text-stone-900 dark:text-white">
                  {item.supplyTons} Tons
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Demand Need:</span>
                <strong className="text-stone-900 dark:text-white">
                  {item.demandTons} Tons
                </strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-stone-200 dark:border-stone-800 font-mono">
                <span>Local Rate:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  NRs. {item.priceIndexNrs}/KG
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
