import React, { useState } from "react";
import { Negotiation, Order } from "../types";
import { QrCode, Copy, Check, Download, Eye, ShieldCheck, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface NegotiationQrCardProps {
  negotiation: Negotiation;
  order: Order;
}

export const NegotiationQrCard: React.FC<NegotiationQrCardProps> = ({ negotiation, order }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isLargePreviewOpen, setIsLargePreviewOpen] = useState(false);

  if (!negotiation.qrCodeData) return null;

  const qrData = negotiation.qrCodeData;
  const qrTitle = negotiation.qrTitle || t("Order QR Code");
  const qrType = negotiation.qrType || "payment";

  const isDataOrHttpUrl = qrData.startsWith("data:image/") || qrData.startsWith("http://") || qrData.startsWith("https://");
  const qrImgUrl = isDataOrHttpUrl ? qrData : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrImgUrl;
    link.download = `Agritech_Order_QR_${order.id}_${qrType}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-2.5 p-3.5 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 dark:from-emerald-950/40 dark:to-slate-850 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg shadow-2xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
              <span>{qrTitle}</span>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            </h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {t("Order")} #{order.id.slice(0, 8)} • {order.crop}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-700 text-white dark:bg-emerald-600 shadow-2xs">
          {qrType.replace('_', ' ')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3.5">
        <div 
          onClick={() => setIsLargePreviewOpen(true)}
          className="relative group cursor-pointer shrink-0 bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-xs transition hover:scale-105"
          title={t("Click to view larger QR code")}
        >
          <img 
            src={qrImgUrl} 
            alt="Negotiation QR Code" 
            className="w-28 h-28 object-contain rounded-lg"
          />
          <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold">
            <Eye className="w-5 h-5 mr-1" />
            <span>{t("Enlarge")}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 w-full text-left">
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/80 dark:border-slate-750 font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all leading-tight max-h-16 overflow-y-auto">
            {qrData}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
              <span>{copied ? t("Copied!") : t("Copy QR Data")}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              <Download className="w-3 h-3 text-emerald-100" />
              <span>{t("Save QR Image")}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLargePreviewOpen(true)}
              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>{t("Scan / View Large")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Large Modal Preview */}
      {isLargePreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-850 max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-750 p-6 text-center relative space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
                  {qrType.replace('_', ' ')}
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {qrTitle}
                </h4>
              </div>
              <button
                onClick={() => setIsLargePreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/50 dark:bg-slate-900/80 p-5 rounded-2xl border border-emerald-200 dark:border-slate-750 flex flex-col items-center">
              <img
                src={qrImgUrl}
                alt="Enlarged QR Code"
                className="w-56 h-56 object-contain rounded-xl border border-white dark:border-slate-800 shadow-md bg-white p-2"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {t("Scan using any mobile camera or eSewa/Khalti banking app")}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-left font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">QR Raw Payload:</span>
              {qrData}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t("Copied!") : t("Copy Data")}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t("Download")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
