import { useState, useMemo } from "react";
import type { MarketPrice } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Minus,
  Activity,
  Sliders,
  BarChart3,
  Layers,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Wheat,
  Search,
  RotateCcw,
} from "lucide-react";

interface TopStapleCropsChartProps {
  prices: MarketPrice[];
}

const DEFAULT_TOP_STAPLES = [
  {
    cropKey: "Potato (Alu)",
    name: "Potato (Alu / आलु)",
    color: "#f59e0b",
    category: "Vegetables",
  },
  {
    cropKey: "Tomato (Golbheda)",
    name: "Tomato (Golbheda / गोलभेडा)",
    color: "#ef4444",
    category: "Vegetables",
  },
  {
    cropKey: "Paddy Rice (Dhan)",
    name: "Paddy Rice (Dhan / धान)",
    color: "#10b981",
    category: "Grains",
  },
  {
    cropKey: "Onion (Pyaj)",
    name: "Onion (Pyaj / प्याज)",
    color: "#8b5cf6",
    category: "Spices",
  },
  {
    cropKey: "Cauliflower (Kauli)",
    name: "Cauliflower (Kauli / काउली)",
    color: "#0284c7",
    category: "Vegetables",
  },
];

export default function TopStapleCropsChart({
  prices,
}: TopStapleCropsChartProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d">("30d");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [chartType, setChartType] = useState<"line" | "area">("line");
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingTier, setPricingTier] = useState("All Prices");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [visibleCrops, setVisibleCrops] = useState<Record<string, boolean>>({
    "Potato (Alu)": true,
    "Tomato (Golbheda)": true,
    "Paddy Rice (Dhan)": true,
    "Onion (Pyaj)": true,
    "Cauliflower (Kauli)": true,
  });

  const toggleCropVisibility = (cropKey: string) => {
    setVisibleCrops((prev) => ({ ...prev, [cropKey]: !prev[cropKey] }));
  };

  const filteredPricesByTime = useMemo(() => {
    if (!prices || prices.length === 0) return [];
    let filtered = [...prices];

    if (selectedDistrict !== "all") {
      filtered = filtered.filter((p) => {
        if (p.district)
          return p.district.toLowerCase() === selectedDistrict.toLowerCase();
        if (p.region === "Kathmandu" && selectedDistrict === "Kathmandu")
          return true;
        if (
          p.source_market.toLowerCase().includes(selectedDistrict.toLowerCase())
        )
          return true;
        return false;
      });
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.crop.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (minPrice !== "") {
      filtered = filtered.filter((p) => p.price_per_unit >= Number(minPrice));
    }
    if (maxPrice !== "") {
      filtered = filtered.filter((p) => p.price_per_unit <= Number(maxPrice));
    }

    const days = timeframe === "7d" ? 7 : timeframe === "14d" ? 14 : 30;
    const allDates: string[] = Array.from(
      new Set<string>(filtered.map((p) => p.date)),
    ).sort();
    const recentDates = allDates.slice(-days);

    return filtered.filter((p) => recentDates.includes(p.date));
  }, [prices, selectedDistrict, timeframe, searchQuery, minPrice, maxPrice]);

  const chartData = useMemo(() => {
    if (filteredPricesByTime.length === 0) return [];
    const uniqueDates: string[] = Array.from(
      new Set<string>(filteredPricesByTime.map((p) => p.date)),
    ).sort();

    return uniqueDates.map((dateStr: string) => {
      const formattedDate =
        dateStr.length >= 10 ? dateStr.substring(5) : dateStr;
      const pointObj: Record<string, string | number | null> = {
        date: formattedDate,
        fullDate: dateStr,
      };

      DEFAULT_TOP_STAPLES.forEach((staple) => {
        const matches = filteredPricesByTime.filter(
          (p) =>
            (p.crop.toLowerCase().includes(staple.cropKey.toLowerCase()) ||
              staple.cropKey.toLowerCase().includes(p.crop.toLowerCase())) &&
            p.date === dateStr,
        );

        if (matches.length > 0) {
          const avg = Math.round(
            matches.reduce((sum, m) => sum + m.price_per_unit, 0) /
              matches.length,
          );
          pointObj[staple.cropKey] = avg;
        } else {
          pointObj[staple.cropKey] = null;
        }
      });

      return pointObj;
    });
  }, [filteredPricesByTime]);

  const stapleAnalytics = useMemo(() => {
    return DEFAULT_TOP_STAPLES.map((staple) => {
      const cropPrices = filteredPricesByTime.filter(
        (p) =>
          p.crop.toLowerCase().includes(staple.cropKey.toLowerCase()) ||
          staple.cropKey.toLowerCase().includes(p.crop.toLowerCase()),
      );

      if (cropPrices.length === 0) {
        return {
          ...staple,
          currentRate: 0,
          minRate: 0,
          maxRate: 0,
          avgRate: 0,
          volatility: 0,
          changePct: 0,
          trend: "neutral" as const,
          dataCount: 0,
        };
      }

      const sorted = [...cropPrices].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const latest = sorted[sorted.length - 1].price_per_unit;
      const oldest = sorted[0].price_per_unit;
      const minRate = Math.min(...sorted.map((s) => s.price_per_unit));
      const maxRate = Math.max(...sorted.map((s) => s.price_per_unit));
      const volatility = maxRate - minRate;
      const diff = latest - oldest;
      const changePct = oldest > 0 ? Math.round((diff / oldest) * 100) : 0;
      let trend: "up" | "down" | "neutral" = "neutral";
      if (diff > 0.5) trend = "up";
      else if (diff < -0.5) trend = "down";

      return {
        ...staple,
        currentRate: latest,
        minRate,
        maxRate,
        volatility,
        changePct,
        trend,
        dataCount: sorted.length,
      };
    });
  }, [filteredPricesByTime]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDistrict("all");
    setPricingTier("All Prices");
    setMinPrice("");
    setMaxPrice("");
    setTimeframe("30d");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Main Recharts Graph & Analytics */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Top Header & Global Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Wheat className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Top 5 Staple Crops Historical Price Fluctuations
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Track daily market price movements, price spikes, and volatility
                indices across Nepal's top 5 essential staple crops.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                {(["7d", "14d", "30d"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      timeframe === tf
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tf === "7d"
                      ? "7 Days"
                      : tf === "14d"
                        ? "14 Days"
                        : "30 Days"}
                  </button>
                ))}
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl font-semibold outline-none focus:border-emerald-500 text-xs cursor-pointer"
              >
                <option value="all">National Index (All Mandis)</option>
                <option value="Kathmandu">
                  Kathmandu (Kalimati &amp; Tokha)
                </option>
                <option value="Dhading">Dhading Mandi</option>
                <option value="Makwanpur">Makwanpur (Hetauda)</option>
              </select>

              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  onClick={() => setChartType("line")}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    chartType === "line"
                      ? "bg-white text-emerald-700 shadow-xs font-bold"
                      : "text-slate-400"
                  }`}
                  title="Line Chart View"
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType("area")}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    chartType === "area"
                      ? "bg-white text-emerald-700 shadow-xs font-bold"
                      : "text-slate-400"
                  }`}
                  title="Area Chart View"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Legend Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Toggle Series:</span>
            </span>
            {DEFAULT_TOP_STAPLES.map((staple) => {
              const isVisible = visibleCrops[staple.cropKey];
              return (
                <button
                  key={staple.cropKey}
                  onClick={() => toggleCropVisibility(staple.cropKey)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    isVisible
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: staple.color }}
                  />
                  <span>{staple.name.split("/")[0].trim()}</span>
                  {isVisible ? (
                    <Eye className="w-3 h-3 text-emerald-400 ml-0.5" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Recharts Graph Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-slate-200 font-bold">
                  Wholesale Market Price Index (NRs / KG)
                </span>
              </div>
              <span className="text-slate-400">
                {chartData.length} Daily Data Points ({timeframe.toUpperCase()})
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#334155"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        dy={5}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        unit=" NRs"
                        dx={-5}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "12px",
                          border: "1px solid #334155",
                          color: "#f8fafc",
                        }}
                        formatter={(value: unknown, name: unknown) => [
                          `NRs. ${String(value)}/KG`,
                          String(name),
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                      />
                      {DEFAULT_TOP_STAPLES.map((staple) => {
                        if (!visibleCrops[staple.cropKey]) return null;
                        return (
                          <Line
                            key={staple.cropKey}
                            type="monotone"
                            dataKey={staple.cropKey}
                            name={staple.name.split("(")[0].trim()}
                            stroke={staple.color}
                            strokeWidth={2.8}
                            dot={{
                              r: 3,
                              fill: staple.color,
                              strokeWidth: 1,
                              stroke: "#0f172a",
                            }}
                            activeDot={{
                              r: 7,
                              strokeWidth: 2,
                              stroke: "#ffffff",
                            }}
                            connectNulls
                          />
                        );
                      })}
                    </LineChart>
                  ) : (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#334155"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        unit=" NRs"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "12px",
                          border: "1px solid #334155",
                          color: "#f8fafc",
                        }}
                        formatter={(value: unknown, name: unknown) => [
                          `NRs. ${String(value)}/KG`,
                          String(name),
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                      />
                      {DEFAULT_TOP_STAPLES.map((staple) => {
                        if (!visibleCrops[staple.cropKey]) return null;
                        return (
                          <Area
                            key={staple.cropKey}
                            type="monotone"
                            dataKey={staple.cropKey}
                            name={staple.name.split("(")[0].trim()}
                            stroke={staple.color}
                            fill={staple.color}
                            fillOpacity={0.15}
                            strokeWidth={2.5}
                            connectNulls
                          />
                        );
                      })}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                  <Activity className="w-8 h-8 text-slate-700 animate-pulse" />
                  <span>
                    No historical market rate data points found for selected
                    filters.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Cards for Top 5 Staple Crops */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Staple Crop Volatility &amp; Rate Metrics Summary</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stapleAnalytics.map((crop) => (
                <div
                  key={crop.cropKey}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: crop.color }}
                      />
                      <h5 className="font-bold text-slate-900 text-xs line-clamp-1">
                        {crop.name.split("/")[0].trim()}
                      </h5>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                      {crop.category}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Latest Rate
                      </span>
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        NRs. {crop.currentRate || "--"}{" "}
                        <span className="text-[10px] font-normal text-slate-500">
                          /KG
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center space-x-0.5 text-xs font-bold ${crop.trend === "up" ? "text-rose-600" : crop.trend === "down" ? "text-emerald-600" : "text-slate-500"}`}
                    >
                      {crop.trend === "up" && (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                      {crop.trend === "down" && (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {crop.trend === "neutral" && (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {crop.changePct > 0
                          ? `+${crop.changePct}%`
                          : `${crop.changePct}%`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Range ({timeframe}):</span>
                      <span className="font-bold text-slate-800 font-mono">
                        NRs. {crop.minRate} - {crop.maxRate}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Volatility:</span>
                      <span
                        className={`font-bold font-mono ${crop.volatility > 15 ? "text-amber-700" : "text-emerald-700"}`}
                      >
                        ±{crop.volatility} NRs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Search & Filter Directory Sidebar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xs font-black tracking-wider text-emerald-700 uppercase flex items-center gap-2">
            <Search className="w-4 h-4" /> Search &amp; Filter Directory
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Product Name (Crop)
            </label>
            <input
              type="text"
              placeholder="Search product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Filter by Region
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Regions &amp; Mandis</option>
              <option value="Kathmandu">Kathmandu District</option>
              <option value="Dhading">Dhading District</option>
              <option value="Makwanpur">Makwanpur District</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Pricing Tier
            </label>
            <select
              value={pricingTier}
              onChange={(e) => setPricingTier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option>All Prices</option>
              <option>Wholesale Bulk Rate</option>
              <option>Cooperative Rate</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Min NRs/KG
              </label>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Max NRs/KG
              </label>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
            <span>Filtered matches:</span>
            <span className="text-slate-900 font-black">
              {filteredPricesByTime.length} items
            </span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Active crops:</span>
            <span className="text-slate-900 font-black">
              {DEFAULT_TOP_STAPLES.length} staples
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters &amp;
            Sorting
          </button>
        </div>
      </div>
    </div>
  );
}
