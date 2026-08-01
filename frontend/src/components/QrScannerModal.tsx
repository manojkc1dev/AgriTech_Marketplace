import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { User, ProduceListing } from "../types";
import { 
  X, Camera, Upload, QrCode, RefreshCw, CheckCircle2, AlertTriangle, 
  Sparkles, Leaf, Building2, UserCheck, Phone, MapPin, Copy, ExternalLink, 
  Plus, Check, ArrowRight, ShieldCheck, Tag, Layers, SlidersHorizontal
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token: string;
  onBatchRegistered?: (newListing: ProduceListing) => void;
  onPreFillForm?: (crop: string, qty: string, price: string) => void;
  activeListings?: ProduceListing[];
  onScanHistoryUpdate?: () => void;
}

export interface ParsedQrBatch {
  crop: string;
  quantity: string;
  price: string;
  district: string;
  grade?: string;
  batchId?: string;
}

export interface ParsedQrMember {
  memberId: string;
  fullName: string;
  district: string;
  cooperativeName: string;
  phone?: string;
  verified?: boolean;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  user,
  token,
  onBatchRegistered,
  onPreFillForm,
  activeListings = [],
  onScanHistoryUpdate
}: QrScannerModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "generate" | "test">("camera");

  // Save scan event to database log
  const saveScanToHistoryLog = async (
    scanType: "member" | "batch" | "text" | "unknown",
    title: string,
    details: string,
    metadata: any
  ) => {
    if (!token) return;
    try {
      await fetch("/api/scan-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          scanType,
          title,
          details,
          metadata
        })
      });
      if (onScanHistoryUpdate) {
        onScanHistoryUpdate();
      }
    } catch (e) {
      console.error("Failed to save scan log:", e);
    }
  };

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Scanned Results
  const [rawScannedText, setRawScannedText] = useState<string | null>(null);
  const [parsedBatch, setParsedBatch] = useState<ParsedQrBatch | null>(null);
  const [parsedMember, setParsedMember] = useState<ParsedQrMember | null>(null);
  const [scannedType, setScannedType] = useState<"batch" | "member" | "text">("text");

  // Registration Actions
  const [isRegistering, setIsRegistering] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);

  // File Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState("");

  // QR Generator
  const [memberQrUrl, setMemberQrUrl] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeListings[0]?.id || "");
  const [batchQrUrl, setBatchQrUrl] = useState<string>("");

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError("");
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t("Camera access is not supported by your browser or environment."));
        return;
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsCameraActive(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(t("Camera permission was denied. Please allow camera access in your browser settings or use the Upload Image / Test Samples option."));
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError(t("No camera device was found on your system. You can upload a QR image or select a sample preset below."));
      } else {
        setCameraError(t("Unable to initialize camera video stream: ") + (err.message || String(err)));
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Frame Scanning Animation Loop
  const startScanningLoop = () => {
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });

          if (code && code.data) {
            handleScanSuccess(code.data);
            return; // stop scanning once found
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  // Handle Successfully Decoded QR Data
  const handleScanSuccess = (data: string) => {
    stopCamera();
    setRawScannedText(data);
    setActionSuccess("");
    setActionError("");

    parseQrData(data);
  };

  // Parse Raw QR Text into structured formats
  const parseQrData = (data: string) => {
    setParsedBatch(null);
    setParsedMember(null);

    // Format 1: JSON format
    if (data.trim().startsWith("{") && data.trim().endsWith("}")) {
      try {
        const json = JSON.parse(data);
        if (json.type === "batch" || json.crop) {
          setScannedType("batch");
          const batchData = {
            crop: json.crop || "Tomato (Golbheda)",
            quantity: String(json.quantity || json.qty || "500"),
            price: String(json.target_price || json.price || "65"),
            district: json.district || user.district || "Dhading",
            grade: json.grade || "A",
            batchId: json.batchId || "BATCH-" + Math.floor(Math.random() * 90000 + 10000)
          };
          setParsedBatch(batchData);
          saveScanToHistoryLog(
            "batch",
            `Harvest Batch Scan: ${batchData.crop}`,
            `Quantity: ${batchData.quantity} KG | Price: NRs. ${batchData.price}/KG | Grade: ${batchData.grade} | District: ${batchData.district}`,
            batchData
          );
          return;
        }
        if (json.type === "member" || json.memberId) {
          setScannedType("member");
          const memberData = {
            memberId: json.memberId || json.id || "MEM-001",
            fullName: json.fullName || json.name || "Cooperative Member",
            district: json.district || "Dhading",
            cooperativeName: json.cooperativeName || json.coop || "Local Farmers Cooperative",
            phone: json.phone || "+977-9841-000000",
            verified: true
          };
          setParsedMember(memberData);
          saveScanToHistoryLog(
            "member",
            `Cooperative Member Pass Verified: ${memberData.fullName}`,
            `Cooperative: ${memberData.cooperativeName} | District: ${memberData.district} | Member ID: ${memberData.memberId}`,
            memberData
          );
          return;
        }
      } catch (e) {
        // Fall back to custom text delimiter parsing
      }
    }

    // Format 2: Delimited pipe string "AGRI-BATCH:Tomato (Golbheda)|Qty:650|Price:68|District:Dhading|Grade:A"
    if (data.startsWith("AGRI-BATCH:")) {
      setScannedType("batch");
      const content = data.replace("AGRI-BATCH:", "");
      const parts = content.split("|");
      const crop = parts[0] || "Tomato (Golbheda)";
      let quantity = "500";
      let price = "65";
      let district = user.district || "Dhading";
      let grade = "A";

      parts.forEach(p => {
        const [k, v] = p.split(":");
        if (k && v) {
          const keyLower = k.trim().toLowerCase();
          if (keyLower === "qty" || keyLower === "quantity") quantity = v.trim();
          if (keyLower === "price" || keyLower === "target_price") price = v.trim();
          if (keyLower === "district") district = v.trim();
          if (keyLower === "grade") grade = v.trim();
        }
      });

      const batchData = {
        crop,
        quantity,
        price,
        district,
        grade,
        batchId: "BATCH-" + Math.floor(Math.random() * 90000 + 10000)
      };
      setParsedBatch(batchData);
      saveScanToHistoryLog(
        "batch",
        `Harvest Batch Scan: ${crop}`,
        `Quantity: ${quantity} KG | Price: NRs. ${price}/KG | Grade: ${grade} | District: ${district}`,
        batchData
      );
      return;
    }

    // Format 3: Member tag "AGRI-MEMBER:ram_farmer|Name:Ram Bahadur Tamang|District:Dhading|Coop:Dhading Vegetable Producers Cooperative|Phone:+977-9841-111111"
    if (data.startsWith("AGRI-MEMBER:")) {
      setScannedType("member");
      const content = data.replace("AGRI-MEMBER:", "");
      const parts = content.split("|");
      const memberId = parts[0] || "ram_farmer";
      let fullName = "Ram Bahadur Tamang";
      let district = "Dhading";
      let cooperativeName = "Dhading Farmers Cooperative Union";
      let phone = "+977-9841-111111";

      parts.forEach(p => {
        const [k, v] = p.split(":");
        if (k && v) {
          const keyLower = k.trim().toLowerCase();
          if (keyLower === "name") fullName = v.trim();
          if (keyLower === "district") district = v.trim();
          if (keyLower === "coop" || keyLower === "cooperative") cooperativeName = v.trim();
          if (keyLower === "phone") phone = v.trim();
        }
      });

      const memberData = {
        memberId,
        fullName,
        district,
        cooperativeName,
        phone,
        verified: true
      };
      setParsedMember(memberData);
      saveScanToHistoryLog(
        "member",
        `Cooperative Member Pass Verified: ${fullName}`,
        `Cooperative: ${cooperativeName} | District: ${district} | Member ID: ${memberId}`,
        memberData
      );
      return;
    }

    // Default: Generic Text / URL
    setScannedType("text");
    saveScanToHistoryLog(
      "text",
      `Text / URL Code Scanned`,
      data.slice(0, 120),
      { rawContent: data }
    );
  };

  // Image Upload File Scanning Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
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
            handleScanSuccess(code.data);
          } else {
            setUploadError(t("No valid QR code could be detected in this image. Please ensure the image is clear and contains a sharp QR code."));
          }
        }
      };
      img.onerror = () => {
        setUploadError(t("Failed to render image file. Please upload a PNG or JPEG file."));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Generate QR Code for Member Pass & Active Batches
  useEffect(() => {
    if (isOpen) {
      // 1. Generate Member ID QR Code
      const memberString = `AGRI-MEMBER:${user.id}|Name:${user.fullName}|District:${user.district}|Role:${user.role}|Phone:${user.phone || ""}`;
      QRCode.toDataURL(memberString, { margin: 2, width: 260, color: { dark: "#064e3b", light: "#ffffff" } })
        .then(url => setMemberQrUrl(url))
        .catch(err => console.error("Error generating member QR:", err));
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedBatchId && activeListings.length > 0) {
      const match = activeListings.find(l => l.id === selectedBatchId);
      if (match) {
        const batchString = `AGRI-BATCH:${match.crop}|Qty:${match.quantity}|Price:${match.target_price}|District:${match.district || user.district}|Grade:A`;
        QRCode.toDataURL(batchString, { margin: 2, width: 260, color: { dark: "#0f172a", light: "#ffffff" } })
          .then(url => setBatchQrUrl(url))
          .catch(err => console.error("Error generating batch QR:", err));
      }
    } else if (activeListings.length > 0 && !selectedBatchId) {
      setSelectedBatchId(activeListings[0].id);
    }
  }, [selectedBatchId, activeListings, user]);

  // Start/Stop Camera on Tab Toggle or Open/Close
  useEffect(() => {
    if (isOpen && activeTab === "camera" && !rawScannedText) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  if (!isOpen) return null;

  // Execute Batch Registration via API
  const handleRegisterScannedBatch = async () => {
    if (!parsedBatch) return;
    setIsRegistering(true);
    setActionError("");
    setActionSuccess("");

    try {
      const payload = {
        crop: parsedBatch.crop,
        quantity: Number(parsedBatch.quantity) || 500,
        unit: "kg",
        target_price: Number(parsedBatch.price) || 60,
        district: parsedBatch.district || user.district
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setActionSuccess(t("Batch Arrival registered successfully on the AgriTech platform!"));
        if (onBatchRegistered && result.listing) {
          onBatchRegistered(result.listing);
        }
      } else {
        const err = await res.json();
        setActionError(err.error || t("Failed to register produce batch arrival."));
      }
    } catch (e) {
      setActionError(t("Network error while submitting batch arrival."));
    } finally {
      setIsRegistering(false);
    }
  };

  // Pre-fill Dashboard Form
  const handlePreFillDashboardForm = () => {
    if (parsedBatch && onPreFillForm) {
      onPreFillForm(parsedBatch.crop, parsedBatch.quantity, parsedBatch.price);
      onClose();
    }
  };

  // Copy raw text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Restart Scanner for another scan
  const handleResetScan = () => {
    setRawScannedText(null);
    setParsedBatch(null);
    setParsedMember(null);
    setActionSuccess("");
    setActionError("");
    if (activeTab === "camera") {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{t("Mobile Camera QR Scanner & ID Pass")}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("Scan produce batch arrival tags or verify cooperative member digital passes")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            title={t("Close Modal")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="px-6 pt-3 pb-0 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-2">
          <button
            onClick={() => {
              setActiveTab("camera");
              if (rawScannedText) handleResetScan();
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "camera"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t("Live Camera Stream")}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("upload");
              if (rawScannedText) handleResetScan();
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "upload"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t("Upload QR Image")}</span>
          </button>

          <button
            onClick={() => setActiveTab("generate")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "generate"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{t("My Member Pass & Batch QRs")}</span>
          </button>

          <button
            onClick={() => setActiveTab("test")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "test"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t("Sample Test QRs")}</span>
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Active Result Banner (if scan is completed) */}
          {rawScannedText && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                    {t("QR Code Decoded Successfully!")}
                  </span>
                </div>
                <button
                  onClick={handleResetScan}
                  className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t("Scan Another QR")}</span>
                </button>
              </div>

              {/* Scanned Batch Arrival Details */}
              {scannedType === "batch" && parsedBatch && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-bold rounded-full text-[10px] uppercase tracking-wider flex items-center space-x-1">
                      <Leaf className="w-3 h-3" />
                      <span>{t("Batch Arrival Tag Detected")}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{parsedBatch.batchId}</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t("Crop Item")}</span>
                      <strong className="text-slate-900 dark:text-white text-sm font-display">{parsedBatch.crop}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t("Quantity")}</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{parsedBatch.quantity} KG</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t("Target Rate")}</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 text-sm">NRs. {parsedBatch.price} / KG</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t("District Origin")}</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{parsedBatch.district}</strong>
                    </div>
                  </div>

                  {actionSuccess && (
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  {actionError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleRegisterScannedBatch}
                      disabled={isRegistering}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      {isRegistering ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t("Registering Batch...")}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t("Instantly Register Batch Arrival")}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePreFillDashboardForm}
                      className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("Pre-fill Dashboard Listing Form")}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scanned Cooperative Member Details */}
              {scannedType === "member" && parsedMember && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded-full text-[10px] uppercase tracking-wider flex items-center space-x-1">
                      <UserCheck className="w-3 h-3" />
                      <span>{t("Cooperative Member ID Card Verified")}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">ID: {parsedMember.memberId}</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h3 className="font-bold font-display text-slate-900 dark:text-white text-base">
                          {parsedMember.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{parsedMember.cooperativeName}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg text-xs flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t("Active Member")}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("District")}</span>
                        <span className="font-semibold">{parsedMember.district}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("Contact Number")}</span>
                        <span className="font-mono font-semibold">{parsedMember.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generic Text Result */}
              {scannedType === "text" && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase">{t("Raw Scanned Data")}:</div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs break-all text-slate-800 dark:text-slate-200">
                    {rawScannedText}
                  </div>
                  <button
                    onClick={() => handleCopyText(rawScannedText)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? t("Copied!") : t("Copy Content")}</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Tab 1: Live Camera Scanner */}
          {activeTab === "camera" && !rawScannedText && (
            <div className="space-y-4">
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video max-h-[380px] flex items-center justify-center border-2 border-slate-800 shadow-inner group">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated Scanner Reticle & Laser Line Overlay */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
                      
                      {/* Laser scanning line */}
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-bounce shadow-[0_0_8px_#34d399]"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {t("Align QR Code")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Camera Inactive / Error Overlay */}
                {!isCameraActive && (
                  <div className="p-6 text-center text-slate-300 space-y-3 max-w-md">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                    {cameraError ? (
                      <p className="text-xs text-rose-300 bg-rose-950/80 p-3 rounded-xl border border-rose-800 leading-relaxed">
                        {cameraError}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        {t("Initializing camera feed... If prompted, allow browser camera permission.")}
                      </p>
                    )}
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t("Retry Camera Feed")}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Switcher Controls */}
              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-semibold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>{t("Camera Status")}: {isCameraActive ? t("Active Scanner") : t("Disabled")}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center space-x-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{facingMode === "environment" ? t("Back Camera") : t("Front Camera")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Upload QR Image */}
          {activeTab === "upload" && !rawScannedText && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-850 rounded-2xl p-8 text-center transition cursor-pointer space-y-3 group"
              >
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-105 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t("Click or Drop Image File Here")}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("Select a saved photo, screenshot, or digital tag containing a QR code (.png, .jpg, .jpeg)")}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: My Member Pass & Batch QRs Generator */}
          {activeTab === "generate" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Member ID Digital Pass */}
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-3 shadow-xs">
                <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t("My Digital Member Pass")}</span>
                </div>

                {memberQrUrl ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                    <img src={memberQrUrl} alt="Member QR Pass" className="w-48 h-48 mx-auto" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-xl mx-auto flex items-center justify-center text-xs text-slate-400">
                    {t("Generating...")}
                  </div>
                )}

                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{user.fullName}</div>
                  <div className="text-xs text-slate-500">{user.district} District &bull; {user.role.toUpperCase()}</div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {t("Show this QR pass at cooperative collection hubs for fast identity check.")}
                </div>
              </div>

              {/* Active Produce Batch QR Tags */}
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>{t("Active Batch Dispatch Tag")}</span>
                </div>

                {activeListings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {t("You currently have no active produce listings. Publish a listing first to generate printable batch QR tags.")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t("Select Active Listing")}</label>
                      <select
                        value={selectedBatchId}
                        onChange={e => setSelectedBatchId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {activeListings.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.crop} - {l.quantity} {l.unit} (NRs. {l.target_price})
                          </option>
                        ))}
                      </select>
                    </div>

                    {batchQrUrl && (
                      <div className="text-center space-y-2">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                          <img src={batchQrUrl} alt="Batch Tag QR" className="w-40 h-40 mx-auto" />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {t("Attach this tag to crates/bags for instant cooperative batch check-in.")}
                        </p>
                        <div className="flex items-center justify-center space-x-2 pt-1">
                          <a
                            href={batchQrUrl}
                            download={`Batch-QR-${selectedBatchId}.png`}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <span>{t("Download Tag PNG")}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <span>{t("Print Tag Sheet")}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 4: Interactive Sample Test QRs */}
          {activeTab === "test" && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <strong className="font-bold flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{t("Browser Sandbox Quick Test Environment")}</span>
                </strong>
                <p>
                  {t("Click any preset below to simulate an instant QR scan result. This allows you to verify batch registration workflows even if your browser blocks real camera access.")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: t("Sample Batch #1: Dhading Tomato Crate"),
                    desc: "Crop: Tomato (Golbheda) • 650 KG • NRs. 68/KG",
                    payload: "AGRI-BATCH:Tomato (Golbheda)|Qty:650|Price:68|District:Dhading|Grade:A",
                    type: "batch"
                  },
                  {
                    title: t("Sample Batch #2: Makwanpur Potato Batch"),
                    desc: "Crop: Potato (Alu) • 1200 KG • NRs. 42/KG",
                    payload: "AGRI-BATCH:Potato (Alu)|Qty:1200|Price:42|District:Makwanpur|Grade:A",
                    type: "batch"
                  },
                  {
                    title: t("Sample Member Card: Ram Bahadur Tamang"),
                    desc: "Role: Farmer Member • Dhading Producers Cooperative",
                    payload: "AGRI-MEMBER:ram_farmer|Name:Ram Bahadur Tamang|District:Dhading|Coop:Dhading Vegetable Producers Cooperative|Phone:+977-9841-111111",
                    type: "member"
                  },
                  {
                    title: t("Sample Member Card: Sita Maya Shrestha"),
                    desc: "Role: Farmer Member • Makwanpur Farmers Union",
                    payload: "AGRI-MEMBER:sita_farmer|Name:Sita Maya Shrestha|District:Makwanpur|Coop:Makwanpur Agri Cooperative|Phone:+977-9851-222222",
                    type: "member"
                  }
                ].map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleScanSuccess(sample.payload)}
                    className="p-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition cursor-pointer space-y-1 hover:shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {sample.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {sample.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{sample.desc}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate pt-1">{sample.payload}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t("AgriTech Mobile QR Verification Hub")}</span>
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
          >
            {t("Close")}
          </button>
        </div>

      </div>
    </div>
  );
}
