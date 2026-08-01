import React, { useState, useEffect } from "react";
import { User } from "./types";
import MarketPricesView from "./components/MarketPricesView";
import FarmerDashboard from "./components/FarmerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import CooperativeDashboard from "./components/CooperativeDashboard";
import LoginRegister from "./components/LoginRegister";
import PlatformFeedbackModal from "./components/PlatformFeedbackModal";
import ProfileDashboardModal from "./components/ProfileDashboardModal";
import NotificationCenter from "./components/NotificationCenter";
import B2bMarketplaceHub from "./components/B2bMarketplaceHub";
import CartDrawerModal from "./components/CartDrawerModal";
import SupportTicketCenterModal from "./components/SupportTicketCenterModal";
import SettingsModal from "./components/SettingsModal";
import ReviewsRatingsModal from "./components/ReviewsRatingsModal";
import ForcePasswordChangeModal from "./components/ForcePasswordChangeModal";
import {
  LogOut,
  Globe,
  Sprout,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  MessageSquarePlus,
  Plus,
  MapPin,
  Sliders,
  ChevronDown,
  User as UserIcon,
  Building2,
  ShoppingCart,
  Settings,
  Star,
} from "lucide-react";
import { useLanguage } from "./context/LanguageContext";
import { useTheme } from "./context/ThemeContext";
import { useCart } from "./context/CartContext";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [activePortal, setActivePortal] = useState<
    "portal" | "public_prices" | "b2b_hub"
  >("public_prices");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isProfileDashboardOpen, setIsProfileDashboardOpen] = useState(false);
  const [isOptionsDropdownOpen, setIsOptionsDropdownOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Use cart items and state trigger from useCart context
  const { cart, setIsCartOpen } = useCart();

  // Load auth state and user-specific cart from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("agritech_user");
    const savedToken = localStorage.getItem("agritech_token");
    if (savedUser && savedToken) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem("agritech_user");
        localStorage.removeItem("agritech_token");
      }
    }
  }, []);

  const handleAuthSuccess = (authUser: User, authToken: string) => {
    const rawUser = authUser as any;
    const safeUser: User = {
      ...authUser,
      fullName:
        rawUser?.fullName ||
        rawUser?.full_name ||
        rawUser?.username ||
        "Authorized User",
      role: rawUser?.role || "farmer",
      is_first_login: rawUser?.is_first_login ?? false,
    };
    setUser(safeUser);
    setToken(authToken);
    localStorage.setItem("agritech_user", JSON.stringify(safeUser));
    localStorage.setItem("agritech_token", authToken);
    setActivePortal("portal");
  };

  const handleUserUpdate = (updatedUser: User) => {
    const rawUser = updatedUser as any;
    const safeUser: User = {
      ...updatedUser,
      fullName:
        rawUser?.fullName ||
        rawUser?.full_name ||
        rawUser?.username ||
        "Authorized User",
      role: rawUser?.role || "farmer",
    };
    setUser(safeUser);
    localStorage.setItem("agritech_user", JSON.stringify(safeUser));
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("agritech_user");
    localStorage.removeItem("agritech_token");
  };

  // Helper to get role translation
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "farmer":
        return {
          text: t("Farmer (किसान)"),
          style: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
      case "buyer":
        return {
          text: t("B2B Buyer"),
          style: "bg-blue-50 text-blue-700 border-blue-100",
        };
      case "admin":
        return {
          text: t("Super Admin"),
          style: "bg-purple-50 text-purple-700 border-purple-100",
        };
      default:
        return {
          text: t("Guest"),
          style: "bg-slate-50 text-slate-700 border-slate-100",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-900/40 selection:text-emerald-900 dark:selection:text-emerald-250">
      {/* Platform Global Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Group */}
            <div
              onClick={() => setActivePortal("public_prices")}
              className="flex items-center space-x-3 cursor-pointer group"
              title={t("Browse Public Prices Index (Home)")}
            >
              <div className="w-9 h-9 bg-emerald-900 text-emerald-400 rounded-lg flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>{t("AgriTech")}</span>
                </h1>
                {!user && (
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider -mt-0.5">
                    {t("Digital Agriculture for a Prosperous Nepal")}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Quick Portal Switches */}
            {user && (
              <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActivePortal("portal")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                    activePortal === "portal"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {t("Dashboard")}
                </button>
                <button
                  onClick={() => setActivePortal("public_prices")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                    activePortal === "public_prices"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {t("Market Rate")}
                </button>
                <button
                  onClick={() => setActivePortal("b2b_hub")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 ${
                    activePortal === "b2b_hub"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t("Supply Chain")}</span>
                </button>
              </div>
            )}

            {/* Nav Bar Actions: Notification Icon, Add to Cart (middle), and User Profile / Options */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              <NotificationCenter
                user={user}
                token={token}
                onNavigateToTab={(tab) => setActivePortal(tab as any)}
                onOpenCartModal={() => setIsCartOpen(true)}
                onOpenSupportModal={() => setIsSupportModalOpen(true)}
                onOpenProfileModal={() =>
                  user && setIsProfileDashboardOpen(true)
                }
              />

              {/* Shopping Cart button restricted exclusively to buyers */}
              {user?.role === "buyer" && (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs flex items-center space-x-1.5 relative shrink-0"
                  title={t("Open Shopping Cart")}
                  id="nav-cart-trigger"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline font-semibold">
                    {t("Cart")}
                  </span>
                  {cart.length > 0 && (
                    <span className="px-1.5 py-0.25 bg-amber-400 text-slate-950 font-black rounded-full text-[10px] shadow-2xs font-mono">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsOptionsDropdownOpen(!isOptionsDropdownOpen)
                    }
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 font-bold text-xs transition cursor-pointer shadow-xs flex items-center space-x-2"
                    title={t("Settings & Options")}
                    id="logged-in-options-trigger"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="max-w-[120px] truncate">
                      {(user.fullName || user.username || "User").split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isOptionsDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOptionsDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOptionsDropdownOpen(false)}
                      />

                      <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-850 rounded-xl shadow-xl border border-slate-200 dark:border-slate-750 p-3.5 z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-100 text-left">
                        <button
                          onClick={() => {
                            setIsProfileDashboardOpen(true);
                            setIsOptionsDropdownOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-emerald-50/90 to-teal-50/60 dark:from-emerald-950/40 dark:to-slate-850 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/60 dark:hover:to-slate-800 border border-emerald-200/70 dark:border-emerald-800/60 rounded-xl p-3 flex items-center space-x-3 shadow-2xs transition cursor-pointer text-left group"
                          id="dropdown-logged-in-profile-card"
                          title="Click to open User Dashboard"
                        >
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs overflow-hidden">
                              {user.profilePic ? (
                                <img
                                  src={user.profilePic}
                                  alt={user.fullName || user.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : user.fullName ? (
                                user.fullName.charAt(0).toUpperCase()
                              ) : (
                                "U"
                              )}
                            </div>
                            {user.verified ||
                            user.verificationStatus === "verified" ? (
                              <span
                                className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-xs"
                                title={t("Verified User")}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            ) : (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition flex items-center space-x-1">
                              <span className="truncate">
                                {user.fullName || user.username}
                              </span>
                              {(user.verified ||
                                user.verificationStatus === "verified") && (
                                <span
                                  title={t("Verified User")}
                                  className="inline-flex items-center"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wide border px-1.5 py-0.25 rounded-full ${getRoleBadge(user.role).style}`}
                              >
                                {getRoleBadge(user.role).text}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                {t("User Dashboard")}
                              </span>
                            </div>
                          </div>
                        </button>

                        <div>
                          <button
                            onClick={() => {
                              setIsFeedbackModalOpen(true);
                              setIsOptionsDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/60 transition cursor-pointer text-left shadow-2xs"
                            id="dropdown-logged-in-fq"
                          >
                            <div className="flex items-center space-x-2.5">
                              <MessageSquarePlus className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>{t("F&Q (FAQ & Feedback)")}</span>
                            </div>
                            <span className="text-[10px] bg-amber-200/60 dark:bg-amber-800/60 px-1.5 py-0.5 rounded font-mono font-bold">
                              FAQ
                            </span>
                          </button>
                        </div>

                        <div>
                          <button
                            onClick={() => {
                              setIsReviewsModalOpen(true);
                              setIsOptionsDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-slate-800 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/60 border border-amber-300/80 dark:border-amber-700/60 transition cursor-pointer text-left shadow-2xs"
                            id="dropdown-logged-in-reviews"
                          >
                            <div className="flex items-center space-x-2.5">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                              <span>{t("Reviews & Ratings")}</span>
                            </div>
                            <span className="text-[10px] bg-amber-200 dark:bg-amber-800/80 text-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                              ★ 4.9
                            </span>
                          </button>
                        </div>

                        <div>
                          <button
                            onClick={() => {
                              setIsSettingsModalOpen(true);
                              setIsOptionsDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer text-left shadow-2xs"
                            id="dropdown-logged-in-settings"
                          >
                            <div className="flex items-center space-x-2.5">
                              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{t("Settings & Preferences")}</span>
                            </div>
                            <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-950 dark:text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                              New
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                            {t("Appearance")}
                          </span>
                          <button
                            onClick={() => toggleTheme()}
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-650 transition cursor-pointer shadow-2xs"
                            id="dropdown-logged-in-theme"
                          >
                            {theme === "light" ? (
                              <>
                                <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Dark</span>
                              </>
                            ) : (
                              <>
                                <Sun className="w-3.5 h-3.5 text-amber-500" />
                                <span>Light</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                            {t("Language")}
                          </span>
                          <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-700/80 p-0.5 rounded-lg border border-slate-300/50 dark:border-slate-600/50">
                            <button
                              onClick={() => setLanguage("en")}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                                language === "en"
                                  ? "bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                              }`}
                            >
                              EN
                            </button>
                            <button
                              onClick={() => setLanguage("ne")}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                                language === "ne"
                                  ? "bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                              }`}
                            >
                              नेपाली
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                        <div>
                          <button
                            onClick={() => {
                              setIsOptionsDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/70 dark:border-rose-800/60 transition cursor-pointer text-left shadow-2xs"
                            id="dropdown-logged-in-logout"
                          >
                            <div className="flex items-center space-x-2.5">
                              <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                              <span>{t("Logout")}</span>
                            </div>
                            <span className="text-[10px] text-rose-500 font-mono font-bold uppercase">
                              Exit
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="hidden md:flex items-center space-x-2 sm:space-x-2.5">
                    <button
                      onClick={toggleTheme}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition duration-150 cursor-pointer shadow-xs flex items-center justify-center"
                      title={
                        theme === "light"
                          ? "Switch to Dark Mode"
                          : "Switch to Light Mode"
                      }
                      id="nav-theme-switcher-toggle"
                    >
                      {theme === "light" ? (
                        <Moon className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Sun className="w-4.5 h-4.5 text-amber-500" />
                      )}
                    </button>

                    <div
                      className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700"
                      id="nav-language-switcher"
                    >
                      <button
                        onClick={() => setLanguage("en")}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                          language === "en"
                            ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 shadow-xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage("ne")}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                          language === "ne"
                            ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 shadow-xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        नेपाली
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setActivePortal(
                        activePortal === "portal" ? "public_prices" : "portal",
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                      activePortal === "portal"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                    }`}
                    id="nav-login-trigger"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>
                      {activePortal === "portal"
                        ? t("View Market Rates")
                        : t("Sign In / Register")}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Centered Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="w-full space-y-6">
          {user ? (
            <div>
              <div className="flex md:hidden items-center justify-center space-x-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-lg mb-6 border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setActivePortal("portal")}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition ${
                    activePortal === "portal"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {t("Dashboard")}
                </button>
                <button
                  onClick={() => setActivePortal("public_prices")}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition ${
                    activePortal === "public_prices"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {t("Market Rate")}
                </button>
                <button
                  onClick={() => setActivePortal("b2b_hub")}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition ${
                    activePortal === "b2b_hub"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {t("Supply Chain")}
                </button>
              </div>

              {activePortal === "public_prices" ? (
                <MarketPricesView user={user} token={token} />
              ) : activePortal === "b2b_hub" ? (
                <B2bMarketplaceHub user={user} token={token} />
              ) : (
                <>
                  {user.role === "farmer" && (
                    <FarmerDashboard
                      user={user}
                      token={token}
                      onUserUpdate={handleUserUpdate}
                    />
                  )}
                  {user.role === "buyer" && (
                    <BuyerDashboard user={user} token={token} />
                  )}
                  {user.role === "admin" && (
                    <AdminDashboard user={user} token={token} />
                  )}
                  {user.role === "cooperative" && (
                    <CooperativeDashboard user={user} token={token} />
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {activePortal === "portal" ? (
                <LoginRegister
                  onAuthSuccess={handleAuthSuccess}
                  onGoToPublicPrices={() => setActivePortal("public_prices")}
                />
              ) : (
                <MarketPricesView user={user} token={token} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Single Clean Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16 pt-10 pb-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-900 text-emerald-400 rounded-lg flex items-center justify-center font-bold shadow-sm">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-bold text-base font-display text-slate-900 dark:text-white">
                  AgriTech{" "}
                  <span className="text-emerald-600 font-normal">Nepal</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Empowering smallholder farmers, regional cooperatives, and B2B
                wholesale buyers with transparent daily market prices and
                streamlined agricultural supply chains.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Platform Services
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Live Market Price Index</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Member Portal Access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Verified Wholesale Rates</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Key Hubs
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Kathmandu Wholesale Market</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Dhading Produce Hub</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Makwanpur Cooperative Network</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Technical Partner
              </h4>
              <div className="flex items-start space-x-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="p-2 bg-emerald-900 text-emerald-400 rounded-lg shrink-0">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    AgriTech Digital Infrastructure
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Developed and maintained for sustainable digital
                    agricultural infrastructure across Bagmati Province, Nepal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>&copy; 2026 AgriTech Initiative &bull; All Rights Reserved.</p>
            <div className="flex items-center space-x-4">
              <a
                href="#privacy"
                onClick={(e) => e.preventDefault()}
                className="hover:underline"
              >
                Privacy Policy
              </a>
              <span>&bull;</span>
              <a
                href="#terms"
                onClick={(e) => e.preventDefault()}
                className="hover:underline"
              >
                Terms of Service
              </a>
              <span>&bull;</span>
              <span>Kathmandu, Nepal</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Force Password Change Modal Interceptor */}
      {user && user.is_first_login && (
        <ForcePasswordChangeModal
          token={token}
          onPasswordChanged={() => {
            const updatedUser = { ...user, is_first_login: false };
            setUser(updatedUser);
            localStorage.setItem("agritech_user", JSON.stringify(updatedUser));
          }}
        />
      )}

      <PlatformFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        user={user}
        token={token}
      />

      {user && (
        <ProfileDashboardModal
          isOpen={isProfileDashboardOpen}
          onClose={() => setIsProfileDashboardOpen(false)}
          user={user}
          token={token}
          onUserUpdated={handleUserUpdate}
        />
      )}

      <CartDrawerModal
        user={user}
        token={token}
        onNavigateToOrders={() => setActivePortal("b2b_hub")}
      />

      {user && (
        <SupportTicketCenterModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          user={user}
          token={token}
        />
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
      />

      <ReviewsRatingsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        user={user}
      />
    </div>
  );
}
