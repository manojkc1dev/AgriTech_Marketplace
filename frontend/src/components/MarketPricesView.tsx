import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MarketPrice, PriceAlert, PriceNotification, User } from "../types";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  Search, Filter, TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Activity, 
  RefreshCw, ArrowUpRight, ArrowDownRight, Minus, Bell, BellRing, Plus, Trash2, 
  Sparkles, CheckCircle2, AlertTriangle, X, Check, Tag, ChevronRight, Sliders, ShieldCheck,
  Layers, Building2, ArrowRightLeft, Scale, GitCompare, ShoppingCart
} from "lucide-react";
import TopStapleCropsChart from "./TopStapleCropsChart";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

interface MarketPricesViewProps {
  user?: User | null;
  token?: string;
}

export default function MarketPricesView({ user, token: propsToken }: MarketPricesViewProps) {
  const { t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
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
  const [sortByPrice, setSortByPrice] = useState<"default" | "low-to-high" | "high-to-low">("default");
  const [pricingTier, setPricingTier] = useState<"all" | "under-50" | "50-100" | "over-100">("all");
  const [selectedChartCrop, setSelectedChartCrop] = useState("Tomato (Golbheda)");
  const [selectedChartRegion, setSelectedChartRegion] = useState("Kathmandu");

  // Dual Crop Side-by-Side Comparison State
  const [compareCropA, setCompareCropA] = useState("Potato (Alu)");
  const [compareCropB, setCompareCropB] = useState("Tomato (Golbheda)");
  const [compareDistrict, setCompareDistrict] = useState("all");

  // Active Token calculation
  const activeToken = propsToken || localStorage.getItem("agritech_token") || "";

  // Price Alerts & Threshold Notifications State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [priceNotifications, setPriceNotifications] = useState<PriceNotification[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertCrop, setAlertCrop] = useState("Tomato (Golbheda)");
  const [alertCriteria, setAlertCriteria] = useState<"above" | "below">("above");
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

  // Refresh highlight animation state
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>("");

  // Fetch prices
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterCrop) query.append("crop", filterCrop);
      if (filterRegion) query.append("region", filterRegion);
      if (selectedDistrict !== "all") query.append("district", selectedDistrict);
      if (selectedCategory !== "all") query.append("category", selectedCategory);

      const res = await fetch(`/api/prices?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrices(data);
          setJustRefreshed(true);
          setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setJustRefreshed(false), 3000);
        }
      }
    } catch {
      // Silently handle temporary fetch failures during server restarts
    } finally {
      setLoading(false);
    }
  };

  // Fetch Price Alerts and Notifications
  const fetchAlertsAndNotifications = async () => {
    if (!activeToken) return;
    try {
      const alertsRes = await fetch("/api/price-alerts", {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (Array.isArray(data)) setPriceAlerts(data);
      }

      const notifRes = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        if (Array.isArray(data)) setPriceNotifications(data);
      }
    } catch {
      // Silently handle temporary fetch failures
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchAlertsAndNotifications();
  }, [filterCrop, filterRegion, filterDistrict, selectedDistrict, selectedCategory, activeToken]);

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
        const res = await fetch("/api/price-alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            crop: alertCrop,
            criteria: alertCriteria,
            priceThreshold: Number(alertThreshold),
            region: alertRegion,
            district: alertDistrict,
            email: alertEmail || user?.email || ""
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAlertSuccess(`Price alert saved! You will receive visual alerts when ${alertCrop} market rate is ${alertCriteria} NRs. ${alertThreshold}/KG.`);
          fetchAlertsAndNotifications();
        } else {
          const errData = await res.json();
          setAlertError(errData.error || "Failed to create price alert.");
        }
      } else {
        // Fallback for guest session
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
          created_at: new Date().toISOString()
        };
        setPriceAlerts(prev => [newLocalAlert, ...prev]);
        setAlertSuccess(`Price alert saved! You will receive visual alerts when ${alertCrop} market rate is ${alertCriteria} NRs. ${alertThreshold}/KG.`);
      }

      setTimeout(() => setAlertSuccess(""), 4000);
    } catch (err: any) {
      setAlertError("Error creating price alert: " + (err.message || ""));
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  // Handle Delete Price Alert
  const handleDeleteAlert = async (id: string) => {
    try {
      if (activeToken) {
        const res = await fetch(`/api/price-alerts/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (res.ok) {
          setPriceAlerts(prev => prev.filter(a => a.id !== id));
        }
      } else {
        setPriceAlerts(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  // Handle Toggle Alert Active
  const handleToggleAlertActive = async (id: string, currentIsActive: boolean) => {
    try {
      if (activeToken) {
        const res = await fetch(`/api/price-alerts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`
          },
          body: JSON.stringify({ isActive: !currentIsActive })
        });
        if (res.ok) {
          setPriceAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentIsActive } : a));
        }
      } else {
        setPriceAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentIsActive } : a));
      }
    } catch (err) {
      console.error("Failed to toggle alert active state:", err);
    }
  };

  // Simulate price surge / test trigger
  const handleSimulateSurge = async () => {
    setIsSimulatingSurge(true);
    setSurgeSimulationSuccess("");
    try {
      if (activeToken) {
        const res = await fetch("/api/price-alerts/test-trigger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            crop: alertCrop,
            price: Number(simulatingSurgePrice || 85),
            region: alertRegion !== "all" ? alertRegion : "Kathmandu",
            district: alertDistrict !== "all" ? alertDistrict : "Kathmandu"
          })
        });

        if (res.ok) {
          const data = await res.json();
          setSurgeSimulationSuccess(`Simulated price surge evaluated! ${data.triggeredCount || 0} alert(s) triggered and logged.`);
          fetchAlertsAndNotifications();
        }
      } else {
        setSurgeSimulationSuccess(`Simulated rate of NRs. ${simulatingSurgePrice}/KG tested against saved alerts!`);
      }
      setTimeout(() => setSurgeSimulationSuccess(""), 4000);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulatingSurge(false);
    }
  };

  // Check if a specific market price triggers any user price alert
  const getTriggeredAlertsForPrice = (p: MarketPrice) => {
    return priceAlerts.filter(a => {
      if (!a.isActive) return false;
      const cropMatch = p.crop.toLowerCase().includes(a.crop.toLowerCase()) || a.crop.toLowerCase().includes(p.crop.toLowerCase());
      const regionMatch = !a.region || a.region === "all" || p.region.toLowerCase() === a.region.toLowerCase();
      if (!cropMatch || !regionMatch) return false;

      if (a.criteria === "above") {
        return p.price_per_unit >= a.priceThreshold;
      } else {
        return p.price_per_unit <= a.priceThreshold;
      }
    });
  };

  // Calculate overall triggered alerts across all current market prices
  const allTriggeredAlerts = priceAlerts.filter(alert => {
    if (!alert.isActive) return false;
    return prices.some(p => {
      const cropMatch = p.crop.toLowerCase().includes(alert.crop.toLowerCase()) || alert.crop.toLowerCase().includes(p.crop.toLowerCase());
      const regionMatch = !alert.region || alert.region === "all" || p.region.toLowerCase() === alert.region.toLowerCase();
      if (!cropMatch || !regionMatch) return false;

      if (alert.criteria === "above") {
        return p.price_per_unit >= alert.priceThreshold;
      } else {
        return p.price_per_unit <= alert.priceThreshold;
      }
    });
  });

  // Calculate 1-week price trends for active prices
  const getWeeklyTrend = (currentPrice: MarketPrice) => {
    // Find historical entries for the exact same crop, region, and market origin
    const history = prices.filter(
      h => h.crop === currentPrice.crop && 
           h.region === currentPrice.region && 
           h.source_market === currentPrice.source_market
    );

    if (history.length <= 1) {
      return { percentChange: 0, direction: "neutral" as const, diff: 0, oldPrice: currentPrice.price_per_unit };
    }

    // Parse current record date
    const curDate = new Date(currentPrice.date);

    // Find the record closest to 7 days in the past relative to this record's date
    let bestMatch: MarketPrice | null = null;
    let minDiff = Infinity;

    for (const h of history) {
      if (h.id === currentPrice.id) continue;
      const hDate = new Date(h.date);
      const daysDiff = (curDate.getTime() - hDate.getTime()) / (1000 * 3600 * 24);

      // Must be strictly older than the current record
      if (daysDiff > 0.5) {
        const targetDiff = Math.abs(daysDiff - 7);
        if (targetDiff < minDiff) {
          minDiff = targetDiff;
          bestMatch = h;
        }
      }
    }

    // Fallback: if we are viewing the oldest record, find the closest newer record to compare with (and invert trend)
    if (!bestMatch) {
      let newestMatch: MarketPrice | null = null;
      let minNewerDiff = Infinity;
      for (const h of history) {
        if (h.id === currentPrice.id) continue;
        const hDate = new Date(h.date);
        const daysDiff = (hDate.getTime() - curDate.getTime()) / (1000 * 3600 * 24);
        if (daysDiff > 0.5) {
          if (daysDiff < minNewerDiff) {
            minNewerDiff = daysDiff;
            newestMatch = h;
          }
        }
      }
      if (newestMatch) {
        // Compare oldest (current) to newestMatch, but we invert it to show the direction from oldest to newer
        const oldP = currentPrice.price_per_unit;
        const newP = newestMatch.price_per_unit;
        const diff = newP - oldP;
        const percentChange = oldP > 0 ? (diff / oldP) * 100 : 0;
        return {
          percentChange,
          direction: diff > 0.1 ? ("up" as const) : diff < -0.1 ? ("down" as const) : ("neutral" as const),
          diff,
          oldPrice: oldP
        };
      }
      return { percentChange: 0, direction: "neutral" as const, diff: 0, oldPrice: currentPrice.price_per_unit };
    }

    const oldPrice = bestMatch.price_per_unit;
    const newPrice = currentPrice.price_per_unit;
    const diff = newPrice - oldPrice;
    const percentChange = oldPrice > 0 ? (diff / oldPrice) * 100 : 0;

    let direction: "up" | "down" | "neutral" = "neutral";
    if (diff > 0.1) direction = "up";
    else if (diff < -0.1) direction = "down";

    return { percentChange, direction, diff, oldPrice };
  };

  // Category definition helper
  const CATEGORIES = [
    { id: "all", label: "All Categories", iconEmoji: "🌾" },
    { id: "vegetables", label: "Vegetables", iconEmoji: "🥦" },
    { id: "fruits", label: "Fruits", iconEmoji: "🍎" },
    { id: "grains", label: "Grains & Cereals", iconEmoji: "🌾" },
    { id: "spices", label: "Spices & Herbs", iconEmoji: "🧄" },
    { id: "pulses", label: "Pulses & Seeds", iconEmoji: "🥜" }
  ];

  const DISTRICTS = [
    { id: "all", name: "All Districts", marketName: "National Index" },
    { id: "Kathmandu", name: "Kathmandu", marketName: "Kalimati & Tokha Mandi" },
    { id: "Dhading", name: "Dhading", marketName: "Dhading Wholesale & Malekhu" },
    { id: "Makwanpur", name: "Makwanpur", marketName: "Hetauda Mandi & Palung" },
    { id: "Chitwan", name: "Chitwan / Terai", marketName: "Narayangarh & Terai Mandi" }
  ];

  const getCropCategory = (p: MarketPrice): string => {
    if (p.category) return p.category;
    const c = p.crop.toLowerCase();
    if (c.includes("potato") || c.includes("tomato") || c.includes("cauliflower") || c.includes("cabbage") || c.includes("radish") || c.includes("alu") || c.includes("golbheda") || c.includes("kauli")) return "vegetables";
    if (c.includes("apple") || c.includes("banana") || c.includes("orange") || c.includes("syau") || c.includes("kera") || c.includes("suntala")) return "fruits";
    if (c.includes("rice") || c.includes("paddy") || c.includes("maize") || c.includes("wheat") || c.includes("dhan") || c.includes("makkai") || c.includes("gahu")) return "grains";
    if (c.includes("ginger") || c.includes("onion") || c.includes("garlic") || c.includes("chili") || c.includes("aduwa") || c.includes("pyaj") || c.includes("lasun")) return "spices";
    if (c.includes("lentil") || c.includes("dal") || c.includes("mustard") || c.includes("tori")) return "pulses";
    return "vegetables";
  };

  const getPriceDistrict = (p: MarketPrice): string => {
    if (p.district) return p.district;
    if (p.region === "Kathmandu") return "Kathmandu";
    const m = p.source_market.toLowerCase();
    if (m.includes("dhading")) return "Dhading";
    if (m.includes("makwanpur") || m.includes("hetauda")) return "Makwanpur";
    if (m.includes("chitwan") || m.includes("narayangarh") || m.includes("itahari") || p.region === "Terai") return "Chitwan";
    if (p.region === "Hill") return "Dhading";
    return "Kathmandu";
  };

  // Extract unique crops dynamically
  const cropsList = Array.from(new Set(prices.map(p => p.crop))).sort();

  // Category and district item counts
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return prices.length;
    return prices.filter(p => getCropCategory(p) === catId).length;
  };

  const getDistrictCount = (distId: string) => {
    if (distId === "all") return prices.length;
    return prices.filter(p => getPriceDistrict(p) === distId).length;
  };

  // Filter and sort prices client-side based on category, district, search, pricing tier, range, and sorting options
  let filteredPrices = prices.filter(p => {
    // 0. Multi-field Search Query Filter (Crop name, Cooperative/Market, Category/Type, District/Region)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCrop = p.crop.toLowerCase().includes(q);
      const matchMarket = p.source_market.toLowerCase().includes(q);
      const matchCategory = getCropCategory(p).toLowerCase().includes(q);
      const matchDistrict = (p.district || "").toLowerCase().includes(q) || getPriceDistrict(p).toLowerCase().includes(q) || p.region.toLowerCase().includes(q);

      if (!matchCrop && !matchMarket && !matchCategory && !matchDistrict) {
        return false;
      }
    }

    // 1. Category Filter
    if (selectedCategory !== "all") {
      if (getCropCategory(p) !== selectedCategory) return false;
    }

    // 2. Tab District Filter
    if (selectedDistrict !== "all") {
      if (getPriceDistrict(p) !== selectedDistrict) return false;
    }

    // 3. Dropdown District Filter
    if (filterDistrict) {
      if (getPriceDistrict(p) !== filterDistrict) return false;
    }

    // 4. Crop search filter
    if (filterCrop) {
      if (!p.crop.toLowerCase().includes(filterCrop.toLowerCase())) return false;
    }

    // 5. Region filter
    if (filterRegion && p.region.toLowerCase() !== filterRegion.toLowerCase()) return false;

    // 6. Pricing Tier option filter
    if (pricingTier === "under-50" && p.price_per_unit >= 50) return false;
    if (pricingTier === "50-100" && (p.price_per_unit < 50 || p.price_per_unit > 100)) return false;
    if (pricingTier === "over-100" && p.price_per_unit <= 100) return false;

    // 7. Custom Minimum & Maximum Price
    if (minPriceFilter && p.price_per_unit < Number(minPriceFilter)) return false;
    if (maxPriceFilter && p.price_per_unit > Number(maxPriceFilter)) return false;

    return true;
  });

  // Sort prices if specified
  if (sortByPrice === "low-to-high") {
    filteredPrices = [...filteredPrices].sort((a, b) => a.price_per_unit - b.price_per_unit);
  } else if (sortByPrice === "high-to-low") {
    filteredPrices = [...filteredPrices].sort((a, b) => b.price_per_unit - a.price_per_unit);
  }

  // Active Price Directory: Filter by latest collection date & cap to 20 products for clean testing
  const latestDateInDb = prices.length > 0 ? prices[0].date : "";
  let directoryPrices = filteredPrices.filter(p => !latestDateInDb || p.date === latestDateInDb);
  if (directoryPrices.length === 0) {
    directoryPrices = filteredPrices.slice(0, 20);
  } else if (directoryPrices.length > 20) {
    directoryPrices = directoryPrices.slice(0, 20);
  }

  // Prepare chart data: Get daily entries for selected crop & region, sorted chronologically
  const chartData = prices
    .filter(p => p.crop === selectedChartCrop && p.region === selectedChartRegion)
    .map(p => ({
      date: p.date.substring(5), // Just MM-DD
      price: p.price_per_unit,
      market: p.source_market
    }))
    // Sort chronological for chart
    .sort((a, b) => a.date.localeCompare(b.date));

  // Key price stats
  const averagePrice = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.price, 0) / chartData.length) 
    : 0;

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(item => item.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(item => item.price)) : 0;
  const volatility = maxPrice - minPrice;

  // --- Side-by-Side Dual Crop Comparison Calculations ---
  const handleSwapCrops = () => {
    const temp = compareCropA;
    setCompareCropA(compareCropB);
    setCompareCropB(temp);
  };

  const pCropA = prices.filter(p => p.crop === compareCropA && (compareDistrict === "all" || getPriceDistrict(p) === compareDistrict));
  const pCropB = prices.filter(p => p.crop === compareCropB && (compareDistrict === "all" || getPriceDistrict(p) === compareDistrict));

  const avgCropA = pCropA.length > 0 ? Math.round(pCropA.reduce((sum, item) => sum + item.price_per_unit, 0) / pCropA.length) : 0;
  const avgCropB = pCropB.length > 0 ? Math.round(pCropB.reduce((sum, item) => sum + item.price_per_unit, 0) / pCropB.length) : 0;
  const priceDiff = avgCropB - avgCropA;
  const priceDiffPct = avgCropA > 0 ? Math.round(((avgCropB - avgCropA) / avgCropA) * 100) : 0;

  // Comparison Table rows grouped by district
  const comparisonDistrictsList = DISTRICTS.filter(d => d.id !== "all");
  const sideBySideTableRows = comparisonDistrictsList.map(dist => {
    const pricesAInDist = prices.filter(p => p.crop === compareCropA && getPriceDistrict(p) === dist.id);
    const pricesBInDist = prices.filter(p => p.crop === compareCropB && getPriceDistrict(p) === dist.id);

    const rateA = pricesAInDist.length > 0 ? Math.round(pricesAInDist.reduce((s, x) => s + x.price_per_unit, 0) / pricesAInDist.length) : 0;
    const rateB = pricesBInDist.length > 0 ? Math.round(pricesBInDist.reduce((s, x) => s + x.price_per_unit, 0) / pricesBInDist.length) : 0;
    const diff = rateB - rateA;
    const pct = rateA > 0 ? Math.round((diff / rateA) * 100) : 0;

    return {
      districtId: dist.id,
      districtName: dist.name,
      marketName: dist.marketName,
      rateA,
      rateB,
      diff,
      pct
    };
  });

  // Recharts Dual Crop Trend Chart Data
  const allComparisonDates = Array.from(new Set(prices.map(p => p.date as string))).sort();
  const dualCropChartData = allComparisonDates.map((dateStr: string) => {
    const listA = prices.filter(p => p.crop === compareCropA && p.date === dateStr && (compareDistrict === "all" || getPriceDistrict(p) === compareDistrict));
    const listB = prices.filter(p => p.crop === compareCropB && p.date === dateStr && (compareDistrict === "all" || getPriceDistrict(p) === compareDistrict));

    const priceAOnDate = listA.length > 0 ? Math.round(listA.reduce((s, x) => s + x.price_per_unit, 0) / listA.length) : null;
    const priceBOnDate = listB.length > 0 ? Math.round(listB.reduce((s, x) => s + x.price_per_unit, 0) / listB.length) : null;

    return {
      date: dateStr.substring(5), // MM-DD
      [compareCropA]: priceAOnDate,
      [compareCropB]: priceBOnDate
    };
  }).filter(item => item[compareCropA] !== null || item[compareCropB] !== null);

  return (
    <div className="space-y-6">
      {/* Intro Header (Matching B2B Hub & Farmer Dashboard design) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>National Market Price Index (राष्ट्रिय दैनिक बजार मूल्य प्रणाली)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Daily Wholesale Produce Price Index &amp; Rate Tracker
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Authorized real-time mandi rates from Kalimati, Tokha, Dhading, Narayangarh, and regional wholesale markets. Set threshold price alerts and analyze multi-crop historical price trends.
            </p>
          </div>

          {/* Set Price Alert Action Trigger */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition duration-150 flex items-center space-x-2 cursor-pointer border border-amber-400"
              id="open-price-alerts-modal-btn"
            >
              <BellRing className="w-4 h-4 text-slate-950" />
              <span>Set Price Alert</span>
              {priceAlerts.length > 0 && (
                <span className="bg-slate-950 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {priceAlerts.length} Active
                </span>
              )}
            </button>

            <button
              onClick={fetchPrices}
              disabled={loading}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition duration-150 flex items-center space-x-2 cursor-pointer border border-white/20"
              title="Refresh Daily Mandi Rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Alert Notification Banner when Market Prices exceed alert thresholds */}
      <AnimatePresence>
        {allTriggeredAlerts.length > 0 && showTriggeredBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
          >
            {/* Background shimmer animation */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent pointer-events-none"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />

            <div className="flex items-start space-x-3.5 relative z-10">
              <motion.div 
                className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5"
                animate={{ scale: [1, 1.1, 1], rotate: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <BellRing className="w-5 h-5 text-slate-950" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    🚨 Market Price Threshold Exceeded!
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full uppercase tracking-wider shadow-2xs">
                    {allTriggeredAlerts.length} Crop Alert{allTriggeredAlerts.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  Wholesale rate for <strong>{allTriggeredAlerts.map(a => a.crop).join(", ")}</strong> has reached or exceeded your target threshold of NRs. {allTriggeredAlerts[0]?.priceThreshold}/KG in current market records!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0 relative z-10">
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>View Alert Details</span>
              </button>
              <button
                onClick={() => setShowTriggeredBanner(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                title="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: Search and Filter with Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Visualizer Chart (Colspan 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 space-y-2 sm:space-y-0">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Price Trend Line Chart</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical pricing indices based on district regions</p>
              </div>

              {/* Chart Controls */}
              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={selectedChartCrop}
                  onChange={(e) => setSelectedChartCrop(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {cropsList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={selectedChartRegion}
                  onChange={(e) => setSelectedChartRegion(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Kathmandu">Kathmandu District</option>
                  <option value="Hill">Hill Districts (Dhading/Makwanpur)</option>
                  <option value="Terai">Terai Plains</option>
                </select>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center mb-4 border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Rate</div>
                <div className="text-base font-bold text-slate-800">NRs. {averagePrice || "--"} <span className="text-[10px] font-normal text-slate-500">/ KG</span></div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Range</div>
                <div className="text-base font-bold text-slate-800">NRs. {minPrice}-{maxPrice || "--"}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volatility</div>
                <div className="text-base font-bold text-emerald-700 flex items-center justify-center space-x-0.5">
                  <span>{volatility ? `${volatility} NRs` : "Low"}</span>
                </div>
              </div>
            </div>

            {/* Recharts Component */}
            <div className="h-56 mt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc" }}
                      labelStyle={{ fontSize: "10px", color: "#94a3b8" }}
                      itemStyle={{ fontSize: "11px", color: "#34d399" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      name="Price (NRs/KG)" 
                      stroke="#059669" 
                      strokeWidth={2.5} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No historical data found for {selectedChartCrop} in {selectedChartRegion}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search Directory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Search & Filter Directory</span>
            </h3>

            <div className="space-y-4">
              {/* Filter Crop / Product Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Product Name (Crop)</label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product name..."
                    value={filterCrop}
                    onChange={(e) => setFilterCrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 pl-9 pr-4 text-sm text-slate-700 transition"
                  />
                </div>
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 transition"
                >
                  <option value="">-- Quick Product Select --</option>
                  {cropsList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Filter Region */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Filter by Region</label>
                <select
                  value={filterDistrict}
                  onChange={(e) => {
                    const dist = e.target.value;
                    setFilterDistrict(dist);
                    if (dist === "Kathmandu") {
                      setFilterRegion("Kathmandu");
                    } else if (dist === "Dhading" || dist === "Makwanpur") {
                      setFilterRegion("Hill");
                    } else {
                      setFilterRegion("");
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  <option value="">All Regions</option>
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Dhading">Dhading</option>
                  <option value="Makwanpur">Makwanpur</option>
                </select>
              </div>

              {/* Pricing Options */}
              <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing Options</span>
                
                {/* Pricing Tier Dropdown */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Pricing Tier</label>
                  <select
                    value={pricingTier}
                    onChange={(e) => setPricingTier(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-1.5 px-2.5 text-xs text-slate-700 transition"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-50">Budget (Under NRs. 50 / KG)</option>
                    <option value="50-100">Mid-Range (NRs. 50 - 100 / KG)</option>
                    <option value="over-100">Premium (Over NRs. 100 / KG)</option>
                  </select>
                </div>

                {/* Custom Price Range (Min/Max) */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Price Range (NRs/KG)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceFilter}
                      onChange={(e) => setMinPriceFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-1.5 px-2.5 text-xs text-slate-700 transition"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceFilter}
                      onChange={(e) => setMaxPriceFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-1.5 px-2.5 text-xs text-slate-700 transition"
                    />
                  </div>
                </div>

                {/* Sort Option */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Sort by Wholesale Price</label>
                  <select
                    value={sortByPrice}
                    onChange={(e) => setSortByPrice(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-1.5 px-2.5 text-xs text-slate-700 transition"
                  >
                    <option value="default">Default (Latest Date)</option>
                    <option value="low-to-high">Wholesale Rate: Low to High</option>
                    <option value="high-to-low">Wholesale Rate: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Status Counters */}
              <div className="border-t border-slate-200 pt-3 mt-4 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between items-center">
                  <span>Filtered matches:</span>
                  <span className="font-bold text-slate-700">{filteredPrices.length} of {prices.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Unique crops:</span>
                  <span className="font-bold text-slate-700">{cropsList.length} items</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDistrict("all");
              setSelectedCategory("all");
              setFilterCrop("");
              setFilterRegion("");
              setFilterDistrict("");
              setMinPriceFilter("");
              setMaxPriceFilter("");
              setPricingTier("all");
              setSortByPrice("default");
            }}
            className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs transition duration-150 border border-slate-200 cursor-pointer"
          >
            Reset All Filters &amp; Sorting
          </button>
        </div>
      </div>


      {/* Universal Search Bar & Quick Discovery Hub */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display flex items-center space-x-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>Search Crops, Cooperatives &amp; Markets</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quickly find specific crops, agricultural cooperatives, wholesale mandis, or category types by name or location.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              Showing {directoryPrices.length} active products
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer border border-slate-200"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input Control */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-emerald-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop name (e.g. Potato, Aduwa), cooperative/mandi (e.g. Kalimati, Tokha, Dhading), or category (e.g. Vegetables, Spices)..."
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none rounded-xl py-3 pl-11 pr-10 text-sm font-medium text-slate-800 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Search Pills */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Popular Quick Searches:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {/* Crops */}
            {[
              { label: "🥔 Potato", query: "Potato" },
              { label: "🍅 Tomato", query: "Tomato" },
              { label: "🧄 Ginger", query: "Ginger" },
              { label: "🌾 Rice", query: "Rice" },
              { label: "🍎 Apple", query: "Apple" },
            ].map(pill => (
              <button
                key={pill.label}
                onClick={() => setSearchQuery(pill.query)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  searchQuery.toLowerCase() === pill.query.toLowerCase()
                    ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {pill.label}
              </button>
            ))}

            <span className="self-center text-slate-300 font-bold mx-1">|</span>

            {/* Cooperatives & Markets */}
            {[
              { label: "🏛️ Kalimati Mandi", query: "Kalimati" },
              { label: "🏢 Tokha Sub-Market", query: "Tokha" },
              { label: "🚛 Dhading Wholesale", query: "Dhading" },
              { label: "🏬 Hetauda Mandi", query: "Hetauda" },
              { label: "🌱 Krishi Cooperative", query: "Cooperative" },
            ].map(pill => (
              <button
                key={pill.label}
                onClick={() => setSearchQuery(pill.query)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  searchQuery.toLowerCase() === pill.query.toLowerCase()
                    ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {pill.label}
              </button>
            ))}

            <span className="self-center text-slate-300 font-bold mx-1">|</span>

            {/* Category Types */}
            {[
              { label: "🥦 Vegetables", query: "Vegetables" },
              { label: "🍎 Fruits", query: "Fruits" },
              { label: "🧄 Spices", query: "Spices" },
              { label: "🌾 Grains", query: "Grains" },
              { label: "🫘 Pulses", query: "Pulses" },
            ].map(pill => (
              <button
                key={pill.label}
                onClick={() => setSearchQuery(pill.query)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  searchQuery.toLowerCase() === pill.query.toLowerCase()
                    ? "bg-purple-600 text-white border-purple-600 font-bold shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Index Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
        {/* Animated Refresh Feedback Banner Toast */}
        <AnimatePresence>
          {justRefreshed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between font-medium shadow-inner"
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                </motion.div>
                <span>Live market rates refreshed successfully! {lastRefreshedTime && `(Updated at ${lastRefreshedTime})`}</span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-emerald-100 font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Live Data Synchronized
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-2">
              <span>Active Price Directory</span>
              {justRefreshed && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-emerald-500 inline-block" 
                  title="Recently updated"
                />
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Live rates collected daily from wholesale markets</p>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition disabled:opacity-50 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 0.8, ease: "linear" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
            <span>{loading ? "Refreshing..." : "Update Rates"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold text-[10px] tracking-wider uppercase">
                <th className="py-3 px-4">Crop Item</th>
                <th className="py-3 px-4">Market Origin</th>
                <th className="py-3 px-4">District / Region</th>
                <th className="py-3 px-4">Daily Wholesale Rate</th>
                <th className="py-3 px-4">Weekly Trend</th>
                <th className="py-3 px-4">Date Registered</th>
                <th className="py-3 px-4 text-right">Price Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {directoryPrices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No directory listings matched the filters.
                  </td>
                </tr>
              ) : (
                directoryPrices.map((p, idx) => {
                  const triggeredAlerts = getTriggeredAlertsForPrice(p);
                  const isTriggered = triggeredAlerts.length > 0;
                  const savedAlert = priceAlerts.find(a => 
                    a.crop.toLowerCase().includes(p.crop.toLowerCase()) || p.crop.toLowerCase().includes(a.crop.toLowerCase())
                  );

                  return (
                    <motion.tr 
                      key={p.id} 
                      initial={{ opacity: 0, y: 4 }}
                      animate={
                        isTriggered
                          ? { 
                              opacity: 1, 
                              y: 0,
                              backgroundColor: [
                                "rgba(254, 243, 199, 0.9)", 
                                "rgba(254, 243, 199, 0.4)", 
                                "rgba(254, 243, 199, 0.9)"
                              ] 
                            }
                          : { opacity: 1, y: 0 }
                      }
                      transition={
                        isTriggered
                          ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                          : { duration: 0.2, delay: idx * 0.02 }
                      }
                      className={`transition-colors duration-150 ${
                        isTriggered 
                          ? "border-l-4 border-l-amber-500 hover:bg-amber-100/80" 
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span>{p.crop}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                            {getCropCategory(p)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.source_market}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            getPriceDistrict(p) === "Kathmandu" 
                              ? "bg-sky-50 text-sky-700 border border-sky-200" 
                              : getPriceDistrict(p) === "Dhading" 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : getPriceDistrict(p) === "Makwanpur"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {getPriceDistrict(p)}
                          </span>
                          <span className="text-[11px] text-slate-400">({p.region})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <span>NRs. {p.price_per_unit}</span>
                            <span className="text-slate-400 text-xs font-normal">/ {p.unit}</span>
                          </div>
                          {isTriggered && (
                            <motion.span 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                              transition={{ repeat: Infinity, duration: 1.6 }}
                              className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded-full w-fit mt-1 shadow-xs border border-amber-400"
                            >
                              <BellRing className="w-3 h-3 text-slate-950 animate-bounce" />
                              <span>Threshold Exceeded (Target ≤ NRs. {triggeredAlerts[0].priceThreshold})</span>
                            </motion.span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {(() => {
                          const trend = getWeeklyTrend(p);
                          if (trend.direction === "up") {
                            return (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center text-emerald-600 font-bold text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
                                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3px]" />
                                  <span>+{trend.percentChange.toFixed(1)}%</span>
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  +NRs. {trend.diff} vs last week
                                </span>
                              </div>
                            );
                          } else if (trend.direction === "down") {
                            return (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center text-rose-600 font-bold text-xs bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full w-fit">
                                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[3px]" />
                                  <span>{trend.percentChange.toFixed(1)}%</span>
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  -NRs. {Math.abs(trend.diff)} vs last week
                                </span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center text-slate-500 font-semibold text-xs bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full w-fit">
                                  <Minus className="w-3.5 h-3.5 mr-0.5 stroke-[2.5px]" />
                                  <span>Stable</span>
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  Baseline rate
                                </span>
                              </div>
                            );
                          }
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        <div className="flex items-center space-x-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          <span>{p.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              addToCart({
                                listingId: "mkt_" + p.id,
                                crop: p.crop,
                                quantity: 10,
                                unit: p.unit || "KG",
                                pricePerUnit: p.price_per_unit,
                                farmerId: "farmer_" + (getPriceDistrict(p) || "Nepal"),
                                farmerName: (getPriceDistrict(p) || "Nepal") + " Smallholder Farm",
                                district: getPriceDistrict(p)
                              });
                              setIsCartOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg transition border bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 flex items-center space-x-1 cursor-pointer shadow-2xs"
                            title="Add 10 KG batch to Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-white" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAlertCrop(p.crop);
                              setAlertThreshold(String(p.price_per_unit));
                              setAlertRegion(p.region);
                              setIsAlertModalOpen(true);
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition border flex items-center space-x-1 cursor-pointer ${
                              savedAlert
                                ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 font-bold"
                                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>{savedAlert ? `Alert (${savedAlert.priceThreshold})` : "Set Alert"}</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Alert Management Modal */}
      <AnimatePresence>
        {isAlertModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center font-bold">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-display">Crop Market Price Alerts</h3>
                    <p className="text-[11px] text-slate-400">Set threshold triggers &amp; receive visual notifications on rate surges</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlertModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                
                {/* Form Card: Set New Alert */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Configure New Price Alert</span>
                  </div>

                  {alertSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{alertSuccess}</span>
                    </motion.div>
                  )}

                  {alertError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2 font-medium"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{alertError}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleCreatePriceAlert} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Crop Selection */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Select Crop Item
                        </label>
                        <select
                          value={alertCrop}
                          onChange={(e) => setAlertCrop(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-800 font-semibold"
                        >
                          {cropsList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Criteria Condition */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Trigger Criteria
                        </label>
                        <select
                          value={alertCriteria}
                          onChange={(e) => setAlertCriteria(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-800 font-semibold"
                        >
                          <option value="above">Price Exceeds Target (≥ Threshold)</option>
                          <option value="below">Price Drops Below Target (≤ Threshold)</option>
                        </select>
                      </div>

                      {/* Target Price Threshold */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Price Threshold (NRs / KG)
                        </label>
                        <div className="relative">
                          <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="number"
                            placeholder="e.g. 80"
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 font-bold"
                            required
                          />
                        </div>
                      </div>

                      {/* Preferred Region */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Target Market Region
                        </label>
                        <select
                          value={alertRegion}
                          onChange={(e) => setAlertRegion(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-800 font-semibold"
                        >
                          <option value="all">All Market Regions</option>
                          <option value="Kathmandu">Kathmandu District</option>
                          <option value="Hill">Hill Districts (Dhading/Makwanpur)</option>
                          <option value="Terai">Terai Plains</option>
                        </select>
                      </div>
                    </div>

                    {/* Email Subscription field */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Notification Email Subscription (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. farmer@krishisajha.np"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingAlert}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>{isSubmittingAlert ? "Saving Price Alert..." : "Save Price Threshold Alert"}</span>
                    </button>
                  </form>
                </div>

                {/* List of Active Price Alerts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>Saved Price Alerts ({priceAlerts.length})</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Auto-monitored against daily wholesale prices
                    </span>
                  </div>

                  {priceAlerts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                      No active price alerts saved yet. Use the form above or click "Set Alert" on any crop listing in the directory table.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {priceAlerts.map(alert => {
                        // Check if currently triggered
                        const isTriggered = prices.some(p => {
                          const cropMatch = p.crop.toLowerCase().includes(alert.crop.toLowerCase()) || alert.crop.toLowerCase().includes(p.crop.toLowerCase());
                          const regionMatch = !alert.region || alert.region === "all" || p.region.toLowerCase() === alert.region.toLowerCase();
                          if (!cropMatch || !regionMatch) return false;
                          return alert.criteria === "above" ? p.price_per_unit >= alert.priceThreshold : p.price_per_unit <= alert.priceThreshold;
                        });

                        const currentMarketItem = prices.find(p => p.crop.toLowerCase().includes(alert.crop.toLowerCase()));
                        const currentPrice = currentMarketItem ? currentMarketItem.price_per_unit : null;

                        return (
                          <div
                            key={alert.id}
                            className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                              isTriggered
                                ? "bg-amber-50 border-amber-300 shadow-2xs"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-800 text-sm">{alert.crop}</span>
                                <span className={`px-2 py-0.25 text-[10px] font-bold rounded-full ${
                                  isTriggered
                                    ? "bg-amber-500 text-slate-950 animate-pulse"
                                    : alert.isActive
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {isTriggered ? "🚨 THRESHOLD EXCEEDED" : alert.isActive ? "ACTIVE" : "PAUSED"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 flex items-center space-x-3">
                                <span>Target: <strong>NRs. {alert.priceThreshold}/KG</strong> ({alert.criteria})</span>
                                {currentPrice && (
                                  <span className="text-slate-400">Current Rate: <strong className="text-slate-700">NRs. {currentPrice}/KG</strong></span>
                                )}
                                <span className="text-slate-400">Region: <strong className="text-slate-600">{alert.region || "All"}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleAlertActive(alert.id, alert.isActive)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition border cursor-pointer ${
                                  alert.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {alert.isActive ? "Pause" : "Enable"}
                              </button>
                              <button
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Delete alert"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price Surge Simulation Tool */}
                <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Price Surge Simulator &amp; Notification Test</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test your price alert configurations by simulating a market rate surge in wholesale markets.
                  </p>

                  {surgeSimulationSuccess && (
                    <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs rounded-lg flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{surgeSimulationSuccess}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="number"
                        placeholder="Simulated Rate NRs/KG"
                        value={simulatingSurgePrice}
                        onChange={(e) => setSimulatingSurgePrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      onClick={handleSimulateSurge}
                      disabled={isSimulatingSurge}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSurge ? "animate-spin" : ""}`} />
                      <span>{isSimulatingSurge ? "Testing..." : "Simulate Price Surge"}</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
