import React, { useState, useEffect } from "react";
import { User, DemandPost, DemandBid, LogisticsDispatch, Invoice, InstitutionalSubscription } from "../types";
import { 
  Building2, Truck, FileText, Scale, ShieldCheck, History, Plus, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Send, DollarSign, Calendar, MapPin, Thermometer,
  ShieldAlert, Printer, ArrowRight, ChevronRight, UserCheck
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import VatInvoiceModal from "./VatInvoiceModal";
import SupportTicketCenterModal from "./SupportTicketCenterModal";
import AuditLogsModal from "./AuditLogsModal";

interface B2bMarketplaceHubProps {
  user: User;
  token: string;
}

export default function B2bMarketplaceHub({ user, token }: B2bMarketplaceHubProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"forward_contracts" | "logistics" | "subscriptions" | "invoices">("forward_contracts");

  // Data States
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [bids, setBids] = useState<DemandBid[]>([]);
  const [dispatches, setDispatches] = useState<LogisticsDispatch[]>([]);
  const [subscriptions, setSubscriptions] = useState<InstitutionalSubscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Control States
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // New Bid State for selected demand
  const [selectedDemandForBid, setSelectedDemandForBid] = useState<DemandPost | null>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidDeliveryDays, setBidDeliveryDays] = useState("20");
  const [bidNotes, setBidNotes] = useState("");
  const [bidMsg, setBidMsg] = useState("");

  // New Subscription Form State
  const [subCrop, setSubCrop] = useState("Tomato (Golbheda)");
  const [subQty, setSubQty] = useState("300");
  const [subPrice, setSubPrice] = useState("60");
  const [subDay, setSubDay] = useState("Monday");
  const [subMsg, setSubMsg] = useState("");

  useEffect(() => {
    fetchAllB2bData();
  }, []);

  const fetchAllB2bData = async () => {
    setLoading(true);
    try {
      const [demandsRes, dispatchesRes, subsRes, invsRes] = await Promise.all([
        fetch("/api/demands", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/logistics", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/subscriptions", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/invoices", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (demandsRes.ok) setDemands(await demandsRes.json());
      if (dispatchesRes.ok) setDispatches(await dispatchesRes.json());
      if (subsRes.ok) setSubscriptions(await subsRes.json());
      if (invsRes.ok) setInvoices(await invsRes.json());

      // Fetch bids for first demand if available
      if (demands.length > 0) {
        fetchBidsForDemand(demands[0].id);
      }
    } catch (e) {
      console.error("Failed to load B2B data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidsForDemand = async (demandId: string) => {
    try {
      const res = await fetch(`/api/demands/${demandId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBids(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch bids:", e);
    }
  };

  const handleSelectDemand = (demand: DemandPost) => {
    setSelectedDemandForBid(demand);
    fetchBidsForDemand(demand.id);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemandForBid) return;
    if (!bidPrice || parseFloat(bidPrice) <= 0) {
      setBidMsg("Please enter a valid bid price per unit.");
      return;
    }

    try {
      const res = await fetch(`/api/demands/${selectedDemandForBid.id}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bidPricePerUnit: parseFloat(bidPrice),
          deliveryDaysRequired: parseInt(bidDeliveryDays),
          notes: bidNotes
        })
      });

      if (res.ok) {
        setBidMsg("Binding Forward Contract Bid submitted successfully!");
        setBidPrice("");
        setBidNotes("");
        fetchBidsForDemand(selectedDemandForBid.id);
        setTimeout(() => setBidMsg(""), 2000);
      }
    } catch (e) {
      console.error("Error submitting bid:", e);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          buyerOrganization: user.fullName + " Institutional Procurement",
          crop: subCrop,
          weeklyQuantity: parseFloat(subQty),
          unit: "KG",
          agreedPricePerUnit: parseFloat(subPrice),
          deliveryDay: subDay,
          district: user.district || "Kathmandu"
        })
      });

      if (res.ok) {
        setSubMsg("Institutional recurring subscription created!");
        fetchAllB2bData();
        setTimeout(() => setSubMsg(""), 2000);
      }
    } catch (e) {
      console.error("Error creating subscription:", e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Toolbars */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Supply Chain Hub (व्यापारिक आपूर्ति प्रणाली)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Bulk Forward Contracts & Cold-Chain Logistics
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              Contract wholesale requirements, monitor Prithvi Highway cold-chain trucks, and generate VAT-compliant split-settlement receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-xs transition shadow-xs cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Support & Disputes</span>
            </button>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-xs transition shadow-xs cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Audit Trail Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("forward_contracts")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "forward_contracts"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Forward Contracts & Bids</span>
        </button>

        <button
          onClick={() => setActiveTab("logistics")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "logistics"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Cold-Chain Route Logistics</span>
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "subscriptions"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Institutional Subscriptions</span>
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === "invoices"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>VAT Invoices & Receipts</span>
        </button>
      </div>

      {/* TAB CONTENT 1: FORWARD CONTRACTS & BIDS */}
      {activeTab === "forward_contracts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Demands List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Bulk Institutional Requirements (थोक माँग)</span>
              <span className="text-xs font-normal text-slate-500">{demands.length} Posts</span>
            </h3>

            {demands.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No active bulk demand requirements posted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demands.map((demand) => (
                  <div
                    key={demand.id}
                    onClick={() => handleSelectDemand(demand)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedDemandForBid?.id === demand.id
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                        #{demand.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                        Target: {demand.requiredByDate || "In 30 Days"}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                      {demand.crop}
                    </h4>

                    <div className="mt-2 text-xs space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                      <p>Quantity Required: <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{demand.quantityRequired} {demand.unit}</span></p>
                      <p>Target Price Ceiling: <span className="font-bold font-mono text-emerald-800 dark:text-emerald-300">NRs. {demand.targetPricePerUnit} / {demand.unit}</span></p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        Buyer: {demand.buyerName} ({demand.district || "Kathmandu"})
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Click to View / Submit Bids</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bidding Panel */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 h-fit">
            {selectedDemandForBid ? (
              <>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    Forward Contract Bidding
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedDemandForBid.crop} ({selectedDemandForBid.quantityRequired} {selectedDemandForBid.unit})
                  </h4>
                </div>

                {/* Submitted Bids Thread */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Submitted Bids</span>
                    <span className="font-mono text-slate-400">{bids.length} Received</span>
                  </h5>

                  {bids.length === 0 ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-400 text-center">
                      No bids submitted yet for this requirement.
                    </div>
                  ) : (
                    bids.map((b) => (
                      <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs border border-slate-200/80 dark:border-slate-750 space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-800 dark:text-slate-200">{b.farmerName} ({b.farmerDistrict})</span>
                          <span className="font-mono text-emerald-800 dark:text-emerald-300">NRs. {b.bidPricePerUnit}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Delivery Lead Time: {b.deliveryDaysRequired} days | Escrow Locked: NRs. {b.depositLocked}
                        </p>
                        {b.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                            "{b.notes}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Submit Bid Form */}
                <form onSubmit={handleSubmitBid} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Submit Binding Farmer/Cooperative Bid
                  </h5>

                  {bidMsg && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200">
                      {bidMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Your Price Bid (per {selectedDemandForBid.unit})
                    </label>
                    <input
                      type="number"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      placeholder={`e.g. ${selectedDemandForBid.targetPricePerUnit}`}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Days Required for Full Harvest Fulfillment
                    </label>
                    <input
                      type="number"
                      value={bidDeliveryDays}
                      onChange={(e) => setBidDeliveryDays(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Quality & Farm Specifications Note
                    </label>
                    <textarea
                      rows={2}
                      value={bidNotes}
                      onChange={(e) => setBidNotes(e.target.value)}
                      placeholder="e.g., Organic Grade-A from Dhading Dhunibesi tunnel farming."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Binding Bid</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Select a demand requirement post on the left to view bids or place a forward contract proposal.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: COLD-CHAIN ROUTE LOGISTICS */}
      {activeTab === "logistics" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Cold-Chain Transit Vehicles & Highway Dispatch (राजमार्ग ढुवानी)</span>
            <span className="text-xs font-normal text-slate-500">{dispatches.length} Vehicles In-Transit</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dispatches.map((disp) => (
              <div key={disp.id} className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 rounded-xl">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {disp.crop} ({disp.quantity} {disp.unit})
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Vehicle: {disp.vehicleNumber}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                    {disp.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Route & Temperature Gauge */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Transit Corridor</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{disp.route}</p>
                    <p className="text-[11px] text-slate-500">{disp.originDistrict} → {disp.destinationDistrict}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Cold Chain Monitor</span>
                    <p className="font-bold font-mono text-sky-600 dark:text-sky-300 flex items-center mt-0.5">
                      <Thermometer className="w-4 h-4 mr-1 text-sky-500" />
                      {disp.coldChainTempC}°C (Optimal)
                    </p>
                  </div>
                </div>

                {/* Checkpoint & Driver */}
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                    <span>Current Checkpoint: <strong className="text-slate-900 dark:text-slate-100">{disp.currentCheckpoint}</strong></span>
                  </p>
                  <p className="flex items-center text-slate-500">
                    <UserCheck className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                    <span>Driver: {disp.driverName} ({disp.driverPhone})</span>
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: INSTITUTIONAL SUBSCRIPTIONS */}
      {activeTab === "subscriptions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Subscriptions List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Institutional Recurring Deliveries (नियमित आपूर्ति)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        Weekly {sub.deliveryDay}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {sub.crop} ({sub.weeklyQuantity} {sub.unit})
                      </h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      Organization: <strong className="text-slate-800 dark:text-slate-200">{sub.buyerOrganization}</strong>
                    </p>
                    <p className="text-slate-500 font-mono">
                      Agreed Price: NRs. {sub.agreedPricePerUnit} / {sub.unit} | Next Delivery: {sub.nextDeliveryDate}
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* New Subscription Setup */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 h-fit">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Create Institutional Contract</span>
            </h4>

            {subMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {subMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubscription} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Crop Category
                </label>
                <select
                  value={subCrop}
                  onChange={(e) => setSubCrop(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="Tomato (Golbheda)">Tomato (Golbheda)</option>
                  <option value="Potato (Aalu)">Potato (Aalu)</option>
                  <option value="Onion (Pyaj)">Onion (Pyaj)</option>
                  <option value="Cabbage (Banda)">Cabbage (Banda)</option>
                  <option value="Cauliflower (Kauli)">Cauliflower (Kauli)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Weekly Requirement Quantity (KG)
                </label>
                <input
                  type="number"
                  value={subQty}
                  onChange={(e) => setSubQty(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contract Price Ceiling (NRs / KG)
                </label>
                <input
                  type="number"
                  value={subPrice}
                  onChange={(e) => setSubPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Delivery Day
                </label>
                <select
                  value={subDay}
                  onChange={(e) => setSubDay(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="Monday">Monday Morning</option>
                  <option value="Wednesday">Wednesday Morning</option>
                  <option value="Friday">Friday Morning</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Schedule Recurring Order
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: VAT INVOICES & RECEIPTS */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Official VAT Tax Invoices & Settlement Receipts (कर बिजक)</span>
            <span className="text-xs font-normal text-slate-500">{invoices.length} Issued</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {inv.invoiceNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {inv.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {inv.crop} ({inv.quantity} {inv.unit})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buyer: {inv.buyerName}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Total (incl 13% VAT):</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      NRs. {inv.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <VatInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />

      <SupportTicketCenterModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        user={user}
        token={token}
      />

      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        token={token}
      />

    </div>
  );
}
