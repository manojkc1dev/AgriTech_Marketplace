import React, { useState, useEffect } from "react";
import { User, MarketPrice, PlatformFeedback } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Check,
  RefreshCw,
  AlertCircle,
  MapPin,
  UserCheck,
  BarChart3,
  PieChartIcon,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Trash2,
  Edit3,
  ShieldCheck,
  XCircle,
  Eye,
  FileText,
  Building2,
  X,
  UserPlus,
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

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pending users
      const pendingRes = await fetch("/api/admin/users/pending-verification", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pendingRes.ok) {
        setPendingUsers(await pendingRes.json());
      }

      // 2. Fetch trending crops analytics
      const analyticsRes = await fetch("/api/admin/analytics/trending-crops");
      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }

      // 3. Fetch platform feedback items
      const feedbackRes = await fetch("/api/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (feedbackRes.ok) {
        setFeedbackItems(await feedbackRes.json());
      }
    } catch (e) {
      console.error("Error loading admin datasets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token, activeTab]);

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
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          fullName: newFullName.trim(),
          password: newPassword.trim(),
          role: newRole,
          district: newDistrict,
          phone: newPhone.trim(),
        }),
      });

      if (res.ok) {
        setCreateUserSuccess(
          `Successfully provisioned new ${newRole} account for ${newFullName}!`,
        );
        setNewUsername("");
        setNewFullName("");
        setNewPassword("");
        setNewPhone("");
        fetchAdminData();
      } else {
        const err = await res.json();
        setCreateUserError(err.error || "Failed to create user account.");
      }
    } catch (e) {
      setCreateUserError("Network communication error while creating user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const [previewImage, setPreviewImage] = useState<{
    title: string;
    url: string;
  } | null>(null);

  const handleVerifyUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert(
          "User Citizenship & National Identity Card credentials approved and activated!",
        );
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
      "Enter reason for rejecting verification (e.g. Image blurry, incomplete National ID):",
      "Document image was unclear or illegible.",
    );
    if (reason === null) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reason }),
      });

      if (res.ok) {
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
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotesInput.trim(),
        }),
      });

      if (res.ok) {
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
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to delete feedback entry.");
      }
    } catch (e) {
      console.error("Error deleting feedback:", e);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const pendingFeedbackCount = feedbackItems.filter(
    (f) => f.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-200/90 dark:border-slate-800 pb-3 pt-1">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 overflow-x-auto no-scrollbar py-1">
          {/* Verification Tab */}
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 relative ${
              activeTab === "verify"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <UserCheck
              className={`w-4 h-4 ${activeTab === "verify" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
            />
            <span>
              {t("Verification")} ({pendingUsers.length})
            </span>
            {pendingUsers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
            )}
          </button>

          {/* Create User Tab */}
          <button
            onClick={() => setActiveTab("create-user")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "create-user"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <UserPlus
              className={`w-4 h-4 ${activeTab === "create-user" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
            />
            <span>{t("Add Users")}</span>
          </button>

          {/* Market Analysis Tab */}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "analytics"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <BarChart3
              className={`w-4 h-4 ${activeTab === "analytics" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
            />
            <span>{t("Market Analysis")}</span>
          </button>

          {/* Feedback Tab */}
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 relative ${
              activeTab === "feedback"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <MessageSquare
              className={`w-4 h-4 ${activeTab === "feedback" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
            />
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
                Cards (NIN) for Buyers and Farmers
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
                  className="p-5 hover:bg-slate-50/50 transition duration-150 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase font-mono ${
                            u.role === "farmer"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base font-display">
                          {u.fullName}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 font-sans">
                        <span>
                          District:{" "}
                          <strong className="text-slate-800">
                            {u.district}
                          </strong>
                        </span>
                        <span>
                          Phone:{" "}
                          <strong className="text-slate-800 font-mono">
                            {u.phone}
                          </strong>
                        </span>
                        <span>
                          Username:{" "}
                          <strong className="font-mono text-slate-700">
                            {u.username}
                          </strong>
                        </span>
                        <span>
                          Submitted:{" "}
                          <strong className="font-mono text-slate-700">
                            {u.verificationSubmittedAt
                              ? new Date(
                                  u.verificationSubmittedAt,
                                ).toLocaleDateString()
                              : "Pending Upload"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleRejectUser(u.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center space-x-1 transition duration-150 shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleVerifyUser(u.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition duration-150 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve User & Unlock Trading</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Scans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    {/* Citizenship Card */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Citizenship Card (नागरिकता)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {u.citizenshipNumber || "Not Entered"}
                        </span>
                      </div>

                      {u.citizenshipDocUrl ? (
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.citizenshipDocUrl}
                            alt="Citizenship Document"
                            className="w-20 h-14 object-cover rounded border border-slate-200 bg-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                title: `Citizenship Card - ${u.fullName}`,
                                url: u.citizenshipDocUrl!,
                              })
                            }
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Scan</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-rose-500 italic py-2">
                          No Citizenship Document Uploaded
                        </p>
                      )}
                    </div>

                    {/* National Identity Card (NIN) */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>National Identity Card (NIN)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {u.nationalIdNumber || "Not Entered"}
                        </span>
                      </div>

                      {u.nationalIdDocUrl ? (
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.nationalIdDocUrl}
                            alt="National ID Document"
                            className="w-20 h-14 object-cover rounded border border-slate-200 bg-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                title: `National Identity Card - ${u.fullName}`,
                                url: u.nationalIdDocUrl!,
                              })
                            }
                            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Scan</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-rose-500 italic py-2">
                          No National Identity Card Uploaded
                        </p>
                      )}
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
              Provision New User Account (Farmer, Buyer, Cooperative)
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
                  placeholder="e.g. buyer_shyam or coop_himalayan"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 font-mono transition"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
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
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition font-semibold"
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
                  Secure Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  District Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9841000000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 font-mono transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingUser}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition duration-150 shadow-sm mt-2 flex items-center justify-center space-x-2"
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
          {/* Crop demand and supply bar chart */}
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
                      name="Active Listings (Farmer Supply)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="demandCount"
                      name="B2B Demand Requests"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="orderCount"
                      name="Closed Deals"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No analytics logs.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Index Average */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <span>Price Volatility Index</span>
            </h3>

            <div className="h-64 mt-2 flex flex-col justify-between">
              {analytics.length > 0 ? (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={65}
                        fill="#8884d8"
                        dataKey="avgPrice"
                        label={({ name, percent = 0 }) =>
                          `${name} (${Math.round(percent * 100)}%)`
                        }
                      >
                        {analytics.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No analytics logs.
                </div>
              )}

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    Most Volatile: <strong>Tomato (Golbheda)</strong>
                  </span>
                  <span>
                    Highest Price crop: <strong>Ginger (Aduwa)</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Platform Feedback Management */}
      {activeTab === "feedback" && (
        <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold font-display text-slate-800 dark:text-slate-100 text-base flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>AgriTech Service Quality & Feature Requests</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review submitted feedback, set development statuses, and reply
                with administrative notes
              </p>
            </div>

            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
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
              {feedbackItems.map((fb) => {
                const isEditing = editingFeedbackId === fb.id;

                return (
                  <div
                    key={fb.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-white dark:hover:bg-slate-850 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-full text-[10px] uppercase">
                          {fb.type.replace("_", " ")}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold rounded-full text-[10px] uppercase">
                          {fb.priority} Priority
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          #{fb.id}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            fb.status === "resolved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : fb.status === "in_progress"
                                ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                                : fb.status === "under_review"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {fb.status.replace("_", " ")}
                        </span>

                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingFeedbackId(null);
                            } else {
                              setEditingFeedbackId(fb.id);
                              setNewStatus(fb.status);
                              setAdminNotesInput(fb.adminNotes || "");
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Manage / Respond"
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

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {fb.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {fb.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span>
                        Submitter: <strong>{fb.userName || "User"}</strong>
                      </span>
                      <span>
                        Role:{" "}
                        <strong className="capitalize">{fb.userRole}</strong>
                      </span>
                      {fb.userDistrict && (
                        <span>
                          District: <strong>{fb.userDistrict}</strong>
                        </span>
                      )}
                      {fb.userPhone && (
                        <span>
                          Phone:{" "}
                          <strong className="font-mono">{fb.userPhone}</strong>
                        </span>
                      )}
                      <span>
                        Date: {new Date(fb.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Admin Response Box */}
                    {fb.adminNotes && !isEditing && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                        <div className="font-bold text-[10px] uppercase flex items-center space-x-1 text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>AgriTech Super Admin Reply / Note</span>
                        </div>
                        <p className="text-xs italic">{fb.adminNotes}</p>
                      </div>
                    )}

                    {/* Admin Edit Controls Form */}
                    {isEditing && (
                      <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 p-4 rounded-xl space-y-3 mt-3 animate-in fade-in duration-150">
                        <div className="font-bold text-xs uppercase text-emerald-800 dark:text-emerald-400 flex items-center space-x-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Update Status & Super Admin Notes</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Set Development Status
                            </label>
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold"
                            >
                              <option value="pending">
                                Pending Review (प्रतीक्षारत)
                              </option>
                              <option value="under_review">
                                Under Review (समीक्षाधीन)
                              </option>
                              <option value="in_progress">
                                In Progress (विकास भइरहेको)
                              </option>
                              <option value="resolved">
                                Resolved / Deployed (सम्पन्न)
                              </option>
                              <option value="dismissed">
                                Dismissed (खारेज)
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Super Admin Response Note
                            </label>
                            <input
                              type="text"
                              value={adminNotesInput}
                              onChange={(e) =>
                                setAdminNotesInput(e.target.value)
                              }
                              placeholder="e.g. Evaluating shortcode gateway with Ncell."
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            onClick={() => setEditingFeedbackId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateFeedbackStatus(fb.id)}
                            disabled={updatingFeedback}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                          >
                            {updatingFeedback
                              ? "Saving..."
                              : "Save Super Admin Response"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal for Document Verification Scans */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm font-display">
                {previewImage.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-2 flex items-center justify-center min-h-[300px]">
              <img
                src={previewImage.url}
                alt="Document Verification Scan"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
