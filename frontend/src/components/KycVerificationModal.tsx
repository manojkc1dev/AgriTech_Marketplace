import React, { useState, useEffect } from "react";
import { User } from "../types";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Clock, FileText, X, Lock, Sparkles, Building2, Eye } from "lucide-react";

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token: string;
  onVerificationSubmitted?: (updatedUser: User) => void;
  onSuccess?: (updatedUser: User) => void;
  actionTitle?: string;
}

export default function KycVerificationModal({
  isOpen,
  onClose,
  user,
  token,
  onVerificationSubmitted,
  onSuccess,
  actionTitle = "Mandatory User Identity Verification"
}: KycVerificationModalProps) {
  const [citizenshipNumber, setCitizenshipNumber] = useState(user.citizenshipNumber || "");
  const [citizenshipDocUrl, setCitizenshipDocUrl] = useState(user.citizenshipDocUrl || "");
  const [nationalIdNumber, setNationalIdNumber] = useState(user.nationalIdNumber || "");
  const [nationalIdDocUrl, setNationalIdDocUrl] = useState(user.nationalIdDocUrl || "");
  
  const [citizenshipFileName, setCitizenshipFileName] = useState<string>("citizenship_scan.jpg");
  const [nationalIdFileName, setNationalIdFileName] = useState<string>("national_id_card.jpg");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCitizenshipNumber(user.citizenshipNumber || "");
      setCitizenshipDocUrl(user.citizenshipDocUrl || "");
      setNationalIdNumber(user.nationalIdNumber || "");
      setNationalIdDocUrl(user.nationalIdDocUrl || "");
    }
  }, [user]);

  if (!isOpen) return null;

  // Handle local file uploads using FileReader to convert image to Data URL
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setDocUrl: (url: string) => void,
    setFileName: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-fill demo credentials for quick agent & user testing
  const handlePreFillDemo = () => {
    setCitizenshipNumber("27-01-78-08492");
    setNationalIdNumber("108-492-3819");
    
    // SVG mock Citizenship Card preview
    const sampleCitizenshipSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%2310b981" opacity="0.1"/><rect x="1.5" y="1.5" width="397" height="247" rx="14.5" stroke="%2310b981" stroke-width="3" stroke-dasharray="6 6"/><text x="20" y="35" fill="%23065f46" font-family="sans-serif" font-weight="bold" font-size="14">GOVERNMENT OF NEPAL - CITIZENSHIP CERTIFICATE</text><text x="20" y="55" fill="%23047857" font-family="sans-serif" font-weight="bold" font-size="12">नेपाल सरकार - नागरिकता प्रमाण-पत्र</text><rect x="25" y="80" width="80" height="100" rx="8" fill="%23d1fae5" stroke="%23059669"/><text x="65" y="135" fill="%23047857" font-family="sans-serif" font-size="10" text-anchor="middle">PHOTO</text><text x="120" y="100" fill="%231e293b" font-family="sans-serif" font-size="12" font-weight="bold">Full Name: ${encodeURIComponent(user.fullName)}</text><text x="120" y="125" fill="%23475569" font-family="sans-serif" font-size="11">District: ${encodeURIComponent(user.district)}</text><text x="120" y="150" fill="%23047857" font-family="sans-serif" font-size="11" font-weight="bold">Citizenship No: 27-01-78-08492</text><text x="120" y="175" fill="%2364748b" font-family="sans-serif" font-size="10">Issued Date: 2078/04/12</text><rect x="20" y="200" width="360" height="30" rx="6" fill="%23059669" opacity="0.15"/><text x="200" y="220" fill="%23065f46" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VERIFIED OFFICIAL DOCUMENT SCAN</text></svg>`;
    
    // SVG mock National ID Card preview
    const sampleNationalIdSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%232563eb" opacity="0.1"/><rect x="1.5" y="1.5" width="397" height="247" rx="14.5" stroke="%232563eb" stroke-width="3"/><text x="20" y="35" fill="%231e40af" font-family="sans-serif" font-weight="bold" font-size="14">NATIONAL IDENTITY CARD (NIN)</text><text x="20" y="55" fill="%231d4ed8" font-family="sans-serif" font-weight="bold" font-size="12">राष्ट्रिय परिचयपत्र - नेपाल</text><rect x="25" y="80" width="80" height="100" rx="8" fill="%23dbeafe" stroke="%232563eb"/><text x="65" y="135" fill="%231d4ed8" font-family="sans-serif" font-size="10" text-anchor="middle">NIN PHOTO</text><text x="120" y="100" fill="%231e293b" font-family="sans-serif" font-size="12" font-weight="bold">Name: ${encodeURIComponent(user.fullName)}</text><text x="120" y="125" fill="%231d4ed8" font-family="sans-serif" font-size="12" font-weight="bold">NIN Number: 108-492-3819</text><text x="120" y="150" fill="%23475569" font-family="sans-serif" font-size="11">District: ${encodeURIComponent(user.district)}</text><text x="120" y="175" fill="%2364748b" font-family="sans-serif" font-size="10">Biometric Verification Status: ENROLLED</text><rect x="20" y="200" width="360" height="30" rx="6" fill="%232563eb" opacity="0.15"/><text x="200" y="220" fill="%231e40af" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">NATIONAL REGISTRATION LOGGED</text></svg>`;
    
    setCitizenshipDocUrl(sampleCitizenshipSvg);
    setNationalIdDocUrl(sampleNationalIdSvg);
    setError(null);
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!citizenshipNumber.trim()) {
      setError("Please enter your Citizenship Card Number.");
      return;
    }
    if (!citizenshipDocUrl) {
      setError("Please upload a photo/scan of your Citizenship Card.");
      return;
    }
    if (!nationalIdNumber.trim()) {
      setError("Please enter your National Identity Card Number (NIN).");
      return;
    }
    if (!nationalIdDocUrl) {
      setError("Please upload a photo/scan of your National Identity Card.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/verify-kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          citizenshipNumber: citizenshipNumber.trim(),
          citizenshipDocUrl,
          nationalIdNumber: nationalIdNumber.trim(),
          nationalIdDocUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Your Citizenship & National Identity Card documents have been submitted! Verification is now pending Admin / Super Admin review.");
        if (onVerificationSubmitted && data.user) {
          onVerificationSubmitted(data.user);
        }
        if (onSuccess && data.user) {
          onSuccess(data.user);
        }
      } else {
        setError(data.error || "Failed to submit verification documents.");
      }
    } catch (e) {
      setError("Communication error. Please try submitting again.");
    } finally {
      setSubmitting(false);
    }
  };

  const status = user.verificationStatus || (user.verified ? "verified" : "unverified");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 backdrop-blur-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase block font-mono">
                Mandatory Compliance & Safety Protocol
              </span>
              <h2 className="text-xl font-bold font-display text-white">{actionTitle}</h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                नागरिकता तथा राष्ट्रिय परिचयपत्र प्रमाणीकरण (First Buy & Sell Requirement)
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Verification Status Alert Banners */}
          {status === "verified" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Account Verified by Super Admin!</h4>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Your Citizenship Card (No: <strong className="font-mono">{user.citizenshipNumber}</strong>) and National Identity Card (NIN: <strong className="font-mono">{user.nationalIdNumber}</strong>) have been officially approved. You have full authorized access to buy and sell produce across all districts.
                </p>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-900">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-amber-900">Verification Under Admin Review</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-mono">
                    Pending Super Admin Approval
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your Citizenship Card & National Identity Card documents were successfully submitted on{" "}
                  <strong>{user.verificationSubmittedAt ? new Date(user.verificationSubmittedAt).toLocaleDateString() : "today"}</strong>.
                </p>
                <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p>📄 <strong>Citizenship No:</strong> <span className="font-mono">{user.citizenshipNumber || citizenshipNumber}</span></p>
                  <p>🆔 <strong>National ID (NIN):</strong> <span className="font-mono">{user.nationalIdNumber || nationalIdNumber}</span></p>
                </div>
                <p className="text-[11px] text-amber-700 italic">
                  Note: A Super Admin or Admin will review your credentials shortly. You will receive immediate access to buy & sell upon sign-off.
                </p>
              </div>
            </div>
          )}

          {status === "rejected" && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3 text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Verification Request Rejected</h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {user.verificationNotes || "The uploaded Citizenship or National Identity Card image was incomplete or unreadable. Please re-upload clearer photos."}
                </p>
              </div>
            </div>
          )}

          {/* General Explanation for Unverified / Rejected Users */}
          {status !== "verified" && status !== "pending" && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Why is identity verification mandatory?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To prevent fraud, guarantee harvest quality, and protect direct financial payouts for Nepalese smallholders and commercial buyers, 
                all users are required to upload both their <strong>Citizenship Card (नागरिकता)</strong> and <strong>National Identity Card (राष्ट्रिय परिचयपत्र)</strong> on their 
                first purchase or sale. Trading activates immediately following approval from a Super Admin or District Admin.
              </p>
            </div>
          )}

          {/* Form for Submission when unverified or rejected */}
          {status !== "verified" && status !== "pending" && (
            <form onSubmit={handleSubmitKyc} className="space-y-5">
              
              {/* Quick Demo Pre-fill Button */}
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Testing mode active: Auto-fill official sample documents?</span>
                </div>
                <button
                  type="button"
                  onClick={handlePreFillDemo}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  Pre-fill Sample Cards
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. CITIZENSHIP CARD SECTION */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>1. Citizenship Card (नागरिकता प्रमाण-पत्र)</span>
                  </h3>
                  <span className="text-[10px] text-rose-600 font-bold uppercase">* Mandatory</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Citizenship Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27-01-78-08492"
                    value={citizenshipNumber}
                    onChange={(e) => setCitizenshipNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs text-slate-800 font-mono transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Upload Citizenship Card Scan / Photo (Front & Back)
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 transition rounded-xl p-4 text-center bg-slate-50 relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setCitizenshipDocUrl, setCitizenshipFileName)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click or drag Citizenship image here
                      </p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WEBP or PDF (Max 10MB)</p>
                    </div>
                  </div>

                  {citizenshipDocUrl && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={citizenshipDocUrl}
                          alt="Citizenship Preview"
                          className="w-16 h-12 object-cover rounded border border-emerald-300 bg-white"
                        />
                        <div>
                          <p className="text-xs font-bold text-emerald-900 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                            <span>Citizenship Card Ready</span>
                          </p>
                          <p className="text-[10px] text-emerald-700 font-mono truncate max-w-[200px]">{citizenshipFileName}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCitizenshipDocUrl("")}
                        className="text-rose-600 text-xs hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. NATIONAL IDENTITY CARD (NIN) SECTION */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>2. National Identity Card (राष्ट्रिय परिचयपत्र - NIN)</span>
                  </h3>
                  <span className="text-[10px] text-rose-600 font-bold uppercase">* Mandatory</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    National Identity Number (NIN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 108-492-3819"
                    value={nationalIdNumber}
                    onChange={(e) => setNationalIdNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 font-mono transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Upload National Identity Card Scan / Photo
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 transition rounded-xl p-4 text-center bg-slate-50 relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setNationalIdDocUrl, setNationalIdFileName)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click or drag National ID Card image here
                      </p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WEBP or PDF (Max 10MB)</p>
                    </div>
                  </div>

                  {nationalIdDocUrl && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={nationalIdDocUrl}
                          alt="National ID Preview"
                          className="w-16 h-12 object-cover rounded border border-blue-300 bg-white"
                        />
                        <div>
                          <p className="text-xs font-bold text-blue-900 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                            <span>National Identity Card Ready</span>
                          </p>
                          <p className="text-[10px] text-blue-700 font-mono truncate max-w-[200px]">{nationalIdFileName}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNationalIdDocUrl("")}
                        className="text-rose-600 text-xs hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? "Submitting Documents..." : "Submit Verification for Admin Approval"}</span>
                </button>
              </div>

            </form>
          )}

          {/* Action Footer if Pending or Verified */}
          {(status === "verified" || status === "pending") && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                Close & Return
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
