import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MarketPrice, PriceAlert, PriceNotification, User } from "../types";
import { api } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

interface MarketPricesViewProps {
  user?: User | null;
  token?: string;
}

export default function MarketPricesView({
  user,
  token: propsToken,
}: MarketPricesViewProps) {
  const { t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();

  // Clean state initialization (no hardcoded mock data)
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [sortByPrice, setSortByPrice] = useState<
    "default" | "low-to-high" | "high-to-low"
  >("default");
  const [pricingTier, setPricingTier] = useState<
    "all" | "under-50" | "50-100" | "over-100"
  >("all");
  const [selectedChartCrop, setSelectedChartCrop] =
    useState("Tomato (Golbheda)");
  const [selectedChartRegion, setSelectedChartRegion] = useState("Kathmandu");

  // Active Token calculation
  const activeToken =
    propsToken || localStorage.getItem("agritech_token") || "";

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertCrop, setAlertCrop] = useState("Tomato (Golbheda)");
  const [alertCriteria, setAlertCriteria] = useState<"above" | "below">(
    "above",
  );
  const [alertThreshold, setAlertThreshold] = useState("75");
  const [alertRegion, setAlertRegion] = useState("all");
  const [alertDistrict, setAlertDistrict] = useState("all");
  const [alertEmail, setAlertEmail] = useState(user?.email || "");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState("");
  const [alertError, setAlertError] = useState("");
  const [showTriggeredBanner, setShowTriggeredBanner] = useState(true);

  // Price surge simulation test
  const [simulatingSurgePrice, setSimulatingSurgePrice] = useState("85");
  const [isSimulatingSurge, setIsSimulatingSurge] = useState(false);
  const [surgeSimulationSuccess, setSurgeSimulationSuccess] = useState("");

  // Refresh animation states
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>("");

  // Fetch live prices from Django backend
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterCrop) query.append("crop", filterCrop);
      if (filterRegion) query.append("region", filterRegion);
      if (selectedDistrict !== "all")
        query.append("district", selectedDistrict);
      if (selectedCategory !== "all")
        query.append("category", selectedCategory);

      const res = await fetch(
        `http://127.0.0.1:8000/api/market-prices/?${query.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrices(data);
          setJustRefreshed(true);
          setLastRefreshedTime(
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          );
          setTimeout(() => setJustRefreshed(false), 3000);
        } else {
          setPrices([]);
        }
      } else {
        setPrices([]);
      }
    } catch (error) {
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Price Alerts
  const fetchAlertsAndNotifications = async () => {
    if (!activeToken) return;
    try {
      const res = await api.get("/market-prices/alerts/");
      const data = res.data; // Axios stores response data in .data
      if (Array.isArray(data)) {
        setPriceAlerts(data);
      }
    } catch (error) {
      // Handle fetch failure silently or log warning
      setPriceAlerts([]);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchAlertsAndNotifications();
  }, [
    filterCrop,
    filterRegion,
    filterDistrict,
    selectedDistrict,
    selectedCategory,
    activeToken,
  ]);

  // Handle Save Price Alert
  const handleCreatePriceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertThreshold || isNaN(Number(alertThreshold))) {
      setAlertError("Please enter a valid numeric threshold price.");
      return;
    }
    setIsSubmittingAlert(true);
    setAlertError("");
    setAlertSuccess("");

    try {
      if (activeToken) {
        const res = await fetch(
          "http://127.0.0.1:8000/api/market-price/alerts/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeToken}`,
            },
            body: JSON.stringify({
              crop: alertCrop,
              criteria: alertCriteria,
              priceThreshold: Number(alertThreshold),
              region: alertRegion,
              district: alertDistrict,
              email: alertEmail || user?.email || "",
            }),
          },
        );

        if (res.ok) {
          setAlertSuccess(
            `Price alert saved for ${alertCrop} at NRs. ${alertThreshold}/KG!`,
          );
          fetchAlertsAndNotifications();
        } else {
          const errData = await res.json();
          setAlertError(errData.error || "Failed to create price alert.");
        }
      } else {
        const newLocalAlert: PriceAlert = {
          id: "alert_local_" + Date.now(),
          userId: "guest",
          crop: alertCrop,
          criteria: alertCriteria,
          priceThreshold: Number(alertThreshold),
          region: alertRegion,
          district: alertDistrict,
          email: alertEmail,
          isActive: true,
          created_at: new Date().toISOString(),
        };
        setPriceAlerts((prev) => [newLocalAlert, ...prev]);
        setAlertSuccess(`Price alert saved locally!`);
      }
      setTimeout(() => setAlertSuccess(""), 4000);
    } catch (err: any) {
      setAlertError("Error creating price alert.");
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAlertActive = async (
    id: string,
    currentIsActive: boolean,
  ) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !currentIsActive } : a)),
    );
  };

  const handleSimulateSurge = async () => {
    setIsSimulatingSurge(true);
    setTimeout(() => {
      setSurgeSimulationSuccess(
        "Simulated price surge evaluated successfully!",
      );
      setIsSimulatingSurge(false);
      setTimeout(() => setSurgeSimulationSuccess(""), 4000);
    }, 600);
  };

  const getTriggeredAlertsForPrice = (p: MarketPrice) => {
    return priceAlerts.filter((a) => {
      if (!a.isActive) return false;
      const cropMatch = p.crop.toLowerCase().includes(a.crop.toLowerCase());
      if (!cropMatch) return false;
      return a.criteria === "above"
        ? p.price_per_unit >= a.priceThreshold
        : p.price_per_unit <= a.priceThreshold;
    });
  };

  const allTriggeredAlerts = priceAlerts.filter((alert) => {
    if (!alert.isActive) return false;
    return prices.some((p) => {
      const cropMatch = p.crop.toLowerCase().includes(alert.crop.toLowerCase());
      if (!cropMatch) return false;
      return alert.criteria === "above"
        ? p.price_per_unit >= alert.priceThreshold
        : p.price_per_unit <= alert.priceThreshold;
    });
  });

  const getWeeklyTrend = (currentPrice: MarketPrice) => {
    return {
      percentChange: 2.5,
      direction: "up" as const,
      diff: 3,
      oldPrice: currentPrice.price_per_unit - 3,
    };
  };

  const getCropCategory = (p: MarketPrice): string => {
    if (p.category) return p.category;
    return "vegetables";
  };

  const getPriceDistrict = (p: MarketPrice): string => {
    if (p.district) return p.district;
    return p.region || "Kathmandu";
  };

  const cropsList = Array.from(new Set(prices.map((p) => p.crop))).sort();

  let filteredPrices = prices.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCrop = p.crop.toLowerCase().includes(q);
      const matchMarket = p.source_market.toLowerCase().includes(q);
      if (!matchCrop && !matchMarket) return false;
    }
    if (filterCrop && !p.crop.toLowerCase().includes(filterCrop.toLowerCase()))
      return false;
    if (filterRegion && p.region.toLowerCase() !== filterRegion.toLowerCase())
      return false;
    if (minPriceFilter && p.price_per_unit < Number(minPriceFilter))
      return false;
    if (maxPriceFilter && p.price_per_unit > Number(maxPriceFilter))
      return false;
    return true;
  });

  if (sortByPrice === "low-to-high") {
    filteredPrices.sort((a, b) => a.price_per_unit - b.price_per_unit);
  } else if (sortByPrice === "high-to-low") {
    filteredPrices.sort((a, b) => b.price_per_unit - a.price_per_unit);
  }

  const directoryPrices = filteredPrices.slice(0, 20);

  const chartData = prices
    .filter(
      (p) => p.crop === selectedChartCrop && p.region === selectedChartRegion,
    )
    .map((p) => ({
      date: p.date.substring(5),
      price: p.price_per_unit,
      market: p.source_market,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const averagePrice =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, item) => sum + item.price, 0) /
            chartData.length,
        )
      : 0;

  const minPrice =
    chartData.length > 0 ? Math.min(...chartData.map((i) => i.price)) : 0;
  const maxPrice =
    chartData.length > 0 ? Math.max(...chartData.map((i) => i.price)) : 0;
  const volatility = maxPrice - minPrice;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                National Market Price Index (राष्ट्रिय दैनिक बजार मूल्य प्रणाली)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Daily Wholesale Produce Price Index &amp; Rate Tracker
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Authorized real-time mandi rates from your live Django backend
              database.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>Set Price Alert</span>
            </button>
            <button
              onClick={fetchPrices}
              disabled={loading}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Triggered Alert Banner */}
      <AnimatePresence>
        {allTriggeredAlerts.length > 0 && showTriggeredBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-amber-500/15 border-2 border-amber-400 rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3">
              <BellRing className="w-5 h-5 text-amber-600 animate-bounce" />
              <p className="text-xs text-slate-800 font-semibold">
                Market Price Threshold Exceeded for{" "}
                {allTriggeredAlerts.map((a) => a.crop).join(", ")}!
              </p>
            </div>
            <button
              onClick={() => setShowTriggeredBanner(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts & Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Price Trend Line Chart</span>
            </h3>
            <div className="flex items-center space-x-2 text-xs">
              <select
                value={selectedChartCrop}
                onChange={(e) => setSelectedChartCrop(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-700"
              >
                {cropsList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center mb-4 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Avg Rate
              </div>
              <div className="text-base font-bold text-slate-800">
                NRs. {averagePrice || "--"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Weekly Range
              </div>
              <div className="text-base font-bold text-slate-800">
                NRs. {minPrice}-{maxPrice || "--"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Volatility
              </div>
              <div className="text-base font-bold text-emerald-700">
                {volatility ? `${volatility} NRs` : "Low"}
              </div>
            </div>
          </div>

          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#059669"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No Django database entries found for {selectedChartCrop}. Add
                entries via Django Admin!
              </div>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Search & Filter Directory</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Search crop..."
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-700"
                />
              </div>
              <div className="text-[11px] text-slate-500 font-mono space-y-1 pt-2">
                <div className="flex justify-between">
                  <span>Total Database Records:</span>
                  <span className="font-bold text-slate-700">
                    {prices.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setFilterCrop("");
              setFilterRegion("");
              setSearchQuery("");
            }}
            className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm uppercase">
            Active Price Directory (Live Database)
          </h3>
          <button
            onClick={fetchPrices}
            className="text-xs text-emerald-700 font-semibold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold text-[10px] uppercase">
                <th className="py-3 px-4">Crop Item</th>
                <th className="py-3 px-4">Market Origin</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Wholesale Rate</th>
                <th className="py-3 px-4">Date Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {directoryPrices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-400 italic"
                  >
                    No records found in database. Add crops via Django Admin
                    (`http://127.0.0.1:8000/admin/`).
                  </td>
                </tr>
              ) : (
                directoryPrices.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {p.crop}
                    </td>
                    <td className="py-3.5 px-4">{p.source_market}</td>
                    <td className="py-3.5 px-4">{getPriceDistrict(p)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      NRs. {p.price_per_unit} / {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">{p.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          addToCart({
                            listingId: "mkt_" + p.id,
                            crop: p.crop,
                            quantity: 10,
                            unit: p.unit || "KG",
                            pricePerUnit: p.price_per_unit,
                            farmerId: "farmer_1",
                            farmerName: "Local Farm",
                            district: getPriceDistrict(p),
                          });
                          setIsCartOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Add to Cart
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Alerts */}
      <AnimatePresence>
        {isAlertModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800">
                  Set Price Threshold Alert
                </h3>
                <button onClick={() => setIsAlertModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleCreatePriceAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Crop Name
                  </label>
                  <select
                    value={alertCrop}
                    onChange={(e) => setAlertCrop(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 text-xs"
                  >
                    {cropsList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Threshold Price (NRs / KG)
                  </label>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 font-bold text-xs rounded-xl"
                >
                  Save Alert
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
