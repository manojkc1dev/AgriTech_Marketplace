import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { User, ProduceListing, Order, Negotiation, DemandPost, PriceAlert, PriceNotification, OrderStatus } from "../types";
import { 
  Search, ShoppingCart, Plus, Check, X, Send, History, ChevronUp, ChevronDown, 
  DollarSign, Store, ClipboardList, Bell, Mail, Trash2, ToggleLeft, ToggleRight, 
  Play, CheckCircle2, Eye, ShieldCheck, AlertTriangle, AlertCircle, UserCheck, 
  QrCode, Download, Printer, Copy, CreditCard, Sparkles, ArrowRight, Minus,
  Sprout, ShoppingBag
} from "lucide-react";
import SupplyChainTracker from "./SupplyChainTracker";
import KycVerificationModal from "./KycVerificationModal";
import { NegotiationQrCard } from "./NegotiationQrCard";
import { SendOrderQrModal } from "./SendOrderQrModal";
import { useLanguage } from "../context/LanguageContext";

export interface CartItem {
  id: string;
  listingId: string;
  crop: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  farmerId: string;
  farmerName: string;
  district?: string;
  listing: ProduceListing;
}

export interface PaymentQRModalData {
  farmerId: string;
  farmerName: string;
  farmerDistrict?: string;
  items: Array<{
    crop: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    subtotal: number;
  }>;
  totalCashAmount: number;
  qrDataUrl: string;
  orderIds?: string[];
  created_at: string;
}

interface BuyerProps {
  user: User;
  token: string;
}

export default function BuyerDashboard({ user, token }: BuyerProps) {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "demands" | "orders" | "price_alerts">("listings");

  // --- CART & PAYMENT QR STATES ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentQRModal, setPaymentQRModal] = useState<PaymentQRModalData | null>(null);
  const [qrCopySuccess, setQrCopySuccess] = useState(false);

  // Search & Filter Farmer Listings state
  const [filterCrop, setFilterCrop] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  // Post Demand Form state
  const [demandCrop, setDemandCrop] = useState("Tomato (Golbheda)");
  const [demandQty, setDemandQty] = useState("");
  const [demandPrice, setDemandPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Place Order Modal/Form state (per listing ID)
  const [buyingListingId, setBuyingListingId] = useState<string | null>(null);
  const [buyQty, setBuyQty] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  // Negotiation logs expansion
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [negotiations, setNegotiations] = useState<Record<string, Negotiation[]>>({});
  
  // Negotiation input states
  const [negPrice, setNegPrice] = useState<Record<string, string>>({});
  const [negMsg, setNegMsg] = useState<Record<string, string>>({});
  const [sendQrModalOrder, setSendQrModalOrder] = useState<Order | null>(null);

  // --- PRICE ALERTS STATES ---
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [priceNotifications, setPriceNotifications] = useState<PriceNotification[]>([]);
  const [alertCrop, setAlertCrop] = useState("Tomato (Golbheda)");
  const [alertDistrict, setAlertDistrict] = useState("Dhading");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCriteria, setAlertCriteria] = useState<"below" | "above">("below");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertFormError, setAlertFormError] = useState("");
  const [alertFormSuccess, setAlertFormSuccess] = useState("");

  // Test trigger simulation states
  const [testCrop, setTestCrop] = useState("Tomato (Golbheda)");
  const [testPrice, setTestPrice] = useState("");
  const [testDistrict, setTestDistrict] = useState("Dhading");
  const [testTriggering, setTestTriggering] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  // Active selected notification for modal preview
  const [activeNotifModal, setActiveNotifModal] = useState<PriceNotification | null>(null);

  const fetchBuyerData = async () => {
    try {
      // 1. Fetch available produce listings
      const listRes = await fetch(`/api/listings?status=available`);
      if (listRes.ok) {
        setListings(await listRes.json());
      }

      // 2. Fetch my placed orders
      const orderRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.ok) {
        setOrders(await orderRes.json());
      }

      // 3. Fetch buyer's demand requirements
      const demandRes = await fetch("/api/demands");
      if (demandRes.ok) {
        const allDemands = await demandRes.json();
        const myDemands = allDemands.filter((d: DemandPost) => d.buyerId === user.id);
        setDemands(myDemands);
      }

      // 4. Fetch my price alerts
      const alertsRes = await fetch("/api/price-alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (alertsRes.ok) {
        setPriceAlerts(await alertsRes.json());
      }

      // 5. Fetch my notifications
      const notifsRes = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (notifsRes.ok) {
        setPriceNotifications(await notifsRes.json());
      }
    } catch (e) {
      console.error("Error fetching buyer data:", e);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [user.id, activeTab]);

  // --- PRICE ALERT HANDLERS ---
  const handleCreatePriceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertFormError("");
    setAlertFormSuccess("");

    if (!alertPrice || Number(alertPrice) <= 0) {
      setAlertFormError("Please enter a valid positive target price.");
      return;
    }
    if (!alertEmail || !alertEmail.includes("@")) {
      setAlertFormError("Please enter a valid email address to subscribe to notifications.");
      return;
    }

    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          crop: alertCrop,
          criteria: alertCriteria,
          priceThreshold: Number(alertPrice),
          district: alertDistrict,
          email: alertEmail
        })
      });

      if (res.ok) {
        setAlertFormSuccess(`Subscribed successfully! You will receive email alerts at ${alertEmail} when ${alertCrop} reaches NRs. ${alertPrice} in ${alertDistrict}.`);
        setAlertPrice("");
        // Refresh alerts list
        const alertsRes = await fetch("/api/price-alerts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          setPriceAlerts(await alertsRes.json());
        }
      } else {
        const err = await res.json();
        setAlertFormError(err.error || "Failed to subscribe to price alert.");
      }
    } catch (e) {
      setAlertFormError("Network error. Please try again.");
    }
  };

  const handleToggleAlertStatus = async (alertObj: PriceAlert) => {
    try {
      const res = await fetch(`/api/price-alerts/${alertObj.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !alertObj.isActive
        })
      });

      if (res.ok) {
        setPriceAlerts(prev => prev.map(a => a.id === alertObj.id ? { ...a, isActive: !a.isActive } : a));
      }
    } catch (e) {
      console.error("Failed to toggle alert active status", e);
    }
  };

  const handleDeletePriceAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this price alert subscription?")) {
      return;
    }
    try {
      const res = await fetch(`/api/price-alerts/${alertId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (e) {
      console.error("Failed to delete price alert", e);
    }
  };

  const handleTestTriggerAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);
    setTestTriggering(true);

    if (!testPrice || Number(testPrice) <= 0) {
      alert("Please enter a valid positive simulation price.");
      setTestTriggering(false);
      return;
    }

    try {
      const res = await fetch("/api/price-alerts/test-trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          crop: testCrop,
          price: Number(testPrice),
          district: testDistrict
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.triggeredCount > 0) {
          setTestResult(`Success! Triggered ${data.triggeredCount} matching alert(s) and dispatched simulated email notification(s) successfully!`);
          fetchBuyerData();
        } else {
          setTestResult(`Completed. No active subscriptions matched this specific simulation criteria.`);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to trigger alerts.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setTestTriggering(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPriceNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  const loadNegotiations = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/negotiations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const history = await res.json();
        setNegotiations(prev => ({ ...prev, [orderId]: history }));
      }
    } catch (e) {
      console.error("Failed to load negotiations:", e);
    }
  };

  const handlePostDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!demandQty || Number(demandQty) <= 0 || !demandPrice || Number(demandPrice) <= 0) {
      setFormError("Please provide positive numerical values.");
      return;
    }

    try {
      const res = await fetch("/api/demands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          crop: demandCrop,
          quantity_needed: Number(demandQty),
          unit: "KG",
          offered_price: Number(demandPrice)
        })
      });

      if (res.ok) {
        setFormSuccess("B2B demand requirement published to the feed!");
        setDemandQty("");
        setDemandPrice("");
        fetchBuyerData();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to post demand requirement.");
        if (err.kycRequired) {
          setIsKycModalOpen(true);
        }
      }
    } catch (e) {
      setFormError("Network error. Please try again.");
    }
  };

  const handleAddToCart = (listing: ProduceListing, qtyStr: string, priceStr: string) => {
    const qty = Number(qtyStr) || listing.quantity;
    const price = Number(priceStr) || listing.target_price;

    if (qty <= 0 || qty > listing.quantity) {
      alert(`Please select a valid quantity between 1 and ${listing.quantity} ${listing.unit}.`);
      return;
    }
    if (price <= 0) {
      alert("Please enter a valid rate.");
      return;
    }

    const cartId = "cart_" + listing.id;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.listingId === listing.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: qty,
          pricePerUnit: price
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartId,
            listingId: listing.id,
            crop: listing.crop,
            unit: listing.unit,
            quantity: qty,
            pricePerUnit: price,
            farmerId: listing.farmerId,
            farmerName: listing.farmerName || "Farmer",
            district: listing.district || "Nepal",
            listing
          }
        ];
      }
    });
    setBuyingListingId(null);
    setBuyQty("");
    setBuyPrice("");
    alert(`Added ${qty} ${listing.unit} of ${listing.crop} from ${listing.farmerName || "Farmer"} to Cart!`);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleConfirmFarmerCheckout = async (farmerId: string) => {
    const farmerItems = cart.filter(i => i.farmerId === farmerId);
    if (farmerItems.length === 0) return;

    const farmerName = farmerItems[0].farmerName;
    const farmerDistrict = farmerItems[0].district;
    const totalAmount = farmerItems.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);

    try {
      const createdOrderIds: string[] = [];
      for (const item of farmerItems) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            listingId: item.listingId,
            quantity: item.quantity,
            agreed_price: item.pricePerUnit
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id || (data.order && data.order.id)) {
            createdOrderIds.push(data.id || data.order.id);
          }
        }
      }

      const qrPayload = {
        payee: farmerName,
        farmerId,
        district: farmerDistrict,
        totalCashAmount: totalAmount,
        currency: "NRs",
        itemCount: farmerItems.length,
        products: farmerItems.map(i => `${i.quantity} ${i.unit} ${i.crop} @ NRs.${i.pricePerUnit}`),
        timestamp: new Date().toISOString()
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        width: 320,
        margin: 2,
        color: { dark: "#064e3b", light: "#ffffff" }
      });

      setPaymentQRModal({
        farmerId,
        farmerName,
        farmerDistrict,
        items: farmerItems.map(i => ({
          crop: i.crop,
          quantity: i.quantity,
          unit: i.unit,
          pricePerUnit: i.pricePerUnit,
          subtotal: i.quantity * i.pricePerUnit
        })),
        totalCashAmount: totalAmount,
        qrDataUrl: qrUrl,
        orderIds: createdOrderIds,
        created_at: new Date().toISOString()
      });

      setCart(prev => prev.filter(i => i.farmerId !== farmerId));
      fetchBuyerData();
    } catch (e) {
      console.error("Checkout failed:", e);
      alert("Order placement failed.");
    }
  };

  const handlePlaceOrder = async (listing: ProduceListing) => {
    if (!buyQty || Number(buyQty) <= 0 || Number(buyQty) > listing.quantity) {
      alert(`Please enter a valid quantity between 1 and ${listing.quantity} KG.`);
      return;
    }
    if (!buyPrice || Number(buyPrice) <= 0) {
      alert("Please enter a valid starting offer price.");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: Number(buyQty),
          agreed_price: Number(buyPrice)
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        const createdOrder = orderData.order || orderData;
        const totalAmount = Number(buyQty) * Number(buyPrice);

        const qrPayload = {
          orderId: createdOrder.id || listing.id,
          payee: listing.farmerName || "Farmer",
          farmerId: listing.farmerId,
          totalCashAmount: totalAmount,
          currency: "NRs",
          product: `${buyQty} ${listing.unit} ${listing.crop} @ NRs.${buyPrice}`,
          timestamp: new Date().toISOString()
        };

        const qrUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          width: 320,
          margin: 2,
          color: { dark: "#064e3b", light: "#ffffff" }
        });

        setPaymentQRModal({
          farmerId: listing.farmerId,
          farmerName: listing.farmerName || "Farmer",
          farmerDistrict: listing.district || "Nepal",
          items: [{
            crop: listing.crop,
            quantity: Number(buyQty),
            unit: listing.unit,
            pricePerUnit: Number(buyPrice),
            subtotal: totalAmount
          }],
          totalCashAmount: totalAmount,
          qrDataUrl: qrUrl,
          orderIds: [createdOrder.id || listing.id],
          created_at: new Date().toISOString()
        });

        setBuyingListingId(null);
        setBuyQty("");
        setBuyPrice("");
        fetchBuyerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to place order.");
        if (err.kycRequired) {
          setIsKycModalOpen(true);
        }
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handleGenerateOrderQR = async (order: Order) => {
    const totalAmount = order.quantity * order.agreed_price;
    const qrPayload = {
      orderId: order.id,
      payee: order.farmerName || "Farmer",
      farmerId: order.farmerId,
      totalCashAmount: totalAmount,
      currency: "NRs",
      product: `${order.quantity} ${order.unit} ${order.crop} @ NRs.${order.agreed_price}`,
      timestamp: new Date().toISOString()
    };

    try {
      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        width: 320,
        margin: 2,
        color: { dark: "#064e3b", light: "#ffffff" }
      });

      setPaymentQRModal({
        farmerId: order.farmerId,
        farmerName: order.farmerName || "Farmer",
        farmerDistrict: user.district || "Nepal",
        items: [{
          crop: order.crop,
          quantity: order.quantity,
          unit: order.unit,
          pricePerUnit: order.agreed_price,
          subtotal: totalAmount
        }],
        totalCashAmount: totalAmount,
        qrDataUrl: qrUrl,
        orderIds: [order.id],
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to generate QR:", e);
    }
  };

  const handleSendCounterOffer = async (orderId: string) => {
    const proposed = negPrice[orderId];
    const message = negMsg[orderId] || "";

    if (!proposed && !message.trim()) {
      alert("Please enter a message or a proposed price.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/negotiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message.trim(),
          proposed_price: proposed ? Number(proposed) : undefined
        })
      });

      if (res.ok) {
        setNegPrice(prev => ({ ...prev, [orderId]: "" }));
        setNegMsg(prev => ({ ...prev, [orderId]: "" }));
        fetchBuyerData();
        loadNegotiations(orderId);
      }
    } catch (e) {
      console.error("Failed to post counter-offer:", e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBuyerData();
        if (expandedOrderId === orderId) {
          loadNegotiations(orderId);
        }
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const toggleExpandOrder = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      loadNegotiations(orderId);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchCrop = !filterCrop || l.crop.toLowerCase().includes(filterCrop.toLowerCase());
    const matchDist = !filterDistrict || (l.district && l.district.toLowerCase() === filterDistrict.toLowerCase());
    return matchCrop && matchDist;
  });

  const cropOptions = ["Potato (Alu)", "Tomato (Golbheda)", "Cauliflower (Kauli)", "Ginger (Aduwa)", "Onion (Pyaj)"];

  return (
    <div className="space-y-6">
      
      {/* Verification State Banner for Buyers */}
      {currentUser.verified || currentUser.verificationStatus === 'verified' ? null : currentUser.verificationStatus === 'pending' ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">KYC Documents Submitted & Pending Admin Approval</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your Citizenship Card (No: <strong>{currentUser.citizenshipNumber || "Uploaded"}</strong>) and National Identity Card scans are currently being audited by Super Admin / Admin. 
                You will be able to buy crops and place demand orders as soon as approval is granted.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shrink-0 shadow-sm transition"
          >
            Check Verification Status
          </button>
        </div>
      ) : currentUser.verificationStatus === 'rejected' ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Mandatory Verification Rejected</h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Note from Admin: <em>"{currentUser.verificationNotes || "Uploaded photo was illegible."}"</em>. Please re-upload legible photos of your Citizenship Card and National Identity Card.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shrink-0 shadow-sm transition"
          >
            Re-upload Verification Documents
          </button>
        </div>
      ) : (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 text-slate-900 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base font-display">Mandatory Verification Required for Buying & Posting Demands</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                As per Nepal AgriTech safety regulations, commercial buyers must upload clear scans of their <strong>Citizenship Card (नागरिकता)</strong> and <strong>National Identity Card (राष्ट्रिय परिचयपत्र)</strong>. 
                After approval by Super Admin / Admin, buying products and placing demand requirements will be instantly activated.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shrink-0 shadow-md transition flex items-center space-x-1.5"
          >
            <span>Verify Identity Now</span>
            <span className="text-[10px] font-normal opacity-90">(नागरिकता / NIN)</span>
          </button>
        </div>
      )}
      
      {/* Cart Bar & Trigger */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-800/90 rounded-xl border border-emerald-700/60 relative">
            <ShoppingCart className="w-5 h-5 text-emerald-300" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                {cart.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-emerald-100 flex items-center space-x-2 font-display">
              <span>Shopping Cart</span>
              <span className="text-[11px] font-normal text-emerald-300 font-mono">(Arranged by Individual Farmer)</span>
            </h3>
            <p className="text-xs text-emerald-200/80">
              {cart.length === 0 
                ? "Your cart is empty. Select farm produce from listings below." 
                : `${cart.length} product(s) in cart • Total Cash: NRs. ${cart.reduce((s, i) => s + (i.quantity * i.pricePerUnit), 0).toLocaleString()}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <ShoppingCart className="w-4 h-4 text-slate-950" />
          <span>View Cart &amp; Checkout ({cart.length})</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-200/90 dark:border-slate-800 pb-3 pt-1">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 overflow-x-auto no-scrollbar py-1">
          {/* Shop Farms Tab */}
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "listings"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Sprout className={`w-4 h-4 ${activeTab === "listings" ? "text-white" : "text-slate-600 dark:text-slate-400"}`} />
            <span>{t("Shop Farms")} ({filteredListings.length})</span>
          </button>

          {/* Orders & Negotiations Tab */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "orders"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${activeTab === "orders" ? "text-white" : "text-slate-600 dark:text-slate-400"}`} />
            <span>{t("Orders & Negotiations")} ({orders.length})</span>
          </button>

          {/* Demand Feed Tab */}
          <button
            onClick={() => setActiveTab("demands")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === "demands"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <ClipboardList className={`w-4 h-4 ${activeTab === "demands" ? "text-white" : "text-slate-600 dark:text-slate-400"}`} />
            <span>{t("Demand Feed")} ({demands.length})</span>
          </button>

          {/* Price Alerts Tab */}
          <button
            onClick={() => setActiveTab("price_alerts")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 relative ${
              activeTab === "price_alerts"
                ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Bell className={`w-4 h-4 ${activeTab === "price_alerts" ? "text-white" : "text-amber-500"}`} />
            <span>{t("Price Alerts")} ({priceAlerts.length})</span>
            {priceNotifications.some(n => !n.isRead) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab: Browse Listings */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-700 w-full md:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search farm crops..."
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs text-slate-700 w-full transition"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">District:</span>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              >
                <option value="">All Districts</option>
                <option value="Dhading">Dhading</option>
                <option value="Makwanpur">Makwanpur</option>
                <option value="Kathmandu">Kathmandu</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-12 text-center text-slate-400 text-sm">
              No active produce listed matching the criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredListings.map((l) => (
                <div key={l.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold font-display text-slate-800 text-base">{l.crop}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {l.district || "Nepal"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1.5">Listed by: <strong className="text-slate-700">{l.farmerName || "Farmer"}</strong></p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 py-3 my-3 bg-slate-50/50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Available Quantity</span>
                        <span className="font-bold text-slate-700 text-sm">{l.quantity} {l.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Farmer Price</span>
                        <span className="font-bold text-slate-700 text-sm">NRs. {l.target_price} / {l.unit}</span>
                      </div>
                    </div>
                  </div>

                  {buyingListingId === l.id ? (
                    <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Qty (KG)</label>
                          <input
                            type="number"
                            placeholder={`Max ${l.quantity}`}
                            value={buyQty}
                            onChange={(e) => setBuyQty(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Rate (NRs/KG)</label>
                          <input
                            type="number"
                            placeholder="Proposed price"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleAddToCart(l, buyQty, buyPrice)}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-2 rounded-xl text-[10px] uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3 text-slate-950" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => handlePlaceOrder(l)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-xl text-[10px] uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <QrCode className="w-3 h-3 text-emerald-200" />
                            <span>Buy &amp; Payment QR</span>
                          </button>
                        </div>
                        <button
                          onClick={() => setBuyingListingId(null)}
                          className="w-full py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] text-slate-600 font-semibold uppercase transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setBuyingListingId(l.id);
                        setBuyQty(l.quantity.toString());
                        setBuyPrice(l.target_price.toString());
                      }}
                      className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition duration-150 shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buy / Add to Cart</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Post Demand Feed */}
      {activeTab === "demands" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Post Demand Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5 border-b border-slate-200 pb-3 mb-4">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>Broadcast B2B Demand</span>
            </h3>

            <form onSubmit={handlePostDemand} className="space-y-4">
              {formError && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">{formError}</div>}
              {formSuccess && <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">{formSuccess}</div>}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Required Crop</label>
                <select
                  value={demandCrop}
                  onChange={(e) => setDemandCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                >
                  {cropOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Qty Needed (KG)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={demandQty}
                    onChange={(e) => setDemandQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Offered Price (NRs/KG)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={demandPrice}
                    onChange={(e) => setDemandPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-sm text-slate-700 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition duration-150 shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Requirement</span>
              </button>
            </form>
          </div>

          {/* My Demands Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase">
              My Active Demand Posts
            </h3>

            {demands.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-12 text-center text-slate-400 text-sm">
                No active requirements posted. Standard supply chain relies on direct offers.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {demands.map((d) => (
                  <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold font-display text-slate-800 text-base">{d.crop}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                          {d.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 py-3 my-3">
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Quantity Wanted</span>
                          <span className="font-bold text-slate-700 text-sm">{d.quantity_needed} {d.unit}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Offered Rate</span>
                          <span className="font-bold text-slate-700 text-sm font-mono">NRs. {d.offered_price} / KG</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between items-center mt-2">
                      <span className="font-mono">Broadcasted {new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Orders & Negotiations */}
      {activeTab === "orders" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold font-display text-slate-800 text-sm tracking-wide uppercase flex items-center space-x-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Purchase History & Counter-Offer Negotiations</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">View transaction status and interact with counter offers in real-time</p>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No orders placed yet. Place an offer from the crop list.
              </div>
            ) : (
              orders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                const orderHistory = negotiations[o.id] || [];

                return (
                  <div key={o.id} className="transition duration-150 hover:bg-slate-50/20">
                    <div 
                      onClick={() => toggleExpandOrder(o.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold font-display text-slate-800 text-sm">{o.crop}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-500">Farmer: <strong>{o.farmerName}</strong></span>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap gap-y-1 items-center space-x-3">
                          <span>Volume: <strong>{o.quantity} {o.unit}</strong></span>
                          <span>&bull;</span>
                          <span>Offer Rate: <strong className="text-slate-700">NRs. {o.agreed_price} / {o.unit}</strong></span>
                          <span>&bull;</span>
                          <span>Sum: <strong className="text-emerald-700">NRs. {o.quantity * o.agreed_price}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-3 md:mt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateOrderQR(o);
                          }}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
                          title="View Payment QR Code with exact total cash amount"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                          <span>View Payment QR</span>
                        </button>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                          o.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : o.status === "negotiating"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : o.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : o.status === "completed"
                            ? "bg-slate-100 text-slate-600 border-slate-300"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {o.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Animated Supply-Chain Order Fulfillment Tracker */}
                    <div className="px-5 pb-4">
                      <SupplyChainTracker
                        order={o}
                        onUpdateStatus={(id, st) => handleUpdateOrderStatus(id, st as string)}
                        userRole="buyer"
                      />
                    </div>

                    {/* Negotiation Message History panel */}
                    {isExpanded && (
                      <div className="bg-slate-50 p-5 border-t border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                            <History className="w-3.5 h-3.5" />
                            <span>Negotiation Counter-Offer Logs</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {o.id}</span>
                        </div>

                        {/* Thread */}
                        <div className="space-y-3 max-h-60 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                          {orderHistory.length === 0 ? (
                            <div className="text-center text-slate-400 italic text-xs py-4">No counter proposals logged yet.</div>
                          ) : (
                            orderHistory.map((n) => (
                              <div key={n.id} className={`flex flex-col p-2.5 rounded-lg border text-xs ${
                                n.senderId === user.id 
                                  ? "bg-emerald-50 border-emerald-200/60 ml-8" 
                                  : "bg-slate-50 border-slate-200 mr-8"
                              }`}>
                                <div className="flex justify-between items-center mb-1 font-semibold text-[11px] text-slate-700">
                                  <span>{n.senderName}</span>
                                  <span className="text-[9px] text-slate-400 font-normal font-mono">{new Date(n.created_at).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-slate-600 font-sans italic">"{n.message}"</p>
                                <NegotiationQrCard negotiation={n} order={o} />
                                <div className="mt-1.5 font-bold text-slate-800 text-[10px] uppercase">
                                  Proposed Rate: <span className="text-emerald-700 font-mono">NRs. {n.proposed_price} / {o.unit}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Negotiation Inputs */}
                        {o.status !== "completed" && o.status !== "cancelled" && (
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="md:col-span-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Price (Optional)</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 64 (Optional)"
                                  value={negPrice[o.id] || ""}
                                  onChange={(e) => setNegPrice(prev => ({ ...prev, [o.id]: e.target.value }))}
                                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Message to Farmer</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Write message or offer details..."
                                    value={negMsg[o.id] || ""}
                                    onChange={(e) => setNegMsg(prev => ({ ...prev, [o.id]: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-3 pr-12 text-xs text-slate-700"
                                  />
                                  <button
                                    onClick={() => handleSendCounterOffer(o.id)}
                                    className="absolute right-1.5 top-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition cursor-pointer"
                                    title="Send Message / Offer"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Status Change Buttons */}
                            <div className="border-t border-slate-200 pt-3 flex items-center justify-between flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSendQrModalOrder(o)}
                                className="bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                              >
                                <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                <span>{t("Send / Upload QR Code")}</span>
                              </button>

                              <div className="flex flex-wrap items-center gap-2 ml-auto">
                                {o.status !== "confirmed" ? (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, "confirmed")}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition shadow-sm cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept & Confirm Deal</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="bg-slate-200 text-slate-400 font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 cursor-not-allowed"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Awaiting Farmer Delivery</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "cancelled")}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancel Offer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Price Alerts & Subscriptions */}
      {activeTab === "price_alerts" && (
        <div className="space-y-6" id="buyer-price-alerts-section">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Create & Simulate (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card 1: Create Price Alert Subscription */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Bell className="w-5 h-5 text-emerald-600 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Subscribe to Price Alerts</h3>
                    <p className="text-xs text-slate-500">Get automatic email alerts when market rates hit your target.</p>
                  </div>
                </div>

                <form onSubmit={handleCreatePriceAlert} className="space-y-4">
                  {alertFormError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center space-x-1">
                      <X className="w-4 h-4 shrink-0" />
                      <span>{alertFormError}</span>
                    </div>
                  )}

                  {alertFormSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{alertFormSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Select Crop</label>
                    <select
                      value={alertCrop}
                      onChange={(e) => setAlertCrop(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      {["Tomato (Golbheda)", "Potato (Alu)", "Cauliflower (Kauli)", "Ginger (Aduwa)", "Onion (Pyaj)"].map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Preferred District</label>
                      <select
                        value={alertDistrict}
                        onChange={(e) => setAlertDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {["Dhading", "Kathmandu", "Makwanpur", "Kavre", "Nuwakot", "Terai", "Hill"].map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Alert Condition</label>
                      <select
                        value={alertCriteria}
                        onChange={(e) => setAlertCriteria(e.target.value as "below" | "above")}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option value="below">Price falls below (&le;)</option>
                        <option value="above">Price rises above (&ge;)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Target Price (NRs./KG)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-semibold">NRs.</span>
                        <input
                          type="number"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Subscription Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder="farmer@example.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Create Alert Subscription</span>
                  </button>
                </form>
              </div>

              {/* Card 2: Price Update Simulation Engine */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <Play className="w-4 h-4 fill-current text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Simulated Price Updates</h3>
                    <p className="text-xs text-slate-500">Trigger market events to verify alert notifications.</p>
                  </div>
                </div>

                <form onSubmit={handleTestTriggerAlerts} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Crop</label>
                      <select
                        value={testCrop}
                        onChange={(e) => setTestCrop(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                      >
                        {["Tomato (Golbheda)", "Potato (Alu)", "Cauliflower (Kauli)", "Ginger (Aduwa)", "Onion (Pyaj)"].map(crop => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">District</label>
                      <select
                        value={testDistrict}
                        onChange={(e) => setTestDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                      >
                        {["Dhading", "Kathmandu", "Makwanpur", "Kavre", "Nuwakot"].map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Simulated Market Rate (NRs./KG)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold">NRs.</span>
                      <input
                        type="number"
                        value={testPrice}
                        onChange={(e) => setTestPrice(e.target.value)}
                        placeholder="e.g. 40"
                        className="w-full bg-white border border-slate-200 rounded-lg pl-11 pr-2 py-1.5 text-xs outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={testTriggering}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                  >
                    {testTriggering ? (
                      <span>Processing Sim...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Simulate Rate Update</span>
                      </>
                    )}
                  </button>

                  {testResult && (
                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg text-xs leading-relaxed font-semibold">
                      {testResult}
                    </div>
                  )}
                </form>
              </div>

            </div>

            {/* Right Column: Active Alerts & Logs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 3: Active Subscriptions */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
                  <span>My Subscribed Price Alerts</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {priceAlerts.length} Active
                  </span>
                </h3>

                {priceAlerts.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                    <p className="text-xs text-slate-400">You haven't set any price alert subscriptions yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                    {priceAlerts.map((alert) => (
                      <div key={alert.id} className="py-3 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">{alert.crop}</span>
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              {alert.district || alert.region || "All"}
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium flex items-center space-x-2">
                            <span>Trigger condition:</span>
                            <span className="font-bold text-slate-700">
                              {alert.criteria === "below" ? "Price \u2264" : "Price \u2265"} NRs. {alert.priceThreshold}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span className="font-mono">{alert.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleAlertStatus(alert)}
                            title={alert.isActive ? "Pause Alert" : "Activate Alert"}
                            className="text-slate-500 hover:text-slate-800 transition"
                          >
                            {alert.isActive ? (
                              <ToggleRight className="w-8 h-8 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-slate-400" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeletePriceAlert(alert.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 4: Dispatched Logs */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-800">Dispatched Alerts & Email Logs</h3>
                  {priceNotifications.some(n => !n.isRead) && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {priceNotifications.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                    <p className="text-xs text-slate-400">No price alerts have triggered yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                    {priceNotifications.map((notif) => (
                      <div key={notif.id} className={`py-3 flex items-start justify-between gap-4 text-xs first:pt-0 last:pb-0 ${!notif.isRead ? "bg-amber-50/40 px-2 rounded-lg" : ""}`}>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span className="font-bold text-slate-800">{notif.title}</span>
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1 py-0.5 rounded uppercase flex items-center space-x-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>Email Sent</span>
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs font-medium">{notif.message}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <span>Sent to: <strong className="text-slate-600 font-mono">{notif.emailSentTo}</strong></span>
                            <span>&bull;</span>
                            <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveNotifModal(notif)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center space-x-1 shrink-0 transition"
                          title="Read Simulated Email"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Email</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Email View Modal Overlay */}
          {activeNotifModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-200 overflow-hidden shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                
                {/* Email Header Panel (Like Gmail) */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Simulated SMTP Email Client</span>
                  </div>
                  <button
                    onClick={() => setActiveNotifModal(null)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* From / To Info */}
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <div className="text-xs text-slate-500">
                      <strong>From:</strong> <span className="font-mono text-slate-700">noreply@krishisajha.org</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <strong>To:</strong> <span className="font-mono text-emerald-700 font-bold">{activeNotifModal.emailSentTo}</span>
                    </div>
                    <div className="text-xs text-slate-800 mt-2 font-bold flex items-center space-x-1">
                      <span className="text-slate-500">Subject:</span>
                      <span>{activeNotifModal.emailSubject || `[Alert] Price threshold reached for ${activeNotifModal.crop}`}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {activeNotifModal.emailBody || activeNotifModal.message}
                  </div>

                  {/* Simulation Status Footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                    <span className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>SMTP Status: DISPATCH_SUCCESS</span>
                    </span>
                    <span>MD5 ID: {activeNotifModal.id}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
                  <button
                    onClick={() => setActiveNotifModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                  >
                    Close Mail Preview
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
      {/* Shopping Cart Modal (Grouped by Individual Farmer) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-900 text-emerald-400 rounded-2xl shadow-xs">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Buyer Shopping Cart</span>
                    <span className="text-xs font-normal text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Arranged by Farmer
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Products are grouped by individual farmer. Confirming an order generates a single aggregate Payment QR for that farmer.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="overflow-y-auto space-y-6 pr-1 flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Your Shopping Cart is Empty</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Browse available produce listings from Dhading, Makwanpur, and Kathmandu farmers to add items to your cart.
                    </p>
                  </div>
                </div>
              ) : (
                (Object.entries(
                  cart.reduce((acc, item) => {
                    if (!acc[item.farmerId]) {
                      acc[item.farmerId] = {
                        farmerName: item.farmerName,
                        district: item.district,
                        items: []
                      };
                    }
                    acc[item.farmerId].items.push(item);
                    return acc;
                  }, {} as Record<string, { farmerName: string; district?: string; items: CartItem[] }>)
                ) as [string, { farmerName: string; district?: string; items: CartItem[] }][]).map(([farmerId, group]) => {
                  const farmerTotal = group.items.reduce((s, i) => s + (i.quantity * i.pricePerUnit), 0);

                  return (
                    <div key={farmerId} className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
                      
                      {/* Farmer Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block">
                              Farmer: {group.farmerName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Location: {group.district || "Nepal"} &bull; {group.items.length} Product(s)
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Farmer Subtotal</span>
                          <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                            NRs. {farmerTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-slate-200 dark:divide-slate-700/60">
                        {group.items.map((item) => (
                          <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-3">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">{item.crop}</span>
                              <span className="text-slate-500 text-[11px]">
                                {item.quantity} {item.unit} &times; NRs. {item.pricePerUnit} / {item.unit}
                              </span>
                            </div>

                            <div className="flex items-center space-x-4">
                              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-sm">
                                NRs. {(item.quantity * item.pricePerUnit).toLocaleString()}
                              </span>
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Checkout Button for this Individual Farmer */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleConfirmFarmerCheckout(farmerId)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-emerald-200" />
                          <span>Confirm Order &amp; Generate Payment QR (NRs. {farmerTotal.toLocaleString()})</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">
                Total Cart Items: <strong>{cart.length}</strong>
              </span>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition"
              >
                Close Cart
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Payment QR Code Modal (Final Combined Payment QR for Individual Farmer or Single Product) */}
      {paymentQRModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Top Security Banner */}
            <div className="bg-emerald-950 text-white p-4 -m-6 mb-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-900 rounded-xl text-emerald-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-200 font-display">Farmer Payment QR Code</h3>
                  <p className="text-[11px] text-emerald-300/80">
                    Payee: <strong>{paymentQRModal.farmerName}</strong> ({paymentQRModal.farmerDistrict || "Nepal"})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentQRModal(null)}
                className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent Exact Cash Amount Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-4 text-center space-y-1 shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Exact Total Cash Amount to Pay
              </span>
              <div className="text-3xl font-black text-emerald-900 dark:text-emerald-200 font-mono tracking-tight">
                NRs. {paymentQRModal.totalCashAmount.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Combined total for {paymentQRModal.items.length} item(s) ordered from {paymentQRModal.farmerName}
              </p>
            </div>

            {/* Generated QR Code Image */}
            <div className="text-center space-y-3">
              <div className="bg-white p-4 rounded-2xl inline-block border-4 border-emerald-800 shadow-xl">
                <img
                  src={paymentQRModal.qrDataUrl}
                  alt="Farmer Payment QR Code"
                  className="w-56 h-56 mx-auto object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                Scan using <strong>eSewa, Fonepay, Khalti, or Mobile Banking</strong> or show to farmer upon cash delivery.
              </p>
            </div>

            {/* Itemized Breakdown Table */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1.5">
                Itemized Order Summary ({paymentQRModal.farmerName})
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                {paymentQRModal.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span>
                      {item.crop} ({item.quantity} {item.unit} &times; NRs.{item.pricePerUnit})
                    </span>
                    <span className="font-bold font-mono">
                      NRs. {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentQRModal.qrDataUrl);
                  setQrCopySuccess(true);
                  setTimeout(() => setQrCopySuccess(false), 2000);
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {qrCopySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{qrCopySuccess ? "QR Link Copied!" : "Copy QR Link"}</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print</span>
              </button>

              <button
                onClick={() => setPaymentQRModal(null)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Payment Done</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mandatory KYC Verification Modal */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        user={currentUser}
        token={token}
        onSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      {/* Send / Upload Order QR Modal */}
      <SendOrderQrModal
        isOpen={!!sendQrModalOrder}
        onClose={() => setSendQrModalOrder(null)}
        order={sendQrModalOrder}
        user={currentUser}
        token={token}
        onQrSent={(orderId) => {
          fetchNegotiations(orderId);
        }}
      />

    </div>
  );
}
