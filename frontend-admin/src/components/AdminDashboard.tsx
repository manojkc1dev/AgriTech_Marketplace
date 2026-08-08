import React, { useState, useEffect, useCallback } from "react";
import type { User, PlatformFeedback } from "../types";
import { api } from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Check,
  RefreshCw,
  UserCheck,
  BarChart3,
  MessageSquare,
  Trash2,
  XCircle,
  UserPlus,
  Edit3,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface AdminProps {
  user: User;
  token: string;
}

interface CropAnalytic {
  crop: string;
  listingCount: number;
  demandCount: number;
  orderCount: number;
  avgPrice: number;
  volatilityScore: number;
}

export default function AdminDashboard({ user, token }: AdminProps) {
  const { t } = useLanguage();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<CropAnalytic[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<PlatformFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "verify" | "create-user" | "analytics" | "feedback"
  >("verify");

  // Feedback admin controls state
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotesInput, setAdminNotesInput] = useState<string>("");
  const [updatingFeedback, setUpdatingFeedback] = useState(false);

  // Create User form state
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<
    "farmer" | "buyer" | "cooperative" | "admin"
  >("farmer");
  const [newDistrict, setNewDistrict] = useState("Kathmandu");
  const [newPhone, setNewPhone] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch pending users, analytics, and feedback concurrently
      const [pendingRes, analyticsRes, feedbackRes] = await Promise.all([
        api.get("/admin/users/pending-verification/"),
        api.get("/admin/analytics/trending-crops/"),
        api.get("/feedback/"),
      ]);

      setPendingUsers(pendingRes.data.data || pendingRes.data);
      setAnalytics(analyticsRes.data);
      setFeedbackItems(feedbackRes.data);
    } catch (e) {
      console.error("Error loading admin datasets:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Microtask deferral avoids synchronous setState inside effect stack frame
    queueMicrotask(() => {
      if (isMounted) {
        fetchAdminData();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token, activeTab, fetchAdminData]);

  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess("");

    if (!newUsername.trim() || !newFullName.trim() || !newPassword.trim()) {
      setCreateUserError("Please fill out username, full name, and password.");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await api.post("/admin/users/create/", {
        username: newUsername.trim(),
        full_name: newFullName.trim(),
        password: newPassword.trim(),
        role: newRole,
        district: newDistrict,
        phone: newPhone.trim(),
      });

      if (res.status === 201 || res.status === 200) {
        setCreateUserSuccess(
          `Successfully provisioned new ${newRole} account for ${newFullName}!`,
        );
        setNewUsername("");
        setNewFullName("");
        setNewPassword("");
        setNewPhone("");
        fetchAdminData();
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setCreateUserError(
        err.response?.data?.error || "Failed to create user account.",
      );
    } finally {
      setCreatingUser(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const res = await api.post(`/admin/users/${userId}/verify/`);
      if (res.status === 200) {
        alert("User verification approved!");
        fetchAdminData();
      } else {
        alert("Verification failed.");
      }
    } catch (e) {
      console.error("Failed to verify user:", e);
    }
  };

  const handleRejectUser = async (userId: string) => {
    const reason = prompt(
      "Enter reason for rejecting verification:",
      "Document image was unclear or illegible.",
    );
    if (reason === null) return;

    try {
      const res = await api.post(`/admin/users/${userId}/reject/`, {
        notes: reason,
      });

      if (res.status === 200) {
        alert("User verification request rejected.");
        fetchAdminData();
      } else {
        alert("Failed to reject user.");
      }
    } catch (e) {
      console.error("Failed to reject user:", e);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string) => {
    if (!newStatus) return;
    setUpdatingFeedback(true);
    try {
      const res = await api.patch(`/feedback/${feedbackId}/`, {
        status: newStatus,
        adminNotes: adminNotesInput.trim(),
      });

      if (res.status === 200) {
        setEditingFeedbackId(null);
        setNewStatus("");
        setAdminNotesInput("");
        fetchAdminData();
      } else {
        alert("Failed to update feedback submission status.");
      }
    } catch (e) {
      console.error("Error updating feedback:", e);
    } finally {
      setUpdatingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback submission?"))
      return;
    try {
      const res = await api.delete(`/feedback/${feedbackId}/`);
      if (res.status === 200 || res.status === 204) {
        fetchAdminData();
      } else {
        alert("Failed to delete feedback entry.");
      }
    } catch (e) {
      console.error("Error deleting feedback:", e);
    }
  };

  const pendingFeedbackCount = feedbackItems.filter(
    (f) => f.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Admin User Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold tracking-wide">
              Logged in as: {user.fullName || user.username}
            </h2>
            <p className="text-xs text-slate-400">
              Role:{" "}
              <span className="uppercase text-emerald-400 font-mono font-bold">
                {user.role || "ADMIN"}
              </span>
            </p>
          </div>
        </div>
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Syncing Data...</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-200/90 dark:border-slate-800 pb-3 pt-1">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "verify"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {t("Verification")} ({pendingUsers.length})
            </span>
            {pendingUsers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("create-user")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "create-user"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t("Add Users")}</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t("Market Analysis")}</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "feedback"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {t("Feedback")} ({feedbackItems.length})
            </span>
            {pendingFeedbackCount > 0 && (
              <span className="ml-1 px-1.5 py-0.25 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingFeedbackCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab: Verification Queue */}
      {activeTab === "verify" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Super Admin KYC Verification Queue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mandatory verification of Citizenship Cards & National Identity
                Cards (NIN)
              </p>
            </div>
            <span className="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-mono">
              {pendingUsers.length} Pending Approvals
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm italic">
                All user accounts across districts are verified. Great job!
              </div>
            ) : (
              pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-5 hover:bg-slate-50/50 transition space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {u.role ? u.role.toUpperCase() : "USER"}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">
                          {u.fullName || u.username}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          District:{" "}
                          <strong className="text-slate-800">
                            {u.district || "N/A"}
                          </strong>
                        </span>
                        <span>
                          Phone:{" "}
                          <strong className="text-slate-800 font-mono">
                            {u.phone || "N/A"}
                          </strong>
                        </span>
                        <span>
                          Username:{" "}
                          <strong className="font-mono text-slate-700">
                            {u.username}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleRejectUser(u.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleVerifyUser(u.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve User & Unlock Trading</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Add User Account */}
      {activeTab === "create-user" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-5 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold font-display text-slate-800 text-base tracking-wide uppercase">
              Provision New User Account
            </h3>
          </div>

          <form onSubmit={handleAdminCreateUser} className="space-y-4">
            {createUserError && (
              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                {createUserError}
              </div>
            )}
            {createUserSuccess && (
              <div className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                {createUserSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  System Username ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. buyer_shyam"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shyam Bahadur"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Account Role Type
                </label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(
                      e.target.value as
                        | "farmer"
                        | "buyer"
                        | "cooperative"
                        | "admin",
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 font-semibold"
                >
                  <option value="farmer">Farmer (किसान)</option>
                  <option value="buyer">Buyer / Merchant (खरीददार)</option>
                  <option value="cooperative">
                    Cooperative / Samiti (सहकारी)
                  </option>
                  <option value="admin">Super Admin (सुपर एडमिन)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  District Location
                </label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700"
                >
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Dhading">Dhading</option>
                  <option value="Makwanpur">Makwanpur</option>
                  <option value="Chitwan">Chitwan</option>
                  <option value="Kavre">Kavre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9841000000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Secure Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingUser}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm mt-2 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {creatingUser
                  ? "Provisioning..."
                  : `Create & Authorize ${newRole.toUpperCase()} Account`}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Analytics reports */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Listing vs Demand volume</span>
            </h3>

            <div className="h-64 mt-2">
              {analytics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="crop"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "none",
                        color: "#f8fafc",
                      }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar
                      dataKey="listingCount"
                      name="Active Listings"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="demandCount"
                      name="Demand Requests"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No analytics logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Platform Feedback Management */}
      {activeTab === "feedback" && (
        <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold font-display text-slate-800 dark:text-slate-100 text-base flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>AgriTech Service Quality & Feature Requests</span>
              </h3>
            </div>

            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Submissions</span>
            </button>
          </div>

          {feedbackItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No platform feedback submissions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackItems.map((fb) => (
                <div
                  key={fb.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-850/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {fb.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {fb.status || "pending"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingFeedbackId(fb.id);
                          setNewStatus(fb.status || "reviewed");
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Update Status"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {fb.description}
                  </p>

                  {/* Status Edit Controls */}
                  {editingFeedbackId === fb.id && (
                    <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center space-x-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="text-xs bg-white border border-slate-300 rounded-lg p-1.5"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Admin notes (optional)..."
                          value={adminNotesInput}
                          onChange={(e) => setAdminNotesInput(e.target.value)}
                          className="text-xs bg-white border border-slate-300 rounded-lg p-1.5 flex-1"
                        />

                        <button
                          onClick={() => handleUpdateFeedbackStatus(fb.id)}
                          disabled={updatingFeedback}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                        >
                          {updatingFeedback ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
