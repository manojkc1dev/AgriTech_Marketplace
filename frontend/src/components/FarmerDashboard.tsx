import React, { useState, useEffect } from "react";
import {
  User,
  ProduceListing,
  Order,
  Negotiation,
  Cooperative,
  MarketPrice,
  SoilLog,
  HarvestRecord,
  PriceAlert,
  PriceNotification,
  CooperativeMessage,
  CooperativeAnnouncement,
  ScanHistoryItem,
} from "../types";
import {
  Plus,
  Check,
  X,
  Send,
  History,
  Building2,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Leaf,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Info,
  BarChart3,
  TrendingDown,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  CloudSun,
  ClipboardList,
  Activity,
  FlaskConical,
  Bell,
  Trash2,
  BellRing,
  Settings,
  ShieldCheck,
  CheckSquare,
  RefreshCw,
  Sparkles,
  Megaphone,
  Calculator,
  Camera,
  QrCode,
  Tag,
  Search,
  Filter,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useLanguage } from "../context/LanguageContext";
import { exportFarmerReportPDF } from "../utils/pdfExport";
import QrScannerModal from "./QrScannerModal";
import PrintableBatchQrModal from "./PrintableBatchQrModal";
import SupplyChainTracker from "./SupplyChainTracker";
import KycVerificationModal from "./KycVerificationModal";
import { NegotiationQrCard } from "./NegotiationQrCard";
import { SendOrderQrModal } from "./SendOrderQrModal";

const CROP_BASE_STATS: Record<
  string,
  { baseYield: number; defaultPrice: number }
> = {
  "Potato (Alu)": { baseYield: 1200, defaultPrice: 40 },
  "Tomato (Golbheda)": { baseYield: 1500, defaultPrice: 65 },
  "Cauliflower (Kauli)": { baseYield: 1000, defaultPrice: 55 },
  "Ginger (Aduwa)": { baseYield: 800, defaultPrice: 110 },
  "Onion (Pyaj)": { baseYield: 900, defaultPrice: 45 },
};

const cropOptions = [
  "Potato (Alu)",
  "Tomato (Golbheda)",
  "Cauliflower (Kauli)",
  "Ginger (Aduwa)",
  "Onion (Pyaj)",
];

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface WeatherDay {
  date: Date;
  dayName: string;
  dateStr: string;
  condition: string;
  iconType: "sun" | "sun-cloud" | "rain" | "storm" | "cloud";
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainProb: number;
  windSpeed: number;
}

const generateForecast = (district: string): WeatherDay[] => {
  const conditions: {
    type: string;
    humidity: number;
    rainProb: number;
    icon: "sun" | "sun-cloud" | "rain" | "storm" | "cloud";
  }[] = [
    { type: "Sunny & Clear", humidity: 45, rainProb: 5, icon: "sun" },
    { type: "Mostly Sunny", humidity: 50, rainProb: 10, icon: "sun-cloud" },
    { type: "Partly Cloudy", humidity: 58, rainProb: 15, icon: "cloud" },
    { type: "Light Showers", humidity: 78, rainProb: 65, icon: "rain" },
    { type: "Heavy Monsoon Rain", humidity: 92, rainProb: 90, icon: "storm" },
    { type: "Scattered Rain", humidity: 80, rainProb: 50, icon: "rain" },
    { type: "Overcast", humidity: 70, rainProb: 25, icon: "cloud" },
  ];

  // Calibrate temperature ranges (in Celsius) based on districts in Nepal
  let baseTempMax = 28;
  let baseTempMin = 18;

  if (district === "Kathmandu") {
    baseTempMax = 25;
    baseTempMin = 15;
  } else if (district === "Dhading") {
    baseTempMax = 29;
    baseTempMin = 19;
  } else if (district === "Makwanpur") {
    baseTempMax = 31;
    baseTempMin = 21;
  } else if (district === "Kavre") {
    baseTempMax = 24;
    baseTempMin = 14;
  } else if (district === "Nuwakot") {
    baseTempMax = 27;
    baseTempMin = 17;
  }

  const startDate = new Date();

  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(startDate.getDate() + idx);

    // Deterministic but realistic rotation
    const cycleIndex =
      (idx + (district ? district.charCodeAt(0) : 7)) % conditions.length;
    const cond = conditions[cycleIndex];

    // Slight natural fluctuations
    const tempOffset = Math.sin(idx) * 2;

    return {
      date: d,
      dayName: idx === 0 ? "Today" : daysOfWeek[d.getDay()],
      dateStr: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      condition: cond.type,
      iconType: cond.icon,
      tempMax: Math.round(baseTempMax + tempOffset),
      tempMin: Math.round(baseTempMin + tempOffset - 8),
      humidity: Math.round(cond.humidity + (idx % 3) * 2),
      rainProb: cond.rainProb,
      windSpeed: Math.round(8 + ((idx * 3) % 12)),
    };
  });
};

interface SuitabilityResult {
  rating: "Optimal" | "Good" | "Risky" | "Danger";
  color: string;
  badge: string;
  desc: string;
}

const getHarvestSuitability = (
  crop: string,
  weather: WeatherDay,
): SuitabilityResult => {
  const prob = weather.rainProb;
  const icon = weather.iconType;

  if (crop === "Potato (Alu)") {
    if (prob >= 75 || icon === "storm") {
      return {
        rating: "Danger",
        color: "bg-rose-50 border-rose-200 text-rose-800",
        badge: "bg-rose-500 text-white",
        desc: "Severe waterlogging risk. Tubers will rot instantly or get heavily bruised and dirty. Do not harvest.",
      };
    }
    if (prob >= 35 || icon === "rain") {
      return {
        rating: "Risky",
        color: "bg-amber-50 border-amber-200 text-amber-800",
        badge: "bg-amber-500 text-white",
        desc: "Damp soil clings to potatoes, delaying drying and promoting mold. Suitable only if cured indoors immediately.",
      };
    }
    return {
      rating: "Optimal",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      badge: "bg-emerald-500 text-white",
      desc: "Perfect dry soil. Potatoes can skin-cure naturally in the sun. Excellent storage longevity.",
    };
  }

  if (crop === "Tomato (Golbheda)") {
    if (prob >= 75 || icon === "storm") {
      return {
        rating: "Danger",
        color: "bg-rose-50 border-rose-200 text-rose-800",
        badge: "bg-rose-500 text-white",
        desc: "Heavy rain causes ripe tomato skin splitting on the vine. Blight disease spreads rapidly in wet conditions.",
      };
    }
    if (prob >= 35 || icon === "rain") {
      return {
        rating: "Risky",
        color: "bg-amber-50 border-amber-200 text-amber-800",
        badge: "bg-amber-500 text-white",
        desc: "Wet conditions. Harvest fruits slightly early (at 'breaker' pink stage) and let them dry on flat racks.",
      };
    }
    return {
      rating: "Optimal",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      badge: "bg-emerald-500 text-white",
      desc: "Dry and sunny. Tomatoes are firm and easily handled. Minimal post-harvest fungal spoilage.",
    };
  }

  if (crop === "Cauliflower (Kauli)") {
    if (icon === "storm" || prob >= 75) {
      return {
        rating: "Danger",
        color: "bg-rose-50 border-rose-200 text-rose-800",
        badge: "bg-rose-500 text-white",
        desc: "Heavy downpours bruise delicate curds, leading to brownish spots and fast rotting.",
      };
    }
    if (prob >= 35 || icon === "rain") {
      return {
        rating: "Risky",
        color: "bg-amber-50 border-amber-200 text-amber-800",
        badge: "bg-amber-500 text-white",
        desc: "Keep wrapper leaves intact to shield white curds. Do not stack wet cauliflowers tightly.",
      };
    }
    return {
      rating: "Optimal",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      badge: "bg-emerald-500 text-white",
      desc: "Bright conditions preserve pure white color of curds. Highly suitable for sorting, washing and immediate sale.",
    };
  }

  if (crop === "Ginger (Aduwa)") {
    if (prob >= 75) {
      return {
        rating: "Risky",
        color: "bg-amber-50 border-amber-200 text-amber-800",
        badge: "bg-amber-500 text-white",
        desc: "Rhizome digging will be heavy and muddy. Risk of washing away nutrient rich topsoil.",
      };
    }
    return {
      rating: "Optimal",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      badge: "bg-emerald-500 text-white",
      desc: "Soil is dry and easy to loosen. Ginger rhizomes slide out clean, minimizing sorting labor.",
    };
  }

  // Onion (Pyaj)
  if (prob >= 35 || icon === "rain" || icon === "storm") {
    return {
      rating: "Danger",
      color: "bg-rose-50 border-rose-200 text-rose-800",
      badge: "bg-rose-500 text-white",
      desc: "Onions must be completely dry. Any rain during or after lifting will ruin scale curing and cause rotting.",
    };
  }
  return {
    rating: "Optimal",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badge: "bg-emerald-500 text-white",
    desc: "Superb drying breeze and high solar exposure. Excellent for field curing onions for 3-4 days.",
  };
};

interface FarmerProps {
  user: User;
  token: string;
  onUserUpdate?: (user: User) => void;
}

export default function FarmerDashboard({
  user,
  token,
  onUserUpdate,
}: FarmerProps) {
  const { language, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coops, setCoops] = useState<Cooperative[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [activeTab, setActiveTab] = useState<
    | "listings"
    | "orders"
    | "coops"
    | "predictions"
    | "climate"
    | "soil"
    | "forecasting"
    | "alerts"
    | "advisor"
    | "calculator"
    | "scans"
  >("listings");
  const [climateCrop, setClimateCrop] = useState("Tomato (Golbheda)");

  // Scan History Log States
  const [scanLogs, setScanLogs] = useState<ScanHistoryItem[]>([]);
  const [isFetchingScanLogs, setIsFetchingScanLogs] = useState(false);
  const [scanFilter, setScanFilter] = useState<
    "all" | "member" | "batch" | "text"
  >("all");
  const [scanSearch, setScanSearch] = useState("");
  const [scanActionSuccess, setScanActionSuccess] = useState("");

  const fetchScanLogs = async () => {
    setIsFetchingScanLogs(true);
    try {
      const res = await fetch("/api/scan-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setScanLogs(await res.json());
      }
    } catch (err) {
      console.error("Failed to load scan history logs:", err);
    } finally {
      setIsFetchingScanLogs(false);
    }
  };

  const handleClearScanHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear your entire QR scan history? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/scan-history/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setScanLogs([]);
        setScanActionSuccess(t("Scan history log cleared successfully."));
        setTimeout(() => setScanActionSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Failed to clear scan history:", err);
    }
  };

  const handleDeleteScanItem = async (id: string) => {
    try {
      const res = await fetch(`/api/scan-history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setScanLogs((prev) => prev.filter((s) => s.id !== id));
        setScanActionSuccess(t("Scan log entry deleted."));
        setTimeout(() => setScanActionSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Failed to delete scan log item:", err);
    }
  };

  // Price Alerts & Notifications States
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [isFetchingAlerts, setIsFetchingAlerts] = useState(false);
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);
  const [alertsError, setAlertsError] = useState("");
  const [notifError, setNotifError] = useState("");
  const [alertSuccess, setAlertSuccess] = useState("");

  // Create alert form states
  const [alertCrop, setAlertCrop] = useState("Tomato (Golbheda)");
  const [alertCriteria, setAlertCriteria] = useState<"above" | "below">(
    "above",
  );
  const [alertThreshold, setAlertThreshold] = useState("");
  const [alertRegion, setAlertRegion] = useState("all");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);

  // Simulation parameters
  const [simulatedPrice, setSimulatedPrice] = useState("50");
  const [isTriggeringSimulation, setIsTriggeringSimulation] = useState(false);
  const [simulationResult, setSimulationResult] = useState("");

  // Weather alerts real-time banner states
  const [weatherAlertSeverity, setWeatherAlertSeverity] = useState<
    "extreme" | "severe" | "moderate" | "normal"
  >("extreme");
  const [weatherAlertDistrict, setWeatherAlertDistrict] = useState<string>(
    user.district || "Dhading",
  );
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  const [showWeatherBanner, setShowWeatherBanner] = useState(() => {
    try {
      const saved = localStorage.getItem("weatherAlertDismissed");
      if (saved) {
        const parsed = JSON.parse(saved);
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const isWithin24Hours =
          Date.now() - (parsed.timestamp || 0) < TWENTY_FOUR_HOURS;
        if (
          isWithin24Hours &&
          parsed.severity === "extreme" &&
          parsed.district === (user.district || "Dhading")
        ) {
          return false;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return true;
  });

  const handleDismissWeatherBanner = () => {
    setShowWeatherBanner(false);
    try {
      localStorage.setItem(
        "weatherAlertDismissed",
        JSON.stringify({
          timestamp: Date.now(),
          severity: weatherAlertSeverity,
          district: weatherAlertDistrict,
        }),
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleReenableWeatherBanner = () => {
    setShowWeatherBanner(true);
    try {
      localStorage.removeItem("weatherAlertDismissed");
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleWeatherDistrictChange = (newDistrict: string) => {
    setWeatherAlertDistrict(newDistrict);
    setShowWeatherBanner(true);
    try {
      localStorage.removeItem("weatherAlertDismissed");
    } catch {}
  };

  const handleWeatherSeverityChange = (
    newSeverity: "extreme" | "severe" | "moderate" | "normal",
  ) => {
    setWeatherAlertSeverity(newSeverity);
    setShowWeatherBanner(true);
    try {
      localStorage.removeItem("weatherAlertDismissed");
    } catch {}
  };

  // QR Scanner & Printable Tag Modal States
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [printableListing, setPrintableListing] =
    useState<ProduceListing | null>(null);
  const [isPrintableQrOpen, setIsPrintableQrOpen] = useState(false);
  const [sendQrModalOrder, setSendQrModalOrder] = useState<Order | null>(null);

  const handleQrPreFillForm = (crop: string, qty: string, price: string) => {
    setActiveTab("listings");
    setNewCrop(crop);
    setNewQty(qty);
    setNewPrice(price);
    setFormSuccess(
      t(
        "Form pre-filled from scanned QR code! Click 'Publish Listing' to confirm.",
      ),
    );
  };

  const fetchAlertsAndNotifications = async () => {
    setIsFetchingAlerts(true);
    setIsFetchingNotifications(true);
    try {
      const alertRes = await fetch("/api/price-alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (alertRes.ok) {
        setPriceAlerts(await alertRes.json());
      } else {
        const err = await alertRes.json();
        setAlertsError(err.error || "Failed to load active alerts");
      }

      const notifRes = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (notifRes.ok) {
        setNotifications(await notifRes.json());
      } else {
        const err = await notifRes.json();
        setNotifError(err.error || "Failed to load notifications");
      }
    } catch (err) {
      console.error("Error loading alerts or notifications:", err);
    } finally {
      setIsFetchingAlerts(false);
      setIsFetchingNotifications(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertsError("");
    setAlertSuccess("");
    if (!alertThreshold || Number(alertThreshold) <= 0) {
      setAlertsError("Please enter a valid positive price threshold.");
      return;
    }
    setIsSubmittingAlert(true);
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: alertCrop,
          criteria: alertCriteria,
          priceThreshold: Number(alertThreshold),
          region: alertRegion,
        }),
      });
      if (res.ok) {
        setAlertSuccess("Price alert registered successfully!");
        setAlertThreshold("");
        fetchAlertsAndNotifications();
        setTimeout(() => setAlertSuccess(""), 3000);
      } else {
        const err = await res.json();
        setAlertsError(err.error || "Failed to register alert.");
      }
    } catch (err) {
      setAlertsError("Network error. Please try again.");
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  const handleToggleAlertActive = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const res = await fetch(`/api/price-alerts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchAlertsAndNotifications();
      }
    } catch (err) {
      console.error("Failed to toggle alert status:", err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm("Are you sure you want to delete this price alert?")) return;
    try {
      const res = await fetch(`/api/price-alerts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAlertsAndNotifications();
      }
    } catch (err) {
      console.error("Failed to delete price alert:", err);
    }
  };

  const handleMarkNotificationRead = async (
    id: string,
    isRead: boolean = true,
  ) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead }),
      });
      if (res.ok) {
        fetchAlertsAndNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAlertsAndNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAlertsAndNotifications();
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleSimulateAlertTrigger = async () => {
    setSimulationResult("");
    setIsTriggeringSimulation(true);
    try {
      const res = await fetch("/api/price-alerts/test-trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: alertCrop,
          price: Number(simulatedPrice),
          region: alertRegion,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.triggeredCount > 0) {
          setSimulationResult(
            `Success! ${data.triggeredCount} alert(s) simulated & triggered.`,
          );
        } else {
          setSimulationResult(
            "Check complete: No active alert criteria were met by this price.",
          );
        }
        fetchAlertsAndNotifications();
      } else {
        const err = await res.json();
        setSimulationResult(err.error || "Simulation failed.");
      }
    } catch (err) {
      setSimulationResult("Network error during simulation.");
    } finally {
      setIsTriggeringSimulation(false);
    }
  };

  // Yield Calculator States
  const [calcLandSize, setCalcLandSize] = useState<number>(3); // Default to 3
  const [calcLandUnit, setCalcLandUnit] = useState<
    "ropani" | "bigha" | "kattha" | "hectare" | "acre"
  >("ropani");
  const [calcCrop, setCalcCrop] = useState<string>("Potato");
  const [calcYieldRate, setCalcYieldRate] = useState<number>(600); // Typical kg per ropani
  const [calcMarketRate, setCalcMarketRate] = useState<number>(45); // Typical price per kg
  const [calcExpenseSeeds, setCalcExpenseSeeds] = useState<number>(3600);
  const [calcExpenseFertilizer, setCalcExpenseFertilizer] =
    useState<number>(2400);
  const [calcExpenseLabor, setCalcExpenseLabor] = useState<number>(4500);
  const [calcExpenseTractor, setCalcExpenseTractor] = useState<number>(1800);
  const [calcExpenseTransport, setCalcExpenseTransport] =
    useState<number>(1200);

  // Crop configuration presets (based on 1 Ropani)
  const calcCropPresets: Record<
    string,
    {
      name: string;
      nepaliName: string;
      yieldPerRopani: number;
      pricePerKg: number;
      expensesPerRopani: {
        seeds: number;
        fertilizer: number;
        labor: number;
        tractor: number;
        transport: number;
      };
    }
  > = {
    Potato: {
      name: "Potato",
      nepaliName: "Potato (आलु)",
      yieldPerRopani: 600,
      pricePerKg: 45,
      expensesPerRopani: {
        seeds: 1200,
        fertilizer: 800,
        labor: 1500,
        tractor: 600,
        transport: 400,
      },
    },
    Tomato: {
      name: "Tomato",
      nepaliName: "Tomato (गोलभेडा)",
      yieldPerRopani: 900,
      pricePerKg: 75,
      expensesPerRopani: {
        seeds: 1500,
        fertilizer: 1000,
        labor: 2000,
        tractor: 600,
        transport: 500,
      },
    },
    Rice: {
      name: "Rice/Paddy",
      nepaliName: "Rice/Paddy (धान)",
      yieldPerRopani: 250,
      pricePerKg: 35,
      expensesPerRopani: {
        seeds: 600,
        fertilizer: 700,
        labor: 1200,
        tractor: 800,
        transport: 300,
      },
    },
    Cauliflower: {
      name: "Cauliflower",
      nepaliName: "Cauliflower (काउली)",
      yieldPerRopani: 750,
      pricePerKg: 65,
      expensesPerRopani: {
        seeds: 1000,
        fertilizer: 900,
        labor: 1800,
        tractor: 600,
        transport: 450,
      },
    },
    Cabbage: {
      name: "Cabbage",
      nepaliName: "Cabbage (बन्दागोभी)",
      yieldPerRopani: 850,
      pricePerKg: 30,
      expensesPerRopani: {
        seeds: 800,
        fertilizer: 800,
        labor: 1600,
        tractor: 600,
        transport: 450,
      },
    },
    Ginger: {
      name: "Ginger",
      nepaliName: "Ginger (अदुवा)",
      yieldPerRopani: 400,
      pricePerKg: 120,
      expensesPerRopani: {
        seeds: 3000,
        fertilizer: 1200,
        labor: 2200,
        tractor: 700,
        transport: 600,
      },
    },
    Onion: {
      name: "Onion",
      nepaliName: "Onion (प्याज)",
      yieldPerRopani: 650,
      pricePerKg: 85,
      expensesPerRopani: {
        seeds: 1400,
        fertilizer: 900,
        labor: 1700,
        tractor: 600,
        transport: 400,
      },
    },
  };

  const landUnitToRopaniMultiplier = {
    ropani: 1,
    bigha: 13.31,
    kattha: 0.6655,
    hectare: 19.65,
    acre: 7.95,
  };

  const handleApplyCropPreset = (
    cropKey: string,
    customLandUnit?: "ropani" | "bigha" | "kattha" | "hectare" | "acre",
  ) => {
    const preset = calcCropPresets[cropKey];
    if (!preset) return;

    const unit = customLandUnit || calcLandUnit;
    const multiplier = landUnitToRopaniMultiplier[unit];

    // Scale typical yield and expenses per unit of land size
    setCalcCrop(cropKey);
    setCalcYieldRate(Math.round(preset.yieldPerRopani * multiplier));

    // Check if we have active live market price for this crop to make it super dynamic
    let currentLivePrice = preset.pricePerKg;
    const liveMatch = marketPrices.filter((p) =>
      p.crop.toLowerCase().includes(preset.name.toLowerCase()),
    );
    if (liveMatch.length > 0) {
      currentLivePrice = liveMatch[0].price_per_unit;
    }
    setCalcMarketRate(currentLivePrice);

    // Multiplier for costs
    setCalcExpenseSeeds(
      Math.round(preset.expensesPerRopani.seeds * multiplier * calcLandSize),
    );
    setCalcExpenseFertilizer(
      Math.round(
        preset.expensesPerRopani.fertilizer * multiplier * calcLandSize,
      ),
    );
    setCalcExpenseLabor(
      Math.round(preset.expensesPerRopani.labor * multiplier * calcLandSize),
    );
    setCalcExpenseTractor(
      Math.round(preset.expensesPerRopani.tractor * multiplier * calcLandSize),
    );
    setCalcExpenseTransport(
      Math.round(
        preset.expensesPerRopani.transport * multiplier * calcLandSize,
      ),
    );
  };

  // Re-calculate costs if land size changes, proportional to current rate per unit
  useEffect(() => {
    const preset = calcCropPresets[calcCrop];
    if (preset) {
      const multiplier = landUnitToRopaniMultiplier[calcLandUnit];
      setCalcExpenseSeeds(
        Math.round(preset.expensesPerRopani.seeds * multiplier * calcLandSize),
      );
      setCalcExpenseFertilizer(
        Math.round(
          preset.expensesPerRopani.fertilizer * multiplier * calcLandSize,
        ),
      );
      setCalcExpenseLabor(
        Math.round(preset.expensesPerRopani.labor * multiplier * calcLandSize),
      );
      setCalcExpenseTractor(
        Math.round(
          preset.expensesPerRopani.tractor * multiplier * calcLandSize,
        ),
      );
      setCalcExpenseTransport(
        Math.round(
          preset.expensesPerRopani.transport * multiplier * calcLandSize,
        ),
      );
    }
  }, [calcLandSize, calcLandUnit, calcCrop]);

  // Contact Cooperative States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactCrop, setContactCrop] = useState("");
  const [selectedCoopId, setSelectedCoopId] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [coopMessages, setCoopMessages] = useState<CooperativeMessage[]>([]);
  const [announcements, setAnnouncements] = useState<CooperativeAnnouncement[]>(
    [],
  );
  const [isSendingCoopMsg, setIsSendingCoopMsg] = useState(false);
  const [coopMsgSuccess, setCoopMsgSuccess] = useState("");
  const [coopMsgError, setCoopMsgError] = useState("");

  const fetchCoopMessages = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/cooperatives/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setCoopMessages(await res.json());
      }
    } catch (err) {
      console.error("Error fetching cooperative messages:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/cooperatives/announcements`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const handleOpenContactModal = (crop: string) => {
    setContactCrop(crop);
    setContactMessage(
      `Hello, we are looking for support to market/transport our listed crop: ${crop}. We'd like to coordinate with the cooperative.`,
    );
    setCoopMsgSuccess("");
    setCoopMsgError("");

    // Default select first available local cooperative
    if (coops.length > 0) {
      setSelectedCoopId(coops[0].id);
    } else {
      setSelectedCoopId("");
    }
    setIsContactModalOpen(true);
  };

  const handleSendCoopMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoopMsgSuccess("");
    setCoopMsgError("");

    if (!selectedCoopId) {
      setCoopMsgError("Please select a cooperative to message.");
      return;
    }
    if (!contactMessage.trim()) {
      setCoopMsgError("Message content cannot be empty.");
      return;
    }

    setIsSendingCoopMsg(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/cooperatives/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cooperativeId: selectedCoopId,
            crop: contactCrop,
            message: contactMessage,
          }),
        },
      );

      if (res.ok) {
        setCoopMsgSuccess(
          "Your message was sent to the cooperative successfully!",
        );
        setContactMessage("");
        fetchCoopMessages();
        setTimeout(() => {
          setIsContactModalOpen(false);
          setCoopMsgSuccess("");
        }, 2000);
      } else {
        const data = await res.json();
        setCoopMsgError(data.error || "Failed to send message.");
      }
    } catch (err) {
      setCoopMsgError("Network error. Please try again.");
    } finally {
      setIsSendingCoopMsg(false);
    }
  };

  // Notification Preferences States
  const [smsDemandAlerts, setSmsDemandAlerts] = useState(
    !!user.smsDemandAlerts,
  );
  const [inAppDemandAlerts, setInAppDemandAlerts] = useState(
    !!user.inAppDemandAlerts,
  );
  const [smsWeatherAlerts, setSmsWeatherAlerts] = useState(
    !!user.smsWeatherAlerts,
  );
  const [inAppWeatherAlerts, setInAppWeatherAlerts] = useState(
    !!user.inAppWeatherAlerts,
  );
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState("");
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    setSmsDemandAlerts(!!user.smsDemandAlerts);
    setInAppDemandAlerts(!!user.inAppDemandAlerts);
    setSmsWeatherAlerts(!!user.smsWeatherAlerts);
    setInAppWeatherAlerts(!!user.inAppWeatherAlerts);
  }, [user]);

  const handleSaveNotifications = async (
    newSmsDemand: boolean,
    newInAppDemand: boolean,
    newSmsWeather: boolean,
    newInAppWeather: boolean,
  ) => {
    setNotificationSuccess("");
    setNotificationError("");
    setIsSavingNotifications(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smsDemandAlerts: newSmsDemand,
          inAppDemandAlerts: newInAppDemand,
          smsWeatherAlerts: newSmsWeather,
          inAppWeatherAlerts: newInAppWeather,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotificationSuccess("Preferences updated successfully!");
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }
        setTimeout(() => setNotificationSuccess(""), 3000);
      } else {
        const err = await res.json();
        setNotificationError(
          err.error || "Failed to update notification settings.",
        );
      }
    } catch (e) {
      setNotificationError("Network error. Please try again.");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const toggleSmsDemand = () => {
    const nextVal = !smsDemandAlerts;
    setSmsDemandAlerts(nextVal);
    handleSaveNotifications(
      nextVal,
      inAppDemandAlerts,
      smsWeatherAlerts,
      inAppWeatherAlerts,
    );
  };
  const toggleInAppDemand = () => {
    const nextVal = !inAppDemandAlerts;
    setInAppDemandAlerts(nextVal);
    handleSaveNotifications(
      smsDemandAlerts,
      nextVal,
      smsWeatherAlerts,
      inAppWeatherAlerts,
    );
  };
  const toggleSmsWeather = () => {
    const nextVal = !smsWeatherAlerts;
    setSmsWeatherAlerts(nextVal);
    handleSaveNotifications(
      smsDemandAlerts,
      inAppDemandAlerts,
      nextVal,
      inAppWeatherAlerts,
    );
  };
  const toggleInAppWeather = () => {
    const nextVal = !inAppWeatherAlerts;
    setInAppWeatherAlerts(nextVal);
    handleSaveNotifications(
      smsDemandAlerts,
      inAppDemandAlerts,
      smsWeatherAlerts,
      nextVal,
    );
  };

  // Soil & Nutrient Management States
  const [soilLogs, setSoilLogs] = useState<SoilLog[]>([]);
  const [soilCropBatch, setSoilCropBatch] = useState(
    "Tomato (Golbheda) - Block A",
  );
  const [soilLogType, setSoilLogType] = useState<"fertilizer" | "soil_test">(
    "fertilizer",
  );
  const [soilDate, setSoilDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [soilDetails, setSoilDetails] = useState("");
  const [soilError, setSoilError] = useState("");
  const [soilSuccess, setSoilSuccess] = useState("");
  const [isSubmittingSoil, setIsSubmittingSoil] = useState(false);

  // Harvest & Forecasting States
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);
  const [harvestCrop, setHarvestCrop] = useState("Tomato (Golbheda)");
  const [harvestSeason, setHarvestSeason] = useState("Summer 2025");
  const [harvestAcreage, setHarvestAcreage] = useState("2");
  const [harvestQty, setHarvestQty] = useState("");
  const [harvestFertilizer, setHarvestFertilizer] = useState("");
  const [harvestWeather, setHarvestWeather] = useState<
    "optimal" | "dry" | "excessive"
  >("optimal");
  const [harvestSoil, setHarvestSoil] = useState<
    "poor" | "organic" | "balanced"
  >("balanced");
  const [isSubmittingHarvest, setIsSubmittingHarvest] = useState(false);
  const [harvestSuccess, setHarvestSuccess] = useState("");
  const [harvestError, setHarvestError] = useState("");

  // Recommender Simulator States
  const [simSeason, setSimSeason] = useState("Autumn 2026");
  const [simAcreage, setSimAcreage] = useState("2");
  const [simWeather, setSimWeather] = useState<"optimal" | "dry" | "excessive">(
    "optimal",
  );
  const [simSoil, setSimSoil] = useState<"poor" | "organic" | "balanced">(
    "balanced",
  );

  // AI-Powered Crop Harvest & Planting Cycle Forecaster States
  const [aiCrop, setAiCrop] = useState("Tomato (Golbheda)");
  const [aiAcreage, setAiAcreage] = useState("2");
  const [aiSoil, setAiSoil] = useState("balanced");
  const [aiWeather, setAiWeather] = useState("optimal");
  const [aiResult, setAiResult] = useState<{
    yieldEstimate: number;
    plantingCycle: string;
    optimalPlantingDate: string;
    optimalHarvestDate: string;
    riskAssessment: string;
    rationale: string;
    actionableSteps: string[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleGenerateAIForecast = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/ai/forecast-harvest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: aiCrop,
          district: user.district,
          acreage: Number(aiAcreage),
          soilCondition: aiSoil,
          weatherScenario: aiWeather,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate AI forecast");
      }

      const data = await res.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(
        err.message ||
          "Failed to establish secure AI link with agronomy forecaster.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // AI Advisor Tab States
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState("");
  const [advisorResult, setAdvisorResult] = useState<{
    upcomingSeason: string;
    climateTrendSummary: string;
    recommendedCrops: {
      cropName: string;
      variety: string;
      yieldPotential: string;
      daysToHarvest: string;
      irrigationRequirement: string;
      marketDemandTrend: string;
      agronomicTips: string[];
    }[];
    climateAdaptationAdvice: string[];
  } | null>(null);

  const handleGenerateAIAdvisor = async () => {
    setAdvisorLoading(true);
    setAdvisorError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/ai/advisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          district: user.district || "Kathmandu",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || "Failed to generate AI advisor suggestions",
        );
      }

      const data = await res.json();
      setAdvisorResult(data);
    } catch (err: any) {
      console.error(err);
      setAdvisorError(
        err.message || "Failed to establish secure link with AI Climatologist.",
      );
    } finally {
      setAdvisorLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "advisor" && !advisorResult && !advisorLoading) {
      handleGenerateAIAdvisor();
    }
  }, [activeTab]);

  // Prediction Form States
  const [predCrop, setPredCrop] = useState("Tomato (Golbheda)");
  const [predAcreage, setPredAcreage] = useState("2");
  const [predRainfall, setPredRainfall] = useState("optimal");
  const [predSoil, setPredSoil] = useState("balanced");
  const [predPest, setPredPest] = useState("low");
  const [historyRegion, setHistoryRegion] = useState<
    "all" | "Kathmandu" | "Terai" | "Hill"
  >("all");

  // Create listing form state
  const [newCrop, setNewCrop] = useState("Tomato (Golbheda)");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Expand states
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [negotiations, setNegotiations] = useState<
    Record<string, Negotiation[]>
  >({});

  // Negotiation input states
  const [negPrice, setNegPrice] = useState<Record<string, string>>({});
  const [negMsg, setNegMsg] = useState<Record<string, string>>({});

  const fetchFarmerData = async () => {
    try {
      // 1. Fetch farmer's listings
      const listRes = await fetch(
        `http://127.0.0.1:8000/api/listings?farmerId=${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (listRes.ok) {
        setListings(await listRes.json());
      }

      // 2. Fetch incoming orders
      const orderRes = await fetch(`http://127.0.0.1:8000/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (orderRes.ok) {
        setOrders(await orderRes.json());
      }

      // 3. Fetch cooperatives
      const coopRes = await fetch(`http://127.0.0.1:8000/api/cooperatives`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (coopRes.ok) {
        const allCoops = await coopRes.json();
        // Filter coops related to farmer's district
        const relevantCoops = allCoops.filter(
          (c: Cooperative) => c.district === user.district,
        );
        setCoops(relevantCoops);
      }

      // 4. Fetch market prices for crop yield prediction
      const pricesRes = await fetch(`http://127.0.0.1:8000/api/prices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pricesRes.ok) {
        setMarketPrices(await pricesRes.json());
      }

      // 5. Fetch soil & nutrient logs
      const soilRes = await fetch(`http://127.0.0.1:8000/api/soil-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (soilRes.ok) {
        setSoilLogs(await soilRes.json());
      }

      // 6. Fetch harvest records
      const harvestRes = await fetch(
        `http://127.0.0.1:8000/api/harvest-records`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (harvestRes.ok) {
        setHarvestRecords(await harvestRes.json());
      }

      // 7. Fetch Price Alerts and Notifications
      await fetchAlertsAndNotifications();

      // 8. Fetch Cooperative Contact Messages
      await fetchCoopMessages();

      // 9. Fetch Cooperative Announcements
      await fetchAnnouncements();

      // 10. Fetch Scan History Logs
      await fetchScanLogs();
    } catch (e) {
      console.error("Error fetching farmer data:", e);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, [user.id]);

  useEffect(() => {
    if (activeTab === "scans") {
      fetchScanLogs();
    }
  }, [activeTab]);

  // Load negotiations for an order
  const loadNegotiations = async (orderId: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/negotiations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const history = await res.json();
        setNegotiations((prev) => ({ ...prev, [orderId]: history }));
      }
    } catch (e) {
      console.error("Failed to load negotiations:", e);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newQty || Number(newQty) <= 0 || !newPrice || Number(newPrice) <= 0) {
      setFormError(
        "Please enter valid positive numbers for quantity and target price.",
      );
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: newCrop,
          quantity: Number(newQty),
          unit: "KG",
          target_price: Number(newPrice),
        }),
      });

      if (res.ok) {
        setFormSuccess("Crop listed successfully!");
        setNewQty("");
        setNewPrice("");
        fetchFarmerData();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to create listing.");
        if (err.kycRequired) {
          setIsKycModalOpen(true);
        }
      }
    } catch (e) {
      setFormError("Network error. Please try again.");
    }
  };

  const handleCreateSoilLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSoilError("");
    setSoilSuccess("");

    if (!soilCropBatch.trim()) {
      setSoilError("Please specify a crop batch name.");
      return;
    }
    if (!soilDate) {
      setSoilError("Please select a valid date.");
      return;
    }
    if (!soilDetails.trim()) {
      setSoilError(
        "Please enter details or comments about this application/test.",
      );
      return;
    }

    setIsSubmittingSoil(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/soil-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cropBatch: soilCropBatch,
          logType: soilLogType,
          date: soilDate,
          details: soilDetails,
        }),
      });

      if (res.ok) {
        setSoilSuccess("Log registered successfully!");
        setSoilDetails("");
        fetchFarmerData();
      } else {
        const err = await res.json();
        setSoilError(err.error || "Failed to submit log.");
      }
    } catch (e) {
      setSoilError("Network error. Please try again.");
    } finally {
      setIsSubmittingSoil(false);
    }
  };

  const handleCreateHarvestRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setHarvestError("");
    setHarvestSuccess("");

    if (!harvestSeason.trim()) {
      setHarvestError("Please specify a season and year (e.g. Summer 2025).");
      return;
    }
    const parsedAcreage = Number(harvestAcreage);
    if (isNaN(parsedAcreage) || parsedAcreage <= 0) {
      setHarvestError("Land area must be a positive number.");
      return;
    }
    const parsedQty = Number(harvestQty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setHarvestError("Harvest yield quantity must be a positive number.");
      return;
    }
    if (!harvestFertilizer.trim()) {
      setHarvestError(
        "Please specify any fertilizer or nutrient application used.",
      );
      return;
    }

    setIsSubmittingHarvest(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/harvest-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: harvestCrop,
          season: harvestSeason,
          acreage: parsedAcreage,
          yieldQuantity: parsedQty,
          fertilizerUsed: harvestFertilizer,
          weatherCondition: harvestWeather,
          soilCondition: harvestSoil,
        }),
      });

      if (res.ok) {
        setHarvestSuccess("Harvest record registered successfully!");
        setHarvestQty("");
        setHarvestFertilizer("");
        fetchFarmerData();
        setTimeout(() => setHarvestSuccess(""), 3000);
      } else {
        const err = await res.json();
        setHarvestError(err.error || "Failed to submit harvest record.");
      }
    } catch (e) {
      setHarvestError("Network error. Please try again.");
    } finally {
      setIsSubmittingHarvest(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        fetchFarmerData();
        if (expandedOrderId === orderId) {
          loadNegotiations(orderId);
        }
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleSendCounterOffer = async (orderId: string) => {
    const proposed = negPrice[orderId];
    const message = negMsg[orderId] || "";

    if (!proposed && !message.trim()) {
      alert("Please enter a message or a proposed price.");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/negotiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message.trim(),
            proposed_price: proposed ? Number(proposed) : undefined,
          }),
        },
      );

      if (res.ok) {
        // Reset counter input
        setNegPrice((prev) => ({ ...prev, [orderId]: "" }));
        setNegMsg((prev) => ({ ...prev, [orderId]: "" }));
        fetchFarmerData();
        loadNegotiations(orderId);
      }
    } catch (e) {
      console.error("Failed to post counter-offer:", e);
    }
  };

  const toggleExpandOrder = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      loadNegotiations(orderId);
    }
  };

  const predictionStats = React.useMemo(() => {
    const cropStats = CROP_BASE_STATS[predCrop] || {
      baseYield: 1000,
      defaultPrice: 50,
    };
    const acreageVal = parseFloat(predAcreage) || 0;

    // Base yield (e.g. 1500 kg per ropani)
    const baseUnitYield = cropStats.baseYield;

    // Factor multipliers
    let weatherMultiplier = 1.0;
    if (predRainfall === "dry") weatherMultiplier = 0.75;
    if (predRainfall === "excessive") weatherMultiplier = 0.85;

    let soilMultiplier = 1.0;
    if (predSoil === "balanced") soilMultiplier = 1.15;
    if (predSoil === "poor") soilMultiplier = 0.7;

    let pestMultiplier = 1.0;
    if (predPest === "moderate") pestMultiplier = 0.8;
    if (predPest === "high") pestMultiplier = 0.5;

    // 2026 Predicted yield (KG)
    const predicted2026 = Math.round(
      baseUnitYield *
        acreageVal *
        weatherMultiplier *
        soilMultiplier *
        pestMultiplier,
    );

    // Historical estimates (showing comparison of past 3 years for same acreage)
    const yield2023 = Math.round(baseUnitYield * acreageVal * 0.92);
    const yield2024 = Math.round(baseUnitYield * acreageVal * 1.05);
    const yield2025 = Math.round(baseUnitYield * acreageVal * 0.98);

    // Calculate dynamic average price from live marketPrices if available, otherwise default
    const relevantPrices = marketPrices.filter((p) => p.crop === predCrop);
    let avgMarketPrice = cropStats.defaultPrice;
    if (relevantPrices.length > 0) {
      const sum = relevantPrices.reduce((acc, p) => acc + p.price_per_unit, 0);
      avgMarketPrice = Math.round(sum / relevantPrices.length);
    }

    const estimatedRevenue = predicted2026 * avgMarketPrice;

    const chartData = [
      { name: "2023 Actual", Yield: yield2023 },
      { name: "2024 Actual", Yield: yield2024 },
      { name: "2025 Actual", Yield: yield2025 },
      { name: "2026 Predicted", Yield: predicted2026 },
    ];

    return {
      predicted2026,
      yield2023,
      yield2024,
      yield2025,
      avgMarketPrice,
      estimatedRevenue,
      chartData,
    };
  }, [predCrop, predAcreage, predRainfall, predSoil, predPest, marketPrices]);

  const getRecommendation = () => {
    const recommendations = [];
    if (predRainfall === "dry") {
      recommendations.push({
        title: "Drip Irrigation & Mulching",
        desc: "A dry spell reduces yields significantly. Implement drip irrigation to maximize water efficiency and apply organic mulch to conserve soil moisture.",
      });
    }
    if (predRainfall === "excessive") {
      recommendations.push({
        title: "Drainage Management",
        desc: "Excessive monsoon water causes root rot and fungal disease. Ensure raised bed farming and clear drainage channels to avoid stagnant water.",
      });
    }
    if (predSoil === "poor") {
      recommendations.push({
        title: "Organic Nitrogen Boost",
        desc: "Soil nutrition is sub-optimal. Prioritize compost, farmyard manure, or quick-release bio-fertilizers to rebuild soil organic matter.",
      });
    }
    if (predSoil === "balanced") {
      recommendations.push({
        title: "Maintain Soil Balance",
        desc: "Soil health is excellent. Continue crop rotation and organic mulching to preserve the nutrient structure.",
      });
    }
    if (predPest === "moderate") {
      recommendations.push({
        title: "Integrated Pest Management (IPM)",
        desc: "Moderate pest risk detected. Install pheromone traps and inspect leaf undersides daily. Prepare organic soap spray or neem extract.",
      });
    }
    if (predPest === "high") {
      recommendations.push({
        title: "Urgent Biosecurity Measures",
        desc: "High disease/pest alert! Coordinate with local cooperative for joint biological spraying. Isolate infected zones immediately to prevent wider spread.",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Optimal Growth Outlook",
        desc: "Your cultivation parameters are perfectly optimized. Ensure timely weeding and plan your harvest labor and market transportation in advance.",
      });
    }

    return recommendations;
  };

  const get30DayHistoryData = () => {
    const cropPrices = marketPrices.filter(
      (p) => p.crop.toLowerCase() === predCrop.toLowerCase(),
    );

    const uniqueDates = Array.from(
      new Set(cropPrices.map((p) => p.date)),
    ).sort() as string[];

    const data = uniqueDates.map((date) => {
      const dayPrices = cropPrices.filter((p) => p.date === date);

      const kathmanduPrice = dayPrices.find(
        (p) => p.region === "Kathmandu",
      )?.price_per_unit;
      const teraiPrice = dayPrices.find(
        (p) => p.region === "Terai",
      )?.price_per_unit;
      const hillPrice = dayPrices.find(
        (p) => p.region === "Hill",
      )?.price_per_unit;

      const validPrices = dayPrices.map((p) => p.price_per_unit);
      const avgPrice =
        validPrices.length > 0
          ? Math.round(
              validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length,
            )
          : 0;

      let formattedDate = date;
      try {
        const d = new Date(date);
        formattedDate = d.toLocaleDateString(
          language === "ne" ? "ne-NP" : "en-US",
          {
            month: "short",
            day: "numeric",
          },
        );
      } catch (e) {
        // ignore
      }

      return {
        date,
        formattedDate,
        Kathmandu: kathmanduPrice,
        Terai: teraiPrice,
        Hill: hillPrice,
        Average: avgPrice,
      };
    });

    return data.slice(-30);
  };

  const getPriceTrendAnalysis = () => {
    const history = get30DayHistoryData();
    if (history.length < 2) {
      return {
        direction: "neutral",
        percentChange: 0,
        desc: t("Insufficient Price Data"),
        badge: "bg-slate-100 text-slate-800",
        advice: t("Monitor market trends weekly for changes."),
      };
    }

    const key: "Average" | "Kathmandu" | "Terai" | "Hill" =
      historyRegion === "all" ? "Average" : historyRegion;
    const initialPrice = history[0][key] || 0;
    const latestPrice = history[history.length - 1][key] || 0;

    if (initialPrice === 0) {
      return {
        direction: "neutral",
        percentChange: 0,
        desc: t("Insufficient Price Data"),
        badge: "bg-slate-100 text-slate-800",
        advice: t("Monitor market trends weekly for changes."),
      };
    }

    const diff = latestPrice - initialPrice;
    const percentChange = Math.round((diff / initialPrice) * 100);

    if (percentChange > 2) {
      return {
        direction: "up",
        percentChange,
        desc: t("Upward Trend"),
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        advice: t(
          "Strong price appreciation over the past 30 days. Planting now is highly recommended as market demand remains robust, which points to high profit margins upon harvest.",
        ),
      };
    } else if (percentChange < -2) {
      return {
        direction: "down",
        percentChange,
        desc: t("Downward Trend"),
        badge: "bg-rose-100 text-rose-800 border border-rose-200",
        advice: t(
          "Price is softening. It is recommended to optimize your cost of inputs, secure early buyer contracts, or consider staggered sowing to target later seasonal peak pricing.",
        ),
      };
    } else {
      return {
        direction: "stable",
        percentChange,
        desc: t("Stable Market"),
        badge: "bg-blue-100 text-blue-800 border border-blue-200",
        advice: t(
          "Prices are holding stable with consistent market volume. Standard crop rotation schedules and regular planting yields are low-risk options under these conditions.",
        ),
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner & Quick Actions (Matching B2B Hub Design) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sprout className="w-3.5 h-3.5" />
              <span>
                Farmer Dashboard &amp; Regional Operations (कृषि उपज व्यवस्थापन)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Direct Farmer Produce &amp; Wholesale Operations
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              List regional crops, process B2B buyer contract orders, manage
              cooperative memberships, and monitor market price advisories in{" "}
              {user.district || "Kathmandu"} District.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsKycModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-xs transition shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>KYC Verification</span>
            </button>

            <button
              onClick={() => setIsWeatherModalOpen(true)}
              className="px-3.5 py-2 bg-amber-600/90 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-xs transition shadow-xs cursor-pointer"
            >
              <CloudRain className="w-4 h-4" />
              <span>Weather Action Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification State Banner */}
      {currentUser.verified ||
      currentUser.verificationStatus ===
        "verified" ? null : currentUser.verificationStatus === "pending" ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                KYC Documents Submitted & Pending Admin Approval
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your Citizenship Card (No:{" "}
                <strong>{currentUser.citizenshipNumber || "Uploaded"}</strong>)
                and National Identity Card scans are currently being audited by
                the Super Admin / Admin team. You will be able to post product
                listings as soon as approval is granted.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shrink-0 shadow-sm transition"
          >
            Check Verification Status
          </button>
        </div>
      ) : currentUser.verificationStatus === "rejected" ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Mandatory Verification Rejected
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Note from Admin:{" "}
                <em>
                  "
                  {currentUser.verificationNotes ||
                    "Uploaded photo was illegible."}
                  "
                </em>
                . Please re-upload legible photos of your Citizenship Card and
                National Identity Card.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shrink-0 shadow-sm transition"
          >
            Re-upload Verification Documents
          </button>
        </div>
      ) : (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 text-slate-900 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base font-display">
                Mandatory Verification Required for Selling Produce
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                As per Nepal AgriTech safety regulations, farmers must upload
                clear scans of their{" "}
                <strong>Citizenship Card (नागरिकता)</strong> and{" "}
                <strong>National Identity Card (राष्ट्रिय परिचयपत्र)</strong>.
                After approval by Super Admin / Admin, product selling and
                listing will be instantly activated.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shrink-0 shadow-md transition flex items-center space-x-1.5"
          >
            <span>Verify Identity Now</span>
            <span className="text-[10px] font-normal opacity-90">
              (नागरिकता / NIN)
            </span>
          </button>
        </div>
      )}

      {/* Real-Time Weather Alert Banner */}
      {showWeatherBanner && (
        <div
          className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden ${
            weatherAlertSeverity === "extreme"
              ? "bg-rose-50/95 border-rose-200 text-rose-900"
              : weatherAlertSeverity === "severe"
                ? "bg-amber-50/95 border-amber-200 text-amber-900"
                : weatherAlertSeverity === "moderate"
                  ? "bg-sky-50/95 border-sky-200 text-sky-900"
                  : "bg-emerald-50/95 border-emerald-200 text-emerald-950"
          }`}
        >
          {/* Subtle background glow pattern for extreme alerts */}
          {weatherAlertSeverity === "extreme" && (
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-rose-200/20 rounded-full blur-2xl pointer-events-none"></div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 relative z-10">
            <div className="flex items-start space-x-3.5">
              {/* Dynamic Icon */}
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  weatherAlertSeverity === "extreme"
                    ? "bg-rose-100 text-rose-700 animate-pulse"
                    : weatherAlertSeverity === "severe"
                      ? "bg-amber-100 text-amber-700"
                      : weatherAlertSeverity === "moderate"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {weatherAlertSeverity === "extreme" ? (
                  <CloudLightning className="w-5.5 h-5.5" />
                ) : weatherAlertSeverity === "severe" ? (
                  <CloudRain className="w-5.5 h-5.5" />
                ) : weatherAlertSeverity === "moderate" ? (
                  <CloudSun className="w-5.5 h-5.5" />
                ) : (
                  <Sun className="w-5.5 h-5.5" />
                )}
              </div>

              {/* Text content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold text-sm uppercase tracking-wide flex items-center">
                    {weatherAlertSeverity === "extreme" &&
                      t("🚨 RED ALERT: EXTREME DOWNPOUR & LANDSLIDE RISK")}
                    {weatherAlertSeverity === "severe" &&
                      t("⚠️ SEVERE WEATHER WARNING: WATERLOGGING RISK")}
                    {weatherAlertSeverity === "moderate" &&
                      t("ℹ️ ADVISORY: ACTIVE MONSOON SHOWERS")}
                    {weatherAlertSeverity === "normal" &&
                      t("☀️ WEATHER REPORT: ALL CLEAR")}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      weatherAlertSeverity === "extreme"
                        ? "bg-rose-200 text-rose-800"
                        : weatherAlertSeverity === "severe"
                          ? "bg-amber-200 text-amber-800"
                          : weatherAlertSeverity === "moderate"
                            ? "bg-sky-200 text-sky-800"
                            : "bg-emerald-200 text-emerald-800"
                    }`}
                  >
                    {t(weatherAlertDistrict)} {t("District")}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal max-w-4xl">
                  {weatherAlertSeverity === "extreme" ? (
                    weatherAlertDistrict === "Dhading" ? (
                      <>
                        <strong>{t("Dhading Region:")}</strong> Extreme
                        localized cloudburst forecasted (&gt;150mm rain in 24
                        hours) near the <strong>Trishuli River Basin</strong>{" "}
                        and <strong>Galchhi / Malekhu</strong> sectors.
                        Extremely high risk of highway-disrupting debris flows
                        and landslides on the <strong>Prithvi Highway</strong>.
                        Minimize slope traversal and secure hillside produce
                        immediately.
                      </>
                    ) : weatherAlertDistrict === "Makwanpur" ? (
                      <>
                        <strong>{t("Makwanpur Region:")}</strong> Heavy
                        orographic rainfall triggering emergency alert levels in
                        the <strong>Kulekhani &amp; Sisneri Watersheds</strong>.
                        Extreme mudslide and landslide warning for transport
                        vehicles traversing the{" "}
                        <strong>Tribhuvan Highway (Bhimfedi-Hetauda)</strong>{" "}
                        and <strong>Kanti Lokpath</strong>. Secure storage
                        barns.
                      </>
                    ) : (
                      <>
                        <strong>{t("Hilly Terraced Sector:")}</strong> Extreme
                        heavy rain (&gt;120mm) predicted. Severe risk of flash
                        mudslides on vulnerable terraced slopes. Clear run-off
                        trenches to avoid direct topsoil erosion.
                      </>
                    )
                  ) : weatherAlertSeverity === "severe" ? (
                    <>
                      Continuous heavy monsoon showers are saturating terraced
                      fields. Saturated ground increases risk of root decay.
                      Trench out surplus pool water from tomato and potato beds
                      immediately.
                    </>
                  ) : weatherAlertSeverity === "moderate" ? (
                    <>
                      Intermittent rainy periods with afternoon thunder.
                      Excellent for rainwater reservoir replenishment, but delay
                      nitrogen application to prevent fertilizer runoff wastage.
                    </>
                  ) : (
                    <>
                      Standard summer conditions. Current local climate
                      parameters are safe. Ideal for harvesting, packaging, and
                      open highway vehicle transport.
                    </>
                  )}
                </p>

                {/* Micro safety actions bullet points */}
                {weatherAlertSeverity === "extreme" && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center text-rose-800 font-bold">
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full mr-1.5"></span>
                      {t("Clean Drainage Trenches")}
                    </span>
                    <span className="flex items-center text-rose-800 font-bold">
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full mr-1.5"></span>
                      {t("Delay Highway Logistics")}
                    </span>
                    <span className="flex items-center text-rose-800 font-bold">
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full mr-1.5"></span>
                      {t("Protect Tomato Harvesting")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Block */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-start shrink-0">
              <button
                onClick={() => setIsWeatherModalOpen(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs ${
                  weatherAlertSeverity === "extreme"
                    ? "bg-rose-700 hover:bg-rose-800 text-white"
                    : weatherAlertSeverity === "severe"
                      ? "bg-amber-700 hover:bg-amber-800 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                }`}
              >
                {t("Safety Action Plan")}
              </button>

              <button
                onClick={handleDismissWeatherBanner}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-black/5 transition cursor-pointer"
                title="Dismiss warning"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Live Control Bar for Simulation */}
          <div className="mt-4 pt-3.5 border-t border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px] relative z-10">
            <div className="flex items-center space-x-1 font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping mr-1"></span>
              <span>{t("Real-Time Weather Feed Controls:")}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center space-x-1">
                <span>{t("District:")}</span>
                <select
                  value={weatherAlertDistrict}
                  onChange={(e) => handleWeatherDistrictChange(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-md py-0.5 px-1.5 text-[11px] font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Dhading">{t("Dhading")} (धादिङ)</option>
                  <option value="Makwanpur">{t("Makwanpur")} (मकवानपुर)</option>
                  <option value="Kathmandu">{t("Kathmandu")}</option>
                  <option value="Kavre">{t("Kavrepalanchok")}</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span>Severity Level:</span>
                <select
                  value={weatherAlertSeverity}
                  onChange={(e) =>
                    handleWeatherSeverityChange(e.target.value as any)
                  }
                  className="bg-white border border-slate-200 text-slate-700 rounded-md py-0.5 px-1.5 text-[11px] font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="extreme">🚨 Red Alert (Extreme)</option>
                  <option value="severe">⚠️ Severe Rain Alert</option>
                  <option value="moderate">ℹ️ Moderate Monsoon</option>
                  <option value="normal">☀️ Sunny / Normal</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-enable Weather Alert Link when closed */}
      {!showWeatherBanner && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs text-slate-600 animate-fade-in">
          <span className="flex items-center space-x-2">
            <CloudRain className="w-4 h-4 text-slate-400" />
            <span>{t("Weather notification banner is currently hidden.")}</span>
          </span>
          <button
            onClick={handleReenableWeatherBanner}
            className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
          >
            {t("Re-enable Weather Alert Feed")}
          </button>
        </div>
      )}

      {/* Alert & Notification Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <ClipboardList className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold font-display text-slate-800 text-sm">
                Real-Time Alert Preferences
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure your channels for critical agricultural updates in{" "}
                {user.district} District
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isSavingNotifications && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full animate-pulse">
                Saving preferences...
              </span>
            )}
            {notificationSuccess && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {notificationSuccess}
              </span>
            )}
            {notificationError && (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                {notificationError}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Demand Toggles */}
          <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="flex items-start space-x-2.5">
              <span className="text-xl shrink-0">📈</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Sudden Shifts in Market Demand
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Get notified instantly when buyer demand posts surge or price
                  forecasts spike for your local crops.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 border-t border-slate-200/50">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={smsDemandAlerts}
                  onChange={toggleSmsDemand}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  SMS Alerts
                </span>
              </label>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inAppDemandAlerts}
                  onChange={toggleInAppDemand}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  In-App Alerts
                </span>
              </label>
            </div>
          </div>

          {/* Weather Warning Toggles */}
          <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="flex items-start space-x-2.5">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Severe Weather Warnings
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Receive critical weather hazard broadcasts (excessive
                  rainfall, severe hailstorms, drought risks).
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 border-t border-slate-200/50">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={smsWeatherAlerts}
                  onChange={toggleSmsWeather}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  SMS Alerts
                </span>
              </label>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inAppWeatherAlerts}
                  onChange={toggleInAppWeather}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  In-App Alerts
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls (Pill style matching B2B Hub) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "listings"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sprout className="w-4 h-4 shrink-0" />
          <span>
            {t("Add crop")} ({listings.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer relative ${
            activeTab === "orders"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span>
            {t("Orders & Negotiations")} (
            {
              orders.filter(
                (o) => o.status !== "completed" && o.status !== "cancelled",
              ).length
            }
            )
          </span>
          {orders.some((o) => o.status === "pending") && (
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("coops")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "coops"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>
            {t("Cooperatives")} ({coops.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("scans")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "scans"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span>
            {t("Scan History")} ({scanLogs.length})
          </span>
        </button>
      </div>

      {/* Tab: Produce Listings */}
      {activeTab === "listings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Crop Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>List New Produce</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1"
                title="Scan batch QR tag to pre-fill or register arrival"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t("Scan Batch QR")}</span>
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              {formError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  {formSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Crop Item
                </label>
                <select
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  disabled={!user.verified}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Quantity (KG)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    disabled={!user.verified}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Target (NRs/KG)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 65"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    disabled={!user.verified}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!user.verified}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Listing</span>
              </button>
            </form>
          </div>

          {/* Active Listings Grid (Colspan 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase">
                My Active Crop Listings
              </h3>
              <button
                type="button"
                onClick={() =>
                  exportFarmerReportPDF(
                    user,
                    listings,
                    orders,
                    coops,
                    coopMessages,
                  )
                }
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200/50 text-purple-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Export Offline PDF Ledger</span>
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-12 text-center text-slate-400 text-sm">
                You haven't listed any crops yet. Use the form to make your
                first offer.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-base font-display">
                          {l.crop}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            l.status === "available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : l.status === "reserved"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-500 border-slate-300"
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 py-3 my-3">
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">
                            Quantity
                          </span>
                          <span className="font-bold text-slate-700 text-sm">
                            {l.quantity} {l.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">
                            Target Price
                          </span>
                          <span className="font-bold text-slate-700 text-sm">
                            NRs. {l.target_price} / {l.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 gap-2">
                      <span className="font-mono">
                        Listed {new Date(l.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            setPrintableListing(l);
                            setIsPrintableQrOpen(true);
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1 cursor-pointer transition bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg"
                          title="Generate & View Printable Batch QR Tag"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t("Printable Batch QR")}</span>
                        </button>
                        <button
                          onClick={() => handleOpenContactModal(l.crop)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer transition"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Contact Cooperative</span>
                        </button>
                        {l.status === "available" && (
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  "Are you sure you want to mark this listing as sold?",
                                )
                              ) {
                                await handleUpdateOrderStatus(l.id, "sold"); // Mark listing
                                fetchFarmerData();
                              }
                            }}
                            className="text-emerald-700 hover:text-emerald-800 font-bold transition duration-150 cursor-pointer"
                          >
                            Mark Sold
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Orders & Negotiations */}
      {activeTab === "orders" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Incoming B2B Purchase Orders</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Secure counter-offers and finalize transactions with real-time
                audit trails
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                exportFarmerReportPDF(
                  user,
                  listings,
                  orders,
                  coops,
                  coopMessages,
                )
              }
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
            >
              <ClipboardList className="w-4 h-4 text-purple-100" />
              <span>Export Offline Ledger PDF</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No active buyer orders placed on your listings.
              </div>
            ) : (
              orders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                const orderHistory = negotiations[o.id] || [];

                return (
                  <div
                    key={o.id}
                    className="transition duration-150 hover:bg-slate-50/20"
                  >
                    <div
                      onClick={() => toggleExpandOrder(o.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm font-display">
                            {o.crop}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-500">
                            Buyer: <strong>{o.buyerName}</strong>
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap gap-y-1 items-center space-x-3">
                          <span>
                            Volume:{" "}
                            <strong>
                              {o.quantity} {o.unit}
                            </strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Agreed Price:{" "}
                            <strong className="text-slate-700">
                              NRs. {o.agreed_price} / {o.unit}
                            </strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Total:{" "}
                            <strong className="text-emerald-700">
                              NRs. {o.quantity * o.agreed_price}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mt-3 md:mt-0">
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                            o.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              : o.status === "negotiating"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : o.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : o.status === "completed"
                                    ? "bg-slate-100 text-slate-600 border-slate-300"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {o.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Animated Supply-Chain Order Fulfillment Tracker */}
                    <div className="px-5 pb-4">
                      <SupplyChainTracker
                        order={o}
                        onUpdateStatus={handleUpdateOrderStatus}
                        userRole="farmer"
                      />
                    </div>

                    {/* Negotiation Message History panel */}
                    {isExpanded && (
                      <div className="bg-slate-50 p-5 border-t border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                            <History className="w-3.5 h-3.5" />
                            <span>Negotiation Counter-Offer Logs</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {o.id}
                          </span>
                        </div>

                        {/* Thread */}
                        <div className="space-y-3 max-h-60 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                          {orderHistory.length === 0 ? (
                            <div className="text-center text-slate-400 italic text-xs py-4">
                              No counter proposals logged. Standard agreement.
                            </div>
                          ) : (
                            orderHistory.map((n) => (
                              <div
                                key={n.id}
                                className={`flex flex-col p-2.5 rounded-lg border text-xs ${
                                  n.senderId === user.id
                                    ? "bg-emerald-50 border-emerald-200/60 ml-8"
                                    : "bg-slate-50 border-slate-200 mr-8"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1 font-semibold text-[11px] text-slate-700">
                                  <span>{n.senderName}</span>
                                  <span className="text-[9px] text-slate-400 font-normal font-mono">
                                    {new Date(
                                      n.created_at,
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 font-sans italic">
                                  "{n.message}"
                                </p>
                                <NegotiationQrCard negotiation={n} order={o} />
                                <div className="mt-1.5 font-bold text-slate-800 text-[10px] uppercase">
                                  Proposed Rate:{" "}
                                  <span className="text-emerald-700">
                                    NRs. {n.proposed_price} / {o.unit}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Negotiation Inputs */}
                        {o.status !== "completed" &&
                          o.status !== "cancelled" && (
                            <div className="space-y-3 pt-2">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="md:col-span-1">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    New Price (Optional)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="e.g. 64 (Optional)"
                                    value={negPrice[o.id] || ""}
                                    onChange={(e) =>
                                      setNegPrice((prev) => ({
                                        ...prev,
                                        [o.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700"
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Message to Buyer
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Write message or update details..."
                                      value={negMsg[o.id] || ""}
                                      onChange={(e) =>
                                        setNegMsg((prev) => ({
                                          ...prev,
                                          [o.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-3 pr-12 text-xs text-slate-700"
                                    />
                                    <button
                                      onClick={() =>
                                        handleSendCounterOffer(o.id)
                                      }
                                      className="absolute right-1.5 top-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition cursor-pointer"
                                      title="Send Message / Offer"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Status Change & Send QR Buttons */}
                              <div className="border-t border-slate-200 pt-3 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setSendQrModalOrder(o)}
                                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                                    title="Send payment, batch tag, or traceability QR code directly to buyer"
                                  >
                                    <QrCode className="w-4 h-4 text-emerald-300" />
                                    <span>{t("Send / Upload QR Code")}</span>
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 ml-auto">
                                  {o.status !== "confirmed" ? (
                                    <button
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          o.id,
                                          "confirmed",
                                        )
                                      }
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition shadow-sm cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Accept & Confirm Deal</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          o.id,
                                          "completed",
                                        )
                                      }
                                      className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition shadow-sm cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Mark as Fully Completed</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleUpdateOrderStatus(o.id, "cancelled")
                                    }
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Cancel Deal</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: District Cooperatives */}
      {activeTab === "coops" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>District Farmer Cooperatives</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Connect with fellow agricultural producers, arrange shared
                transport to Kalimati, and secure volume wholesale discounts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{t("Scan Member Pass QR")}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  exportFarmerReportPDF(
                    user,
                    listings,
                    orders,
                    coops,
                    coopMessages,
                  )
                }
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-purple-600" />
                <span>Export Network Ledger</span>
              </button>
            </div>
          </div>

          {/* Announcements & Bulletins Board */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <span>Cooperative Announcements & Market Updates</span>
              </h3>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 border border-emerald-100 rounded-full font-mono">
                {announcements.length} Active
              </span>
            </div>

            {announcements.length === 0 ? (
              <p className="text-slate-400 text-xs italic py-2">
                No active announcements found from your district cooperatives.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {announcements.map((ann) => {
                  let badgeColor =
                    "bg-emerald-50 text-emerald-700 border-emerald-100";
                  let categoryText = "Market Update";
                  if (ann.category === "weather_warning") {
                    badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                    categoryText = "Weather Advisory";
                  } else if (ann.category === "training") {
                    badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                    categoryText = "Training/Event";
                  } else if (ann.category === "bulk_notification") {
                    badgeColor =
                      "bg-purple-50 text-purple-700 border-purple-100";
                    categoryText = "Bulk Logistics";
                  }

                  return (
                    <div
                      key={ann.id}
                      className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-700 text-xs">
                            {ann.cooperativeName}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${badgeColor}`}
                          >
                            {categoryText}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(ann.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-xs leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed font-normal whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coops.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-8 text-center text-slate-400 text-xs">
                No cooperatives registered in {user.district} District yet.
              </div>
            ) : (
              coops.map((coop) => (
                <div
                  key={coop.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {coop.district} Hub
                    </span>
                    <h4 className="font-bold font-display text-slate-800 text-base mt-2.5">
                      {coop.name}
                    </h4>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div>
                        Contact Director: <strong>{coop.contact_person}</strong>
                      </div>
                      <div>
                        Phone:{" "}
                        <strong className="text-slate-800 font-mono">
                          {coop.phone}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                    <span>
                      {coop.farmerIds.includes(user.id)
                        ? "You are a linked member"
                        : "Open for membership"}
                    </span>
                    {coop.farmerIds.includes(user.id) && (
                      <span className="text-emerald-700 font-bold flex items-center space-x-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Joined</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sent Messages History Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Sent Messages to Cooperatives ({coopMessages.length})</span>
            </h3>

            {coopMessages.length === 0 ? (
              <p className="text-slate-400 text-xs italic py-2">
                No sent messages found. Use the 'Contact Cooperative' button on
                your active listings to start a dialogue.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {coopMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/40 space-y-2"
                  >
                    <div className="flex justify-between items-start text-[11px]">
                      <div>
                        To:{" "}
                        <strong className="text-slate-700">
                          {msg.cooperativeName}
                        </strong>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] flex items-center space-x-1">
                      <span className="text-slate-400">Crop Subject:</span>
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                        {msg.crop}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs italic mt-1 font-sans border-l-2 border-indigo-200 pl-2.5">
                      "{msg.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Crop Yield Prediction */}
      {activeTab === "predictions" && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Crop Yield & Revenue Predictor</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Estimate your upcoming harvest volume and potential market
              revenues based on historical district yields, regional climate
              trends, and farm management parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Parameters Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h4 className="font-bold font-display text-slate-800 text-xs tracking-wider uppercase border-b border-slate-100 pb-2.5 flex items-center space-x-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cultivation Parameters</span>
              </h4>

              {/* Select Crop */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Crop Item
                </label>
                <select
                  value={predCrop}
                  onChange={(e) => setPredCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cultivated land (Ropani) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Cultivated Area (Ropani)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={predAcreage}
                  onChange={(e) => setPredAcreage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  1 Ropani &asymp; 508.7 sq. meters
                </span>
              </div>

              {/* Seasonal Rainfall Outlook */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Seasonal Rainfall Pattern
                </label>
                <select
                  value={predRainfall}
                  onChange={(e) => setPredRainfall(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  <option value="dry">Dry Spell / Low Rainfall</option>
                  <option value="optimal">
                    Optimal / Season-appropriate Rainfall
                  </option>
                  <option value="excessive">
                    Excessive Monsoon / Heavy Storms
                  </option>
                </select>
              </div>

              {/* Soil Management */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Soil Nutrient Management
                </label>
                <select
                  value={predSoil}
                  onChange={(e) => setPredSoil(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  <option value="poor">Minimal Fertilizer / Poor Soil</option>
                  <option value="organic">
                    Standard Organic / Compost Only
                  </option>
                  <option value="balanced">
                    Balanced NPK / Optimal Fertilizer
                  </option>
                </select>
              </div>

              {/* Pest & Disease Alert */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Pest / Disease Threat level
                </label>
                <select
                  value={predPest}
                  onChange={(e) => setPredPest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  <option value="low">Low Threat / Well Controlled</option>
                  <option value="moderate">
                    Moderate Threat / Alert Active
                  </option>
                  <option value="high">Critical Outbreak Risk</option>
                </select>
              </div>
            </div>

            {/* Prediction Results & Chart Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stat Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Yield Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    Predicted Yield
                  </span>
                  <div className="text-xl font-bold font-display text-slate-800 mt-1.5 flex items-baseline space-x-1">
                    <span>
                      {predictionStats.predicted2026.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      KG
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1 flex items-center space-x-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Est. Volume</span>
                  </span>
                </div>

                {/* Avg Market Price Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    Est. Market Price
                  </span>
                  <div className="text-xl font-bold font-display text-slate-800 mt-1.5 flex items-baseline space-x-1">
                    <span className="text-xs text-slate-500">NRs.</span>
                    <span>{predictionStats.avgMarketPrice}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      /KG
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold block mt-1 flex items-center space-x-0.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Live/Market Average</span>
                  </span>
                </div>

                {/* Projected Revenue Card */}
                <div className="bg-emerald-600 border border-emerald-700 rounded-xl p-4 shadow-sm text-white relative overflow-hidden">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">
                    Projected Revenue
                  </span>
                  <div className="text-xl font-bold font-display mt-1.5 flex items-baseline space-x-1">
                    <span className="text-xs text-emerald-100">NRs.</span>
                    <span>
                      {predictionStats.estimatedRevenue.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-100 font-semibold block mt-1 flex items-center space-x-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Calculated Gross</span>
                  </span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold font-display text-slate-800 text-xs tracking-wider uppercase mb-4 flex items-center space-x-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Harvest Volume Comparison (KG)</span>
                </h4>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={predictionStats.chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderRadius: "12px",
                          border: "none",
                        }}
                        labelStyle={{
                          color: "#94a3b8",
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                        itemStyle={{ color: "#f8fafc", fontSize: "12px" }}
                      />
                      <Bar
                        dataKey="Yield"
                        fill="#94a3b8"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={45}
                      >
                        {predictionStats.chartData.map((entry, index) => {
                          const isPredicted = entry.name.includes("Predicted");
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={isPredicted ? "#10b981" : "#cbd5e1"}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-2 text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-slate-300 rounded-full inline-block"></span>
                    <span>Historical Actuals</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
                    <span>2026 Predicted Harvest</span>
                  </div>
                </div>
              </div>

              {/* 30-Day Historical Price Trend Widget */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold font-display text-slate-800 text-xs tracking-wider uppercase flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("30-Day Historical Market Price Trend")}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("Analyze day-to-day rate trends for")}{" "}
                      <strong className="text-emerald-700">
                        {t(predCrop)}
                      </strong>{" "}
                      {t(
                        "to time your sowing, transplanting, or harvest windows.",
                      )}
                    </p>
                  </div>

                  {/* Region Filter Buttons */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start sm:self-center">
                    {(["all", "Kathmandu", "Terai", "Hill"] as const).map(
                      (reg) => (
                        <button
                          key={reg}
                          onClick={() => setHistoryRegion(reg)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
                            historyRegion === reg
                              ? "bg-white text-slate-800 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {reg === "all" ? t("All") : t(reg)}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Main Trend Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={get30DayHistoryData()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        label={{
                          value: t("NRs. / KG"),
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                          fill: "#94a3b8",
                          fontSize: 10,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderRadius: "12px",
                          border: "none",
                        }}
                        labelStyle={{
                          color: "#94a3b8",
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                        itemStyle={{ color: "#f8fafc", fontSize: "12px" }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#475569",
                        }}
                      />

                      {(historyRegion === "all" ||
                        historyRegion === "Kathmandu") && (
                        <Line
                          type="monotone"
                          dataKey="Kathmandu"
                          name={t("Kathmandu")}
                          stroke="#3b82f6"
                          strokeWidth={historyRegion === "Kathmandu" ? 3 : 1.5}
                          dot={historyRegion === "Kathmandu" ? { r: 4 } : false}
                          strokeDasharray={
                            historyRegion === "all" ? "4 4" : undefined
                          }
                        />
                      )}

                      {(historyRegion === "all" ||
                        historyRegion === "Terai") && (
                        <Line
                          type="monotone"
                          dataKey="Terai"
                          name={t("Terai")}
                          stroke="#ef4444"
                          strokeWidth={historyRegion === "Terai" ? 3 : 1.5}
                          dot={historyRegion === "Terai" ? { r: 4 } : false}
                          strokeDasharray={
                            historyRegion === "all" ? "4 4" : undefined
                          }
                        />
                      )}

                      {(historyRegion === "all" ||
                        historyRegion === "Hill") && (
                        <Line
                          type="monotone"
                          dataKey="Hill"
                          name={t("Hill")}
                          stroke="#eab308"
                          strokeWidth={historyRegion === "Hill" ? 3 : 1.5}
                          dot={historyRegion === "Hill" ? { r: 4 } : false}
                          strokeDasharray={
                            historyRegion === "all" ? "4 4" : undefined
                          }
                        />
                      )}

                      {historyRegion === "all" && (
                        <Line
                          type="monotone"
                          dataKey="Average"
                          name={t("Average Price")}
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Decision Support Insights Panel */}
                {(() => {
                  const analysis = getPriceTrendAnalysis();
                  return (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {t("Planting Decision Insight")}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${analysis.badge}`}
                        >
                          {analysis.desc}{" "}
                          {analysis.percentChange !== 0 &&
                            `(${analysis.percentChange > 0 ? "+" : ""}${analysis.percentChange}%)`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {analysis.advice}
                      </p>
                      <div className="pt-1.5 flex items-center space-x-2 text-[10px] text-slate-400">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span>
                          {t(
                            "Analyzing Kalimati, Tokha, & Terai regional wholesale feed...",
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Agronomic Action Plan */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 shadow-sm space-y-3.5">
                <h4 className="font-bold font-display text-emerald-800 text-xs tracking-wider uppercase flex items-center space-x-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Agronomic Recommendations &amp; Action Plan</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRecommendation().map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-emerald-100/80 rounded-xl p-4 shadow-sm space-y-1"
                    >
                      <h5 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>{rec.title}</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {rec.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Climate Advisory */}
      {activeTab === "climate" && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span>Local Climate Advisory &amp; Harvest Planner</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Personalized 7-day agricultural weather forecast for{" "}
                <strong className="text-slate-700">
                  {user.district || "Kathmandu"} District
                </strong>
                . Select your crop below to see optimal harvesting dates.
              </p>
            </div>

            {/* Crop Selector */}
            <div className="flex items-center space-x-2 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                Crop:
              </span>
              <select
                value={climateCrop}
                onChange={(e) => setClimateCrop(e.target.value)}
                className="bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-lg py-1 px-2.5 text-xs font-semibold text-slate-700 transition"
              >
                {cropOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {generateForecast(user.district || "Kathmandu").map((day, idx) => {
              const suitability = getHarvestSuitability(climateCrop, day);
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between hover:border-slate-300 transition relative"
                >
                  {idx === 0 && (
                    <span className="absolute top-2 right-2 bg-slate-100 text-[8px] font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded-full">
                      Today
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">
                        {day.dayName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {day.dateStr}
                      </p>
                    </div>

                    <div className="flex justify-center py-2">
                      {day.iconType === "sun" && (
                        <Sun className="w-8 h-8 text-amber-500" />
                      )}
                      {day.iconType === "sun-cloud" && (
                        <CloudSun className="w-8 h-8 text-amber-500" />
                      )}
                      {day.iconType === "rain" && (
                        <CloudRain className="w-8 h-8 text-blue-400" />
                      )}
                      {day.iconType === "storm" && (
                        <CloudLightning className="w-8 h-8 text-purple-500" />
                      )}
                      {day.iconType === "cloud" && (
                        <Cloud className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700 leading-tight">
                        {day.condition}
                      </p>
                      <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                        {day.tempMax}° / {day.tempMin}°C
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2 space-y-1 text-[10px] font-semibold text-slate-500 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-[9px] uppercase font-bold text-slate-400">
                          <Droplets className="w-3 h-3 text-blue-400 mr-1 shrink-0" />{" "}
                          Rain %
                        </span>
                        <span>{day.rainProb}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-[9px] uppercase font-bold text-slate-400">
                          <Droplets className="w-3 h-3 text-slate-400 mr-1 shrink-0" />{" "}
                          Humid
                        </span>
                        <span>{day.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-[9px] uppercase font-bold text-slate-400">
                          <Wind className="w-3 h-3 text-slate-400 mr-1 shrink-0" />{" "}
                          Wind
                        </span>
                        <span>{day.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-3 p-2 rounded-lg border text-[10px] ${suitability.color}`}
                  >
                    <div className="flex items-center justify-between font-bold uppercase tracking-wider mb-1">
                      <span>Harvest:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] ${suitability.badge}`}
                      >
                        {suitability.rating}
                      </span>
                    </div>
                    <p className="leading-snug text-slate-600 font-normal">
                      {suitability.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Panel */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold font-display text-slate-800 text-xs tracking-wider uppercase mb-4 flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>7-Day Temperature &amp; Precipitation Trend</span>
              </h4>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={generateForecast(user.district || "Kathmandu").map(
                      (d) => ({
                        name: d.dayName,
                        "Max Temp (°C)": d.tempMax,
                        "Rain Prob (%)": d.rainProb,
                      }),
                    )}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#e2e8f0"
                      label={{
                        value: "Temp (°C)",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fill: "#64748b",
                        fontSize: 10,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#e2e8f0"
                      label={{
                        value: "Rain (%)",
                        angle: 90,
                        position: "insideRight",
                        offset: 10,
                        fill: "#64748b",
                        fontSize: 10,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        border: "none",
                      }}
                      labelStyle={{
                        color: "#94a3b8",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                      itemStyle={{ color: "#f8fafc", fontSize: "12px" }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Max Temp (°C)"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Rain Prob (%)"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Smart Advisory Tasks */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold font-display text-slate-800 text-xs tracking-wider uppercase border-b border-slate-100 pb-2.5 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Harvest Window Recommendations</span>
                </h4>

                <div className="space-y-3">
                  {/* Dynamic Harvest Window Summary */}
                  {(() => {
                    const forecast = generateForecast(
                      user.district || "Kathmandu",
                    );
                    const dryDays = forecast.filter((d) => d.rainProb < 20);
                    const wetDays = forecast.filter((d) => d.rainProb >= 50);

                    return (
                      <>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                          <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Recommended Harvest Schedule</span>
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {dryDays.length > 0 ? (
                              <span>
                                The best window to harvest{" "}
                                <strong className="text-slate-800">
                                  {climateCrop}
                                </strong>{" "}
                                is on{" "}
                                <strong className="text-emerald-700">
                                  {dryDays.map((d) => d.dayName).join(", ")}
                                </strong>{" "}
                                due to low rain risks ({dryDays[0]?.rainProb}%).
                              </span>
                            ) : (
                              <span>
                                Persistent wet patterns forecasted. Delay bulk
                                harvest of{" "}
                                <strong className="text-slate-800">
                                  {climateCrop}
                                </strong>{" "}
                                if possible. If harvesting is urgent, focus on
                                protective covers.
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="space-y-2.5 pt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Agronomic Task List
                          </p>

                          {wetDays.length > 0 && (
                            <div className="flex items-start space-x-2 text-[11px] text-slate-600">
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-800">
                                  Moisture Protection:
                                </strong>{" "}
                                Heavy rain is forecasted on{" "}
                                {wetDays
                                  .map((d) => d.dayName)
                                  .slice(0, 2)
                                  .join(" & ")}
                                . Clean cooperative storage bays or lay out dry
                                tarps in advance.
                              </div>
                            </div>
                          )}

                          {climateCrop === "Potato (Alu)" && (
                            <div className="flex items-start space-x-2 text-[11px] text-slate-600">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-800">
                                  De-halming (Vines cutting):
                                </strong>{" "}
                                Cut potato vines 10-12 days before the dry
                                weather window to thicken tuber skins for
                                bruising prevention.
                              </div>
                            </div>
                          )}

                          {climateCrop === "Tomato (Golbheda)" && (
                            <div className="flex items-start space-x-2 text-[11px] text-slate-600">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-800">
                                  Airflow Management:
                                </strong>{" "}
                                Prune lower leaves now to reduce humidity
                                build-up and minimize late blight spread before
                                showers start.
                              </div>
                            </div>
                          )}

                          {climateCrop === "Onion (Pyaj)" && (
                            <div className="flex items-start space-x-2 text-[11px] text-slate-600">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-800">
                                  Dry Curing:
                                </strong>{" "}
                                Ensure harvested bulbs are not left on moist
                                soil. Cure them on raised wire racks under shade
                                to prevent sunscald.
                              </div>
                            </div>
                          )}

                          <div className="flex items-start space-x-2 text-[11px] text-slate-600">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-800">
                                Cooperative Logistics:
                              </strong>{" "}
                              Coordinate transportation via your district
                              cooperative to move bulk stock on clear days.
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Last updated: Live (10m ago)</span>
                <span className="text-emerald-600 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>Station Online</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Advisor */}
      {activeTab === "advisor" && (
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base font-display">
                    AI Agronomy &amp; Climatology Advisor
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gemini Climatology Engine analyzes seasonal weather
                    patterns, temperature anomalies, and historic wholesales to
                    recommend the best crops for{" "}
                    <strong className="text-slate-700">
                      {user.district || "Kathmandu"}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateAIAdvisor}
              disabled={advisorLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:from-purple-300 disabled:to-indigo-300 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center space-x-1.5 self-start md:self-auto shrink-0"
            >
              {advisorLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing district...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate Advice</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {advisorError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 flex items-start space-x-2.5 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong className="block mb-0.5 font-bold">
                  Climate Analysis Disrupted
                </strong>
                <p>{advisorError}</p>
                <button
                  onClick={handleGenerateAIAdvisor}
                  className="mt-2 text-[10px] font-bold text-red-700 hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Link</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading States Skeleton */}
          {advisorLoading && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
                <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-96 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="h-96 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="h-96 bg-slate-100 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Advice Output Result */}
          {advisorResult && !advisorLoading && (
            <div className="space-y-6">
              {/* Climate Summary & Upcoming Season */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12 select-none pointer-events-none">
                  <Sparkles className="w-96 h-96" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block mb-1">
                        Upcoming Target Season
                      </span>
                      <h4 className="text-xl font-black font-display tracking-tight flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-indigo-300" />
                        <span>{advisorResult.upcomingSeason}</span>
                      </h4>
                    </div>
                    <div className="bg-white/10 border border-white/20 text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider backdrop-blur-xs">
                      District: {user.district || "Kathmandu"}
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-4xl">
                    <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest block">
                      Meteorological Trend Summary
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {advisorResult.climateTrendSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* High-Yield Crop Recommendations */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-purple-50 text-purple-600 rounded-lg">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                    Recommended High-Yield Crops Suite
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {advisorResult.recommendedCrops.map((crop, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-150 flex flex-col justify-between space-y-5"
                    >
                      {/* Top Row: Crop Name & Variety */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-black font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase tracking-widest">
                            Recommendation #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 font-mono">
                            {crop.daysToHarvest}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 text-base tracking-tight font-display">
                          {crop.cropName}
                        </h5>
                        <div className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded-lg py-1 px-2.5 inline-block">
                          Variety:{" "}
                          <span className="text-purple-700 font-extrabold">
                            {crop.variety}
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid: Metrics */}
                      <div className="grid grid-cols-2 gap-3.5 border-y border-slate-100 py-4 font-semibold text-slate-600 text-xs">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mr-1" />{" "}
                            Yield Potential
                          </span>
                          <span className="font-bold text-slate-700 font-mono">
                            {crop.yieldPotential}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                            <Droplets className="w-3.5 h-3.5 text-blue-400 mr-1" />{" "}
                            Irrigation
                          </span>
                          <span className="font-bold text-slate-700">
                            {crop.irrigationRequirement}
                          </span>
                        </div>

                        <div className="space-y-1 col-span-2">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />{" "}
                            Market Trend &amp; Demand
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 leading-relaxed block">
                            {crop.marketDemandTrend}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Block: Agronomic Steps */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          AI Precision Agronomy Tips
                        </span>
                        <ul className="space-y-2">
                          {crop.agronomicTips.map((tip, tIdx) => (
                            <li
                              key={tIdx}
                              className="text-[11px] text-slate-600 leading-relaxed flex items-start space-x-1.5 font-medium"
                            >
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Climate Adaptation Actions */}
              <div className="bg-purple-50/50 border border-purple-150 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-purple-100 text-purple-700 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-purple-900 uppercase tracking-wider">
                    Climate-Smart Adaptation Guidelines
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advisorResult.climateAdaptationAdvice.map((advice, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-purple-100 p-4 rounded-xl flex items-start space-x-3.5 shadow-xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {advice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Soil & Nutrient Management */}
      {activeTab === "soil" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Log Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Log Soil/Nutrient Activity</span>
            </h3>

            <form onSubmit={handleCreateSoilLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Crop Batch / Field
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={soilCropBatch}
                    onChange={(e) => setSoilCropBatch(e.target.value)}
                    placeholder="e.g. Tomato (Golbheda) - Block A"
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                    <Sprout className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Specify which crop batch or partition of your land this
                  applies to.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Activity Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSoilLogType("fertilizer")}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-3 border rounded-lg text-xs font-medium transition duration-150 ${
                      soilLogType === "fertilizer"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Fertilizer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoilLogType("soil_test")}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-3 border rounded-lg text-xs font-medium transition duration-150 ${
                      soilLogType === "soil_test"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Soil Test</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Date of Event
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={soilDate}
                    onChange={(e) => setSoilDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Details &amp; Findings
                </label>
                <textarea
                  value={soilDetails}
                  onChange={(e) => setSoilDetails(e.target.value)}
                  placeholder={
                    soilLogType === "fertilizer"
                      ? "e.g. Applied 15kg Urea, 10kg DAP, and organic leaf compost."
                      : "e.g. pH: 6.2. Nitrogen: Low, Phosphorus: Medium. Recommended adding manure."
                  }
                  rows={4}
                  className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {/* Quick Fill Templates */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Quick Fill Templates
                </span>
                <div className="flex flex-wrap gap-1">
                  {soilLogType === "fertilizer" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSoilDetails(
                            "Applied 50kg organic farmyard manure (Compost) to boost micronutrient soil health.",
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition text-left"
                      >
                        + Compost
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSoilDetails(
                            "Applied chemical booster: 15kg Urea (Nitrogen) & 10kg Potash.",
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition text-left"
                      >
                        + N-K Booster
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSoilDetails(
                            "Added 20kg DAP (Diammonium Phosphate) before seeding to strengthen roots.",
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition text-left"
                      >
                        + DAP Root Care
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSoilDetails(
                            "Soil pH: 6.5 (Optimal). N-P-K values are balanced. Standard maintenance recommended.",
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition text-left"
                      >
                        + Balanced pH
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSoilDetails(
                            "Soil pH: 5.5 (Acidic). Nitrogen is low. Recommended adding agricultural lime and nitrogen-rich manure.",
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition text-left"
                      >
                        + Acidic + Low N
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSoilDetails(
                            "Soil pH: 7.2 (Slightly Alkaline). Phosphorus is low. Recommended applying bone meal or acidifying fertilizers.",
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition text-left"
                      >
                        + Alkaline + Low P
                      </button>
                    </>
                  )}
                </div>
              </div>

              {soilError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg p-3">
                  {soilError}
                </div>
              )}

              {soilSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3">
                  {soilSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingSoil}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition duration-150 shadow-sm disabled:opacity-50"
              >
                {isSubmittingSoil ? "Saving Log..." : "Save Log Activity"}
              </button>
            </form>
          </div>

          {/* Logs List & Educational Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logs List Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 space-y-2 sm:space-y-0">
                <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>
                    Soil &amp; Fertilizer Application Logs ({soilLogs.length})
                  </span>
                </h3>
                <div className="text-[10px] font-mono text-slate-400">
                  Total logged events: {soilLogs.length}
                </div>
              </div>

              {soilLogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Sprout className="w-8 h-8 text-slate-300 mx-auto mb-2.5 animate-bounce" />
                  <p className="text-slate-600 font-medium text-xs">
                    No records logged yet
                  </p>
                  <p className="text-slate-400 text-[11px] max-w-xs mx-auto mt-1 leading-normal">
                    Track fertilizer dosages and soil test results here. Use the
                    form to submit your first soil or nutrient activity.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {soilLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-slate-150 hover:border-slate-300 rounded-xl p-4 transition duration-150 bg-white shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 text-xs">
                              {log.cropBatch}
                            </span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-[11px] font-semibold text-slate-500 flex items-center">
                              <Calendar className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                              {log.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1.5 font-normal">
                            {log.details}
                          </p>
                        </div>

                        <div>
                          {log.logType === "fertilizer" ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                              <Activity className="w-2.5 h-2.5 shrink-0" />
                              <span>Fertilizer</span>
                            </span>
                          ) : (
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                              <FlaskConical className="w-2.5 h-2.5 shrink-0" />
                              <span>Soil Test</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Educational Insights Cards */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold font-display text-slate-800 text-xs tracking-wider uppercase border-b border-slate-100 pb-2.5 mb-4 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Soil &amp; pH Advisory for Key Crops</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span>Tomato (Golbheda) Requirements</span>
                  </p>
                  <ul className="text-[11px] text-slate-600 leading-relaxed list-disc list-inside space-y-1">
                    <li>
                      Optimal Soil pH:{" "}
                      <strong className="text-slate-800">6.0 - 6.8</strong>
                    </li>
                    <li>
                      Prefers well-draining loam or sandy loam with lots of
                      compost.
                    </li>
                    <li>
                      Needs Phosphorus for initial root set, followed by
                      Potassium during fruiting.
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                    <span>Potato (Alu) Requirements</span>
                  </p>
                  <ul className="text-[11px] text-slate-600 leading-relaxed list-disc list-inside space-y-1">
                    <li>
                      Optimal Soil pH:{" "}
                      <strong className="text-slate-800">4.8 - 6.0</strong>{" "}
                      (Acidic prevents common potato scab).
                    </li>
                    <li>
                      Demands heavy Potassium for tuber size and starch
                      synthesis.
                    </li>
                    <li>
                      Avoid heavy fresh manure right before planting to prevent
                      rot.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-emerald-800 flex items-center space-x-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>NPK Nutrient Cheat Sheet</span>
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed mt-1">
                  <strong>N (Nitrogen/Urea)</strong>: Drives lush, green leaf
                  growth. Deficient plants look pale yellow. <br />
                  <strong>P (Phosphorus/DAP)</strong>: Powers healthy root
                  structures and flowering. Deficient leaves look dark purple.{" "}
                  <br />
                  <strong>K (Potassium/Potash)</strong>: Strengthens immunity
                  against disease and enhances crop size/quality. Deficient leaf
                  edges look brown.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Crop Yield Forecasting */}
      {activeTab === "forecasting" &&
        (() => {
          const userHarvests = harvestRecords.filter(
            (h) => h.farmerId === user.id,
          );

          // Chronological order for chart
          const seasonOrder = [
            "Spring 2024",
            "Summer 2024",
            "Autumn 2024",
            "Winter 2024",
            "Spring 2025",
            "Summer 2025",
            "Autumn 2025",
            "Winter 2025",
          ];
          const sortedUserHarvests = [...userHarvests].sort((a, b) => {
            const indexA = seasonOrder.indexOf(a.season);
            const indexB = seasonOrder.indexOf(b.season);
            return indexA - indexB;
          });

          // Format chart data: group by season
          const seasonsWithData = Array.from(
            new Set(sortedUserHarvests.map((h) => h.season)),
          );
          seasonsWithData.sort(
            (a, b) => seasonOrder.indexOf(a) - seasonOrder.indexOf(b),
          );

          const chartData = seasonsWithData.map((season) => {
            const seasonRecords = sortedUserHarvests.filter(
              (h) => h.season === season,
            );
            const dataPoint: any = { name: season };
            const cropsList = [
              "Potato (Alu)",
              "Tomato (Golbheda)",
              "Cauliflower (Kauli)",
              "Ginger (Aduwa)",
              "Onion (Pyaj)",
            ];
            cropsList.forEach((crop) => {
              const cropRecord = seasonRecords.find((r) => r.crop === crop);
              if (cropRecord) {
                dataPoint[crop] = Math.round(
                  cropRecord.yieldQuantity / cropRecord.acreage,
                );
              }
            });
            return dataPoint;
          });

          // Compute recommendations
          const cropsList = [
            "Potato (Alu)",
            "Tomato (Golbheda)",
            "Cauliflower (Kauli)",
            "Ginger (Aduwa)",
            "Onion (Pyaj)",
          ];
          const recommendations = cropsList.map((cropName) => {
            // User's own yield records
            const userCropRecords = userHarvests.filter(
              (h) => h.crop === cropName,
            );
            const totalUserYield = userCropRecords.reduce(
              (sum, r) => sum + r.yieldQuantity,
              0,
            );
            const totalUserAcreage = userCropRecords.reduce(
              (sum, r) => sum + r.acreage,
              0,
            );
            const userAvgYieldPerRopani =
              totalUserAcreage > 0 ? totalUserYield / totalUserAcreage : 0;

            // Regional yield records
            const allCropRecords = harvestRecords.filter(
              (h) => h.crop === cropName,
            );
            const totalAllYield = allCropRecords.reduce(
              (sum, r) => sum + r.yieldQuantity,
              0,
            );
            const totalAllAcreage = allCropRecords.reduce(
              (sum, r) => sum + r.acreage,
              0,
            );
            const regionalAvgYieldPerRopani =
              totalAllAcreage > 0
                ? totalAllYield / totalAllAcreage
                : CROP_BASE_STATS[cropName]?.baseYield || 1000;

            // Best user harvest season for this crop
            const bestHarvest =
              userCropRecords.length > 0
                ? userCropRecords.reduce((prev, curr) =>
                    curr.yieldQuantity / curr.acreage >
                    prev.yieldQuantity / prev.acreage
                      ? curr
                      : prev,
                  )
                : null;

            const baseYieldPerRopani =
              userAvgYieldPerRopani > 0
                ? userAvgYieldPerRopani
                : regionalAvgYieldPerRopani;

            // Multipliers
            const weatherMult = (() => {
              if (simWeather === "optimal") return 1.15;
              if (simWeather === "dry") {
                if (cropName === "Tomato (Golbheda)") return 0.6;
                if (cropName === "Ginger (Aduwa)") return 0.55;
                if (cropName === "Cauliflower (Kauli)") return 0.7;
                if (cropName === "Potato (Alu)") return 0.8;
                return 0.85; // Onion
              }
              // excessive
              if (cropName === "Tomato (Golbheda)") return 0.5;
              if (cropName === "Onion (Pyaj)") return 0.55;
              if (cropName === "Ginger (Aduwa)") return 0.8;
              if (cropName === "Cauliflower (Kauli)") return 0.75;
              return 0.85; // Potato
            })();

            const soilMult = (() => {
              if (simSoil === "poor") return 0.65;
              if (simSoil === "organic") return 0.95;
              return 1.25; // balanced
            })();

            const forecastedYieldPerRopani =
              baseYieldPerRopani * weatherMult * soilMult;
            const forecastedYield =
              forecastedYieldPerRopani * Number(simAcreage);

            // Current Market Price
            const cropPrices = marketPrices.filter((p) => p.crop === cropName);
            const currentPrice =
              cropPrices.length > 0
                ? cropPrices[0].price_per_unit
                : CROP_BASE_STATS[cropName]?.defaultPrice || 50;
            const expectedRevenue = forecastedYield * currentPrice;

            // Advice summary
            const adviceList = [];
            if (simWeather === "dry") {
              adviceList.push(
                "Requires protective straw mulching to preserve ground moisture.",
              );
            } else if (simWeather === "excessive") {
              adviceList.push(
                "Build deep runoff trenches and raised planting beds (25-30cm) to secure high drainage.",
              );
            } else {
              adviceList.push(
                "Ideal season condition. Standard planting depth with moderate watering schedules is sufficient.",
              );
            }

            if (simSoil === "poor") {
              adviceList.push(
                "Add heavy organic manure & root booster DAP fertilizer prior to sowing seeds.",
              );
            } else if (simSoil === "organic") {
              adviceList.push(
                "Incorporate bio-fertilizers like vermicompost and liquid organic tea sprays.",
              );
            } else {
              adviceList.push(
                "Balanced fertilizer ready. Utilize balanced NPK 19-19-19 chemical nutrient application.",
              );
            }

            return {
              cropName,
              baseYieldPerRopani: Math.round(baseYieldPerRopani),
              forecastedYieldPerRopani: Math.round(forecastedYieldPerRopani),
              forecastedYield: Math.round(forecastedYield),
              currentPrice,
              expectedRevenue: Math.round(expectedRevenue),
              isBasedOnPersonalHistory: userAvgYieldPerRopani > 0,
              bestHarvest,
              adviceList,
            };
          });

          // Sort by expected revenue descending
          recommendations.sort((a, b) => b.expectedRevenue - a.expectedRevenue);

          return (
            <div className="space-y-6">
              {/* Header Advisory block */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-md">
                <div className="max-w-4xl space-y-2">
                  <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Next-Season Recommendation Engine
                  </span>
                  <h3 className="text-xl font-bold font-display tracking-tight">
                    Crop Yield Forecasting &amp; Smart Planting Engine
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed max-w-3xl">
                    Analyze multi-season harvest trends across your specific
                    acreage in {user.district}. Log past harvests below to train
                    the recommendation algorithm on your farm's unique
                    performance baseline.
                  </p>
                </div>
              </div>

              {/* AI Crop Harvest Forecasting & Optimal Planting Cycle Tool */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <Sparkles className="w-5 h-5 animate-pulse text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">
                        AI-Powered Harvest &amp; Planting Forecaster
                      </h3>
                      <p className="text-xs text-slate-500">
                        Gemini deep intelligence leverages historical{" "}
                        {user.district} district data and live soil metrics to
                        predict optimal sowing schedules.
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] bg-purple-100/70 border border-purple-200 text-purple-700 font-bold px-2.5 py-1 rounded-full w-fit shrink-0">
                    Powered by Gemini 3.5 Flash
                  </div>
                </div>

                {/* Input Form Fields for AI */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                      Target Crop
                    </label>
                    <select
                      value={aiCrop}
                      onChange={(e) => setAiCrop(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {cropOptions.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                      Acreage (Ropani)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={aiAcreage}
                      onChange={(e) => setAiAcreage(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                      Current Soil Condition
                    </label>
                    <select
                      value={aiSoil}
                      onChange={(e) => setAiSoil(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="poor">Poor (Low organic nutrients)</option>
                      <option value="balanced">
                        Balanced (Optimal pH &amp; NPK)
                      </option>
                      <option value="organic">
                        Organic Rich (Heavy composted)
                      </option>
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={handleGenerateAIForecast}
                      disabled={aiLoading}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all duration-150 shadow-sm flex items-center justify-center space-x-1.5 h-[36px]"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyzing with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Run AI Forecast</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error State */}
                {aiError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                    <div>
                      <span className="font-bold block mb-0.5">
                        AI Engine Error
                      </span>
                      <span>{aiError}</span>
                    </div>
                  </div>
                )}

                {/* Loading State Skeleton */}
                {aiLoading && (
                  <div className="border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse bg-slate-50/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                      <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
                  </div>
                )}

                {/* AI Forecast Report Output */}
                {aiResult && !aiLoading && (
                  <div className="border border-purple-150 rounded-2xl overflow-hidden shadow-xs">
                    {/* Top bar */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 px-5 py-3 border-b border-purple-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wide flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Agri-Intelligence Forecast Report</span>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        District: {user.district}
                      </span>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Key Metrics Bento Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Estimated Yield
                          </span>
                          <div className="text-2xl font-extrabold text-slate-800 font-mono flex items-baseline">
                            {aiResult.yieldEstimate.toLocaleString()}
                            <span className="text-xs font-semibold text-slate-500 ml-1">
                              KG
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Calculated across {aiAcreage} Ropani
                          </span>
                        </div>

                        <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Recommended Cycle
                          </span>
                          <div className="text-base font-extrabold text-purple-700 uppercase tracking-tight truncate mt-0.5">
                            {aiResult.plantingCycle}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Selected for {user.district} micro-climate
                          </span>
                        </div>

                        <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Optimal Timelines
                          </span>
                          <div className="text-xs font-bold text-slate-700 mt-1 space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">
                                Sowing:
                              </span>
                              <span className="font-mono">
                                {aiResult.optimalPlantingDate}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-0.5">
                              <span className="text-slate-400 font-medium">
                                Harvest:
                              </span>
                              <span className="font-mono">
                                {aiResult.optimalHarvestDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scientific Rationale */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center space-x-1">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>Forecast Rationale &amp; Baseline</span>
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {aiResult.rationale}
                        </p>
                      </div>

                      {/* Localized Risk Assessment */}
                      <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Localized {user.district} Risk Assessment</span>
                        </span>
                        <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                          {aiResult.riskAssessment}
                        </p>
                      </div>

                      {/* Actionable recommendations */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          AI Sequential Implementation Steps:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {aiResult.actionableSteps.map((step, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-start space-x-2.5 shadow-xs"
                            >
                              <span className="w-5 h-5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Log Past Harvest Form */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
                  <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Log Past Harvest Record</span>
                  </h3>

                  <form
                    onSubmit={handleCreateHarvestRecord}
                    className="space-y-4"
                  >
                    {/* Select Crop */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Crop Type
                      </label>
                      <select
                        value={harvestCrop}
                        onChange={(e) => setHarvestCrop(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {cropOptions.map((crop) => (
                          <option key={crop} value={crop}>
                            {crop}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Season Year */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Harvest Season &amp; Year
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Spring 2025"
                        value={harvestSeason}
                        onChange={(e) => setHarvestSeason(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Enter in format like 'Spring 2025', 'Autumn 2024'.
                      </p>
                    </div>

                    {/* Acreage and Harvest Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Area (Ropani)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={harvestAcreage}
                          onChange={(e) => setHarvestAcreage(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Yield (KG)
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 3500"
                          value={harvestQty}
                          onChange={(e) => setHarvestQty(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Fertilizer Applied */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Fertilizers / Nutrients Applied
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Organic manure + 15kg DAP"
                        value={harvestFertilizer}
                        onChange={(e) => setHarvestFertilizer(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>

                    {/* Weather and Soil dropdowns */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Weather Trend
                        </label>
                        <select
                          value={harvestWeather}
                          onChange={(e) =>
                            setHarvestWeather(e.target.value as any)
                          }
                          className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="optimal">Optimal</option>
                          <option value="dry">Dry Spell</option>
                          <option value="excessive">Excessive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Soil Status
                        </label>
                        <select
                          value={harvestSoil}
                          onChange={(e) =>
                            setHarvestSoil(e.target.value as any)
                          }
                          className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="poor">Poor</option>
                          <option value="organic">Organic</option>
                          <option value="balanced">Balanced</option>
                        </select>
                      </div>
                    </div>

                    {harvestError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg p-2.5">
                        {harvestError}
                      </div>
                    )}

                    {harvestSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg p-2.5">
                        {harvestSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingHarvest}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition duration-150 shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingHarvest
                        ? "Recording..."
                        : "Record Past Harvest"}
                    </button>
                  </form>
                </div>

                {/* Right Side: Recommender Simulator Input + Interactive output */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Simulator Parameters Panel */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="border-b border-slate-200 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>Next-Season Simulation Criteria</span>
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        Current Target: {simSeason}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Target Season Selection */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                          Target Season
                        </label>
                        <select
                          value={simSeason}
                          onChange={(e) => setSimSeason(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 font-medium text-slate-700"
                        >
                          <option value="Autumn 2026">Autumn 2026</option>
                          <option value="Winter 2026">Winter 2026</option>
                          <option value="Spring 2027">Spring 2027</option>
                          <option value="Summer 2027">Summer 2027</option>
                        </select>
                      </div>

                      {/* Sim Acreage */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                          Simulated Land (Ropani)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={simAcreage}
                          onChange={(e) => setSimAcreage(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-700"
                        />
                      </div>

                      {/* Sim Expected Weather */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                          Expected Weather
                        </label>
                        <select
                          value={simWeather}
                          onChange={(e) => setSimWeather(e.target.value as any)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 font-medium text-slate-700"
                        >
                          <option value="optimal">Optimal Rainfall</option>
                          <option value="dry">Dry Spell / Low Rain</option>
                          <option value="excessive">Excessive Storms</option>
                        </select>
                      </div>

                      {/* Sim Expected Soil */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                          Soil Quality Plan
                        </label>
                        <select
                          value={simSoil}
                          onChange={(e) => setSimSoil(e.target.value as any)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 font-medium text-slate-700"
                        >
                          <option value="poor">
                            Poor / Minimal Fertilizer
                          </option>
                          <option value="organic">
                            Organic / Heavy Compost
                          </option>
                          <option value="balanced">
                            Balanced NPK / Optimal
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Ranked Recommendations List */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-xs tracking-wider uppercase flex items-center space-x-1.5 px-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Ranked Crop Feasibility &amp; Recommendations</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((rec, index) => {
                        const isTop = index === 0;
                        return (
                          <div
                            key={rec.cropName}
                            className={`border rounded-xl p-5 shadow-sm transition-all duration-200 bg-white ${
                              isTop
                                ? "ring-2 ring-emerald-500/80 border-emerald-500/30"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                {isTop ? (
                                  <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center w-fit space-x-1 mb-2">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>#1 Best Choice</span>
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center w-fit mb-2">
                                    <span>Alternative Choice #{index + 1}</span>
                                  </span>
                                )}

                                <h4 className="font-bold font-display text-slate-800 text-base flex items-center space-x-1">
                                  <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{rec.cropName}</span>
                                </h4>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                                  Expected Revenue
                                </span>
                                <span className="text-base font-bold text-emerald-700 font-mono">
                                  NPR {rec.expectedRevenue.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Stats Breakdown */}
                            <div className="grid grid-cols-2 gap-2 mt-4 py-2 border-t border-b border-slate-100 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                                  Estimated Yield
                                </span>
                                <span className="font-bold text-slate-700 font-mono">
                                  {rec.forecastedYield} KG
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                                  Efficiency Baseline
                                </span>
                                <span className="font-semibold text-slate-600 font-mono">
                                  {rec.forecastedYieldPerRopani} KG/Ropani
                                </span>
                              </div>
                            </div>

                            <div className="mt-3.5 space-y-2">
                              {/* Personal History validation tag */}
                              {rec.isBasedOnPersonalHistory ? (
                                <div className="bg-emerald-50/70 border border-emerald-100 text-[10px] text-emerald-800 p-2 rounded-lg leading-relaxed flex items-start space-x-1.5">
                                  <span className="text-xs shrink-0">📈</span>
                                  <span>
                                    Based on your own farm history. Your best
                                    record:{" "}
                                    <strong>
                                      {rec.bestHarvest
                                        ? Math.round(
                                            rec.bestHarvest.yieldQuantity /
                                              rec.bestHarvest.acreage,
                                          )
                                        : 0}{" "}
                                      KG/Ropani
                                    </strong>{" "}
                                    in {rec.bestHarvest?.season}.
                                  </span>
                                </div>
                              ) : (
                                <div className="bg-slate-50 border border-slate-200 text-[10px] text-slate-500 p-2 rounded-lg leading-relaxed flex items-start space-x-1.5">
                                  <span className="text-xs shrink-0">📋</span>
                                  <span>
                                    No personal history logged yet for this
                                    crop. Forecasting initialized with regional
                                    district averages of{" "}
                                    <strong>
                                      {rec.baseYieldPerRopani} KG/Ropani
                                    </strong>
                                    .
                                  </span>
                                </div>
                              )}

                              {/* Actionable Fertilizers & Planting Advisories */}
                              <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                                  Actionable Planting Guides:
                                </span>
                                <ul className="text-[11px] text-slate-600 leading-relaxed list-disc list-inside space-y-1 pl-1">
                                  {rec.adviceList.map((adv, aIdx) => (
                                    <li key={aIdx}>{adv}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Historical Multi-season Yield Trends Graph */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Historical Yield Performance Trends (KG / Ropani)
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        Compare seasonal soil efficiency milestones. More
                        recorded harvests refine this line chart naturally.
                      </p>
                    </div>

                    {userHarvests.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Sprout className="w-8 h-8 text-slate-300 mx-auto mb-2.5 animate-bounce" />
                        <p className="text-slate-600 font-medium text-xs">
                          No historical records logged yet
                        </p>
                        <p className="text-slate-400 text-[11px] max-w-xs mx-auto mt-1 leading-normal">
                          Submit a past harvest using the form to populate the
                          efficiency line charts instantly.
                        </p>
                      </div>
                    ) : (
                      <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -20,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                fontSize: 11,
                                borderRadius: 8,
                                borderColor: "#cbd5e1",
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line
                              type="monotone"
                              dataKey="Tomato (Golbheda)"
                              stroke="#ef4444"
                              strokeWidth={2.5}
                              dot={{ r: 4 }}
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="Potato (Alu)"
                              stroke="#3b82f6"
                              strokeWidth={2.5}
                              dot={{ r: 4 }}
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="Cauliflower (Kauli)"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              dot={{ r: 4 }}
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="Ginger (Aduwa)"
                              stroke="#f59e0b"
                              strokeWidth={2.5}
                              dot={{ r: 4 }}
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="Onion (Pyaj)"
                              stroke="#8b5cf6"
                              strokeWidth={2.5}
                              dot={{ r: 4 }}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* History Logs List panel */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                        <History className="w-4 h-4 text-emerald-600" />
                        <span>
                          My Logged Harvests Timeline ({userHarvests.length})
                        </span>
                      </h3>
                    </div>

                    {userHarvests.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No past harvest logs stored. Use the left panel form to
                        build your history.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {userHarvests.map((rec) => (
                          <div
                            key={rec.id}
                            className="border border-slate-100 hover:border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-800">
                                  {rec.crop}
                                </span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="font-semibold text-slate-500 font-mono">
                                  {rec.season}
                                </span>
                              </div>
                              <p className="text-slate-600 leading-normal">
                                Land Area: <strong>{rec.acreage} Ropani</strong>{" "}
                                &bull; Total Yield:{" "}
                                <strong>{rec.yieldQuantity} KG</strong> (
                                <strong className="text-emerald-700 font-mono">
                                  {Math.round(rec.yieldQuantity / rec.acreage)}{" "}
                                  KG/Ropani
                                </strong>{" "}
                                efficiency)
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Soil:{" "}
                                <strong className="capitalize">
                                  {rec.soilCondition}
                                </strong>{" "}
                                &bull; Weather:{" "}
                                <strong className="capitalize">
                                  {rec.weatherCondition}
                                </strong>{" "}
                                &bull; Nutrients:{" "}
                                <strong>{rec.fertilizerUsed}</strong>
                              </p>
                            </div>

                            <div className="flex items-center space-x-2.5">
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono tracking-wider border border-emerald-100 shrink-0">
                                Logged Log
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Tab: Price Alerts & Notifications */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Main layout grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Create Alert Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-2">
                  <BellRing className="w-4 h-4 text-emerald-600" />
                  <span>Create Price Alert</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Receive an automated alert when a crop's market price violates
                  your target threshold.
                </p>
              </div>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                {alertsError && (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    {alertsError}
                  </div>
                )}
                {alertSuccess && (
                  <div className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    {alertSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Crop Item (बाली)
                  </label>
                  <select
                    value={alertCrop}
                    onChange={(e) => setAlertCrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                  >
                    {cropOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Trigger When Price
                    </label>
                    <select
                      value={alertCriteria}
                      onChange={(e) => setAlertCriteria(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                    >
                      <option value="above">Rises Above (या बढी)</option>
                      <option value="below">Falls Below (या कम)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Threshold (NRs/KG)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    District / Region (क्षेत्र)
                  </label>
                  <select
                    value={alertRegion}
                    onChange={(e) => setAlertRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                  >
                    <option value="all">All Regions (सबै क्षेत्र)</option>
                    <option value="Kathmandu">Kathmandu Valley</option>
                    <option value="Terai">Terai Plains</option>
                    <option value="Hill">Hill District</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAlert}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    {isSubmittingAlert
                      ? "Registering..."
                      : "Enable Alert Watch"}
                  </span>
                </button>
              </form>

              {/* Price Alerts Simulator Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 pt-3">
                <div className="flex items-center space-x-2 text-slate-800">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Interactive Test Bed
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Simulate a live market price update for your registered crop
                  alert above to test instant trigger notifications:
                </p>

                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">
                      Simulated Price
                    </span>
                    <input
                      type="number"
                      value={simulatedPrice}
                      onChange={(e) => setSimulatedPrice(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-lg py-1 px-2 text-xs font-mono"
                    />
                  </div>
                  <button
                    onClick={handleSimulateAlertTrigger}
                    disabled={isTriggeringSimulation}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg self-end h-[32px] transition cursor-pointer"
                  >
                    {isTriggeringSimulation ? "Testing..." : "Test Trigger"}
                  </button>
                </div>

                {simulationResult && (
                  <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/50 p-2 rounded-lg leading-snug">
                    {simulationResult}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Active Alerts List */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>
                      My Registered Alert Watches ({priceAlerts.length})
                    </span>
                  </h3>
                </div>

                {isFetchingAlerts ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    Loading your watches...
                  </p>
                ) : priceAlerts.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-semibold text-xs">
                      No active price alert watches
                    </p>
                    <p className="text-slate-400 text-[10px] max-w-xs mx-auto mt-1 leading-relaxed">
                      Farmers register watches to track price fluctuations.
                      Create one on the left to start!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {priceAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`border rounded-xl p-3.5 flex items-center justify-between transition ${
                          alert.isActive
                            ? "bg-slate-50 border-slate-200/80"
                            : "bg-slate-50/50 border-slate-100 opacity-60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 text-xs">
                              {alert.crop}
                            </span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-[10px] text-slate-400 font-mono capitalize">
                              Region:{" "}
                              {alert.region === "all" ? "Any" : alert.region}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 text-xs">
                            <span className="text-slate-500">
                              Alert if price is
                            </span>
                            <span
                              className={`font-bold uppercase text-[10px] px-2 py-0.25 rounded-md ${
                                alert.criteria === "above"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {alert.criteria === "above"
                                ? "≥ Above"
                                : "≤ Below"}
                            </span>
                            <span className="font-extrabold text-slate-700 font-mono">
                              NRs. {alert.priceThreshold}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            Registered on{" "}
                            {new Date(alert.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Active Switch */}
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={alert.isActive}
                              onChange={() =>
                                handleToggleAlertActive(
                                  alert.id,
                                  alert.isActive,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                          </label>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-lg transition cursor-pointer"
                            title="Remove Watch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Notification Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>
                    Triggered In-App Alerts Logs ({notifications.length})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  History of verified market fluctuations matching your alert
                  target configurations.
                </p>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="px-3 py-1.5 border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-800 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 bg-slate-50 hover:bg-emerald-50 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Mark All As Read</span>
                </button>
              )}
            </div>

            {isFetchingNotifications ? (
              <p className="text-center py-6 text-xs text-slate-400">
                Loading your history log...
              </p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <BellRing className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
                <p className="text-slate-600 font-bold text-xs">
                  No notifications logged yet
                </p>
                <p className="text-slate-400 text-[10px] max-w-xs mx-auto mt-1 leading-relaxed">
                  Notifications trigger automatically when an administrator logs
                  new prices or during test bed simulations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 relative ${
                      notif.isRead
                        ? "bg-slate-50/50 border-slate-100 opacity-75"
                        : "bg-amber-50/60 border-amber-200/80 shadow-xs"
                    }`}
                  >
                    {!notif.isRead && (
                      <span
                        className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-ping"
                        title="Unread"
                      ></span>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-800">
                          {notif.title}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                        {notif.message}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/80 flex justify-between items-center text-[11px]">
                      <div className="flex items-center space-x-2 font-semibold">
                        <span className="text-slate-400">
                          Current Unit Rate:
                        </span>
                        <span className="font-bold text-slate-800 font-mono">
                          NRs. {notif.currentPrice}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400">Threshold:</span>
                        <span className="font-bold text-slate-700 font-mono">
                          NRs. {notif.threshold}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notif.isRead && (
                          <button
                            onClick={() =>
                              handleMarkNotificationRead(notif.id, true)
                            }
                            className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Yield Calculator */}
      {activeTab === "calculator" &&
        (() => {
          const totalYield = calcLandSize * (calcYieldRate || 0);
          const grossRevenue = totalYield * (calcMarketRate || 0);
          const totalExpenses =
            (calcExpenseSeeds || 0) +
            (calcExpenseFertilizer || 0) +
            (calcExpenseLabor || 0) +
            (calcExpenseTractor || 0) +
            (calcExpenseTransport || 0);
          const netProfit = grossRevenue - totalExpenses;
          const profitMargin =
            grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

          // Recharts data format
          const chartData = [
            { name: "Gross Revenue", Amount: grossRevenue, fill: "#059669" },
            { name: "Total Expenses", Amount: totalExpenses, fill: "#e11d48" },
            {
              name: "Net Profit",
              Amount: netProfit,
              fill: netProfit >= 0 ? "#10b981" : "#f43f5e",
            },
          ];

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header section with bilingual title */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Interactive Crop Yield &amp; Revenue Calculator</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Estimate total yield, production costs, and net potential
                    profit. Fill in manual parameters or click a preset crop
                    profile below.
                    <br />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      फसल उत्पादन र आम्दानी क्यालकुलेटर: आफ्नो जग्गा, अपेक्षित
                      उत्पादन र बजार भाउ अनुसार सम्भावित नाफा गणना गर्नुहोस्।
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    Unit: {calcLandUnit.toUpperCase()}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900">
                    Scale: {calcLandSize} {calcLandUnit}
                  </span>
                </div>
              </div>

              {/* Crop Preset Selector Quick Bar */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                  Quick Load Crop Profile presets / द्रुत बाली प्रोफाइलहरू:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {Object.keys(calcCropPresets).map((cropKey) => {
                    const isActive = calcCrop === cropKey;
                    return (
                      <button
                        key={cropKey}
                        type="button"
                        onClick={() => handleApplyCropPreset(cropKey)}
                        className={`py-2 px-3 text-left rounded-xl border text-xs font-semibold transition-all duration-150 flex flex-col justify-between cursor-pointer shadow-xs ${
                          isActive
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50/20"
                        }`}
                      >
                        <span className="truncate">
                          {calcCropPresets[cropKey].name}
                        </span>
                        <span
                          className={`text-[10px] font-normal truncate ${isActive ? "text-emerald-100" : "text-slate-400 dark:text-slate-500"}`}
                        >
                          {calcCropPresets[cropKey].nepaliName.split(" ")[1] ||
                            ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Input Panel */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 1. Land and Crop Settings */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center space-x-2">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        Land &amp; Crop Parameters (जग्गा र बाली विवरण)
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Land Size (जग्गा क्षेत्रफल)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={calcLandSize}
                          onChange={(e) =>
                            setCalcLandSize(
                              Math.max(0.1, Number(e.target.value) || 0),
                            )
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Land Unit (क्षेत्रफल एकाई)
                        </label>
                        <select
                          value={calcLandUnit}
                          onChange={(e) => {
                            const unit = e.target.value as any;
                            setCalcLandUnit(unit);
                            handleApplyCropPreset(calcCrop, unit);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="ropani">Ropani (रोपनी)</option>
                          <option value="bigha">Bigha (बिघा)</option>
                          <option value="kattha">Kattha (कट्ठा)</option>
                          <option value="hectare">Hectare (हेक्टर)</option>
                          <option value="acre">Acre (एकर)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Crop Selection (बाली चयन)
                      </label>
                      <select
                        value={calcCrop}
                        onChange={(e) => handleApplyCropPreset(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-200 cursor-pointer font-semibold"
                      >
                        {Object.keys(calcCropPresets).map((key) => (
                          <option key={key} value={key}>
                            {calcCropPresets[key].nepaliName}
                          </option>
                        ))}
                        <option value="custom">
                          Other / Custom Crop (अन्य बाली)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* 2. Expected Yield and Market Prices */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        Yield &amp; Price Forecasts (उत्पादन र बजार दर)
                      </h4>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Yield rate per {calcLandUnit} (उत्पादकत्व दर)
                        </label>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                          Typical yield: ~
                          {calcCropPresets[calcCrop]?.yieldPerRopani
                            ? Math.round(
                                calcCropPresets[calcCrop].yieldPerRopani *
                                  landUnitToRopaniMultiplier[calcLandUnit],
                              )
                            : 500}{" "}
                          Kg / {calcLandUnit}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={calcYieldRate}
                          onChange={(e) =>
                            setCalcYieldRate(
                              Math.max(1, Number(e.target.value) || 0),
                            )
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-200 font-mono pr-20"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold uppercase">
                          Kg / {calcLandUnit}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Expected Price rate (अपेक्षित बजार भाउ)
                        </label>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                          Standard rate: ~
                          {calcCropPresets[calcCrop]?.pricePerKg || 40} NRs / Kg
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={calcMarketRate}
                          onChange={(e) =>
                            setCalcMarketRate(
                              Math.max(1, Number(e.target.value) || 0),
                            )
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-200 font-mono pr-20"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold uppercase">
                          NRs. / Kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Cost break down inputs */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          Production Expenses (उत्पादन लागत विवरण)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCropPreset(calcCrop)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin-slow" />
                        <span>Reset to Average Guidelines</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                      Estimated costs scaled proportionally to {calcLandSize}{" "}
                      {calcLandUnit}. You can edit these fields manually to
                      reflect your actual seasonal expenditures.
                    </p>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Seeds &amp; Saplings (बिउ बिजन)
                          </label>
                          <input
                            type="number"
                            value={calcExpenseSeeds}
                            onChange={(e) =>
                              setCalcExpenseSeeds(
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Fertilizer &amp; Pesticides (मल र विषादी)
                          </label>
                          <input
                            type="number"
                            value={calcExpenseFertilizer}
                            onChange={(e) =>
                              setCalcExpenseFertilizer(
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Labor Wages (श्रमिक ज्याला)
                          </label>
                          <input
                            type="number"
                            value={calcExpenseLabor}
                            onChange={(e) =>
                              setCalcExpenseLabor(
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Tractor &amp; Tillage (ट्र्याक्टर र जोताइ)
                          </label>
                          <input
                            type="number"
                            value={calcExpenseTractor}
                            onChange={(e) =>
                              setCalcExpenseTractor(
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Transport &amp; Market Logistics (ढुवानी र प्याकेजिङ)
                        </label>
                        <input
                          type="number"
                          value={calcExpenseTransport}
                          onChange={(e) =>
                            setCalcExpenseTransport(
                              Math.max(0, Number(e.target.value) || 0),
                            )
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Projections & Advice */}
                <div className="lg:col-span-7 space-y-6">
                  {/* 1. Main Numeric Projections Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Gross Revenue */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                          Estimated Gross Revenue
                        </span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 italic">
                          कुल सम्भावित आम्दानी
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono block">
                          Rs. {grossRevenue.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium block mt-1">
                          From {totalYield.toLocaleString()} Kg total yield
                        </span>
                      </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider block">
                          Total Input Expenses
                        </span>
                        <span className="text-[9px] text-rose-600 dark:text-rose-500 italic">
                          कुल अनुमानित उत्पादन लागत
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono block">
                          Rs. {totalExpenses.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-medium block mt-1">
                          Avg cost: Rs.{" "}
                          {Math.round(
                            totalExpenses / calcLandSize,
                          ).toLocaleString()}{" "}
                          / {calcLandUnit}
                        </span>
                      </div>
                    </div>

                    {/* Net Profit */}
                    <div
                      className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors duration-200 ${
                        netProfit >= 0
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                          : "bg-rose-600 border-rose-500 text-white shadow-md"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-90">
                          Net Potential Profit
                        </span>
                        <span className="text-[9px] italic opacity-80 block">
                          अनुमानित खुद नाफा
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black font-mono block">
                          Rs. {netProfit.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold block mt-1 opacity-90">
                          {profitMargin}% Net Profit Margin
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Visual Recharts Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>Financial Projections Chart (वित्तीय चार्ट)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono">
                        Currency: NRs
                      </span>
                    </div>

                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                          barSize={60}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                              `Rs.${value >= 1000 ? value / 1000 + "k" : value}`
                            }
                          />
                          <Tooltip
                            formatter={(value: any) => [
                              `Rs. ${Number(value).toLocaleString()}`,
                              "Amount",
                            ]}
                            contentStyle={{
                              background: "#0f172a",
                              borderRadius: "12px",
                              border: "none",
                              color: "#fff",
                              fontSize: "11px",
                            }}
                            cursor={{ fill: "rgba(226, 232, 240, 0.4)" }}
                          />
                          <Bar dataKey="Amount" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 3. Detailed Cost Breakdown Bar Bar */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs tracking-wider uppercase">
                      Input Cost Distribution (लागत बाँडफाँड विवरण)
                    </h4>

                    {totalExpenses === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-400">
                        No expenses recorded yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {/* Bar visualizer stack */}
                        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{
                              width: `${Math.round((calcExpenseSeeds / totalExpenses) * 100)}%`,
                            }}
                            title={`Seeds: ${Math.round((calcExpenseSeeds / totalExpenses) * 100)}%`}
                          />
                          <div
                            className="h-full bg-amber-500"
                            style={{
                              width: `${Math.round((calcExpenseFertilizer / totalExpenses) * 100)}%`,
                            }}
                            title={`Fertilizer: ${Math.round((calcExpenseFertilizer / totalExpenses) * 100)}%`}
                          />
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${Math.round((calcExpenseLabor / totalExpenses) * 100)}%`,
                            }}
                            title={`Labor: ${Math.round((calcExpenseLabor / totalExpenses) * 100)}%`}
                          />
                          <div
                            className="h-full bg-indigo-500"
                            style={{
                              width: `${Math.round((calcExpenseTractor / totalExpenses) * 100)}%`,
                            }}
                            title={`Tractor: ${Math.round((calcExpenseTractor / totalExpenses) * 100)}%`}
                          />
                          <div
                            className="h-full bg-rose-500"
                            style={{
                              width: `${Math.round((calcExpenseTransport / totalExpenses) * 100)}%`,
                            }}
                            title={`Transport: ${Math.round((calcExpenseTransport / totalExpenses) * 100)}%`}
                          />
                        </div>

                        {/* Legends with values and percentage breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                          <div className="space-y-0.5">
                            <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">Seeds</span>
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono pl-3.5">
                              Rs.{calcExpenseSeeds.toLocaleString()} (
                              {Math.round(
                                (calcExpenseSeeds / totalExpenses) * 100,
                              )}
                              %)
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                              <span className="truncate">Fertilizer</span>
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono pl-3.5">
                              Rs.{calcExpenseFertilizer.toLocaleString()} (
                              {Math.round(
                                (calcExpenseFertilizer / totalExpenses) * 100,
                              )}
                              %)
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="truncate">Labor Wages</span>
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono pl-3.5">
                              Rs.{calcExpenseLabor.toLocaleString()} (
                              {Math.round(
                                (calcExpenseLabor / totalExpenses) * 100,
                              )}
                              %)
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                              <span className="truncate">Tractor</span>
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono pl-3.5">
                              Rs.{calcExpenseTractor.toLocaleString()} (
                              {Math.round(
                                (calcExpenseTractor / totalExpenses) * 100,
                              )}
                              %)
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                              <span className="truncate">Transport</span>
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono pl-3.5">
                              Rs.{calcExpenseTransport.toLocaleString()} (
                              {Math.round(
                                (calcExpenseTransport / totalExpenses) * 100,
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Cooperative Insight & Recommendations */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
                    <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                      <Info className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        Agri-Advisory &amp; Profit Recommendations
                      </span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {profitMargin >= 45 ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl p-4 space-y-2">
                          <p className="font-bold text-emerald-900 dark:text-emerald-400 flex items-center space-x-1.5">
                            <span>
                              🌟 Excellent Potential Margin! (उत्कृष्ट खुद नाफा
                              दर)
                            </span>
                          </p>
                          <p className="text-emerald-800 dark:text-emerald-300 font-normal">
                            Your calculated margin of{" "}
                            <strong>{profitMargin}%</strong> is extremely
                            viable. This suggests your cultivation density and
                            expected market price are highly optimized.
                          </p>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 space-y-1 pl-1">
                            <p>
                              &bull; <strong>Marketing Strategy:</strong> Direct
                              list this crop on our B2B portal to negotiate
                              long-term supply contracts with bulk hospitality
                              buyers in Kathmandu for stable pricing.
                            </p>
                            <p>
                              &bull; <strong>Reinvestment:</strong> Consider
                              allocating 10% of profit to install drip
                              irrigation or solar poly-tunnel covers to secure
                              off-season premium rates.
                            </p>
                          </div>
                        </div>
                      ) : profitMargin >= 15 ? (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl p-4 space-y-2">
                          <p className="font-bold text-amber-900 dark:text-amber-400">
                            ⚖️ Healthy Seasonal Balance (सामान्य नाफाको
                            सम्भावना)
                          </p>
                          <p className="text-amber-800 dark:text-amber-300 font-normal">
                            A <strong>{profitMargin}%</strong> margin matches
                            average regional standards in {user.district}{" "}
                            district. It provides steady sustainability but has
                            room for further cost controls.
                          </p>
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 space-y-1 pl-1">
                            <p>
                              &bull; <strong>Labor Optimization:</strong> Labor
                              wages represent a noticeable input block. Explore
                              community mechanization pools or coordinate shared
                              harvest schedules with neighbor cooperatives.
                            </p>
                            <p>
                              &bull; <strong>Logistics:</strong> Coordinate
                              transport with local cooperatives to share flatbed
                              trucks to Kathmandu, slicing travel costs by up to
                              25%.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl p-4 space-y-2">
                          <p className="font-bold text-rose-900 dark:text-rose-400 flex items-center space-x-1.5">
                            <span>
                              🚨 Critical Cost Threshold Warning (उच्च जोखिम
                              चेतावनी)
                            </span>
                          </p>
                          <p className="text-rose-800 dark:text-rose-300 font-normal">
                            Calculated profit margin is low (
                            <strong>{profitMargin}%</strong>). At current rates,
                            high input expenditures (seeds, fertilizer,
                            transport) leave you highly sensitive to weather or
                            price fluctuations.
                          </p>
                          <div className="text-[11px] text-rose-700 dark:text-rose-400 space-y-1 pl-1">
                            <p>
                              &bull; <strong>Cost Mitigation:</strong> Seek
                              subsidy programs for seeds and compost fertilizer
                              from Trishuli Valley Farmers Union or Dhading
                              Cooperative network.
                            </p>
                            <p>
                              &bull; <strong>Premium Pricing:</strong> Consider
                              certifying your farm as "Dhading Organic" to list
                              crops with a 15-20% target premium above standard
                              wholesale rates.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 italic border-t border-slate-200/50">
                        Note: Calculations are based on regional pilot district
                        variables. Actual yields can fluctuate based on
                        localized micro-climate indices, soil nutrient scores,
                        and pest mitigation. Use as guidance only.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Tab: QR Scan History & Audit Log */}
      {activeTab === "scans" && (
        <div className="space-y-6">
          {/* Header Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                    <QrCode className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold font-display text-white">
                    {t("QR Scan History & Audit Log")}
                  </h2>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {t(
                    "Log of previous QR codes scanned, including cooperative member digital passes, harvest batch crate tags, and raw codes.",
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t("Scan New QR Code")}</span>
                </button>

                {scanLogs.length > 0 && (
                  <button
                    onClick={handleClearScanHistory}
                    className="px-3.5 py-2 bg-white/10 hover:bg-rose-600/80 text-white border border-white/20 hover:border-rose-500 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                    title="Clear all scan history"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                    <span>{t("Clear Log")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("Total Scans")}
                </p>
                <p className="text-xl font-black font-mono text-white mt-0.5">
                  {scanLogs.length}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("Member Passes")}
                </p>
                <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {scanLogs.filter((s) => s.scanType === "member").length}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("Harvest Batches")}
                </p>
                <p className="text-xl font-black font-mono text-indigo-400 mt-0.5">
                  {scanLogs.filter((s) => s.scanType === "batch").length}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("Latest Activity")}
                </p>
                <p className="text-xs font-bold font-mono text-amber-300 mt-1 truncate">
                  {scanLogs.length > 0
                    ? new Date(scanLogs[0].scannedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : t("No activity")}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Success Notification */}
          {scanActionSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{scanActionSuccess}</span>
              </div>
              <button
                onClick={() => setScanActionSuccess("")}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider flex items-center space-x-1 shrink-0">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>{t("Filter")}:</span>
              </span>
              <button
                onClick={() => setScanFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  scanFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("All Scans")} ({scanLogs.length})
              </button>
              <button
                onClick={() => setScanFilter("member")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  scanFilter === "member"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {t("Member Passes")} (
                {scanLogs.filter((s) => s.scanType === "member").length})
              </button>
              <button
                onClick={() => setScanFilter("batch")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  scanFilter === "batch"
                    ? "bg-indigo-700 text-white"
                    : "bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100"
                }`}
              >
                {t("Harvest Batches")} (
                {scanLogs.filter((s) => s.scanType === "batch").length})
              </button>
              <button
                onClick={() => setScanFilter("text")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  scanFilter === "text"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                {t("Text / Code")} (
                {scanLogs.filter((s) => s.scanType === "text").length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={scanSearch}
                onChange={(e) => setScanSearch(e.target.value)}
                placeholder={t("Search by crop, member, coop...")}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-700"
              />
              {scanSearch && (
                <button
                  onClick={() => setScanSearch("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scan Log Items List */}
          {isFetchingScanLogs ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">
                {t("Loading QR scan history logs...")}
              </p>
            </div>
          ) : (
            (() => {
              const filteredScans = scanLogs.filter((item) => {
                if (scanFilter !== "all" && item.scanType !== scanFilter)
                  return false;
                if (scanSearch.trim()) {
                  const q = scanSearch.toLowerCase();
                  const titleMatch = item.title.toLowerCase().includes(q);
                  const detailsMatch = item.details.toLowerCase().includes(q);
                  const metaMatch = JSON.stringify(item.metadata || {})
                    .toLowerCase()
                    .includes(q);
                  return titleMatch || detailsMatch || metaMatch;
                }
                return true;
              });

              if (filteredScans.length === 0) {
                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="font-bold text-slate-800 text-sm">
                        {scanSearch || scanFilter !== "all"
                          ? t("No matching scan records found")
                          : t("No QR scans recorded yet")}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {scanSearch || scanFilter !== "all"
                          ? t(
                              "Try adjusting your search terms or filter selection.",
                            )
                          : t(
                              "Use the Mobile Camera QR Scanner to scan produce batch tags or cooperative member passes. All scan activity will be logged here.",
                            )}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsQrModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t("Open QR Scanner")}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3.5">
                  {filteredScans.map((log) => {
                    const dateObj = new Date(log.scannedAt);
                    const formattedDate = dateObj.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={log.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs transition duration-150 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >
                        <div className="flex items-start space-x-3.5">
                          {/* Type Icon Badge */}
                          <div className="shrink-0 mt-0.5">
                            {log.scanType === "member" && (
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                                <UserCheck className="w-5 h-5" />
                              </div>
                            )}
                            {log.scanType === "batch" && (
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                                <Tag className="w-5 h-5" />
                              </div>
                            )}
                            {log.scanType === "text" && (
                              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                                <QrCode className="w-5 h-5" />
                              </div>
                            )}
                            {log.scanType === "unknown" && (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                                <QrCode className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Scan Log Content */}
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-display">
                                {log.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  log.scanType === "member"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : log.scanType === "batch"
                                      ? "bg-indigo-100 text-indigo-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {log.scanType === "member"
                                  ? t("Member Pass")
                                  : log.scanType === "batch"
                                    ? t("Harvest Batch")
                                    : t("Code / Text")}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-normal font-sans">
                              {log.details}
                            </p>

                            {/* Metadata Tags */}
                            {log.metadata && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {log.metadata.fullName && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700">
                                    <UserCheck className="w-3 h-3 text-slate-500" />
                                    <span>{log.metadata.fullName}</span>
                                  </span>
                                )}
                                {log.metadata.cooperativeName && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700">
                                    <Building2 className="w-3 h-3 text-slate-500" />
                                    <span>{log.metadata.cooperativeName}</span>
                                  </span>
                                )}
                                {log.metadata.crop && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800">
                                    <Leaf className="w-3 h-3 text-emerald-600" />
                                    <span>{log.metadata.crop}</span>
                                  </span>
                                )}
                                {log.metadata.quantity && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-[10px] font-mono font-bold text-indigo-800">
                                    <span>Qty: {log.metadata.quantity} KG</span>
                                  </span>
                                )}
                                {log.metadata.price && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-mono font-bold text-amber-800">
                                    <span>NRs. {log.metadata.price}/KG</span>
                                  </span>
                                )}
                                {log.metadata.district && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>{log.metadata.district}</span>
                                  </span>
                                )}
                                {log.metadata.batchId && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600">
                                    <span>{log.metadata.batchId}</span>
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="text-[11px] text-slate-400 font-mono pt-1 flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>
                                {formattedDate} at {formattedTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Quick Actions */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          {log.scanType === "batch" && log.metadata?.crop && (
                            <button
                              onClick={() =>
                                handleQrPreFillForm(
                                  log.metadata?.crop || "",
                                  log.metadata?.quantity || "",
                                  log.metadata?.price || "",
                                )
                              }
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{t("Pre-fill Listing")}</span>
                            </button>
                          )}

                          {log.scanType === "member" && (
                            <button
                              onClick={() =>
                                handleOpenContactModal(
                                  log.metadata?.crop || "General Coordinate",
                                )
                              }
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs rounded-xl transition flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{t("Contact Cooperative")}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteScanItem(log.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete scan entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Contact Cooperative Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase font-display">
                  Contact Local Cooperative
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-150 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendCoopMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Selected Crop Subject
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={contactCrop}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Choose District Cooperative
                </label>
                {coops.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">
                        No registered cooperatives found in {user.district}.
                      </p>
                      <p className="mt-0.5 text-amber-700 leading-normal">
                        Please register with a local office first, or contact
                        our administrative hub for help.
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedCoopId}
                    onChange={(e) => setSelectedCoopId(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 cursor-pointer"
                    required
                  >
                    {coops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.district}) - {c.contact_person}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Your Message
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Enter detailed message to coordinate crop transport, pricing, or warehouse logistics..."
                  rows={4}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl py-2.5 px-3.5 text-xs text-slate-700 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Error and Success Feedback */}
              {coopMsgError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{coopMsgError}</span>
                </div>
              )}

              {coopMsgSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{coopMsgSuccess}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 font-bold text-xs rounded-xl transition bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingCoopMsg || coops.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  {isSendingCoopMsg ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weather Safety Action Plan Modal */}
      {isWeatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <CloudLightning className="w-5 h-5 text-rose-700" />
                <div>
                  <h3 className="font-extrabold text-rose-900 text-sm tracking-wide uppercase font-display">
                    {t("Monsoon Disaster Response Plan")}
                  </h3>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    {t("Critical precautions for")} {t(weatherAlertDistrict)}{" "}
                    {t("District")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWeatherModalOpen(false)}
                className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-100/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-rose-900">
                  {t(
                    "⚠️ Primary Hazards: Mudslides & Landslides (पहिरोको जोखिम)",
                  )}
                </p>
                <p className="text-xs text-rose-800 leading-relaxed font-normal">
                  {t(
                    "Both Dhading and Makwanpur feature steep hilly topography. Hilly slopes and terraced farmlands can instantly liquefy under prolonged extreme rainfall, washing away topsoil, crop beds, or farm infrastructure.",
                  )}
                </p>
              </div>

              {/* Action Steps */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {t("Field & Crop Security Protocols")}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-2">
                    <span className="text-lg">🚜</span>
                    <h5 className="text-xs font-bold text-slate-800">
                      {t("1. Clear Run-off Channels")}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t(
                        "Walk the perimeter of tomato trellis plots and potato ridges. Manually shovel out soil blockages in the arterial drain channels to divert heavy volumes of rainwater away from crop roots.",
                      )}
                    </p>
                  </div>

                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-2">
                    <span className="text-lg">🍅</span>
                    <h5 className="text-xs font-bold text-slate-800">
                      {t("2. Safeguard Harvested Stocks")}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t(
                        "Move all wooden or plastic vegetable crates off bare earth fields. Store harvested crops inside secure, elevated brick or concrete storage warehouses immediately.",
                      )}
                    </p>
                  </div>

                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-2">
                    <span className="text-lg">🎒</span>
                    <h5 className="text-xs font-bold text-slate-800">
                      {t("3. Human Life Safety First")}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t(
                        "If your fields are located near high landslide hazard zones (such as steep valley banks in Malekhu, Dhading or Sisneri, Makwanpur), prioritize evacuating farm labor to safe community shelters.",
                      )}
                    </p>
                  </div>

                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-2">
                    <span className="text-lg">🛣️</span>
                    <h5 className="text-xs font-bold text-slate-800">
                      {t("4. Suspend Highway Transport")}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t(
                        "Highway landslide blockages on the Prithvi Highway or Kanti Lokpath can leave perishable vegetable trucks stranded for days. Check current police road closure reports before loading cargo.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* District Emergency Contacts */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {t("Emergency Support Lines")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <p className="font-bold text-slate-700">
                      {t("Dhading District Emergency Hub")}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("📞 Landslide & Flood Response: +977-10-520133")}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <p className="font-bold text-slate-700">
                      {t("Makwanpur District Emergency Hub")}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("📞 Landslide & Flood Response: +977-57-520112")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(false)}
                className="px-5 py-2 bg-slate-850 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {t("Understood, Close Plan")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Harvest Batch QR Tag Modal */}
      <PrintableBatchQrModal
        isOpen={isPrintableQrOpen}
        onClose={() => setIsPrintableQrOpen(false)}
        listing={printableListing}
        user={user}
      />

      {/* QR Scanner & ID Pass Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        user={user}
        token={token}
        onBatchRegistered={(newListing) => {
          setListings((prev) => [newListing, ...prev]);
        }}
        onPreFillForm={handleQrPreFillForm}
        onScanHistoryUpdate={fetchScanLogs}
        activeListings={listings}
      />

      {/* Mandatory KYC Verification Modal */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        user={currentUser}
        token={token}
        onSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          if (onUserUpdate) onUserUpdate(updatedUser);
        }}
      />

      {/* Send Order QR Code Modal to Buyer */}
      <SendOrderQrModal
        isOpen={!!sendQrModalOrder}
        onClose={() => setSendQrModalOrder(null)}
        order={sendQrModalOrder}
        user={currentUser}
        token={token}
        onQrSent={(orderId) => {
          fetchFarmerData();
          loadNegotiations(orderId);
        }}
      />
    </div>
  );
}
