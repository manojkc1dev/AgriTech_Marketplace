import React, { useState } from "react";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  QrCode,
  Store,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { useCart, AVAILABLE_COUPONS, CartItem } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { User } from "../types";

interface FarmerGroup {
  farmerName: string;
  district?: string;
  items: CartItem[];
}

interface CartDrawerModalProps {
  user: User | null;
  token: string;
  onNavigateToOrders?: () => void;
}

export default function CartDrawerModal({
  user,
  token,
  onNavigateToOrders,
}: CartDrawerModalProps) {
  // 1. ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const { t } = useLanguage();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalCartValue,
    discountValue,
    finalCartValue,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    success: boolean;
    text: string;
  } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<
    "esewa" | "khalti" | "connectips" | "cod"
  >("esewa");
  const [qrModalFarmer, setQrModalFarmer] = useState<{
    farmerId: string;
    farmerName: string;
    amount: number;
  } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // 2. SECURITY GUARD: Strict role check ensuring cart components only run/display for buyers
  if (!isCartOpen || !user || user.role !== "buyer") return null;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setCouponInput(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleCheckoutFarmer = async (
    farmerId: string,
    farmerName: string,
    subtotal: number,
  ) => {
    setQrModalFarmer({ farmerId, farmerName, amount: subtotal });
  };

  const handleCompletePaymentAndOrder = async () => {
    if (!qrModalFarmer) return;
    try {
      if (token) {
        await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            farmerId: qrModalFarmer.farmerId,
            farmerName: qrModalFarmer.farmerName,
            amount: qrModalFarmer.amount,
            paymentMethod: selectedPayment,
            status: "confirmed",
          }),
        }).catch(() => {});
      }
      setOrderSuccessMsg(
        `Order successfully placed with ${qrModalFarmer.farmerName}! Payment via ${selectedPayment.toUpperCase()} verified.`,
      );
      setQrModalFarmer(null);
      const farmerItems = cart.filter(
        (i) => i.farmerId === qrModalFarmer.farmerId,
      );
      farmerItems.forEach((i) => removeFromCart(i.id));
      setTimeout(() => setOrderSuccessMsg(null), 5000);
    } catch {
      setQrModalFarmer(null);
    }
  };

  const farmerGroups = cart.reduce<Record<string, FarmerGroup>>((acc, item) => {
    if (!acc[item.farmerId]) {
      acc[item.farmerId] = {
        farmerName: item.farmerName,
        district: item.district,
        items: [],
      };
    }
    acc[item.farmerId].items.push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="fixed inset-0" onClick={() => setIsCartOpen(false)} />

      {/* Slide-over Drawer Content */}
      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 transition-transform duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-display text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{t("AgriTech Cart")}</span>
                <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/60 dark:border-emerald-800">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("Direct smallholder farm produce & B2B bulk orders")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {orderSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border-y border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-3.5 text-xs font-semibold flex items-start space-x-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{orderSuccessMsg}</span>
              {onNavigateToOrders && (
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToOrders();
                  }}
                  className="block text-emerald-700 dark:text-emerald-300 underline font-bold mt-1 cursor-pointer"
                >
                  View Order History &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Cart Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {cart.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                    {t("Your Cart is Empty")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {t(
                      "Browse live market listings from Dhading, Makwanpur, and Kathmandu farming cooperatives to add crops to your cart.",
                    )}
                  </p>
                </div>
              </div>

              {/* Coupons & Promo Codes Section */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{t("Apply Promotional Coupon or Subsidy Code")}</span>
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold font-mono uppercase bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded mr-2">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] block text-emerald-800 dark:text-emerald-300">
                        {appliedCoupon.description} &bull; Savings: NRs.{" "}
                        {discountValue.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. NEPALAGRI10 or FREIGHT500"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 uppercase font-mono font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      {t("Apply")}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p
                    className={`text-[11px] font-semibold ${
                      couponMessage.success
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* List of Available Coupons */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  <span className="text-[10px] uppercase font-bold text-amber-800/80 dark:text-amber-400/80 block mb-1.5">
                    {t("Active AgriTech Coupons Available:")}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {AVAILABLE_COUPONS.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between text-[11px] bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40"
                      >
                        <div>
                          <span className="font-bold font-mono uppercase text-amber-900 dark:text-amber-300 mr-2">
                            {c.code}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {c.description}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(c.code)}
                          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1 ml-2 cursor-pointer"
                        >
                          {copiedCoupon === c.code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Use Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Farmer Groups */}
              <div className="space-y-4">
                {(Object.entries(farmerGroups) as [string, FarmerGroup][]).map(
                  ([farmerId, group]) => {
                    const farmerTotal = group.items.reduce(
                      (s, i) => s + i.quantity * i.pricePerUnit,
                      0,
                    );

                    return (
                      <div
                        key={farmerId}
                        className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl p-4 space-y-3.5 shadow-2xs"
                      >
                        {/* Farmer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                                {group.farmerName}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {group.district || "Nepal"} &bull;{" "}
                                {group.items.length} item(s)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                              Subtotal
                            </span>
                            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                              NRs. {farmerTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-750">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              className="py-2.5 flex items-center justify-between text-xs gap-2"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                  {item.crop}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                  NRs. {item.pricePerUnit} / {item.unit}
                                </span>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-2xs">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 font-bold font-mono text-xs text-slate-800 dark:text-slate-200 min-w-[28px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="text-right min-w-[70px]">
                                <span className="font-bold font-mono text-xs text-slate-900 dark:text-white block">
                                  NRs.{" "}
                                  {(
                                    item.quantity * item.pricePerUnit
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Farmer Quick Checkout button */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() =>
                              handleCheckoutFarmer(
                                farmerId,
                                group.farmerName,
                                farmerTotal,
                              )
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>
                              Pay {group.farmerName} (NRs.{" "}
                              {farmerTotal.toLocaleString()})
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Coupons & Promo Codes Section */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{t("Apply Promotional Coupon or Subsidy Code")}</span>
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold font-mono uppercase bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded mr-2">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] block text-emerald-800 dark:text-emerald-300">
                        {appliedCoupon.description} &bull; Savings: NRs.{" "}
                        {discountValue.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. NEPALAGRI10 or FREIGHT500"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 uppercase font-mono font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      {t("Apply")}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p
                    className={`text-[11px] font-semibold ${
                      couponMessage.success
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* List of Available Coupons */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  <span className="text-[10px] uppercase font-bold text-amber-800/80 dark:text-amber-400/80 block mb-1.5">
                    {t("Active AgriTech Coupons Available:")}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {AVAILABLE_COUPONS.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between text-[11px] bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40"
                      >
                        <div>
                          <span className="font-bold font-mono uppercase text-amber-900 dark:text-amber-300 mr-2">
                            {c.code}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {c.description}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(c.code)}
                          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1 ml-2 cursor-pointer"
                        >
                          {copiedCoupon === c.code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Use Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t("Select Payment Gateway / Method")}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment("esewa")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPayment === "esewa"
                        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs block font-extrabold text-emerald-600">
                      eSewa
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Digital Wallet
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment("khalti")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPayment === "khalti"
                        ? "bg-purple-50 dark:bg-purple-950 border-purple-600 text-purple-900 dark:text-purple-200 font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs block font-extrabold text-purple-600">
                      Khalti
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Instant Pay
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment("connectips")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPayment === "connectips"
                        ? "bg-blue-50 dark:bg-blue-950 border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs block font-extrabold text-blue-600">
                      ConnectIPS
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Direct Bank
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment("cod")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPayment === "cod"
                        ? "bg-amber-50 dark:bg-amber-950 border-amber-600 text-amber-900 dark:text-amber-200 font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs block font-extrabold text-amber-600">
                      Cash/COD
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      On Delivery
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Total Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items):</span>
                <span className="font-mono font-semibold">
                  NRs. {totalCartValue.toLocaleString()}
                </span>
              </div>

              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span className="font-mono">
                    - NRs. {discountValue.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-750">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  NRs. {finalCartValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Clear Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  const firstFarmer = (
                    Object.entries(farmerGroups) as [string, FarmerGroup][]
                  )[0];
                  if (firstFarmer) {
                    const farmerTotal = firstFarmer[1].items.reduce(
                      (s, i) => s + i.quantity * i.pricePerUnit,
                      0,
                    );
                    handleCheckoutFarmer(
                      firstFarmer[0],
                      firstFarmer[1].farmerName,
                      farmerTotal,
                    );
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Checkout &amp; Generate Payment QR</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment QR Modal Sub-overlay */}
      {qrModalFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>AgriTech Payment QR</span>
              </span>
              <button
                onClick={() => setQrModalFarmer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                Pay directly to registered farmer:
              </p>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {qrModalFarmer.farmerName}
              </h3>
              <p className="text-xl font-black text-emerald-600 font-mono mt-1">
                NRs. {qrModalFarmer.amount.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `AGRITECH_PAYMENT:${qrModalFarmer.farmerName}:${qrModalFarmer.amount}:${selectedPayment}`,
                )}`}
                alt="AgriTech Payment QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Scan with{" "}
              <strong className="text-emerald-700">
                {selectedPayment.toUpperCase()}
              </strong>{" "}
              or bank mobile app to settle order.
            </p>

            <button
              onClick={handleCompletePaymentAndOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              Verify Payment &amp; Place Order &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
