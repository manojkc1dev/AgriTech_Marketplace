import React, { useState, useRef } from "react";
import { Order, User } from "../types";
import { QrCode, Send, ShieldCheck, Sparkles, X, Check, Landmark, Truck, Leaf, FileText, Copy, Upload, Image as ImageIcon, AlertTriangle } from "lucide-react";
import jsQR from "jsqr";
import { useLanguage } from "../context/LanguageContext";

interface SendOrderQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  user: User;
  token: string;
  onQrSent: (orderId: string) => void;
}

export const SendOrderQrModal: React.FC<SendOrderQrModalProps> = ({
  isOpen,
  onClose,
  order,
  user,
  token,
  onQrSent
}) => {
  const { t } = useLanguage();

  const [qrType, setQrType] = useState<"payment" | "batch_tag" | "traceability" | "verification" | "upload_custom">("payment");
  const [bankOrEsewa, setBankOrEsewa] = useState("eSewa");
  const [paymentId, setPaymentId] = useState(user.phone || "9841000000");
  const [bankName, setBankName] = useState("Agricultural Development Bank Nepal (ADBL)");
  const [qualityGrade, setQualityGrade] = useState("Grade A - Export Quality");
  const [dispatchDriver, setDispatchDriver] = useState("Ram Bahadur (Driver)");
  const [dispatchMandi, setDispatchMandi] = useState("Kalimati Wholesale Fruit & Vegetable Market");
  const [customNote, setCustomNote] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Upload QR Image State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);
  const [uploadedQrDecodedText, setUploadedQrDecodedText] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  if (!isOpen || !order) return null;

  const totalAmount = order.quantity * order.agreed_price;

  // Handle uploaded image
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(t("Please select a valid image file (.png, .jpg, .jpeg, .webp)."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImageDataUrl(dataUrl);

      // Attempt to decode QR with jsQR
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert"
            });
            if (code && code.data) {
              setUploadedQrDecodedText(code.data);
            } else {
              setUploadedQrDecodedText(null);
            }
          }
        } catch (err) {
          console.error("Error reading QR image:", err);
          setUploadedQrDecodedText(null);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Generate payload based on selected type
  let generatedPayload = "";
  let generatedTitle = "";
  let qrImgUrl = "";

  if (qrType === "upload_custom") {
    generatedTitle = t("Uploaded Custom QR Code");
    generatedPayload = uploadedImageDataUrl || "NO_IMAGE_UPLOADED";
    qrImgUrl = uploadedImageDataUrl || "";
  } else if (qrType === "payment") {
    generatedTitle = `${bankOrEsewa} ${t("Payment QR")}`;
    generatedPayload = `AGRITECH_PAYMENT|ORDER:${order.id}|FARMER:${user.fullName}|CROP:${order.crop}|AMOUNT_NRS:${totalAmount}|METHOD:${bankOrEsewa}|ID:${paymentId}|BANK:${bankName}`;
    qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(generatedPayload)}`;
  } else if (qrType === "batch_tag" || qrType === "traceability") {
    generatedTitle = t("Harvest Batch & Quality Traceability QR");
    generatedPayload = `AGRITECH_TRACEABILITY|ORDER:${order.id}|CROP:${order.crop}|QTY:${order.quantity}${order.unit}|FARMER:${user.fullName}|DISTRICT:${user.district || 'Dhading'}|GRADE:${qualityGrade}|CERTIFIED:NP_AGRI_GOV`;
    qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(generatedPayload)}`;
  } else {
    generatedTitle = t("Order Dispatch & Handover Verification QR");
    generatedPayload = `AGRITECH_DISPATCH|ORDER:${order.id}|BUYER:${order.buyerName}|DRIVER:${dispatchDriver}|DESTINATION:${dispatchMandi}|TIMESTAMP:${new Date().toISOString()}`;
    qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(generatedPayload)}`;
  }

  if (customNote.trim() && qrType !== "upload_custom") {
    generatedPayload += `|NOTE:${customNote.trim()}`;
  }

  const handleSendQr = async () => {
    setSending(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/orders/${order.id}/negotiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          proposed_price: order.agreed_price,
          message: `📱 Sent ${generatedTitle} to buyer for ${order.crop} order.`,
          qrCodeData: generatedPayload,
          qrType: qrType,
          qrTitle: generatedTitle
        })
      });

      if (res.ok) {
        onQrSent(order.id);
        onClose();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to transmit QR code.");
      }
    } catch (e) {
      setErrorMsg("Network error transmitting QR code.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-850 max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-750 overflow-hidden text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <QrCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">
                {t("Send Order QR Code to Buyer")}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {order.crop} • {order.quantity} {order.unit} @ NRs. {order.agreed_price}/{order.unit} (Total: NRs. {totalAmount})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* QR Type Tabs */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              {t("Select QR Code Category")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setQrType("payment")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  qrType === "payment"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-center">{t("Payment QR")}</span>
              </button>

              <button
                type="button"
                onClick={() => setQrType("traceability")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  qrType === "traceability" || qrType === "batch_tag"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-center">{t("Traceability QR")}</span>
              </button>

              <button
                type="button"
                onClick={() => setQrType("verification")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  qrType === "verification"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-center">{t("Dispatch QR")}</span>
              </button>

              <button
                type="button"
                onClick={() => setQrType("upload_custom")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  qrType === "upload_custom"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-center">{t("Upload QR Image")}</span>
              </button>
            </div>
          </div>

          {/* Type-Specific Options */}
          {qrType === "upload_custom" && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800 rounded-xl p-5 text-center cursor-pointer transition group"
              >
                {uploadedImageDataUrl ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={uploadedImageDataUrl}
                      alt="Uploaded QR Preview"
                      className="w-32 h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white shadow-xs"
                    />
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1 text-xs">
                      <Check className="w-4 h-4" />
                      <span>{t("QR Code Image Loaded")}</span>
                    </div>
                    {uploadedQrDecodedText && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg text-[10px] font-mono text-emerald-900 dark:text-emerald-200 max-w-full break-all">
                        <strong>Decoded Payload:</strong> {uploadedQrDecodedText}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 underline group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {t("Click to change image")}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl mx-auto flex items-center justify-center group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {t("Click to Upload Saved QR Code Image")}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t("Upload eSewa, Khalti, Bank QR, or Custom Batch Tag Image (.png, .jpg, .jpeg)")}
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg font-bold border border-rose-200 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {qrType === "payment" && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                  {t("Payment Wallet / Channel")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQrType("upload_custom");
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t("Or Upload Custom QR Image")}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("Payment Wallet / Channel")}
                  </label>
                  <select
                    value={bankOrEsewa}
                    onChange={(e) => setBankOrEsewa(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="eSewa">eSewa Mobile Wallet</option>
                    <option value="Khalti">Khalti Wallet</option>
                    <option value="Bank Transfer">Bank Direct Transfer</option>
                    <option value="ConnectIPS">ConnectIPS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("Wallet / Phone Number")}
                  </label>
                  <input
                    type="text"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
                    placeholder="e.g. 9841234567"
                  />
                </div>
              </div>

              {bankOrEsewa === "Bank Transfer" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("Bank Name")}
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}

              <div className="p-2 bg-emerald-100/70 dark:bg-emerald-950/80 rounded-lg text-emerald-900 dark:text-emerald-200 font-bold text-[11px] flex items-center justify-between">
                <span>{t("Total Encoded Payment Amount:")}</span>
                <span className="font-mono text-sm">NRs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {(qrType === "traceability" || qrType === "batch_tag") && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {t("Produce Quality Grade")}
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Grade A - Export Quality">Grade A - Premium / Export Quality</option>
                  <option value="Grade B - Standard Wholesale">Grade B - Standard Wholesale Mandi Grade</option>
                  <option value="Organic Certified">Organic Certified Local Crop</option>
                </select>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t("Encodes origin district")}: <strong>{user.district || 'Dhading'}</strong> • {t("Farmer")}: <strong>{user.fullName}</strong>
              </div>
            </div>
          )}

          {qrType === "verification" && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("Driver / Handler")}
                  </label>
                  <input
                    type="text"
                    value={dispatchDriver}
                    onChange={(e) => setDispatchDriver(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("Delivery Mandi / Hub")}
                  </label>
                  <input
                    type="text"
                    value={dispatchMandi}
                    onChange={(e) => setDispatchMandi(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              {t("Additional Note / Instruction (Optional)")}
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please scan QR upon receiving shipment crate..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Live QR Image Preview */}
          <div className="p-4 bg-emerald-50/50 dark:bg-slate-900/80 rounded-2xl border border-emerald-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
            {qrImgUrl ? (
              <img
                src={qrImgUrl}
                alt="Generated QR Preview"
                className="w-28 h-28 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1.5 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-28 h-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] text-center p-2 shrink-0">
                {t("Upload Image to Preview")}
              </div>
            )}
            <div className="space-y-1.5 text-left text-xs text-slate-700 dark:text-slate-300 flex-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider block font-mono">
                {generatedTitle}
              </span>
              <p className="font-mono text-[10px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 break-all max-h-16 overflow-y-auto text-slate-600 dark:text-slate-400">
                {generatedPayload}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-750 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t("Cancel")}
          </button>

          <button
            type="button"
            disabled={sending || (qrType === "upload_custom" && !uploadedImageDataUrl)}
            onClick={handleSendQr}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-emerald-300" />
            <span>{sending ? t("Transmitting...") : t("Send QR Code to Buyer")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
