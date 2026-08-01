import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  Bell,
  TrendingUp,
  CloudRain,
  BarChart2,
  HelpCircle,
  Check,
  ShieldCheck,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { User } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export interface UserSettingsState {
  demandShifts: boolean;
  weatherWarnings: boolean;
  reports: boolean;
  supportUpdates: boolean;
  soundAlerts: boolean;
  emailDigest: boolean;
}

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const { t } = useLanguage();

  const [settings, setSettings] = useState<UserSettingsState>(() => {
    try {
      const saved = localStorage.getItem("agritech_user_settings");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      demandShifts: true,
      weatherWarnings: true,
      reports: true,
      supportUpdates: true,
      soundAlerts: true,
      emailDigest: false,
    };
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("agritech_user_settings", JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  if (!isOpen) return null;

  const toggleSetting = (key: keyof UserSettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-white flex items-center space-x-2">
                <span>{t("App & Notification Settings")}</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {t("Configure alert toggles, market shifts, weather & support updates")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save confirmation toast */}
        {savedSuccessMsg && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{t("Settings updated & saved automatically!")}</span>
            </span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Notification Alert Toggles Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                {t("Live Alert Notification Toggles")}
              </h4>
            </div>

            <div className="space-y-3">
              
              {/* 1. Sudden Shifts in Market Demand */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/50 transition">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {t("Sudden Shifts in Market Demand")}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                      {t("Instant alerts when crop demand spikes or market wholesale prices shift rapidly (>10%).")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSetting("demandShifts")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.demandShifts ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.demandShifts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Severe Weather Warnings */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-sky-500/50 transition">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 rounded-xl shrink-0 mt-0.5">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {t("Severe Weather Warnings")}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                      {t("High-priority emergency alerts for heavy rainfall, flash floods, and frost risks.")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSetting("weatherWarnings")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.weatherWarnings ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.weatherWarnings ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 3. Market & Crop Reports */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-purple-500/50 transition">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 rounded-xl shrink-0 mt-0.5">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {t("Market & Crop Reports")}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                      {t("Weekly Kalimati & Balkhu wholesale price indexes, harvest reports & crop analytics.")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSetting("reports")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.reports ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.reports ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Support Ticket Updates */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-rose-500/50 transition">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-xl shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {t("Support Ticket Updates")}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                      {t("Get notified immediately when AgriTech Admin responds to your support tickets.")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSetting("supportUpdates")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.supportUpdates ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.supportUpdates ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Additional Preferences */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              {t("Audio & Delivery Preferences")}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <button
                type="button"
                onClick={() => toggleSetting("soundAlerts")}
                className={`p-3 rounded-2xl border flex items-center space-x-3 transition cursor-pointer text-left ${
                  settings.soundAlerts
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {settings.soundAlerts ? (
                  <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="block font-bold">{t("Sound Chimes")}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {settings.soundAlerts ? t("Enabled") : t("Muted")}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleSetting("emailDigest")}
                className={`p-3 rounded-2xl border flex items-center space-x-3 transition cursor-pointer text-left ${
                  settings.emailDigest
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="block font-bold">{t("SMS / Push Digest")}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {settings.emailDigest ? t("Active") : t("Disabled")}
                  </span>
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            {t("Done")}
          </button>
        </div>

      </div>
    </div>
  );
}
