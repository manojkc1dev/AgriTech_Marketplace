import React, { useState } from "react";
import { User, UserRole } from "../types";
import { api } from "../utils/api";
import {
  LogIn,
  KeyRound,
  Globe,
  Smartphone,
  MapPin,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Check,
  AlertCircle,
  Mail,
  User as UserIcon,
  Building2,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Shield,
  ArrowRight,
  ArrowLeft,
  X,
  Sprout,
  MessageSquarePlus,
  Plus,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface LoginProps {
  onAuthSuccess: (user: User, token: string) => void;
  onGoToPublicPrices?: () => void;
}

export default function Login({
  onAuthSuccess,
  onGoToPublicPrices,
}: LoginProps) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login State
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Strict Role Detection based solely on exact username patterns
  const detectRoleFromUsername = (username: string): UserRole => {
    const lower = username.toLowerCase().trim();

    if (
      lower.startsWith("admin") ||
      lower.includes("administrator") ||
      lower.includes("root")
    ) {
      return "admin";
    }
    if (
      lower.startsWith("coop") ||
      lower.startsWith("co-op") ||
      lower.includes("cooperative") ||
      lower.includes("samiti") ||
      lower.includes("group")
    ) {
      return "cooperative";
    }
    if (
      lower.startsWith("buyer") ||
      lower.startsWith("hotel") ||
      lower.startsWith("retail") ||
      lower.startsWith("market") ||
      lower.startsWith("merchant") ||
      lower.startsWith("store")
    ) {
      return "buyer";
    }
    return "farmer";
  };

  const detectedRole = detectRoleFromUsername(loginUsername);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!loginUsername.trim()) {
      setError(
        language === "ne"
          ? "कृपया प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्।"
          : "Please enter your system username.",
      );
      return;
    }

    setLoading(true);
    try {
      // Forcefully bind the strictly detected role based on credentials
      const res = await api.post("/auth/login/", {
        username: loginUsername.trim(),
        password: loginPassword.trim() || undefined,
        role: detectedRole,
      });

      setSuccessMessage(
        language === "ne"
          ? "प्रमाणीकरण सफल भयो! ड्यासबोर्डमा प्रविष्ट गरिँदैछ..."
          : "Login successful! Directing to dashboard...",
      );

      const token =
        res.data.access ||
        res.data.access_token ||
        res.data.token ||
        res.data.key;

      const userObj = {
        ...(res.data.user || res.data),
        role: detectedRole, // Enforce strict matching role on client state
      };

      setTimeout(() => {
        onAuthSuccess(userObj, token);
      }, 300);
    } catch (e: any) {
      const errorData = e.response?.data || {};
      setError(
        errorData.error ||
          errorData.detail ||
          (language === "ne"
            ? "लगइन असफल भयो। विवरण जाँच गर्नुहोस्।"
            : "Login failed. Please verify credentials."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 2500);
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      {onGoToPublicPrices && (
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-850 p-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={onGoToPublicPrices}
            className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{language === "ne" ? "गृहपृष्ठ (Home)" : "Home"}</span>
          </button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
            {language === "ne" ? "सदस्य पोर्टल (Login)" : "Member Login Portal"}
          </span>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold font-display tracking-wide uppercase text-emerald-300">
              {language === "ne"
                ? "नेपाल कृषि-प्रविधि सुरक्षित लगइन गेटवे"
                : "Nepal AgriTech Secure Dashboard Gateway"}
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-light">
            {language === "ne"
              ? "प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्, प्रणालीले स्वचालित रूपमा सही ड्यासबोर्ड पत्ता लगाउनेछ।"
              : "Enter your username/ID and the system will strictly route you to your designated role dashboard."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {language === "ne" ? "सदस्य लगइन" : "Login"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === "ne"
                  ? "खाताहरू एडमिन ड्यासबोर्ड मार्फत सिर्जना गरिन्छ"
                  : "Accounts are created via the Admin Dashboard"}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full font-mono font-bold">
            Secure Portal
          </span>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-3 rounded-xl text-xs font-medium text-rose-800 dark:text-rose-200 flex items-start space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 p-3 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-start space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === "ne" ? "प्रयोगकर्ता नाम (Username)" : "Username"}
              </label>
              {loginUsername.trim().length > 0 && (
                <div className="flex items-center space-x-1">
                  <span
                    onClick={() => setLoginUsername("")}
                    title="Clear"
                    className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer mr-1"
                  >
                    ✕
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                    Role: {detectedRole}
                  </span>
                </div>
              )}
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. coop_1, buyer_kathmandu, admin, farmer_ram"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === "ne" ? "पासवर्ड (Password)" : "Password"}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {language === "ne" ? "पासवर्ड बिर्सनुभयो?" : "Forgot Password?"}
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2.5 pl-9 pr-10 text-sm text-slate-800 dark:text-slate-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              >
                {showLoginPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
              />
              <span>
                {language === "ne" ? "मेरो लगइन सम्झिनुहोस्" : "Remember me"}
              </span>
            </label>

            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Strict Role Enforcement</span>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 shadow-sm flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{language === "ne" ? "लगइन गर्नुहोस्" : "Login"}</span>
          </button>
        </form>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider font-display">
                {language === "ne" ? "पासवर्ड पुनःप्राप्ति" : "Reset Password"}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "ne"
                ? "तपाईंको दर्ता गरिएको इमेल वा प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्।"
                : "Enter your registered username or email below to receive recovery instructions."}
            </p>

            {forgotSent ? (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 text-center space-y-1 font-medium">
                <div className="font-bold">✓ Reset Instructions Sent!</div>
                <p>Check your inbox or contact support.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ram_farmer or ram@agritech.np"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Send Recovery Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
