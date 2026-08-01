import React from "react";
import { Invoice } from "../types";
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, FileText, QrCode } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface VatInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function VatInvoiceModal({ isOpen, onClose, invoice }: VatInvoiceModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Modal Header Controls (Hidden during browser print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t("Official Tax Invoice")} (कर बिजक)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t("Print / PDF")}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT */}
        <div className="p-6 md:p-8 space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:p-0">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span className="text-xl font-black tracking-tight text-emerald-800 dark:text-emerald-400 print:text-black">
                  AGRITECH NEPAL B2B
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 print:text-slate-700">
                Inland Revenue Department (IRD) Registered Agriculture Exchange
              </p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                PAN / VAT No: 601284910 | Kathmandu, Nepal
              </p>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {invoice.status.toUpperCase()} (भुक्तानी चुक्ता)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Issue Date: <span className="font-mono text-slate-800 dark:text-slate-200">{new Date(invoice.issuedAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Billing Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-750">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Seller / Supplier (विक्रेता / किसान)
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {invoice.farmerName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cooperative: {invoice.cooperativeName || "Dhading Farmers Cooperative Union"}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Buyer / Customer (खरीदकर्ता)
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {invoice.buyerName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order Ref: <span className="font-mono text-slate-700 dark:text-slate-300">#{invoice.orderId}</span>
              </p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Item Description (कृषि उपज)</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Subtotal (रु.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">{invoice.crop} (Grade-A)</td>
                  <td className="p-3 text-right font-mono">{invoice.quantity} {invoice.unit}</td>
                  <td className="p-3 text-right font-mono">NRs. {invoice.pricePerUnit}</td>
                  <td className="p-3 text-right font-mono font-bold">NRs. {invoice.subtotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cost Breakdown & Tax */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs space-y-1 max-w-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Split-Payment Settlement Lock Active</span>
              </div>
              <p>Payment via {invoice.paymentMethod}. Funds held inescrow until weigh-in verification at destination hub.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">NRs. {invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Highway Cold-Chain Logistics (4%):</span>
                <span className="font-mono">NRs. {invoice.logisticsFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cooperative Service Fee (2%):</span>
                <span className="font-mono">NRs. {invoice.cooperativeServiceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Nepal VAT (13%):</span>
                <span className="font-mono">NRs. {invoice.vatAmount.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              <div className="flex justify-between text-sm font-black text-emerald-800 dark:text-emerald-300">
                <span>Total Amount Due:</span>
                <span className="font-mono">NRs. {invoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & QR Authorization */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              <p className="font-mono">Digital Signature Hash: 0x8491...e319</p>
              <p>Generated via AGRITECH B2B Exchange Platform</p>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
