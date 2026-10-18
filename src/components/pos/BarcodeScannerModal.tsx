import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Barcode, Check, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Product } from '../../types/pos';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setManualCode('');
      setScannedFeedback(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera unavailable or permission denied. You can use manual entry or quick-test scan chips below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleScanSubmit = (codeToScan: string) => {
    const trimmed = codeToScan.trim();
    if (!trimmed) return;
    setScannedFeedback(trimmed);
    onScan(trimmed);
    setTimeout(() => {
      setScannedFeedback(null);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100/70 border border-emerald-200 text-emerald-800 rounded-xl">
              <Barcode className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Barcode Scanner</h3>
              <p className="text-xs text-slate-500">Scan product label or select quick barcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Video Preview with Scanning Reticle */}
          <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Camera className="w-12 h-12 text-slate-500 mb-2" />
                <p className="text-sm font-semibold text-slate-200">Camera Feed Inactive</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {cameraError || 'Allow camera permission to activate live barcode optics.'}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
              </div>
            )}

            {/* Laser scanning line overlay */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-36 border-2 border-emerald-400 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse absolute top-1/2 -translate-y-1/2" />
              <div className="absolute -top-3 left-3 bg-slate-900/95 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                ALIGN BARCODE HERE
              </div>
            </div>

            {scannedFeedback && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-white z-10 animate-in fade-in">
                <Check className="w-12 h-12 text-emerald-400 mb-2" />
                <p className="font-bold text-lg">Barcode Scanned!</p>
                <p className="text-xs font-mono text-emerald-200">{scannedFeedback}</p>
              </div>
            )}
          </div>

          {/* Manual Barcode Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScanSubmit(manualCode);
            }}
            className="space-y-2"
          >
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Manual Barcode Input / Hardware Wedge</span>
              <span className="text-[11px] text-slate-500 font-normal">Supports USB / Bluetooth Scanners</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter or scan barcode digits (e.g. 012000000133)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                Scan Product
              </button>
            </div>
          </form>

          {/* Quick-Scan Test Barcodes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Test Barcodes (Click to simulate scanner):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {products.slice(0, 8).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleScanSubmit(prod.barcode)}
                  className="p-2.5 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                    {prod.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 flex items-center justify-between mt-1">
                    <span>{prod.barcode}</span>
                    <span className="text-emerald-700 font-bold">${prod.sellingPrice.toFixed(2)}</span>
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Standard EAN-13, UPC-A, Code-128 supported</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
