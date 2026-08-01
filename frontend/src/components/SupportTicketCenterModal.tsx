import React, { useState, useEffect } from "react";
import { User, SupportTicket, SupportTicketResponse } from "../types";
import { X, MessageSquare, AlertTriangle, CheckCircle2, Clock, Plus, Send, ShieldAlert, Sparkles, User as UserIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface SupportTicketCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token: string;
}

export default function SupportTicketCenterModal({ isOpen, onClose, user, token }: SupportTicketCenterModalProps) {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tickets" | "create">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New Ticket Form State
  const [category, setCategory] = useState<SupportTicket["category"]>("shipping_delay");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState("");
  const [formMsg, setFormMsg] = useState("");

  // Response Message State
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support-tickets", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (data.length > 0 && !selectedTicket) {
          setSelectedTicket(data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setFormMsg("Please enter both a subject and description.");
      return;
    }

    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          priority,
          subject,
          description,
          orderId: orderId.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFormMsg("Dispute/Support ticket filed successfully.");
        setSubject("");
        setDescription("");
        setOrderId("");
        fetchTickets();
        setTimeout(() => {
          setActiveTab("tickets");
          setFormMsg("");
        }, 1200);
      }
    } catch (e) {
      console.error("Error filing support ticket:", e);
    }
  };

  const handleSendResponse = async (ticketId: string) => {
    if (!replyMessage.trim()) return;

    try {
      const res = await fetch(`/api/support-tickets/${ticketId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setReplyMessage("");
        fetchTickets();
      }
    } catch (e) {
      console.error("Failed to send ticket reply:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t("Dispute Resolution & Support Center")} (उजुरी र सहयोग)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quality claims, highway shipment delays & multi-language mediation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === "create"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t("File New Ticket")}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "create" ? (
            <div className="w-full p-6 overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>File a Quality, Shipping, or Payment Dispute</span>
              </h4>

              {formMsg && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  {formMsg}
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    >
                      <option value="shipping_delay">Highway Logistics / Shipping Delay</option>
                      <option value="quality_dispute">Crop Quality / Grade Dispute</option>
                      <option value="payment_issue">Payment & Escrow Settlement Issue</option>
                      <option value="kyc_issue">KYC & Verification Help</option>
                      <option value="other">General Platform Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent / Cold-Chain Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Related Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., o1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the dispute"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Explanation
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full details regarding crate counts, driver reports, or quality discrepancies..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Submit Support Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tickets")}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="w-full flex h-full">
              {/* Ticket List Sidebar */}
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50/50 dark:bg-slate-850/50">
                {tickets.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No active dispute tickets found.
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-3.5 text-left border-b border-slate-200/70 dark:border-slate-800 transition cursor-pointer ${
                        selectedTicket?.id === ticket.id
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span className="uppercase">{ticket.category.replace('_', ' ')}</span>
                        <span className={`px-1.5 py-0.25 rounded-full font-mono ${
                          ticket.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          ticket.status === 'in_progress' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                        {ticket.subject}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {ticket.description}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Active Ticket Conversation Thread */}
              <div className="w-2/3 flex flex-col h-full bg-white dark:bg-slate-900">
                {selectedTicket ? (
                  <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Ticket ID: #{selectedTicket.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          Filed by {selectedTicket.userName} ({selectedTicket.userRole})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {selectedTicket.subject}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {/* Messages Thread */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {(selectedTicket.responses || []).length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                          No responses yet. Platform mediator will update this thread.
                        </div>
                      ) : (
                        selectedTicket.responses.map((resp) => (
                          <div
                            key={resp.id}
                            className={`p-3 rounded-xl max-w-lg text-xs space-y-1 ${
                              resp.userRole === "admin"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 ml-auto"
                                : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                              <span>{resp.senderName} ({resp.userRole})</span>
                              <span className="font-mono">{new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">
                              {resp.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Input Box */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendResponse(selectedTicket.id)}
                        placeholder="Write a response message..."
                        className="flex-1 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                      />
                      <button
                        onClick={() => handleSendResponse(selectedTicket.id)}
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                    Select a ticket on the left to view dispute thread.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
