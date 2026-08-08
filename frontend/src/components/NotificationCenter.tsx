import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ShoppingBag,
  Volume2,
  VolumeX,
  Clock,
  BarChart2,
  Star,
  HelpCircle,
  ChevronRight,
  Handshake,
} from "lucide-react";
import { PriceNotification, User } from "../types";
import { useLanguage } from "../context/LanguageContext";

export type NotificationCategory =
  | "all"
  | "unread"
  | "price_alerts"
  | "negotiations"
  | "orders"
  | "reports"
  | "reviews"
  | "support";

interface NotificationCenterProps {
  user: User | null;
  token: string;
  onNavigateToTab?: (tabName: string) => void;
  onOpenWeatherModal?: () => void;
  onOpenCartModal?: () => void;
  onOpenSupportModal?: () => void;
  onOpenProfileModal?: () => void;
}

export default function NotificationCenter({
  user,
  token,
  onNavigateToTab,
  onOpenWeatherModal,
  onOpenCartModal,
  onOpenSupportModal,
  onOpenProfileModal,
}: NotificationCenterProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<PriceNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterTab, setFilterTab] = useState<NotificationCategory>("all");

  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const haltPollingRef = useRef(false);

  // Gentle audio chime function
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.5);
    } catch {
      // Ignore autoplay restrictions
    }
  };

  // Fetch real notifications from backend API with dynamic localStorage token check
  const fetchNotifications = async (showToastForNew = true) => {
    const currentToken =
      token ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");
    if (!currentToken || !user || haltPollingRef.current) return;

    try {
      const res = await api.get("/notifications/", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      const data: PriceNotification[] = res.data || [];

      setNotifications(data);

      if (showToastForNew && !isFirstLoadRef.current) {
        const newItems = data.filter(
          (n) => !n.isRead && !knownIdsRef.current.has(n.id),
        );
        if (newItems.length > 0) {
          playChime();
          setToasts((prev) => [...newItems, ...prev].slice(0, 4));
        }
      }

      const updatedSet = new Set<string>();
      data.forEach((n) => updatedSet.add(n.id));
      knownIdsRef.current = updatedSet;
      isFirstLoadRef.current = false;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        haltPollingRef.current = true;
      }
      setNotifications([]);
    }
  };

  useEffect(() => {
    haltPollingRef.current = false;
    const currentToken =
      token ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");
    if (currentToken && user) {
      fetchNotifications(false);
      const interval = setInterval(() => fetchNotifications(true), 8000);
      return () => clearInterval(interval);
    }
  }, [token, user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const currentToken =
    token ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");
  if (!currentToken || !user) {
    return null;
  }

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setToasts((prev) => prev.filter((t) => t.id !== id));

    if (currentToken) {
      api
        .patch(
          `/notifications/${id}/read/`,
          { isRead: true },
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          },
        )
        .catch(() => {});
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setToasts([]);
    if (currentToken) {
      api
        .post(
          "/notifications/read-all/",
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          },
        )
        .catch(() => {});
    }
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToasts((prev) => prev.filter((t) => t.id !== id));

    if (currentToken) {
      api
        .delete(`/notifications/${id}/`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        })
        .catch(() => {});
    }
  };

  const handleNotificationClick = (notif: PriceNotification) => {
    handleMarkAsRead(notif.id);
    setIsOpen(false);

    const titleLower = notif.title.toLowerCase();
    if (titleLower.includes("weather") && onOpenWeatherModal) {
      onOpenWeatherModal();
    } else if (titleLower.includes("coupon") && onOpenCartModal) {
      onOpenCartModal();
    } else if (
      titleLower.includes("support") ||
      titleLower.includes("ticket")
    ) {
      if (onOpenSupportModal) onOpenSupportModal();
    } else if (titleLower.includes("review") && onOpenProfileModal) {
      onOpenProfileModal();
    } else if (titleLower.includes("report") || titleLower.includes("price")) {
      if (onNavigateToTab) onNavigateToTab("public_prices");
    } else if (
      titleLower.includes("demand") ||
      titleLower.includes("negotiation") ||
      titleLower.includes("order")
    ) {
      if (onNavigateToTab) onNavigateToTab("b2b_hub");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const categoryHasItems = (catKey: NotificationCategory) => {
    if (catKey === "all") return notifications.length > 0;
    if (catKey === "unread") return unreadCount > 0;

    return notifications.some((n) => {
      const lower = (n.title + " " + n.message).toLowerCase();
      if (catKey === "price_alerts")
        return (
          lower.includes("price") ||
          lower.includes("alert") ||
          lower.includes("rate") ||
          lower.includes("threshold") ||
          lower.includes("surged")
        );
      if (catKey === "negotiations")
        return (
          lower.includes("negotiat") ||
          lower.includes("counter") ||
          lower.includes("offer")
        );
      if (catKey === "orders")
        return (
          lower.includes("order") ||
          lower.includes("demand") ||
          lower.includes("accept")
        );
      if (catKey === "reports")
        return (
          lower.includes("report") ||
          lower.includes("trend") ||
          lower.includes("analytic")
        );
      if (catKey === "reviews")
        return (
          lower.includes("review") ||
          lower.includes("star") ||
          lower.includes("rating")
        );
      if (catKey === "support")
        return (
          lower.includes("support") ||
          lower.includes("ticket") ||
          lower.includes("admin")
        );
      return false;
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "unread") return !n.isRead;
    const lower = (n.title + " " + n.message).toLowerCase();
    if (filterTab === "price_alerts")
      return (
        lower.includes("price") ||
        lower.includes("alert") ||
        lower.includes("rate") ||
        lower.includes("threshold") ||
        lower.includes("surged")
      );
    if (filterTab === "negotiations")
      return (
        lower.includes("negotiat") ||
        lower.includes("counter") ||
        lower.includes("offer")
      );
    if (filterTab === "orders")
      return (
        lower.includes("order") ||
        lower.includes("demand") ||
        lower.includes("accept")
      );
    if (filterTab === "reports")
      return (
        lower.includes("report") ||
        lower.includes("trend") ||
        lower.includes("analytic")
      );
    if (filterTab === "reviews")
      return (
        lower.includes("review") ||
        lower.includes("star") ||
        lower.includes("rating")
      );
    if (filterTab === "support")
      return (
        lower.includes("support") ||
        lower.includes("ticket") ||
        lower.includes("admin")
      );
    return true;
  });

  const formatTimeAgo = (isoString: string) => {
    const diffSeconds = Math.floor(
      (new Date().getTime() - new Date(isoString).getTime()) / 1000,
    );
    if (diffSeconds < 30) return t("Just now");
    if (diffSeconds < 3600)
      return `${Math.floor(diffSeconds / 60)}m ${t("ago")}`;
    if (diffSeconds < 86400)
      return `${Math.floor(diffSeconds / 3600)}h ${t("ago")}`;
    return new Date(isoString).toLocaleDateString();
  };

  const getCategoryIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (
      lower.includes("negotiat") ||
      lower.includes("counter") ||
      lower.includes("offer")
    ) {
      return (
        <Handshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      );
    }
    if (
      lower.includes("order") ||
      lower.includes("demand") ||
      lower.includes("accept")
    ) {
      return <ShoppingBag className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
    if (
      lower.includes("report") ||
      lower.includes("trend") ||
      lower.includes("analytic")
    ) {
      return <BarChart2 className="w-4 h-4 text-purple-500 shrink-0" />;
    }
    if (
      lower.includes("review") ||
      lower.includes("star") ||
      lower.includes("rating")
    ) {
      return <Star className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (lower.includes("support") || lower.includes("ticket")) {
      return <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    return (
      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
    );
  };

  const allCategoryTabs: [NotificationCategory, string][] = [
    ["all", "All"],
    ["unread", "Unread"],
    ["price_alerts", "Price Alerts"],
    ["negotiations", "Negotiations"],
    ["orders", "Orders"],
    ["reports", "Reports"],
    ["reviews", "Reviews"],
    ["support", "Support"],
  ];

  const activeCategoryTabs = allCategoryTabs.filter(([catKey]) => {
    if (catKey === "all" || catKey === "unread")
      return notifications.length > 0;
    return categoryHasItems(catKey);
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer shadow-xs relative flex items-center justify-center"
        title={t("Notifications & Live Alerts (अधिसूचनाहरू)")}
        id="notification-bell-trigger"
        aria-label="Toggle notifications"
      >
        <Bell className="w-4.5 h-4.5" />

        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-400 rounded-full animate-ping opacity-75"></span>
          </>
        )}
      </button>

      {/* NOTIFICATION POPOVER DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans transition-all duration-200 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white flex items-center space-x-1.5">
                  <span>{t("Notifications & Alerts")}</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                      {unreadCount} {t("new")}
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {t("Price Alerts, Negotiations, Orders & Support")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title={
                  soundEnabled ? "Disable audio chime" : "Enable audio chime"
                }
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center space-x-1 text-xs font-semibold"
                  title={t("Mark all as read")}
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Filter Category Scrollable Tabs */}
          {activeCategoryTabs.length > 1 && (
            <div className="flex items-center overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-2 pt-1 text-[11px] no-scrollbar whitespace-nowrap">
              {activeCategoryTabs.map(([catKey, label]) => (
                <button
                  key={catKey}
                  onClick={() => setFilterTab(catKey)}
                  className={`px-2.5 py-1.5 font-bold border-b-2 transition cursor-pointer ${
                    filterTab === catKey
                      ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">
                  {t("No notifications found")}
                </p>
                <p className="text-[10px] mt-1 text-slate-400">
                  {t("New alerts will appear here in real-time.")}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 transition cursor-pointer flex items-start space-x-2.5 group ${
                    !notif.isRead
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                      !notif.isRead
                        ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {getCategoryIcon(notif.title)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold leading-tight truncate ${
                          !notif.isRead
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span
                          className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"
                          title="Unread"
                        />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed break-words">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400">
                      <span className="flex items-center space-x-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgo(notif.created_at)}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                          View &rarr;
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(notif.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>
              {notifications.length} {t("total notifications")}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToTab) onNavigateToTab("public_prices");
              }}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center space-x-0.5 cursor-pointer"
            >
              <span>{t("View Price Alerts")}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING TOAST ALERTS OVERLAY */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-emerald-500/40 dark:border-emerald-500/50 p-4 shadow-2xl transition-all duration-300 animate-in slide-in-from-top-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />

            <div className="flex items-start space-x-3 pl-1">
              <div className="p-2 rounded-xl shrink-0 mt-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {getCategoryIcon(toast.title)}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>{toast.title}</span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-snug break-words">
                  {toast.message}
                </p>

                <div className="flex items-center space-x-3 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(toast)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    {t("View Details")}
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTimeAgo(toast.created_at)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
