import React, { useState, useEffect } from "react";
import { User } from "../types";
import { 
  User as UserIcon, ShieldCheck, Key, MapPin, Calendar, Camera, Upload, 
  CheckCircle2, AlertCircle, Clock, Lock, Sparkles, X, Eye, EyeOff, Save,
  FileText, Building2, Phone, Mail, UserCheck, RefreshCw, BadgeCheck
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ProfileDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token: string;
  onUserUpdated: (updatedUser: User) => void;
}

// List of Nepalese Districts for dropdown
const NEPAL_DISTRICTS = [
  "Kathmandu", "Dhading", "Makwanpur", "Chitwan", "Kaski", "Kavrepalanchok", 
  "Nuwakot", "Jhapa", "Morang", "Sunsari", "Rupandehi", "Palpa", "Gorkha", 
  "Syangja", "Tanahun", "Ilam", "Bara", "Parsa", "Lalitpur", "Bhaktapur", "Surkhet", "Kailali"
];

export default function ProfileDashboardModal({
  isOpen,
  onClose,
  user,
  token,
  onUserUpdated
}: ProfileDashboardModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "kyc">("personal");

  // Personal Info State
  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [district, setDistrict] = useState(user.district || "Kathmandu");
  const [address, setAddress] = useState(user.address || "");
  const [dob, setDob] = useState(user.dob || "1990-05-15");
  const [profilePic, setProfilePic] = useState(user.profilePic || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // KYC Verification State
  const [citizenshipNumber, setCitizenshipNumber] = useState(user.citizenshipNumber || "");
  const [citizenshipDocUrl, setCitizenshipDocUrl] = useState(user.citizenshipDocUrl || "");
  const [nationalIdNumber, setNationalIdNumber] = useState(user.nationalIdNumber || "");
  const [nationalIdDocUrl, setNationalIdDocUrl] = useState(user.nationalIdDocUrl || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset local state when user changes or modal opens
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setDistrict(user.district || "Kathmandu");
      setAddress(user.address || "");
      setDob(user.dob || "1990-05-15");
      setProfilePic(user.profilePic || "");

      setCitizenshipNumber(user.citizenshipNumber || "");
      setCitizenshipDocUrl(user.citizenshipDocUrl || "");
      setNationalIdNumber(user.nationalIdNumber || "");
      setNationalIdDocUrl(user.nationalIdDocUrl || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Age calculation helper from Date of Birth
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const computedAge = calculateAge(dob);

  // Handle image upload to Base64 Data URL
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError("File size should not exceed 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick pre-fill demo data for KYC testing
  const handlePreFillKyc = () => {
    setCitizenshipNumber("27-01-78-08492");
    setNationalIdNumber("108-492-3819");
    const sampleCitizenshipSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%2310b981" opacity="0.1"/><rect x="1.5" y="1.5" width="397" height="247" rx="14.5" stroke="%2310b981" stroke-width="3" stroke-dasharray="6 6"/><text x="20" y="35" fill="%23065f46" font-family="sans-serif" font-weight="bold" font-size="14">GOVERNMENT OF NEPAL - CITIZENSHIP CERTIFICATE</text><text x="20" y="55" fill="%23047857" font-family="sans-serif" font-weight="bold" font-size="12">नेपाल सरकार - नागरिकता प्रमाण-पत्र</text><rect x="25" y="80" width="80" height="100" rx="8" fill="%23d1fae5" stroke="%23059669"/><text x="65" y="135" fill="%23047857" font-family="sans-serif" font-size="10" text-anchor="middle">PHOTO</text><text x="120" y="100" fill="%231e293b" font-family="sans-serif" font-size="12" font-weight="bold">Full Name: ${encodeURIComponent(fullName)}</text><text x="120" y="125" fill="%23475569" font-family="sans-serif" font-size="11">District: ${encodeURIComponent(district)}</text><text x="120" y="150" fill="%23047857" font-family="sans-serif" font-size="11" font-weight="bold">Citizenship No: 27-01-78-08492</text><text x="120" y="175" fill="%2364748b" font-family="sans-serif" font-size="10">Issued Date: 2078/04/12</text><rect x="20" y="200" width="360" height="30" rx="6" fill="%23059669" opacity="0.15"/><text x="200" y="220" fill="%23065f46" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VERIFIED OFFICIAL DOCUMENT SCAN</text></svg>`;
    const sampleNationalIdSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%232563eb" opacity="0.1"/><rect x="1.5" y="1.5" width="397" height="247" rx="14.5" stroke="%232563eb" stroke-width="3"/><text x="20" y="35" fill="%231e40af" font-family="sans-serif" font-weight="bold" font-size="14">NATIONAL IDENTITY CARD (NIN)</text><text x="20" y="55" fill="%231d4ed8" font-family="sans-serif" font-weight="bold" font-size="12">राष्ट्रिय परिचयपत्र - नेपाल</text><rect x="25" y="80" width="80" height="100" rx="8" fill="%23dbeafe" stroke="%232563eb"/><text x="65" y="135" fill="%231d4ed8" font-family="sans-serif" font-size="10" text-anchor="middle">NIN PHOTO</text><text x="120" y="100" fill="%231e293b" font-family="sans-serif" font-size="12" font-weight="bold">Name: ${encodeURIComponent(fullName)}</text><text x="120" y="125" fill="%231d4ed8" font-family="sans-serif" font-size="12" font-weight="bold">NIN Number: 108-492-3819</text><text x="120" y="150" fill="%23475569" font-family="sans-serif" font-size="11">District: ${encodeURIComponent(district)}</text><text x="120" y="175" fill="%2364748b" font-family="sans-serif" font-size="10">Biometric Verification Status: ENROLLED</text><rect x="20" y="200" width="360" height="30" rx="6" fill="%232563eb" opacity="0.15"/><text x="200" y="220" fill="%231e40af" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">NATIONAL REGISTRATION LOGGED</text></svg>`;
    setCitizenshipDocUrl(sampleCitizenshipSvg);
    setNationalIdDocUrl(sampleNationalIdSvg);
    setSuccessMsg("Sample Nepalese Citizenship & National ID Card documents loaded.");
  };

  // Submit profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError("New Password and Confirm Password do not match.");
        return;
      }
      if (newPassword.length < 4) {
        setError("New Password must be at least 4 characters.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          username,
          currentPassword,
          newPassword,
          phone,
          email,
          district,
          address,
          dob,
          profilePic,
          citizenshipNumber,
          citizenshipDocUrl,
          nationalIdNumber,
          nationalIdDocUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessMsg("Profile details & security preferences saved successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onUserUpdated(data.user);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("Network error while saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Role Badge Styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "farmer":
        return { text: "Farmer (किसान)", style: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300" };
      case "buyer":
        return { text: "Wholesale Buyer (व्यापारी)", style: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300" };
      case "admin":
        return { text: "Super Admin (प्रशासक)", style: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300" };
      case "cooperative":
        return { text: "Cooperative Manager (सहकारी)", style: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300" };
      default:
        return { text: role, style: "bg-slate-100 text-slate-800 border-slate-300" };
    }
  };

  const kycStatus = user.verificationStatus || (user.verified ? "verified" : "unverified");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Cover Card */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Close Dashboard"
            id="profile-dashboard-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
            {/* Profile Avatar with Live Upload Overlay */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-emerald-600 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white font-black text-3xl">
                {profilePic ? (
                  <img src={profilePic} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition cursor-pointer">
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, setProfilePic)}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Metadata */}
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black font-display tracking-tight text-white">{fullName}</h2>
                <span className={`text-[10px] font-bold uppercase tracking-wide border px-2.5 py-0.5 rounded-full ${getRoleBadge(user.role).style}`}>
                  {getRoleBadge(user.role).text}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-emerald-100/90 font-medium">
                <span className="flex items-center space-x-1">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-300" />
                  <span>@{username}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{district} District</span>
                </span>
                {computedAge !== null && (
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{computedAge} Yrs Old</span>
                  </span>
                )}
              </div>

              {/* Verification Banner Pill */}
              <div className="pt-1 flex items-center justify-center sm:justify-start">
                {kycStatus === "verified" ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>KYC Verified Citizen</span>
                  </span>
                ) : kycStatus === "pending" ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>KYC Pending Admin Review</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[11px] font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                    <span>Unverified Identity</span>
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex border-b border-emerald-700/50 space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-2.5 text-xs font-bold transition flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "personal"
                  ? "border-emerald-300 text-white"
                  : "border-transparent text-emerald-200/70 hover:text-white"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Personal Details & Photo</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`pb-2.5 text-xs font-bold transition flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "security"
                  ? "border-emerald-300 text-white"
                  : "border-transparent text-emerald-200/70 hover:text-white"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Username & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`pb-2.5 text-xs font-bold transition flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "kyc"
                  ? "border-emerald-300 text-white"
                  : "border-transparent text-emerald-200/70 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>KYC Verification Hub</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL DETAILS & PHOTO */}
          {activeTab === "personal" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Profile Photo Management */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shrink-0 border border-emerald-500 shadow-sm">
                    {profilePic ? (
                      <img src={profilePic} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Profile Picture / Avatar</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Upload a clear passport-size or face photograph (PNG, JPG, WEBP)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setProfilePic)}
                      className="hidden"
                    />
                  </label>
                  {profilePic && (
                    <button
                      type="button"
                      onClick={() => setProfilePic("")}
                      className="px-2.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Full Name (पूरा नाम)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number (फोन नम्बर)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-100 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Email Address (ईमेल)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      placeholder="e.g. farmer@krishisajha.np"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Date of Birth (जन्म मिति)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-100 transition"
                    />
                    {computedAge !== null && (
                      <span className="absolute right-3 top-2.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        {computedAge} yrs old
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* District & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    District (जिल्ला)
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 transition"
                  >
                    {NEPAL_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Local Address / Ward / Municipality (ठेगाना)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Naubise-4, Dhading"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 transition"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 p-4 rounded-2xl space-y-1">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Account Credentials & Security</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Update your unique username or replace your access password to protect your B2B supply transactions and wallet authorizations.
                </p>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Username (प्रयोगकर्ता नाम)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-8 pr-3 py-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Password Management */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Change Password (पासवर्ड परिवर्तन)
                </h4>

                {user.password && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 transition"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: KYC VERIFICATION HUB */}
          {activeTab === "kyc" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* KYC Status Indicator */}
              {kycStatus === "verified" ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start space-x-3 text-emerald-800 dark:text-emerald-300">
                  <BadgeCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">Super Admin Verified Account</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                      Your Citizenship Card (<span className="font-mono font-bold">{user.citizenshipNumber}</span>) and National ID (<span className="font-mono font-bold">{user.nationalIdNumber}</span>) are verified. You hold full verified trade privileges in Nepal.
                    </p>
                  </div>
                </div>
              ) : kycStatus === "pending" ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 dark:text-amber-300">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">KYC Submission Pending Super Admin Sign-off</h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Submitted on <strong>{user.verificationSubmittedAt ? new Date(user.verificationSubmittedAt).toLocaleDateString() : "Today"}</strong>. Documents are in queue for verification.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-start space-x-3 text-rose-900 dark:text-rose-300">
                  <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">Verification Required for B2B Direct Sales</h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                      Please upload your Citizenship Card (नागरिकता) and National ID Card (राष्ट्रिय परिचयपत्र) to gain verified producer or wholesale buyer status.
                    </p>
                  </div>
                </div>
              )}

              {/* Pre-fill Sample Documents for testing */}
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl">
                <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto-fill official Nepalese sample documents for testing?</span>
                </div>
                <button
                  type="button"
                  onClick={handlePreFillKyc}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs shrink-0"
                >
                  Load Sample Cards
                </button>
              </div>

              {/* Citizenship Details */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>1. Citizenship Certificate (नागरिकता)</span>
                  </h4>
                  <span className="text-[10px] text-rose-600 font-bold">* Required</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Citizenship Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27-01-78-08492"
                    value={citizenshipNumber}
                    onChange={(e) => setCitizenshipNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Citizenship Document Scan / Photo
                  </label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-850 relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setCitizenshipDocUrl)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Click to upload Citizenship Card scan</span>
                    </div>
                  </div>

                  {citizenshipDocUrl && (
                    <div className="mt-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={citizenshipDocUrl} alt="Citizenship" className="w-16 h-10 object-cover rounded border bg-white" />
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Citizenship Document Loaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCitizenshipDocUrl("")}
                        className="text-rose-600 text-xs font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* National ID Details */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>2. National Identity Card (NIN - राष्ट्रिय परिचयपत्र)</span>
                  </h4>
                  <span className="text-[10px] text-rose-600 font-bold">* Required</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    National Identity Number (NIN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 108-492-3819"
                    value={nationalIdNumber}
                    onChange={(e) => setNationalIdNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    National ID Document Scan / Photo
                  </label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-850 relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setNationalIdDocUrl)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Click to upload National Identity Card scan</span>
                    </div>
                  </div>

                  {nationalIdDocUrl && (
                    <div className="mt-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={nationalIdDocUrl} alt="National ID" className="w-16 h-10 object-cover rounded border bg-white" />
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300">National ID Document Loaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNationalIdDocUrl("")}
                        className="text-rose-600 text-xs font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center space-x-2 disabled:opacity-50"
              id="save-profile-dashboard-btn"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
