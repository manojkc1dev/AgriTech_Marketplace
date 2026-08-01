import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { X, Printer, Download, Copy, Check, QrCode, Tag, Leaf, ShieldCheck, MapPin, Calendar, UserCheck } from "lucide-react";
import { ProduceListing, User } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface PrintableBatchQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProduceListing | null;
  user: User;
}

export default function PrintableBatchQrModal({
  isOpen,
  onClose,
  listing,
  user
}: PrintableBatchQrModalProps) {
  const { t } = useLanguage();
  const [qrUrl, setQrUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const printCardRef = useRef<HTMLDivElement>(null);

  const batchPayload = listing ? `AGRI-BATCH:${listing.crop}|Qty:${listing.quantity}|Price:${listing.target_price}|District:${listing.district || user.district || "Nepal"}|Grade:A|BatchId:${listing.id}` : "";

  useEffect(() => {
    if (isOpen && listing && batchPayload) {
      QRCode.toDataURL(batchPayload, {
        margin: 2,
        width: 320,
        color: { dark: "#064e3b", light: "#ffffff" }
      })
        .then(url => setQrUrl(url))
        .catch(err => console.error("Error generating printable QR:", err));
    }
  }, [isOpen, listing, batchPayload]);

  if (!isOpen || !listing) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `Batch-Tag-${listing.crop.replace(/\s+/g, "_")}-${listing.id.slice(-6)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(batchPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden font-sans flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center space-x-1.5">
                <span>{t("Printable Batch Dispatch QR Tag")}</span>
              </h3>
              <p className="text-[10px] text-slate-400">{t("Attach to crate, sack, or truck dispatch lot for digital check-in")}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t("Ready for Crate Labeling")}</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs transition cursor-pointer flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("Save Image")}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition shadow-xs cursor-pointer flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("Print Tag Sheet")}</span>
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Print Target Tag Sheet */}
          <div 
            ref={printCardRef}
            id="printable-batch-tag-sheet"
            className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-md text-slate-900 relative overflow-hidden font-sans print:border-2 print:border-black print:shadow-none"
          >
            {/* Top Brand Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-emerald-700 text-white rounded-lg flex items-center justify-center font-black text-xs">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-wider text-slate-900">
                    KALIMATI AGRI NETWORK
                  </div>
                  <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest">
                    VERIFIED HARVEST DISPATCH TAG
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[9px] font-mono font-bold text-slate-500 uppercase">BATCH CODE</div>
                <div className="text-xs font-mono font-black text-slate-900">#{listing.id.toUpperCase().slice(-8)}</div>
              </div>
            </div>

            {/* Main Grid: QR Code + Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* High Resolution QR Image */}
              <div className="sm:col-span-5 text-center flex flex-col items-center justify-center">
                {qrUrl ? (
                  <div className="p-2 bg-white rounded-xl border-2 border-slate-900 shadow-xs inline-block">
                    <img src={qrUrl} alt="Batch QR Tag" className="w-36 h-36 mx-auto object-contain" />
                  </div>
                ) : (
                  <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                    Generating QR...
                  </div>
                )}
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  SCAN FOR DIGITAL CHECK-IN
                </span>
              </div>

              {/* Crop & Origin Details */}
              <div className="sm:col-span-7 space-y-2.5">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800 block">PRODUCE CROP</span>
                  <div className="text-lg font-black text-slate-900 leading-tight">{listing.crop}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">QUANTITY</span>
                    <span className="font-black text-slate-900 text-sm">{listing.quantity} {listing.unit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">TARGET PRICE</span>
                    <span className="font-black text-emerald-800 text-sm">NRs. {listing.target_price}/{listing.unit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Farmer: {user.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Origin: {listing.district || user.district || "Nepal"} District</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Logged: {new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Seal */}
            <div className="mt-4 pt-2 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center space-x-1 text-emerald-800 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Digitally Authenticated Produce Batch</span>
              </span>
              <span className="font-mono">KALIMATI-TAG-V2</span>
            </div>
          </div>

          {/* Raw Payload Inspector */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
              <span>{t("Embedded QR Metadata Payload")}</span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? t("Copied") : t("Copy Data")}</span>
              </button>
            </div>
            <div className="font-mono text-[10px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all text-slate-700 dark:text-slate-300">
              {batchPayload}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            {t("Close")}
          </button>
        </div>

      </div>

      {/* Print Specific CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-batch-tag-sheet, #printable-batch-tag-sheet * {
            visibility: visible;
          }
          #printable-batch-tag-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
