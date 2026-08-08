import React, { useState, useEffect, useCallback } from "react";
import type {
  User,
  FeedbackType,
  FeedbackPriority,
  PlatformFeedback,
} from "../../../frontend/src/types";
import {
  X,
  Send,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Layers,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "../../../frontend/src/context/LanguageContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  token?: string;
}

export default function PlatformFeedbackModal({
  isOpen,
  onClose,
  user,
  token,
}: FeedbackModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"submit" | "explore">("submit");

  // Form State
  const [type, setType] = useState<FeedbackType>("feature_request");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<FeedbackPriority>("medium");
  const [userName, setUserName] = useState(user?.fullName || "");
  const [userRole, setUserRole] = useState(user?.role || "guest");
  const [userDistrict, setUserDistrict] = useState(
    user?.district || "Kathmandu",
  );
  const [userPhone, setUserPhone] = useState(user?.phone || "");

  // Submission & Data State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedFeedback, setSubmittedFeedback] =
    useState<PlatformFeedback | null>(null);

  // Community feedback list
  const [feedbackList, setFeedbackList] = useState<PlatformFeedback[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Sync state cleanly when user prop changes (deferred to prevent synchronous setState warning)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setUserName(user.fullName || "");
        setUserRole(user.role || "guest");
        setUserDistrict(user.district || "Kathmandu");
        setUserPhone(user.phone || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Fetch community feedback list when explore tab or modal is opened
  const fetchFeedbackList = useCallback(async () => {
    setLoadingList(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/feedback", { headers });
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data);
      }
    } catch (e) {
      console.error("Error fetching feedback list:", e);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      // Defer execution to macrotask queue to prevent synchronous setState during effect mount
      const timer = setTimeout(() => {
        fetchFeedbackList();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, fetchFeedbackList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!title.trim()) {
      setSubmitError(
        t("Please provide a title for your feedback or feature request."),
      );
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setSubmitError(
        t("Please enter a detailed description (at least 10 characters)."),
      );
      return;
    }

    setSubmitting(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        priority,
        userName: userName.trim() || (user ? user.fullName : "Anonymous"),
        userRole: user ? user.role : userRole,
        userDistrict: user ? user.district : userDistrict,
        userPhone: userPhone.trim() || (user ? user.phone : ""),
      };

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setSubmittedFeedback(result.feedback);
        // Refresh feedback list
        fetchFeedbackList();
      } else {
        const err = await res.json();
        setSubmitError(
          err.error ||
            t("Failed to submit platform feedback. Please try again."),
        );
      }
    } catch {
      setSubmitError(
        t("Network communication error. Please check connection."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedFeedback(null);
    setTitle("");
    setDescription("");
    setType("feature_request");
    setPriority("medium");
    setSubmitError("");
  };

  const getTypeBadge = (fbType: FeedbackType) => {
    switch (fbType) {
      case "feature_request":
        return {
          label: t("Feature Request (नयाँ विशेषता)"),
          icon: Lightbulb,
          style:
            "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "bug_report":
        return {
          label: t("Bug Report (त्रुटि समस्या)"),
          icon: AlertTriangle,
          style:
            "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        };
      case "usability_issue":
        return {
          label: t("Usability & Design (डिजाइन अनुभव)"),
          icon: MessageSquare,
          style:
            "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      default:
        return {
          label: t("General Feedback (सामान्य प्रतिक्रिया)"),
          icon: Sparkles,
          style:
            "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
    }
  };

  const getPriorityBadge = (pri: FeedbackPriority) => {
    switch (pri) {
      case "critical":
        return "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold";
      case "high":
        return "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold";
      case "medium":
        return "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "resolved":
        return {
          text: t("Resolved / Deployed (सम्पन्न)"),
          style:
            "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200",
        };
      case "in_progress":
        return {
          text: t("In Progress (काम भइरहेको)"),
          style:
            "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border-indigo-200",
        };
      case "under_review":
        return {
          text: t("Under Review (समीक्षाधीन)"),
          style:
            "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200",
        };
      case "dismissed":
        return {
          text: t("Closed"),
          style:
            "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200",
        };
      default:
        return {
          text: t("Pending Admin Review (प्रतीक्षारत)"),
          style:
            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200",
        };
    }
  };

  const filteredList = feedbackList.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/90 text-emerald-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{t("Platform Feedback & Feature Requests")}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  "Submit requests or report issues directly to the AgriTech administrative engineering team",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            title={t("Close Modal")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 pt-3 pb-0 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 flex space-x-4">
          <button
            onClick={() => setActiveTab("submit")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === "submit"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t("Submit New Feedback / Request")}</span>
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === "explore"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {t("Community Roadmap & Requests")} ({feedbackList.length})
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "submit" ? (
            <div>
              {submittedFeedback ? (
                /* Success Confirmation View */
                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                      {t("Submission Received Successfully!")}
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto mt-1 leading-relaxed">
                      {t(
                        "Thank you for contributing to the long-term enhancement of AgriTech Nepal. Our administrative engineering team evaluates submissions regularly.",
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-left space-y-2 max-w-lg mx-auto">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>
                        {t("Reference ID")}:{" "}
                        <strong className="text-emerald-600 font-bold">
                          {submittedFeedback.id}
                        </strong>
                      </span>
                      <span>
                        {new Date(
                          submittedFeedback.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {submittedFeedback.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {submittedFeedback.description}
                    </div>
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                      <span className="capitalize">
                        {t("Type")}: {submittedFeedback.type.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {t("Priority")}: {submittedFeedback.priority}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">
                        {t("Status")}: {submittedFeedback.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3 pt-2">
                    <button
                      onClick={handleResetForm}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t("Submit Another Request")}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("explore")}
                      className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t("View All Community Requests")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Category Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      1. {t("Select Feedback Category")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: "feature_request",
                          label: t("Feature Request (नयाँ विशेषता)"),
                          desc: t(
                            "Suggest new functionality, reports, or automation",
                          ),
                          icon: Lightbulb,
                          color:
                            "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200",
                        },
                        {
                          id: "bug_report",
                          label: t("Report Issue / Bug (समस्या)"),
                          desc: t(
                            "Report glitches, calculation errors, or system issues",
                          ),
                          icon: AlertTriangle,
                          color:
                            "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200",
                        },
                        {
                          id: "usability_issue",
                          label: t("Usability & Design (डिजाइन अनुभव)"),
                          desc: t(
                            "Feedback on layout, mobile view, or ease of use",
                          ),
                          icon: MessageSquare,
                          color:
                            "border-purple-300 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200",
                        },
                        {
                          id: "general_feedback",
                          label: t("General Suggestion (सामान्य सुझाव)"),
                          desc: t(
                            "General comments or service recommendations",
                          ),
                          icon: Sparkles,
                          color:
                            "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200",
                        },
                      ].map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = type === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setType(cat.id as FeedbackType)}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start space-x-3 ${
                              isSelected
                                ? `${cat.color} shadow-xs ring-1 ring-emerald-500/20`
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? "bg-white/80 dark:bg-slate-800/80"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                {cat.label}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {cat.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority & Title Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Priority */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        2. {t("Urgency / Priority")}
                      </label>
                      <select
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as FeedbackPriority)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="low">{t("Low (निम्न Priority)")}</option>
                        <option value="medium">
                          {t("Medium (मध्यम Priority)")}
                        </option>
                        <option value="high">
                          {t("High (उच्च Priority)")}
                        </option>
                        <option value="critical">
                          {t("Critical (गम्भीर Priority)")}
                        </option>
                      </select>
                    </div>

                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        3. {t("Title / Summary")}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t(
                          "e.g. Add SMS alerts for buyer counter-offers",
                        )}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>

                  {/* Description Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      4. {t("Detailed Explanation")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t(
                        "Describe the feature request or issue in detail. For bug reports, mention steps to reproduce or expected vs actual outcome.",
                      )}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed"
                    />
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-1">
                      {description.length} {t("characters")}
                    </div>
                  </div>

                  {/* Contact & Submitter Information */}
                  <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t("5. Submitter Information")}</span>
                      </span>
                      {user && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                          {t("Authenticated User")}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          {t("Full Name")}
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          disabled={!!user}
                          placeholder={t("Your Name")}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 disabled:opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          {t("District")}
                        </label>
                        <input
                          type="text"
                          value={userDistrict}
                          onChange={(e) => setUserDistrict(e.target.value)}
                          disabled={!!user}
                          placeholder={t("District (e.g. Kathmandu, Dhading)")}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 disabled:opacity-75"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {submitError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Action */}
                  <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-150 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {t("Cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{t("Submitting...")}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-emerald-300" />
                          <span>{t("Submit to AgriTech Team")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Community Roadmap & Requests Explorer */
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    {t("Category")}:
                  </span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium"
                  >
                    <option value="all">{t("All Categories")}</option>
                    <option value="feature_request">
                      {t("Feature Requests")}
                    </option>
                    <option value="bug_report">{t("Bug Reports")}</option>
                    <option value="usability_issue">
                      {t("Usability & Design")}
                    </option>
                    <option value="general_feedback">
                      {t("General Suggestions")}
                    </option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    {t("Status")}:
                  </span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium"
                  >
                    <option value="all">{t("All Statuses")}</option>
                    <option value="pending">{t("Pending Review")}</option>
                    <option value="under_review">{t("Under Review")}</option>
                    <option value="in_progress">{t("In Progress")}</option>
                    <option value="resolved">{t("Resolved / Deployed")}</option>
                  </select>
                </div>
              </div>

              {loadingList ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{t("Loading community roadmap requests...")}</span>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  {t("No feedback entries match the selected filters.")}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredList.map((item) => {
                    const badge = getTypeBadge(item.type);
                    const Icon = badge.icon;
                    const stBadge = getStatusBadge(item.status);

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${badge.style}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${getPriorityBadge(
                                item.priority,
                              )}`}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stBadge.style}`}
                          >
                            {stBadge.text}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Admin Notes / Official Reply */}
                        {item.adminNotes && (
                          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-lg p-2.5 text-xs space-y-1">
                            <div className="font-bold text-[10px] uppercase text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                {t("AgriTech Administrative Response")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                              "{item.adminNotes}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center space-x-1">
                            <span>
                              {item.userName || "User"} (
                              {t(item.userRole || "guest")})
                            </span>
                            {item.userDistrict && (
                              <span>• {t(item.userDistrict)}</span>
                            )}
                          </span>
                          <span>
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {t("Direct line to AgriTech Administrative Team • Kathmandu")}
            </span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
