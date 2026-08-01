import React, { useState } from "react";
import { User, UserRole } from "../types";
import { 
  LogIn, UserPlus, KeyRound, Globe, Smartphone, MapPin, Loader2, 
  Eye, EyeOff, Lock, ShieldCheck, Check, AlertCircle, Mail, User as UserIcon, 
  Building2, Sparkles, HelpCircle, CheckCircle2, Shield, ArrowRight, ArrowLeft, X, Sprout, MessageSquarePlus, Plus
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface LoginRegisterProps {
  onAuthSuccess: (user: User, token: string) => void;
  onGoToPublicPrices?: () => void;
}

export default function LoginRegister({ onAuthSuccess, onGoToPublicPrices }: LoginRegisterProps) {
  const { language, t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sign In State
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("farmer");
  const [regDistrict, setRegDistrict] = useState("Dhading");
  const [regCooperativeId, setRegCooperativeId] = useState("coop_1");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Pre-seeded accounts list for single-click access
  const seedUsers = [
    {
      name: "Ram Bahadur Tamang",
      username: "ram_farmer",
      pass: "pass123",
      role: "Farmer (किसान)",
      roleKey: "farmer",
      district: "Dhading",
      avatar: "🚜",
      verified: "Verified Affiliate"
    },
    {
      name: "Hari Devi Acharya",
      username: "hari_farmer",
      pass: "pass123",
      role: "Farmer (किसान)",
      roleKey: "farmer",
      district: "Makwanpur",
      avatar: "🌾",
      verified: "Pending Review"
    },
    {
      name: "Mukunda Prasad Sapkota",
      username: "mukunda_coop",
      pass: "pass123",
      role: "Cooperative (Dhading)",
      roleKey: "cooperative",
      district: "Dhading",
      avatar: "🏢",
      verified: "Coop Leader"
    },
    {
      name: "Keshav Raj Giri",
      username: "keshav_coop",
      pass: "pass123",
      role: "Cooperative (Makwanpur)",
      roleKey: "cooperative",
      district: "Makwanpur",
      avatar: "🏢",
      verified: "Coop Leader"
    },
    {
      name: "Shyam Shrestha",
      username: "shyam_buyer",
      pass: "pass123",
      role: "B2B Buyer (Hotel/Retail)",
      roleKey: "buyer",
      district: "Kathmandu",
      avatar: "🏨",
      verified: "Pre-verified"
    },
    {
      name: "Light Code Admin",
      username: "admin",
      pass: "pass123",
      role: "System Administrator",
      roleKey: "admin",
      district: "Kathmandu",
      avatar: "🛡️",
      verified: "Platform Admin"
    }
  ];

  // Calculate Password Strength score (0-4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200 dark:bg-slate-700" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass) || /[^a-zA-Z0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: language === "ne" ? "कमजोर" : "Weak", color: "bg-rose-500", text: "text-rose-500" };
      case 2:
        return { score: 2, label: language === "ne" ? "सामान्य" : "Fair", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { score: 3, label: language === "ne" ? "राम्रो" : "Good", color: "bg-sky-500", text: "text-sky-500" };
      case 4:
        return { score: 4, label: language === "ne" ? "मजबुत" : "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      default:
        return { score: 0, label: "", color: "bg-slate-200 dark:bg-slate-700", text: "text-slate-400" };
    }
  };

  const pwdStrength = getPasswordStrength(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!loginUsername.trim()) {
      setError(language === "ne" ? "कृपया प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्।" : "Please enter your system username.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(language === "ne" ? "प्रमाणीकरण सफल भयो! ड्यासबोर्डमा प्रविष्ट गरिँदैछ..." : "Authentication successful! Entering portal...");
        setTimeout(() => {
          onAuthSuccess(data.user, data.access_token);
        }, 300);
      } else {
        const data = await res.json();
        setError(data.error || (language === "ne" ? "लगइन असफल भयो। विवरण जाँच गर्नुहोस्।" : "Login failed. Please verify credentials."));
      }
    } catch (e) {
      setError(language === "ne" ? "गेटवेमा जोडिन सकिएन।" : "Network error connecting to Express gateway.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFastLogin = async (usr: string, pass: string) => {
    setLoginUsername(usr);
    setLoginPassword(pass);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usr, password: pass })
      });

      if (res.ok) {
        const data = await res.json();
        onAuthSuccess(data.user, data.access_token);
      } else {
        const data = await res.json();
        setError(data.error || "Demo login failed.");
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!regFullName || !regUsername || !regPhone || !regPassword) {
      setError(language === "ne" ? "कृपया सबै आवश्यक विवरणहरू भर्नुहोस्।" : "Please fill out all mandatory registration fields including password.");
      return;
    }

    if (regPassword.length < 6) {
      setError(language === "ne" ? "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।" : "Password must be at least 6 characters long.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError(language === "ne" ? "पासवर्ड मिलेन। पुनः प्रयास गर्नुहोस्।" : "Passwords do not match. Please verify.");
      return;
    }

    if (!agreeTerms) {
      setError(language === "ne" ? "कृपया शर्त र गोपनीयता नीति स्वीकार गर्नुहोस्।" : "Please accept the Terms of Service & Privacy Policy to proceed.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        username: regUsername.trim(),
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
        district: regDistrict
      };
      if (regRole === "cooperative") {
        payload.cooperativeId = regCooperativeId;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(language === "ne" ? "रजिस्ट्रेसन सफल भयो! स्वागत छ।" : "Registration completed successfully! Welcome.");
        setTimeout(() => {
          onAuthSuccess(data.user, data.access_token);
        }, 400);
      } else {
        const data = await res.json();
        setError(data.error || (language === "ne" ? "रजिस्ट्रेसन अस्वीकृत भयो।" : "Registration rejected. Please verify details."));
      }
    } catch (e) {
      setError(language === "ne" ? "नेटवर्क सञ्चार त्रुटि।" : "Network communication error.");
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
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      
      {/* Back to Home / Public Prices Button */}
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
            {language === "ne" ? "प्राधिकृत सदस्य पोर्टल (Users Portal)" : "Authorized Users Member Portal"}
          </span>
        </div>
      )}

      {/* Top Professional Security Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold font-display tracking-wide uppercase text-emerald-300">
              {language === "ne" ? "नेपाल कृषि-प्रविधि सुरक्षित गेटवे पोर्टल" : "Nepal AgriTech Regional Partner Access Gateway"}
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-light">
            {language === "ne"
              ? "हस्ताक्षर गरिएको JWT-२५६ बियरर टोकन र SSL एन्क्रिप्शनद्वारा सुरक्षित। किसान, सहकारी तथा B2B होटल क्रेताहरूको लागि उद्योग-स्तरीय अधिकार व्यवस्थापन।"
              : "Secured by signed 256-bit JWT authorization tokens with HTTPS encryption. Direct multi-role access for Smallholder Farmers, Regional Cooperatives, and B2B Retail Hospitality Buyers."}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-700/50 px-3 py-1.5 rounded-xl text-[11px] font-mono text-emerald-300 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Gateway: Online &amp; ISO 27001 Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Seed User Fast Access Selection (Colspan 6) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === "ne" ? "द्रुत लगइन प्रोफाइलहरू (Fast Demo Auth)" : "Quick-Select Demo Accounts"}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                1-Click JWT Authorization
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === "ne"
                ? "कुनै पनि परीक्षण खाता रोज्नुहोस्। प्रणालीले स्वतः प्रमाण-पत्रहरू र पासवर्ड पुष्टि गरी ड्यासबोर्डमा प्रवेश गराउनेछ।"
                : "Select any pre-configured partner profile below to simulate instant password authentication and inspect role-specific features:"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {seedUsers.map((u) => (
              <button
                key={u.username}
                onClick={() => handleDemoFastLogin(u.username, u.pass)}
                disabled={loading}
                className="flex items-start text-left bg-slate-50 dark:bg-slate-850 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-600 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 transition duration-150 group cursor-pointer shadow-2xs hover:shadow-xs relative"
              >
                <div className="text-2xl mr-3 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0 select-none">
                  {u.avatar}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {u.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {u.role}
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-mono text-slate-400 dark:text-slate-500">
                      @{u.username}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Auth &rarr;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {language === "ne"
                ? "नयाँ प्रयोगकर्ता खाता सिर्जना गर्दा उद्योग-स्तरीय पासवर्ड सुरक्षा र जिल्लास्तरीय सत्यापन लागू हुन्छ।"
                : "New custom registrations automatically store password hashing credentials and support full JWT session tokens."}
            </p>
          </div>
        </div>

        {/* Right Column: Industry-Standard Login / Signup Panel (Colspan 6) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setIsRegister(false); setError(""); setSuccessMessage(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                !isRegister
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === "ne" ? "साइन इन (Sign In)" : "Sign In to Portal"}</span>
            </button>

            <button
              onClick={() => { setIsRegister(true); setError(""); setSuccessMessage(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                isRegister
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === "ne" ? "खाता सिर्जना गर्नुहोस् (Sign Up)" : "Create Partner Account"}</span>
            </button>
          </div>

          {/* Feedback Alerts */}
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

          {/* Sign In Form */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {language === "ne" ? "प्रयोगकर्ता नाम (Username)" : "System Username or Registered ID"}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. ram_farmer, admin"
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
                    {language === "ne" ? "पासवर्ड (Password)" : "Account Password"}
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
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>{language === "ne" ? "मेरो लगइन सम्झिनुहोस्" : "Remember my session"}</span>
                </label>

                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>256-bit Encrypted</span>
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 shadow-sm flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{language === "ne" ? "सुरक्षित रूपमा लगइन गर्नुहोस्" : "Authenticate & Sign In"}</span>
              </button>
            </form>
          ) : (
            /* Sign Up / Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Full Legal Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  {language === "ne" ? "पूरा नाम (Full Legal Name)" : "Full Legal Name"} *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Ram Prasad Adhikari"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 transition"
                  />
                </div>
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    {language === "ne" ? "प्रयोगकर्ता नाम" : "System Username"} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ram_organic"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    {language === "ne" ? "इमेल (Email)" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="ram@agritech.np"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-100 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Role & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    {language === "ne" ? "जिल्ला (District)" : "District Jurisdiction"} *
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 transition cursor-pointer"
                  >
                    <option value="Dhading">Dhading District</option>
                    <option value="Makwanpur">Makwanpur District</option>
                    <option value="Kathmandu">Kathmandu Valley</option>
                    <option value="Kavre">Kavrepalanchok</option>
                    <option value="Chitwan">Chitwan District</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    {language === "ne" ? "भूमिका (User Role)" : "Partner Role"} *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 transition cursor-pointer font-medium"
                  >
                    <option value="farmer">Smallholder Farmer (किसान)</option>
                    <option value="buyer">B2B Buyer (Hotel/Wholesale)</option>
                    <option value="cooperative">Cooperative Representative</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              {regRole === "cooperative" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    {language === "ne" ? "सहकारी छनोट" : "Affiliated Regional Cooperative"}
                  </label>
                  <select
                    value={regCooperativeId}
                    onChange={(e) => setRegCooperativeId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 transition cursor-pointer"
                  >
                    <option value="coop_1">Dhading Organic Vegetable Cooperative Union</option>
                    <option value="coop_2">Trishuli Valley Farmers Federation</option>
                    <option value="coop_3">Makwanpur Hill Fruit &amp; Spice Cooperative</option>
                  </select>
                </div>
              )}

              {/* Phone Contact */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  {language === "ne" ? "फोन नम्बर (Contact Phone)" : "Mobile Phone (SMS & Alerts)"} *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+977-9841-XXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 transition"
                  />
                </div>
              </div>

              {/* Password Fields with Strength Meter */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                      {language === "ne" ? "पासवर्ड" : "Create Password"} *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-8 text-xs text-slate-800 dark:text-slate-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                      {language === "ne" ? "पासवर्ड पुनः पुष्टि" : "Confirm Password"} *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                        className={`w-full bg-slate-50 dark:bg-slate-800 border focus:ring-1 focus:outline-none rounded-xl py-2 pl-8 pr-8 text-xs text-slate-800 dark:text-slate-100 transition ${
                          regConfirmPassword.length > 0
                            ? passwordsMatch
                              ? "border-emerald-500 focus:ring-emerald-500"
                              : "border-rose-500 focus:ring-rose-500"
                            : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Visual Meter */}
                {regPassword.length > 0 && (
                  <div className="space-y-1.5 pt-1 animate-fade-in">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                      <span className={pwdStrength.text}>{pwdStrength.label}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 1 ? pwdStrength.color : "bg-transparent"}`}></div>
                      <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 2 ? pwdStrength.color : "bg-transparent"}`}></div>
                      <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 3 ? pwdStrength.color : "bg-transparent"}`}></div>
                      <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 4 ? pwdStrength.color : "bg-transparent"}`}></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>• Min 6 characters</span>
                      {regConfirmPassword.length > 0 && (
                        <span className={passwordsMatch ? "text-emerald-600 font-bold flex items-center space-x-0.5" : "text-rose-500 font-bold"}>
                          {passwordsMatch ? "✓ Passwords Match" : "✕ Passwords Do Not Match"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 mt-0.5"
                  />
                  <span className="leading-tight">
                    {language === "ne"
                      ? "म नेपाल कृषि-प्रविधि सेवाका शर्तहरू र डेटा सुरक्षा नीति स्वीकार गर्दछु।"
                      : "I agree to Nepal AgriTech's Partner Terms of Service & Regional Data Governance Guidelines."}
                  </span>
                </label>
              </div>

              {/* Register CTA */}
              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition duration-150 shadow-sm flex items-center justify-center space-x-2 cursor-pointer mt-3"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{language === "ne" ? "खाता दर्ता गरी प्रमाणित गर्नुहोस्" : "Complete Registration & Authenticate"}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
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
                {language === "ne" ? "पासवर्ड पुनःप्राप्ति (Password Recovery)" : "Reset Account Password"}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "ne"
                ? "तपाईंको दर्ता गरिएको प्रयोगकर्ता नाम वा इमेल प्रविष्ट गर्नुहोस्। हामी तपाईंको क्षेत्रको सहकारी प्रतिनिधिमार्फत पासवर्ड रिसेट लिङ्क पठाउनेछौँ।"
                : "Enter your registered email address or partner username below. A password reset link will be dispatched via your regional cooperative district officer."}
            </p>

            {forgotSent ? (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 text-center space-y-1 font-medium">
                <div className="font-bold">✓ Reset Instructions Sent!</div>
                <p>Check your inbox or contact your Dhading/Makwanpur cooperative lead.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Registered Email or Username
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
