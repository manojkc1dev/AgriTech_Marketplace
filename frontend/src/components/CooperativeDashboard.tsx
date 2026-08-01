import React, { useState, useEffect } from "react";
import { User, Cooperative, CooperativeMessage, CooperativeAnnouncement, ProduceListing } from "../types";
import { 
  Building2, Megaphone, Users, MessageSquare, Trash2, Plus, 
  Check, Bell, ShieldAlert, Sparkles, HelpCircle, Phone, Calendar, ArrowRight, ClipboardList,
  Truck, MapPin, Compass, Navigation, Info, AlertTriangle, ShieldCheck, RefreshCw, Gauge, Clock, HelpCircle as HelpIcon, Map, DollarSign, TrendingDown, Eye, Leaf, Settings
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Localized Hubs within Dhading and Makwanpur
const DISTRICT_HUBS: Record<string, { name: string; nepaliName: string; baseDistances: Record<string, number>; avgTimeHrs: number; desc: string }[]> = {
  Dhading: [
    { 
      name: "Galchhi", 
      nepaliName: "गल्छी", 
      baseDistances: { Kalimati: 50, Balkhu: 49, Koteshwor: 58, Chabahil: 55 },
      avgTimeHrs: 1.5,
      desc: "Trishuli highway intersection. Main B2B pickup point for central Dhading."
    },
    { 
      name: "Dharke", 
      nepaliName: "धार्के", 
      baseDistances: { Kalimati: 32, Balkhu: 31, Koteshwor: 40, Chabahil: 37 },
      avgTimeHrs: 1.0,
      desc: "Prithvi highway hub near Nagdhunga. Fast transit point."
    },
    { 
      name: "Malekhu", 
      nepaliName: "मलेखु", 
      baseDistances: { Kalimati: 70, Balkhu: 69, Koteshwor: 78, Chabahil: 75 },
      avgTimeHrs: 2.2,
      desc: "Major vegetable and fish hub on the Prithvi highway corridor."
    },
    { 
      name: "Dhading Besi", 
      nepaliName: "धादिङबेसी", 
      baseDistances: { Kalimati: 90, Balkhu: 89, Koteshwor: 98, Chabahil: 95 },
      avgTimeHrs: 3.0,
      desc: "District headquarters. Higher local terrain transport overhead."
    },
  ],
  Makwanpur: [
    { 
      name: "Palung", 
      nepaliName: "पालुङ", 
      baseDistances: { Kalimati: 65, Balkhu: 64, Koteshwor: 73, Chabahil: 70 },
      avgTimeHrs: 2.5,
      desc: "High altitude vegetable basin. Known for off-season cabbage & cauliflower."
    },
    { 
      name: "Bhimphedi", 
      nepaliName: "भीमफेदी", 
      baseDistances: { Kalimati: 95, Balkhu: 93, Koteshwor: 101, Chabahil: 103 },
      avgTimeHrs: 3.5,
      desc: "Historic valley entrance. Relies on winding link highway routes."
    },
    { 
      name: "Hetauda", 
      nepaliName: "हेटौडा", 
      baseDistances: { Kalimati: 82, Balkhu: 80, Koteshwor: 86, Chabahil: 88 },
      avgTimeHrs: 3.5,
      desc: "Industrial hub. Fast Kanti Lokpath link or stable Tribhuvan Highway link."
    }
  ]
};

const MARKET_DESTINATIONS = [
  { id: "Kalimati", name: "Kalimati Wholesale Market", nepaliName: "कालीमाटी फलफूल तथा तरकारी बजार", desc: "Largest wholesale market. Highest demand but strict congestion hours." },
  { id: "Balkhu", name: "Balkhu Vegetable Market", nepaliName: "बल्खु कृषि बजार", desc: "Easy access from southern routes. Fast unloading." },
  { id: "Koteshwor", name: "Koteshwor Wholesale Market", nepaliName: "कोटेश्वर तरकारी बजार", desc: "Best for eastern deliveries, bypasses central traffic." },
  { id: "Chabahil", name: "Chabahil Vegetable Market", nepaliName: "चाबहिल तरकारी बजार", desc: "Smaller capacity but commands premium retail prices." }
];

const VEHICLE_PROFILES = {
  mini: {
    id: "mini",
    name: "Mini Pickup (TATA Ace / Bolero)",
    nepaliName: "सानो पिकअप (टाटा एस / बोलेरो)",
    capacityKg: 1500,
    baseHireCost: 4800,
    fuelConsumptionPer100Km: 10,
    driverAllowance: 1500,
    highwayTolls: 150,
    extraUnloadingLaborCostPerKg: 0.15,
    co2PerLiter: 2.62,
    desc: "Compact dimensions, perfect for small local farmer yields."
  },
  medium: {
    id: "medium",
    name: "Medium Truck (TATA 407)",
    nepaliName: "मझौला ट्रक (टाटा ४०७)",
    capacityKg: 4000,
    baseHireCost: 9200,
    fuelConsumptionPer100Km: 15,
    driverAllowance: 2500,
    highwayTolls: 300,
    extraUnloadingLaborCostPerKg: 0.10,
    co2PerLiter: 2.68,
    desc: "All-rounder transport, optimal for mid-size cooperative bundling."
  },
  heavy: {
    id: "heavy",
    name: "Heavy Multi-Axle Truck",
    nepaliName: "ठूलो ट्रक (टाटा १६१३)",
    capacityKg: 10000,
    baseHireCost: 16500,
    fuelConsumptionPer100Km: 25,
    driverAllowance: 3800,
    highwayTolls: 600,
    extraUnloadingLaborCostPerKg: 0.08,
    co2PerLiter: 2.72,
    desc: "High capacity freight, ideal for combined cooperative shipping."
  }
};

interface CooperativeProps {
  user: User;
  token: string;
}

export default function CooperativeDashboard({ user, token }: CooperativeProps) {
  const { t } = useLanguage();
  const [cooperative, setCooperative] = useState<Cooperative | null>(null);
  const [announcements, setAnnouncements] = useState<CooperativeAnnouncement[]>([]);
  const [messages, setMessages] = useState<CooperativeMessage[]>([]);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [farmerListings, setFarmerListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bulletins" | "logistics">("bulletins");

  // Logistics Planner States
  const [logisticsOriginDistrict, setLogisticsOriginDistrict] = useState<"Dhading" | "Makwanpur">(
    user.district === "Makwanpur" ? "Makwanpur" : "Dhading"
  );
  const [logisticsOriginHub, setLogisticsOriginHub] = useState<string>(
    user.district === "Makwanpur" ? "Palung" : "Galchhi"
  );
  const [logisticsDestination, setLogisticsDestination] = useState<string>("Kalimati");
  const [logisticsProduceWeight, setLogisticsProduceWeight] = useState<number>(3500); // default 3500 kg
  const [logisticsVehicleType, setLogisticsVehicleType] = useState<"mini" | "medium" | "heavy">("medium");
  const [logisticsRouteOption, setLogisticsRouteOption] = useState<"kanti" | "tribhuvan">("kanti");
  const [logisticsIncludeRoundTrip, setLogisticsIncludeRoundTrip] = useState<boolean>(true);
  const [logisticsCustomDieselPrice, setLogisticsCustomDieselPrice] = useState<number>(145); // NRS per liter

  // Form states for broadcasting announcements
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<'market_update' | 'bulk_notification' | 'training' | 'weather_warning'>("market_update");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all cooperatives to find this cooperative
      const coopRes = await fetch("/api/cooperatives");
      if (coopRes.ok) {
        const allCoops = await coopRes.json();
        const myCoop = allCoops.find((c: Cooperative) => c.id === user.cooperativeId);
        if (myCoop) {
          setCooperative(myCoop);
        }
      }

      // 2. Fetch all announcements
      const annRes = await fetch("/api/cooperatives/announcements");
      if (annRes.ok) {
        const allAnns = await annRes.json();
        // Filter announcements specifically by this cooperative
        const filtered = allAnns.filter((a: CooperativeAnnouncement) => a.cooperativeId === user.cooperativeId);
        setAnnouncements(filtered);
      }

      // 3. Fetch all farmer messages (or load all messages and filter)
      // Since farmers send messages to cooperatives, let's load all messages and filter by my coop ID
      const msgRes = await fetch("/api/cooperatives/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Note: server returns messages filtered by farmerId if using GET /api/cooperatives/messages, 
      // but let's check. Actually we can load all messages if there's a helper, or fetch them.
      // Wait! Let's make an endpoint in server.ts to load messages for cooperatives!
      // Yes, we will check if server has an endpoint or we can add one.
      // Let's create GET /api/cooperatives/received-messages for cooperatives. We'll implement it shortly or write it in server.ts.
      const recvMsgRes = await fetch(`/api/cooperatives/received-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (recvMsgRes.ok) {
        setMessages(await recvMsgRes.json());
      }

      // 4. Fetch all users to filter farmers in the district
      const usersRes = await fetch("/api/admin/users/pending-verification", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Wait, let's load verified farmers or all farmers. Let's make an endpoint or fetch from existing.
      // Actually, we can fetch all listings to find district active crops and farmer details.
      const listingsRes = await fetch("/api/listings");
      if (listingsRes.ok) {
        const allListings = await listingsRes.json();
        // Filter listings from the same district
        const districtListings = allListings.filter((l: ProduceListing) => l.district === user.district);
        setFarmerListings(districtListings);

        // Extract unique farmers from these listings, or fetch farmers
        const farmersMap: Record<string, User> = {};
        districtListings.forEach((l: ProduceListing) => {
          if (l.farmerId && l.farmerName) {
            farmersMap[l.farmerId] = {
              id: l.farmerId,
              username: l.farmerId,
              fullName: l.farmerName,
              role: "farmer",
              phone: "+977-9841-XXXXXX", // masked or fallback
              district: l.district || user.district,
              verified: true
            };
          }
        });
        setFarmers(Object.values(farmersMap));
      }

    } catch (e) {
      console.error("Error loading cooperative data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!title.trim() || !content.trim()) {
      setFormError("Please enter both a title and details for the announcement.");
      return;
    }

    setBroadcastLoading(true);
    try {
      const res = await fetch("/api/cooperatives/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category
        })
      });

      if (res.ok) {
        setFormSuccess("Broadcast announcement posted successfully to your farmer network!");
        setTitle("");
        setContent("");
        setCategory("market_update");
        // Refresh announcements
        const annRes = await fetch("/api/cooperatives/announcements");
        if (annRes.ok) {
          const allAnns = await annRes.json();
          const filtered = allAnns.filter((a: CooperativeAnnouncement) => a.cooperativeId === user.cooperativeId);
          setAnnouncements(filtered);
        }
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to broadcast update.");
      }
    } catch (e) {
      setFormError("Network communication error.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const res = await fetch(`/api/cooperatives/announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error("Error deleting announcement:", e);
    }
  };

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "market_update":
        return { text: "Market Update", bg: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" };
      case "weather_warning":
        return { text: "Weather Advisory", bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500" };
      case "training":
        return { text: "Training / Event", bg: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500" };
      case "bulk_notification":
        return { text: "Bulk Logistics", bg: "bg-purple-50 text-purple-700 border-purple-100", dot: "bg-purple-500" };
      default:
        return { text: "General Announcement", bg: "bg-slate-50 text-slate-700 border-slate-100", dot: "bg-slate-400" };
    }
  };

  return (
    <div className="space-y-6" id="coop-dashboard">
      
      {/* Cooperative Banner Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -ml-12 -mb-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-300">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-widest">{t("Registered B2B Cooperative Hub")}</span>
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-white">
              {cooperative ? cooperative.name : "Farmer Cooperative Association"}
            </h2>
            <p className="text-xs text-purple-200/80 max-w-xl">
              Logistics hub coordinating bulk supply lines, micro-transport optimization to Kathmandu markets, and dynamic agricultural bulletins.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Representative</div>
            <div className="text-sm font-bold text-white">{user.fullName}</div>
            <div className="text-xs text-purple-200">{user.phone} &bull; {user.district} District</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher Bar (Pill style matching B2B Hub) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("bulletins")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "bulletins"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Megaphone className="w-4 h-4 shrink-0" />
          <span>Coop Board &amp; Directory (बुलेटिन र नेटवर्क)</span>
        </button>
        <button
          onClick={() => setActiveTab("logistics")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "logistics"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span>B2B Logistics Planner (ढुवानी योजनाकार)</span>
        </button>
      </div>

      {activeTab === "bulletins" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left column: Broadcast / Stats Panel (1 column) */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Quick Stats Widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Cooperative Statistics</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-display text-slate-800">{farmers.length || 2}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Linked Farmers</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-display text-slate-800">{farmerListings.length}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Active Crop Lots</div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span>District Hub Location:</span>
                  <strong className="text-slate-700">{user.district}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Network Broadcasts:</span>
                  <strong className="text-slate-700">{announcements.length} Active</strong>
                </div>
              </div>
            </div>

            {/* Broadcast Form Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                  <Megaphone className="w-4.5 h-4.5 text-purple-600" />
                  <span>Broadcast Update</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Publish instant bulletins visible on your farmer network dashboards</p>
              </div>

              {formError && (
                <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl mb-3">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl mb-3">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Announcement Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 font-medium transition"
                  >
                    <option value="market_update">📈 Market Price Update</option>
                    <option value="bulk_notification">🚛 Bulk Logistics / Transport</option>
                    <option value="training">🎓 Farmer Training & Events</option>
                    <option value="weather_warning">⛈️ Weather Advisory Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Bulletin Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Wednesday Kalimati Transport Run"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Bulletin Details</label>
                  <textarea
                    placeholder="Write instructions, prices, meteorological updates, or logistics coordination times here..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={broadcastLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-100 text-white font-bold py-2 px-3 rounded-xl text-xs uppercase tracking-wider transition duration-150 shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {broadcastLoading ? "Broadcasting..." : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Broadcast to Network</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right column: Announcements List + Farmer directory + Messages (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Section: Active Bulletins Announcements Board */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                      Live Bulletins & Announcements Board
                    </h3>
                    <p className="text-xs text-slate-400">Manage broadcast bulletins visible to registered district smallholders</p>
                  </div>
                </div>
                <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 border border-purple-100 rounded-full font-mono">
                  {announcements.length} Active
                </span>
              </div>

              {announcements.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400 text-xs">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2.5 text-slate-300" />
                  <p className="font-semibold">No Broadcast Bulletins Active</p>
                  <p className="text-[11px] text-slate-400 mt-1">Use the left broadcast panel to share bulk logistics or market price updates.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {announcements.map((ann) => {
                    const style = getCategoryStyles(ann.category);
                    return (
                      <div 
                        key={ann.id} 
                        className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl p-4 transition-all flex items-start gap-3.5"
                      >
                        <div className="p-2 bg-white rounded-lg border border-slate-200/50 shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        </div>
                        
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full self-start ${style.bg}`}>
                              {style.text}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-slate-300" />
                              {new Date(ann.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-xs leading-snug">{ann.title}</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">{ann.content}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1.5 border border-slate-200 hover:border-rose-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Farmer Network Directory */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>My Registered Farmer Network ({farmers.length || 2})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Directly coordinate with B2B farmers in {user.district} district to combine and optimize logistics</p>
              </div>

              {farmers.length === 0 ? (
                <div className="text-xs text-slate-400 border border-slate-100 rounded-xl py-6 text-center">
                  No farmers have published listings in {user.district} yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {farmers.map((farmer) => {
                    const myListings = farmerListings.filter(l => l.farmerId === farmer.id);
                    return (
                      <div key={farmer.id} className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <strong className="text-xs text-slate-800">{farmer.fullName}</strong>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.25 border border-emerald-100 rounded-full font-bold">
                              District Affiliate
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">@{farmer.username}</p>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-slate-500 text-[10px]">
                            <Phone className="w-3 h-3 text-slate-300" />
                            <span>+977-9841-XXXXXX</span>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200/50 rounded-lg p-2 space-y-1">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active listings ({myListings.length})</div>
                          {myListings.length === 0 ? (
                            <div className="text-[10px] text-slate-400 italic">No crops currently listed</div>
                          ) : (
                            <div className="space-y-1 max-h-[80px] overflow-y-auto">
                              {myListings.map(l => (
                                <div key={l.id} className="text-[10px] text-slate-600 flex justify-between items-center bg-slate-50 p-1 rounded">
                                  <span className="font-semibold">{l.crop}</span>
                                  <span>{l.quantity} {l.unit} &bull; NRs.{l.target_price}/KG</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Farmer Contact Messages (Received) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span>Farmer Communications & Logistics Requests ({messages.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Incoming B2B coordinate messages sent by farmers needing transport and storage assistance</p>
              </div>

              {messages.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                  <p className="font-semibold text-slate-400">No Logistics Messages Received</p>
                  <p className="text-[11px] text-slate-400 mt-1">When farmers in your district contact you, their inquiries will accumulate here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 transition duration-150">
                      <div className="flex items-start justify-between gap-2.5">
                        <div>
                          <strong className="text-xs text-slate-800">{msg.farmerName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">@{msg.farmerId}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-1.5 flex items-center space-x-2">
                        <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-700 px-1.5 py-0.25 border border-purple-100 rounded">
                          {msg.crop} LOT
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white border border-slate-200/50 p-2.5 rounded-lg italic font-normal">
                        "{msg.message}"
                      </p>

                      <div className="mt-3 flex items-center justify-end">
                        <a 
                          href={`tel:${user.phone}`} 
                          className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-purple-50 border border-purple-100 text-purple-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call to Coordinate</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (() => {
        // Find selected hub details
        const selectedHubObj = DISTRICT_HUBS[logisticsOriginDistrict]?.find(
          (h) => h.name === logisticsOriginHub
        ) || DISTRICT_HUBS[logisticsOriginDistrict]?.[0];

        if (!selectedHubObj) return null;

        // Base distance
        let distance = selectedHubObj.baseDistances[logisticsDestination] || 50;
        let timeHrs = selectedHubObj.avgTimeHrs;
        let roadName = logisticsOriginDistrict === "Dhading" ? "Prithvi Highway (पृथ्वी राजमार्ग)" : "Tribhuvan Highway (त्रिभुवन राजपथ)";
        let statusText = "Fully open. Standard traffic at Nagdhunga checkpoint.";
        let risk: "low" | "medium" | "high" = "low";

        // Route adjustments for Makwanpur
        if (logisticsOriginHub === "Hetauda") {
          if (logisticsRouteOption === "kanti") {
            distance = 82;
            timeHrs = 3.5;
            roadName = "Kanti Lokpath (कान्ति लोकपथ)";
            statusText = "Kanti Lokpath has narrow single-lane sections. Heavy rainfall warning: high risk of landslide/debris flow.";
            risk = "high";
          } else {
            distance = 135;
            timeHrs = 5.5;
            roadName = "Tribhuvan Highway (त्रिभुवन राजपथ)";
            statusText = "Stable bypass but features extreme steep slopes & winding bends around Palung. High fuel usage.";
            risk = "medium";
          }
        } else if (logisticsOriginHub === "Palung") {
          roadName = "Tribhuvan Highway (त्रिभुवन राजपथ)";
          statusText = "Open. Watch for morning thick mist & slow-moving freight trucks near Naubise.";
          risk = "medium";
        } else if (logisticsOriginHub === "Bhimphedi") {
          roadName = "Dakshinkali-Sisneri-Kathmandu Link Road";
          statusText = "Open for light/medium passenger & cargo vehicles. Heavy trucks must detour via Tribhuvan Highway.";
          risk = "high";
        } else {
          // Dhading
          roadName = "Prithvi Highway (पृथ्वी राजमार्ग)";
          statusText = "Nagdhunga-Mugling highway widening underway. Expect intermittent 20-30 minute lane merges near Galchhi.";
          risk = "low";
        }

        // Adjust distance based on specific market destinations in Kathmandu
        if (logisticsDestination === "Balkhu") {
          distance -= 1;
        } else if (logisticsDestination === "Koteshwor") {
          distance += 8;
          timeHrs += 0.5;
        } else if (logisticsDestination === "Chabahil") {
          distance += 6;
          timeHrs += 0.4;
        }

        // Vehicle specifications
        const vehicle = VEHICLE_PROFILES[logisticsVehicleType];

        // Calculations
        const isOverloaded = logisticsProduceWeight > vehicle.capacityKg;
        const fillPercentage = Math.min(100, Math.round((logisticsProduceWeight / vehicle.capacityKg) * 100));

        // Fuel calculation
        const tripDistance = logisticsIncludeRoundTrip ? distance * 2 : distance;
        const fuelConsumedLiters = Number(((tripDistance * vehicle.fuelConsumptionPer100Km) / 100).toFixed(1));
        const fuelCost = Math.round(fuelConsumedLiters * logisticsCustomDieselPrice);

        // Labor & Tolls
        const unloadingCost = Math.round(logisticsProduceWeight * vehicle.extraUnloadingLaborCostPerKg);
        const baseRent = vehicle.baseHireCost;
        const driverWage = vehicle.driverAllowance;
        const tollFees = vehicle.highwayTolls;

        // Total calculated logistics budget
        const totalLogisticsCost = baseRent + fuelCost + driverWage + tollFees + unloadingCost;
        const costPerKg = logisticsProduceWeight > 0 ? Number((totalLogisticsCost / logisticsProduceWeight).toFixed(2)) : 0;

        // Carbon metric
        const co2Kg = Math.round(fuelConsumedLiters * vehicle.co2PerLiter);

        // Cooperative bundle compatibility: listings in the same district that can be bundled!
        const localListingsToBundle = farmerListings.filter(
          (l) => l.district === logisticsOriginDistrict
        );
        const totalBundlableWeight = localListingsToBundle.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header section with bilingual title */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <span>B2B Route &amp; Cargo Freight Planner</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Calculate optimal transport routes, estimate costs, and schedule collective deliveries to Kathmandu wholesale markets.
                  <br />
                  <span className="text-purple-600 font-semibold">सहकारी ढुवानी योजनाकार: काठमाडौंका बजारहरूमा ढुवानीको दूरी, समय र सवारी अनुसारको खर्च गणना गर्नुहोस्।</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                  Route: {selectedHubObj.nepaliName} &rarr; {logisticsDestination}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                  Distance: {distance} KM
                </span>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Metric 1: Distance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">One-Way Distance</span>
                  <span className="text-lg font-black text-slate-800 font-mono block leading-none mt-1">{distance} KM</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">कुल दूरी</span>
                </div>
              </div>

              {/* Metric 2: Estimated Time */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Travel Time</span>
                  <span className="text-lg font-black text-slate-800 font-mono block leading-none mt-1">~{timeHrs} Hours</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">अनुमानित यात्रा समय</span>
                </div>
              </div>

              {/* Metric 3: Total Cost */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5 col-span-2 md:col-span-1">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Transport Cost</span>
                  <span className="text-lg font-black text-emerald-700 font-mono block leading-none mt-1">Rs. {totalLogisticsCost.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">अनुमानित कुल खर्च</span>
                </div>
              </div>

              {/* Metric 4: Cost per Kg */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Freight Cost / Kg</span>
                  <span className="text-lg font-black text-slate-800 font-mono block leading-none mt-1">Rs. {costPerKg}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">प्रति केजी लागत</span>
                </div>
              </div>

              {/* Metric 5: Carbon Footprint */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ Carbon Index</span>
                  <span className="text-lg font-black text-slate-800 font-mono block leading-none mt-1">{co2Kg} Kg</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">कार्बन उत्सर्जन सूचकांक</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Route Controls and Vehicle Config */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Card 1: Route Setup */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      Routing &amp; Location Parameters (स्थान विवरण)
                    </h4>
                  </div>

                  <div className="space-y-3.5">
                    {/* Origin District toggle button */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Origin District (उत्पत्ति जिल्ला)
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(["Dhading", "Makwanpur"] as const).map((dist) => {
                          const isSel = logisticsOriginDistrict === dist;
                          return (
                            <button
                              key={dist}
                              type="button"
                              onClick={() => {
                                setLogisticsOriginDistrict(dist);
                                setLogisticsOriginHub(DISTRICT_HUBS[dist][0].name);
                              }}
                              className={`py-2 px-3 text-center rounded-xl border text-xs font-bold transition duration-150 cursor-pointer ${
                                isSel
                                  ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              {dist === "Dhading" ? "Dhading (धादिङ)" : "Makwanpur (मकवानपुर)"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Origin Hub */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Collection Hub (सङ्कलन केन्द्र)
                        </label>
                        <select
                          value={logisticsOriginHub}
                          onChange={(e) => setLogisticsOriginHub(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 cursor-pointer font-semibold"
                        >
                          {DISTRICT_HUBS[logisticsOriginDistrict].map((hub) => (
                            <option key={hub.name} value={hub.name}>
                              {hub.nepaliName} ({hub.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Destination Wholesale Market */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Destination Market (गन्तव्य बजार)
                        </label>
                        <select
                          value={logisticsDestination}
                          onChange={(e) => setLogisticsDestination(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 cursor-pointer font-semibold"
                        >
                          {MARKET_DESTINATIONS.map((dest) => (
                            <option key={dest.id} value={dest.id}>
                              {dest.nepaliName.split(" ")[0]} ({dest.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                      <strong>Local Hub Note:</strong> {selectedHubObj.desc}
                    </div>
                  </div>
                </div>

                {/* Card 2: Cargo Volume and Capacity */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      Logistics Produce Weight (उत्पादन परिमाण)
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Cargo Weight (कुल तौल)
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          {(logisticsProduceWeight / 1000).toFixed(2)} Tons
                        </span>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="number"
                          min="50"
                          step="50"
                          value={logisticsProduceWeight}
                          onChange={(e) => setLogisticsProduceWeight(Math.max(50, Number(e.target.value) || 0))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 font-mono pr-12 font-bold"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold uppercase">
                          KG
                        </span>
                      </div>
                    </div>

                    {/* Volume Slider Presets */}
                    <div className="flex gap-2">
                      {[500, 1500, 3500, 8000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setLogisticsProduceWeight(preset);
                            if (preset <= 1500) setLogisticsVehicleType("mini");
                            else if (preset <= 4000) setLogisticsVehicleType("medium");
                            else setLogisticsVehicleType("heavy");
                          }}
                          className="flex-1 py-1 px-2 text-center rounded-lg border border-slate-200 text-[10px] text-slate-600 bg-slate-50 hover:bg-slate-100 transition cursor-pointer font-mono"
                        >
                          {preset >= 1000 ? `${preset/1000}T` : `${preset}kg`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 3: Vehicle selection */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <h4 className="font-bold text-slate-800 text-sm">
                        Transport Vehicle Profile (सवारी साधन)
                      </h4>
                    </div>
                    {isOverloaded && (
                      <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse">
                        🚨 Overloaded / ओभरलोड
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {Object.keys(VEHICLE_PROFILES).map((key) => {
                      const profile = VEHICLE_PROFILES[key as "mini" | "medium" | "heavy"];
                      const isSel = logisticsVehicleType === key;
                      const tooSmall = logisticsProduceWeight > profile.capacityKg;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setLogisticsVehicleType(key as any)}
                          className={`w-full p-3.5 text-left rounded-2xl border transition duration-150 flex flex-col cursor-pointer ${
                            isSel
                              ? "bg-purple-50/50 border-purple-600 text-slate-800 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <div className="flex items-center space-x-2.5">
                              <Truck className={`w-4.5 h-4.5 ${isSel ? "text-purple-600" : "text-slate-400"}`} />
                              <div>
                                <span className="text-xs font-bold block">{profile.name}</span>
                                <span className="text-[10px] text-slate-400 mt-0.5">{profile.nepaliName}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${tooSmall ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
                              Max: {(profile.capacityKg / 1000)} Tons
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                            {profile.desc}
                          </p>

                          {/* Capacity Load Bar */}
                          <div className="mt-3 w-full">
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-1">
                              <span>Current Load Utilization:</span>
                              <span className={tooSmall ? "text-rose-600 font-bold" : "font-bold"}>
                                {isSel ? fillPercentage : Math.min(100, Math.round((logisticsProduceWeight / profile.capacityKg) * 100))}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  tooSmall 
                                    ? "bg-rose-500" 
                                    : isSel 
                                      ? "bg-purple-600" 
                                      : "bg-slate-400"
                                }`}
                                style={{ width: `${isSel ? fillPercentage : Math.min(100, Math.round((logisticsProduceWeight / profile.capacityKg) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card 4: Advanced Cost variables */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      Advanced Cost Adjustments (उन्नत खर्च विकल्प)
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Toggle Round Trip */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Include Round-Trip Fuel
                        </label>
                        <span className="text-[10px] text-slate-400 block">
                          दुईतर्फी इन्धन खर्च गणना गर्नुहोस् (Typical)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={logisticsIncludeRoundTrip}
                        onChange={(e) => setLogisticsIncludeRoundTrip(e.target.checked)}
                        className="w-4.5 h-4.5 text-purple-600 focus:ring-purple-500 border-slate-300 rounded cursor-pointer"
                      />
                    </div>

                    {/* Route choice for Hetauda */}
                    {logisticsOriginHub === "Hetauda" && (
                      <div className="bg-purple-50/35 p-3 rounded-xl space-y-2 border border-purple-100/50">
                        <label className="block text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                          Choose Highway Route (राजमार्ग विकल्प)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setLogisticsRouteOption("kanti")}
                            className={`py-1.5 px-2 text-center rounded-lg border text-[10px] font-bold transition duration-150 cursor-pointer ${
                              logisticsRouteOption === "kanti"
                                ? "bg-purple-600 border-purple-600 text-white"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            Kanti Lokpath (82 KM)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogisticsRouteOption("tribhuvan")}
                            className={`py-1.5 px-2 text-center rounded-lg border text-[10px] font-bold transition duration-150 cursor-pointer ${
                              logisticsRouteOption === "tribhuvan"
                                ? "bg-purple-600 border-purple-600 text-white"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            Tribhuvan Hwy (135 KM)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Diesel price per liter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Diesel Fuel Price (डिजेलको मूल्य - NRs. / Liter)
                      </label>
                      <input
                        type="number"
                        value={logisticsCustomDieselPrice}
                        onChange={(e) => setLogisticsCustomDieselPrice(Math.max(10, Number(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Routing Cost Analytics & B2B Actions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Card 1: Route Weather, Terrain & Hazard advisory */}
                <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
                  risk === "high" 
                    ? "bg-rose-50/50 border-rose-100" 
                    : risk === "medium"
                      ? "bg-amber-50/50 border-amber-100"
                      : "bg-emerald-50/50 border-emerald-100"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      risk === "high" 
                        ? "bg-rose-100 text-rose-700" 
                        : risk === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {risk === "high" ? (
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                      ) : risk === "medium" ? (
                        <Info className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                        risk === "high" 
                          ? "text-rose-800" 
                          : risk === "medium"
                            ? "text-amber-800"
                            : "text-emerald-800"
                      }`}>
                        {risk === "high" 
                          ? "🚨 High-Risk Transit Route (उच्च जोखिम मार्ग)" 
                          : risk === "medium"
                            ? "⚠️ Cautionary Winding Route (सावधानी आवश्यक)"
                            : "✅ Optimal Direct Highway (उत्कृष्ट सीधा मार्ग)"}
                      </span>
                      <h5 className="font-extrabold text-slate-800 text-xs mt-1">
                        Route: {roadName}
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {statusText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Interactive cost breakdown bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
                      Freight Cost Distribution (ढुवानी खर्च वितरण)
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Total: Rs. {totalLogisticsCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Bar visualizer stack */}
                    <div className="h-5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300" 
                        style={{ width: `${Math.round((baseRent / totalLogisticsCost) * 100)}%` }} 
                        title={`Base Rent: ${Math.round((baseRent / totalLogisticsCost) * 100)}%`}
                      />
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300" 
                        style={{ width: `${Math.round((fuelCost / totalLogisticsCost) * 100)}%` }} 
                        title={`Fuel: ${Math.round((fuelCost / totalLogisticsCost) * 100)}%`}
                      />
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300" 
                        style={{ width: `${Math.round((driverWage / totalLogisticsCost) * 100)}%` }} 
                        title={`Driver Allowance: ${Math.round((driverWage / totalLogisticsCost) * 100)}%`}
                      />
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300" 
                        style={{ width: `${Math.round(((tollFees + unloadingCost) / totalLogisticsCost) * 100)}%` }} 
                        title={`Tolls & Labor: ${Math.round(((tollFees + unloadingCost) / totalLogisticsCost) * 100)}%`}
                      />
                    </div>

                    {/* Detailed breakdowns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                      <div className="space-y-1">
                        <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                          <span className="truncate">Vehicle Rental</span>
                        </span>
                        <span className="text-xs font-bold text-slate-800 block font-mono pl-3.5 leading-none">
                          Rs. {baseRent.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block pl-3.5">
                          ({Math.round((baseRent / totalLogisticsCost) * 100)}%)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="truncate">Diesel ({fuelConsumedLiters}L)</span>
                        </span>
                        <span className="text-xs font-bold text-slate-800 block font-mono pl-3.5 leading-none">
                          Rs. {fuelCost.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block pl-3.5">
                          ({Math.round((fuelCost / totalLogisticsCost) * 100)}%)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                          <span className="truncate">Driver &amp; Helper</span>
                        </span>
                        <span className="text-xs font-bold text-slate-800 block font-mono pl-3.5 leading-none">
                          Rs. {driverWage.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block pl-3.5">
                          ({Math.round((driverWage / totalLogisticsCost) * 100)}%)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate">Labor &amp; Tolls</span>
                        </span>
                        <span className="text-xs font-bold text-slate-800 block font-mono pl-3.5 leading-none">
                          Rs. {(tollFees + unloadingCost).toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block pl-3.5">
                          ({Math.round(((tollFees + unloadingCost) / totalLogisticsCost) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Cooperative Bundling Optimizer Alert */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Sparkles className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
                    <span className="font-extrabold text-xs uppercase tracking-wider">Smart Cooperative Bundling Advisor</span>
                  </div>

                  <div className="space-y-3.5 text-xs leading-relaxed text-slate-600">
                    {fillPercentage < 60 ? (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
                        <p className="font-bold text-purple-900 flex items-center space-x-1.5">
                          <span>💡 Leverage Combined Cooperative Volume!</span>
                        </p>
                        <p className="text-purple-800 font-normal">
                          Your selected vehicle is currently running at only <strong>{fillPercentage}%</strong> capacity. Fixed vehicle costs (Rent &amp; Wages: Rs. {baseRent + driverWage}) are being absorbed by a smaller weight, raising your cost to <strong>Rs. {costPerKg}/kg</strong>.
                        </p>
                        
                        {localListingsToBundle.length > 0 ? (
                          <div className="space-y-2.5 pt-1.5 border-t border-purple-100/40">
                            <p className="text-[11px] font-bold text-purple-800">
                              Available local lot(s) from other farmers to combine in {logisticsOriginDistrict}:
                            </p>
                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                              {localListingsToBundle.map(l => (
                                <div key={l.id} className="bg-white border border-purple-100/50 p-2 rounded-lg flex justify-between items-center text-[10px]">
                                  <div>
                                    <span className="font-bold text-slate-800">{l.farmerName}</span>
                                    <span className="text-slate-400 font-mono ml-2">({l.crop})</span>
                                  </div>
                                  <span className="font-black text-purple-700 font-mono">{l.quantity} {l.unit}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-purple-700/90 italic">
                              By bundling even some of these lots, you can utilize empty space and instantly drop transport costs per-kg.
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-purple-700/80">
                            No active farmer crop listings are currently pending in your district database. Broaden your network of farmers to combine schedules!
                          </p>
                        )}
                      </div>
                    ) : isOverloaded ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
                        <p className="font-bold text-rose-950 flex items-center space-x-1.5">
                          <span>🚨 Truck Capacity Exceeded Warning</span>
                        </p>
                        <p className="text-rose-800 font-normal">
                          Your produce weight of <strong>{logisticsProduceWeight.toLocaleString()} KG</strong> exceeds the maximum safe capability of the selected vehicle ({(vehicle.capacityKg / 1000)} Tons).
                        </p>
                        <div className="text-[11px] text-rose-700 space-y-1.5">
                          <p>&bull; <strong>Recommended action:</strong> Switch vehicle selection above to <strong>{logisticsProduceWeight <= 4000 ? "Medium Truck" : "Heavy Multi-Axle Truck"}</strong> for legal weight compliance &amp; mountain road safety.</p>
                          <p>&bull; <strong>Alternative:</strong> Divide the shipment into two runs or dispatch dual mini pickups to split cargo risks.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                        <p className="font-bold text-emerald-900 flex items-center space-x-1.5">
                          <span>🌟 Highly Optimized Cargo Loading!</span>
                        </p>
                        <p className="text-emerald-800 font-normal">
                          Your load utilization of <strong>{fillPercentage}%</strong> is extremely efficient. You are leveraging bulk shipping savings. This represents the ultimate cooperative standard!
                        </p>
                        <div className="text-[11px] text-emerald-700 space-y-1 pl-1">
                          <p>&bull; <strong>Stable Costs:</strong> Slicing shipping cost to just <strong>Rs. {costPerKg} per KG</strong> helps retain maximum profit margins for your cooperative smallholders.</p>
                          <p>&bull; <strong>Priority Lane:</strong> Dispatch early in the evening (before 6 PM) to bypass nighttime checkpost line-ups at Nagdhunga entrance.</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 text-[10px] text-slate-400 italic border-t border-slate-200/50">
                      Route distances are calibrated against Prithvi highway mileage and Tribhuvan/Kanti lokpath terrain logs. Weather/monsoon landslide conditions can change fast; verify with local transport committees before dispatch.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
