import React, { useState } from "react";
import {
  TrendingUp,
  Sun,
  Moon,
  Bell,
  MapPin,
  CheckCircle2,
  Search,
  RefreshCw,
  Plus,
  Truck,
  ShieldAlert,
  FileText,
  DollarSign,
  Layers,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";

import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PriceEntryDashboard } from "./components/PriceEntryDashboard";
import { TopStapleCropsChart } from "./components/TopStapleCropsChart";
import { KycVerificationModal } from "./components/KycVerificationModal";
import { PlatformFeedbackModal } from "./components/PlatformFeedbackModal";
import { AuditLogsModal } from "./components/AuditLogsModal";

import {
  INITIAL_CROPS,
  INITIAL_DEMAND_REQUIREMENTS,
  INITIAL_KYC_USERS,
  INITIAL_FEEDBACK,
  INITIAL_AUDIT_LOGS,
  INITIAL_API_LOGS,
  INITIAL_USER_ACCOUNTS,
} from "./utils/api";

import {
  CropPriceIndex,
  ForwardContractRequirement,
  BidProposal,
  KycVerificationUser,
  PlatformFeedbackItem,
  AuditLogItem,
  ApiLogItem,
  UserAccount,
} from "./types";

import { exportVATReceiptToPDF } from "./utils/pdfExport";

function AgriTechMainApp() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Navigation State
  const [activeMainTab, setActiveMainTab] = useState<
    "DASHBOARD" | "MARKET RATE" | "SUPPLY CHAIN"
  >("DASHBOARD");
  const [activeSubTab, setActiveSubTab] = useState<string>("User Management");
  const [supplyChainSubTab, setSupplyChainSubTab] = useState<
    | "Forward Contracts"
    | "Cold-Chain Logistics"
    | "Subscriptions"
    | "VAT Receipts"
  >("Forward Contracts");

  // App Data State
  const [crops, setCrops] = useState<CropPriceIndex[]>(INITIAL_CROPS);
  const [contracts, setContracts] = useState<ForwardContractRequirement[]>(
    INITIAL_DEMAND_REQUIREMENTS,
  );
  const [kycUsers, setKycUsers] =
    useState<KycVerificationUser[]>(INITIAL_KYC_USERS);
  const [feedbackItems, setFeedbackItems] =
    useState<PlatformFeedbackItem[]>(INITIAL_FEEDBACK);
  const [auditLogs, setAuditLogs] =
    useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [apiLogs, setApiLogs] = useState<ApiLogItem[]>(INITIAL_API_LOGS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);

  // Selected State
  const [selectedContract, setSelectedContract] =
    useState<ForwardContractRequirement | null>(contracts[0] || null);

  // Modals
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] =
    useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isNewDemandModalOpen, setIsNewDemandModalOpen] =
    useState<boolean>(false);
  const [isSubmitBidModalOpen, setIsSubmitBidModalOpen] =
    useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] =
    useState<string>("All Regions");
  const [pricingTier, setPricingTier] = useState<string>("All Prices");
  const [minPrice] = useState<string>("");
  const [maxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("Default (Latest Date)");

  // New Bid Form State
  const [bidPriceNrs, setBidPriceNrs] = useState<string>("76");
  const [bidQuantityKg, setBidQuantityKg] = useState<string>("2500");
  const [bidCoopName, setBidCoopName] = useState<string>(
    "Kathmandu Organic Produce Co-op",
  );

  // New Requirement Post Form State
  const [newCropName, setNewCropName] = useState<string>("Tomato (Golbheda)");
  const [newQtyKg, setNewQtyKg] = useState<string>("3000");
  const [newTargetPrice, setNewTargetPrice] = useState<string>("80");

  // Handlers
  const handlePublishPrice = (newCrop: Partial<CropPriceIndex>) => {
    const createdItem: CropPriceIndex = {
      id: `crop-${Date.now()}`,
      cropName: newCrop.cropName || "Tomato",
      region: newCrop.region || "Kathmandu",
      rateNrs: newCrop.rateNrs || 75,
      sourceMarket: newCrop.sourceMarket || "Kalimati Market",
      loggingDate: newCrop.loggingDate || "2026-08-08",
      unit: "KG",
    };
    setCrops([createdItem, ...crops]);

    // Log action
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: "admin@agritech.gov.np",
      role: "ADMIN",
      action: "PRICE_INDEX_PUBLISH",
      details: `Published ${createdItem.cropName} @ NRs. ${createdItem.rateNrs}/KG [${createdItem.region}]`,
      ipAddress: "103.10.28.4",
      severity: "info",
    };
    setAuditLogs([newLog, ...auditLogs]);

    // Log API
    const newApi: ApiLogItem = {
      id: `api-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      method: "POST",
      endpoint: "/api/v1/market-indices/publish",
      statusCode: 200,
      durationMs: 38,
      payloadSize: "1.4 KB",
    };
    setApiLogs([newApi, ...apiLogs]);
  };

  const handleVerifyKycUser = (id: string) => {
    setKycUsers(
      kycUsers.map((u) => (u.id === id ? { ...u, status: "Verified" } : u)),
    );
  };

  const handleRejectKycUser = (id: string) => {
    setKycUsers(
      kycUsers.map((u) => (u.id === id ? { ...u, status: "Rejected" } : u)),
    );
  };

  const handleToggleResolveFeedback = (id: string) => {
    setFeedbackItems(
      feedbackItems.map((f) =>
        f.id === id ? { ...f, resolved: !f.resolved } : f,
      ),
    );
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const newBid: BidProposal = {
      id: `bid-${Date.now()}`,
      contractId: selectedContract.id,
      sellerName: "Ganesh Adhikari",
      cooperativeName: bidCoopName,
      region: "Kathmandu",
      priceOfferedNrs: Number(bidPriceNrs),
      quantityKg: Number(bidQuantityKg),
      deliveryDate: "2026-08-22",
      status: "Pending",
      submittedAt: "2026-08-08",
    };

    const updatedContracts = contracts.map((c) => {
      if (c.id === selectedContract.id) {
        const bids = c.bids || [];
        return { ...c, bidsCount: c.bidsCount + 1, bids: [...bids, newBid] };
      }
      return c;
    });

    setContracts(updatedContracts);
    setSelectedContract(
      updatedContracts.find((c) => c.id === selectedContract.id) || null,
    );
    setIsSubmitBidModalOpen(false);
    alert("Bid proposal submitted successfully to buyer!");
  };

  const handleCreateDemandPost = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ForwardContractRequirement = {
      id: `demand_${Date.now()}`,
      code: `#demand_seed_${contracts.length + 1}`,
      cropName: newCropName,
      cropNepaliName: newCropName.includes("Tomato") ? "गोलभेडा" : "कृषि उपज",
      quantityKg: Number(newQtyKg),
      targetPriceCeiling: Number(newTargetPrice),
      buyerName: "Shyam Shrestha",
      buyerOrg: "Kathmandu Resort & Catering Group",
      buyerLocation: "Kathmandu",
      targetDays: 30,
      category: "Vegetables",
      bidsCount: 0,
      status: "Open",
      createdDate: "2026-08-08",
      description:
        "Bulk wholesale requirement for institutional hotel chain supply.",
      bids: [],
    };

    setContracts([newReq, ...contracts]);
    setSelectedContract(newReq);
    setIsNewDemandModalOpen(false);
  };

  // Filter Crops for Market Rate Directory
  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.sourceMarket.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      selectedRegionFilter === "All Regions" ||
      crop.region === selectedRegionFilter;
    const matchesSelectCrop =
      !selectedCropFilter || crop.cropName === selectedCropFilter;

    let matchesTier = true;
    if (pricingTier === "Below NRs. 50") matchesTier = crop.rateNrs < 50;
    if (pricingTier === "NRs. 50-100")
      matchesTier = crop.rateNrs >= 50 && crop.rateNrs <= 100;
    if (pricingTier === "Above NRs. 100") matchesTier = crop.rateNrs > 100;

    return matchesSearch && matchesRegion && matchesSelectCrop && matchesTier;
  });

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-1.5">
              AgriTech{" "}
              <span className="text-emerald-700 dark:text-emerald-400 font-normal text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800">
                Nepal
              </span>
            </h1>
          </div>
        </div>

        {/* Center Nav Pill Bar */}
        <div className="hidden md:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700">
          <button
            onClick={() => setActiveMainTab("DASHBOARD")}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === "DASHBOARD"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => setActiveMainTab("MARKET RATE")}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === "MARKET RATE"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            MARKET RATE
          </button>
          <button
            onClick={() => setActiveMainTab("SUPPLY CHAIN")}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === "SUPPLY CHAIN"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            SUPPLY CHAIN
          </button>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsKycModalOpen(true)}
              aria-label="Notifications"
              className="p-2.5 rounded-2xl bg-[#f0f4f9] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-stone-700 cursor-pointer transition-colors flex items-center justify-center shadow-xs"
            >
              <Bell className="w-4.5 h-4.5 text-stone-700 dark:text-stone-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </button>
          </div>

          {/* Theme Mode Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={
              theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            }
            className="p-2.5 rounded-2xl bg-[#f0f4f9] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-200/80 dark:hover:bg-stone-700 cursor-pointer transition-all flex items-center justify-center shadow-xs"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-indigo-600 stroke-[2.2]" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            )}
          </button>

          {/* Language Switch Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-[#f0f4f9] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-xs">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs"
                  : "text-slate-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ne")}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                language === "ne"
                  ? "bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs"
                  : "text-slate-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white"
              }`}
            >
              नेपाली
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header Tabs Bar */}
      <div className="md:hidden flex bg-stone-200 dark:bg-stone-800 p-1 border-b border-stone-300 dark:border-stone-700">
        <button
          onClick={() => setActiveMainTab("DASHBOARD")}
          className={`flex-1 py-2 text-center text-xs font-bold ${activeMainTab === "DASHBOARD" ? "bg-emerald-700 text-white" : "text-stone-700 dark:text-stone-300"}`}
        >
          DASHBOARD
        </button>
        <button
          onClick={() => setActiveMainTab("MARKET RATE")}
          className={`flex-1 py-2 text-center text-xs font-bold ${activeMainTab === "MARKET RATE" ? "bg-emerald-700 text-white" : "text-stone-700 dark:text-stone-300"}`}
        >
          MARKET RATE
        </button>
        <button
          onClick={() => setActiveMainTab("SUPPLY CHAIN")}
          className={`flex-1 py-2 text-center text-xs font-bold ${activeMainTab === "SUPPLY CHAIN" ? "bg-emerald-700 text-white" : "text-stone-700 dark:text-stone-300"}`}
        >
          SUPPLY CHAIN
        </button>
      </div>

      {/* Main App Content Viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-8">
        {/* VIEW 1: DASHBOARD */}
        {activeMainTab === "DASHBOARD" && (
          <div className="space-y-6">
            <PriceEntryDashboard
              onPublishPrice={handlePublishPrice}
              onOpenKycModal={() => setIsKycModalOpen(true)}
              onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              users={users}
              setUsers={setUsers}
              kycUsers={kycUsers}
              onVerifyKyc={handleVerifyKycUser}
              onRejectKyc={handleRejectKycUser}
              feedbackItems={feedbackItems}
              onToggleResolveFeedback={handleToggleResolveFeedback}
            />
          </div>
        )}

        {/* VIEW 2: MARKET RATE */}
        {activeMainTab === "MARKET RATE" && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700/60">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>
                      National Market Price Index (राष्ट्रिय दैनिक बजार मूल्य
                      प्रणाली)
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Daily Wholesale Produce Price Index & Rate Tracker
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Authorized real-time mandi rates from Kalimati, Tokha,
                    Dhading, Narayangarh, and regional wholesale markets. Set
                    threshold price alerts and analyze multi-crop historical
                    price trends.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() =>
                      alert(
                        "Price Alert trigger established for Tomato (Golbheda) @ NRs. 80 threshold!",
                      )
                    }
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Bell className="w-4 h-4 fill-stone-950" />
                    Set Price Alert
                  </button>
                  <button
                    onClick={() =>
                      alert(
                        "Market directory data refreshed from Kalimati gateway!",
                      )
                    }
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <TopStapleCropsChart
                  selectedCrop={selectedCropFilter || "Tomato (Golbheda)"}
                  selectedRegion={
                    selectedRegionFilter !== "All Regions"
                      ? selectedRegionFilter
                      : "Kathmandu District"
                  }
                  onCropChange={setSelectedCropFilter}
                  onRegionChange={setSelectedRegionFilter}
                />

                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Live Wholesale Produce Directory ({
                      filteredCrops.length
                    }{" "}
                    Crops)
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredCrops.map((crop) => (
                      <div
                        key={crop.id}
                        className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-sm text-stone-900 dark:text-white">
                            {crop.cropName}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {crop.sourceMarket} • {crop.region}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm font-mono">
                            NRs. {crop.rateNrs}/KG
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {crop.loggingDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Search & Filter Directory
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    Product Name (Crop)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <select
                    value={selectedCropFilter}
                    onChange={(e) => setSelectedCropFilter(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-700 dark:text-stone-200 mt-2 focus:outline-none text-xs"
                  >
                    <option value="">-- Quick Product Select --</option>
                    {crops.map((c) => (
                      <option key={c.id} value={c.cropName}>
                        {c.cropName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    Filter By Region
                  </label>
                  <select
                    value={selectedRegionFilter}
                    onChange={(e) => setSelectedRegionFilter(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-700 dark:text-stone-200 focus:outline-none text-xs"
                  >
                    <option value="All Regions">All Regions</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Dhading">Dhading</option>
                    <option value="Makwanpur">Makwanpur</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Kavre">Kavre</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Pricing Options
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-stone-500 text-[10px]">
                      Pricing Tier
                    </label>
                    <select
                      value={pricingTier}
                      onChange={(e) => setPricingTier(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-700 dark:text-stone-200 focus:outline-none text-xs"
                    >
                      <option value="All Prices">All Prices</option>
                      <option value="Below NRs. 50">Below NRs. 50</option>
                      <option value="NRs. 50-100">NRs. 50-100</option>
                      <option value="Above NRs. 100">Above NRs. 100</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-stone-500 text-[10px]">
                      Price Range (NRs/KG)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Min"
                        value={minPrice}
                        readOnly
                        className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2 text-xs font-mono opacity-60"
                      />
                      <input
                        type="text"
                        placeholder="Max"
                        value={maxPrice}
                        readOnly
                        className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2 text-xs font-mono opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-stone-100 dark:border-stone-800">
                  <label className="text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    Sort By Wholesale Price
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-700 dark:text-stone-200 focus:outline-none text-xs"
                  >
                    <option value="Default (Latest Date)">
                      Default (Latest Date)
                    </option>
                    <option value="Price: Low to High">
                      Price: Low to High
                    </option>
                    <option value="Price: High to Low">
                      Price: High to Low
                    </option>
                  </select>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl font-mono text-[11px] text-stone-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Filtered matches:</span>
                    <strong className="text-stone-800 dark:text-stone-200">
                      {filteredCrops.length * 500} of 3000
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique crops:</span>
                    <strong className="text-stone-800 dark:text-stone-200">
                      {crops.length} items
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCropFilter("");
                    setSelectedRegionFilter("All Regions");
                    setPricingTier("All Prices");
                  }}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Reset All Filters & Sorting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SUPPLY CHAIN */}
        {activeMainTab === "SUPPLY CHAIN" && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700/60">
                    <Truck className="w-3.5 h-3.5" />
                    <span>
                      B2B Supply Chain Hub (व्यापारिक आपूर्ति प्रणाली)
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Bulk Forward Contracts & Cold-Chain Logistics
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Contract wholesale requirements, monitor Prithvi Highway
                    cold-chain trucks, and generate VAT-compliant
                    split-settlement receipts.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() =>
                      alert(
                        "Support helpline initiated. Escalating dispute ticket #DSP-882 to Bagmati Agro Board.",
                      )
                    }
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Support & Disputes
                  </button>
                  <button
                    onClick={() => setIsAuditModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Audit Trail Logs
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setSupplyChainSubTab("Forward Contracts")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  supplyChainSubTab === "Forward Contracts"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Forward Contracts & Bids
              </button>

              <button
                onClick={() => setSupplyChainSubTab("Cold-Chain Logistics")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  supplyChainSubTab === "Cold-Chain Logistics"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Truck className="w-4 h-4" />
                Cold-Chain Route Logistics
              </button>

              <button
                onClick={() => setSupplyChainSubTab("Subscriptions")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  supplyChainSubTab === "Subscriptions"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Layers className="w-4 h-4" />
                Institutional Subscriptions
              </button>

              <button
                onClick={() => setSupplyChainSubTab("VAT Receipts")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  supplyChainSubTab === "VAT Receipts"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                VAT Invoices & Receipts
              </button>
            </div>

            {supplyChainSubTab === "Forward Contracts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-white">
                      Bulk Institutional Requirements (थोक माग)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Active B2B purchase posts needing cooperative supply bids
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-400">
                      {contracts.length} Posts
                    </span>
                    <button
                      onClick={() => setIsNewDemandModalOpen(true)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Post Requirement
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 space-y-4">
                    {contracts.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => setSelectedContract(req)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-stone-900 ${
                          selectedContract?.id === req.id
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
                            : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {req.code}
                          </span>
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            Target: In {req.targetDays} Days
                          </span>
                        </div>

                        <h4 className="font-bold text-lg text-stone-900 dark:text-white mt-2">
                          {req.cropName}
                        </h4>

                        <div className="mt-3 space-y-1 text-xs text-stone-600 dark:text-stone-300">
                          <div>
                            Quantity Required:{" "}
                            <strong className="text-stone-900 dark:text-white">
                              {req.quantityKg.toLocaleString()} KG
                            </strong>
                          </div>
                          <div>
                            Target Price Ceiling:{" "}
                            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                              NRs. {req.targetPriceCeiling} / KG
                            </strong>
                          </div>
                          <div className="flex items-center gap-1 text-stone-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              Buyer: {req.buyerName} ({req.buyerOrg}) (
                              {req.buyerLocation})
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                          <span>Click to View / Submit Bids</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 min-h-[380px] flex flex-col justify-between">
                    {selectedContract ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                          <div>
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {selectedContract.code}
                            </span>
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                              {selectedContract.cropName}
                            </h3>
                          </div>
                          <button
                            onClick={() => setIsSubmitBidModalOpen(true)}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                          >
                            Submit Forward Bid
                          </button>
                        </div>

                        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 text-xs space-y-2">
                          <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                            {selectedContract.description}
                          </p>
                          <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-mono">
                            <span>
                              Quantity Needed:{" "}
                              <strong>
                                {selectedContract.quantityKg.toLocaleString()}{" "}
                                KG
                              </strong>
                            </span>
                            <span>
                              Ceiling:{" "}
                              <strong>
                                NRs. {selectedContract.targetPriceCeiling}/KG
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                            Submitted Cooperative Proposals (
                            {selectedContract.bids?.length || 0})
                          </h4>
                          {!selectedContract.bids ||
                          selectedContract.bids.length === 0 ? (
                            <div className="p-6 text-center text-xs text-stone-400 border border-dashed rounded-xl">
                              No bids submitted yet for this requirement
                            </div>
                          ) : (
                            selectedContract.bids.map((b) => (
                              <div
                                key={b.id}
                                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-1.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-stone-900 dark:text-white">
                                    {b.cooperativeName}
                                  </span>
                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    NRs. {b.priceOfferedNrs}/KG
                                  </span>
                                </div>
                                <div className="flex justify-between text-stone-500 text-[11px]">
                                  <span>
                                    Seller: {b.sellerName} ({b.region})
                                  </span>
                                  <span>
                                    Qty: {b.quantityKg.toLocaleString()} KG
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-stone-400 text-sm font-medium">
                        Select a demand requirement post on the left to view
                        bids or place a forward contract proposal.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {supplyChainSubTab === "Cold-Chain Logistics" && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                      <Truck className="w-5 h-5 text-indigo-600" />
                      Prithvi Highway Cold-Chain Truck Telemetry
                    </h3>
                    <p className="text-xs text-stone-500">
                      Live GPS tracking and refrigerated cargo temperature
                      monitoring
                    </p>
                  </div>
                </div>

                <div className="p-6 text-center text-xs text-stone-400 border border-dashed rounded-xl">
                  Cold-chain log monitoring operational. All telemetry systems
                  functioning normally.
                </div>
              </div>
            )}

            {supplyChainSubTab === "VAT Receipts" && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      VAT-Compliant Split-Settlement Receipt Generator
                    </h3>
                    <p className="text-xs text-stone-500">
                      Government IRD tax-registered invoices for institutional
                      agricultural purchasing
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 space-y-4 max-w-xl">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    Sample B2B Tax Invoice
                  </h4>
                  <div className="text-xs space-y-2 text-stone-600 dark:text-stone-300">
                    <div className="flex justify-between">
                      <span>Buyer:</span>
                      <strong>Kathmandu Resort & Catering Group</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cooperative:</span>
                      <strong>Panchkhal Organic Farmers Co-op</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Contract Amount:</span>
                      <strong className="font-mono text-emerald-700">
                        NRs. 195,000
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      exportVATReceiptToPDF(
                        "Bulk Tomato Crate Contract",
                        195000,
                        "Kathmandu Resort & Catering",
                        "Panchkhal Organic Farmers Co-op",
                      )
                    }
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Printable Official VAT Receipt (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Section Across All Screens */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-10 px-4 sm:px-8 mt-12 text-stone-600 dark:text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                🌿
              </div>
              <span className="font-bold text-base text-stone-900 dark:text-white">
                AgriTech{" "}
                <span className="text-emerald-700 font-normal">Nepal</span>
              </span>
            </div>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm">
              Empowering smallholder farmers, regional cooperatives, and B2B
              wholesale buyers with transparent daily market prices and
              streamlined agricultural supply chains.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              {t("footer.services")}
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live Market Price Index
              </li>
              <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Member Portal Access
              </li>
              <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Wholesale Rates
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              {t("footer.hubs")}
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Kathmandu Hub
              </li>
              <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Dhading Hub
              </li>
              <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Makwanpur Co-op
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              {t("footer.partner")}
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  🌿
                </div>
                <span>AgriTech Digital Infrastructure</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Developed and maintained for sustainable digital agricultural
                infrastructure across Bagmati Province, Nepal.
              </p>
              <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  Verified System Partner
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 dark:text-stone-400">
          <div>
            © {new Date().getFullYear()} AgriTech Nepal • National Daily
            Wholesale Price & Supply Chain Platform
          </div>
          <div className="flex items-center gap-3">
            <span>Bagmati Province Digital Initiative</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Technical Partner Verified
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        users={kycUsers}
        onVerify={handleVerifyKycUser}
        onReject={handleRejectKycUser}
      />

      <PlatformFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        feedbackItems={feedbackItems}
        onToggleResolve={handleToggleResolveFeedback}
      />

      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      {/* Modal: Submit Bid */}
      {isSubmitBidModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Submit Cooperative Bid
              </h3>
              <button
                onClick={() => setIsSubmitBidModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-500 font-semibold">
                  Cooperative Name
                </label>
                <input
                  type="text"
                  value={bidCoopName}
                  onChange={(e) => setBidCoopName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 mt-1 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 font-semibold">
                    Bid Price (NRs/KG)
                  </label>
                  <input
                    type="text"
                    value={bidPriceNrs}
                    onChange={(e) => setBidPriceNrs(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 font-semibold">
                    Quantity (KG)
                  </label>
                  <input
                    type="text"
                    value={bidQuantityKg}
                    onChange={(e) => setBidQuantityKg(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 mt-1 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors mt-2"
              >
                Submit Proposal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Requirement Post */}
      {isNewDemandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Post Institutional Requirement
              </h3>
              <button
                onClick={() => setIsNewDemandModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateDemandPost}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-stone-500 font-semibold">
                  Crop Produce
                </label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 mt-1 font-semibold"
                >
                  <option value="Tomato (Golbheda)">Tomato (Golbheda)</option>
                  <option value="Ginger (Aduwa)">Ginger (Aduwa)</option>
                  <option value="Red Potato (Rato Aalu)">
                    Red Potato (Rato Aalu)
                  </option>
                  <option value="Dry Onion">Dry Onion</option>
                  <option value="Cauliflower">Cauliflower</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 font-semibold">
                    Quantity Needed (KG)
                  </label>
                  <input
                    type="text"
                    value={newQtyKg}
                    onChange={(e) => setNewQtyKg(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 font-semibold">
                    Target Price (NRs/KG)
                  </label>
                  <input
                    type="text"
                    value={newTargetPrice}
                    onChange={(e) => setNewTargetPrice(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 mt-1 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors mt-2"
              >
                Publish B2B Demand Requirement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AgriTechMainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
