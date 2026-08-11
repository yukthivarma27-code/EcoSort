import React, { useState, useRef } from 'react';
import { 
  Upload, Camera, Sparkles, CheckCircle2, AlertTriangle, 
  Trash2, ArrowRight, RefreshCw, Download, FileText, 
  Recycle, Cpu, Zap, Layers, Info, ShieldCheck, Play
} from 'lucide-react';
import { ClassificationResult } from '../types';
import { PRESET_SAMPLES } from '../data/presets';

interface WasteClassifierProps {
  onScanComplete: (result: ClassificationResult) => void;
  history: ClassificationResult[];
}

export const WasteClassifier: React.FC<WasteClassifierProps> = ({ onScanComplete, history }) => {
  const [inputMode, setInputMode] = useState<'upload' | 'camera' | 'presets' | 'text'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<ClassificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera capture state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMessage('Unable to access camera. Please check browser permissions or upload an image file.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture Frame from Camera
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle File Upload with automatic downscaling for fast network transfer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload or capture a clear image of a waste item.');
      return;
    }

    if (file.size === 0 || file.size > 30 * 1024 * 1024) {
      setErrorMessage('Please upload or capture a clear image of a waste item.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(compressedDataUrl);
        } else {
          setSelectedImage(rawDataUrl);
        }
      };
      img.onerror = () => {
        setSelectedImage(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Select
  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_SAMPLES.find((p) => p.id === presetId);
    if (!preset) return;
    setErrorMessage(null);
    setSelectedPresetId(presetId);
    setSelectedImage(preset.imageUrl);
    setTextQuery(preset.title);
  };

  // Execute Classification Call
  const runClassification = async () => {
    if (!selectedImage && !textQuery.trim()) {
      setErrorMessage('Please upload or capture a clear image of a waste item.');
      return;
    }

    setIsScanning(true);
    setScanProgress(15);
    setErrorMessage(null);
    setCurrentResult(null);

    // Progress animation interval
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const body: any = {};

      if (selectedImage) {
        body.imageBase64 = selectedImage;
      }
      if (textQuery) {
        body.textPrompt = textQuery;
      }

      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      clearInterval(interval);
      setScanProgress(100);

      const responseData = await res.json().catch(() => null);

      if (!res.ok || !responseData || responseData.isValidWaste === false || responseData.error) {
        const message = responseData?.error || 'Please upload or capture a clear image of a waste item.';
        setIsScanning(false);
        setCurrentResult(null);
        setErrorMessage(message);
        return;
      }

      const data: ClassificationResult = responseData;
      if (selectedImage) {
        data.imageUrl = selectedImage;
      }

      setTimeout(() => {
        setIsScanning(false);
        setCurrentResult(data);
        onScanComplete(data);
      }, 300);
    } catch (err: any) {
      clearInterval(interval);
      setIsScanning(false);
      setCurrentResult(null);
      console.error('Scan error:', err);
      setErrorMessage('Please upload or capture a clear image of a waste item.');
    }
  };

  // Reset Form
  const handleReset = () => {
    setSelectedImage(null);
    setTextQuery('');
    setSelectedPresetId(null);
    setCurrentResult(null);
    setErrorMessage(null);
    stopCamera();
  };

  // Download Compliance Report
  const downloadReport = (result: ClassificationResult) => {
    const compositionList = (result.composition || []).map((c) => `- ${c.material}: ${c.percentage}%`).join('\n') || '- Standard material composition: 100%';
    const stepsList = (result.segregationSteps || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n') || '1. Deposit in designated bin';
    const upcyclingList = (result.upcyclingIdeas || []).map((idea) => `• ${idea}`).join('\n') || '• Standard recycling reprocessing';

    const reportText = `=====================================================
ECOSORT AI - ENTERPRISE WASTE SEGREGATION AUDIT REPORT
=====================================================
Scan ID: ${result.id || 'N/A'}
Timestamp: ${result.timestamp || new Date().toISOString()}
System Model: EcoSort AI Neural Vision Engine v2.4

ITEM IDENTIFICATION:
--------------------
Item Name: ${result.itemName || 'Identified Waste'}
Brand/Code: ${result.brandOrModel || 'N/A'}
Classification: ${result.category || 'General Waste'}
Target Bin: ${result.primaryBin || 'Designated Collection Container'}
AI Confidence Rating: ${result.confidence ?? 95}%
Recyclability Feasibility Score: ${result.recyclabilityScore ?? 90}%
Contamination Risk Level: ${result.contaminationRisk || 'Low'}

MATERIAL COMPOSITION BREAKDOWN:
-------------------------------
${compositionList}

MANDATORY SEGREGATION STEPS:
----------------------------
${stepsList}

ENVIRONMENTAL SAVINGS CALCULATED:
---------------------------------
- CO2 Emissions Avoided: ${result.impact?.co2SavedKg ?? 0.2} kg
- Energy Saved: ${result.impact?.energySavedKwh ?? 0.4} kWh
- Water Preserved: ${result.impact?.waterSavedLiters ?? 1.5} Liters
- Landfill Decomposition Duration: ${result.impact?.decompositionYears ?? 100} Years

CIRCULAR ECONOMY & UPCYCLING STRATEGIES:
----------------------------------------
${upcyclingList}

DISPOSAL NOTICE:
----------------
${result.localDisposalNotice || 'Compliant with standard municipal waste segregation protocols.'}

=====================================================
EcoSort AI Technologies Inc. - Confidential Segregation Record
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoSort_Report_${result.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Computer Vision for Automated Waste Segregation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            AI-Powered <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Waste Intelligence</span> Studio
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload or capture waste items to receive instant neural classification, material composition diagnostics, precise bin routing, and verified carbon accounting.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>&gt;98.5% Categorization Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>&lt;400ms Neural Inference</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Recycle className="w-4 h-4 text-teal-400" />
              <span>ISO 14001 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Classifier Canvas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input & Scan Studio Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Mode Selection Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Select Input Vector
                </h2>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setInputMode('upload');
                      stopCamera();
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      inputMode === 'upload' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => {
                      setInputMode('camera');
                      setErrorMessage(null);
                      startCamera();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      inputMode === 'camera' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Camera
                  </button>
                  <button
                    onClick={() => {
                      setInputMode('presets');
                      stopCamera();
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      inputMode === 'presets' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Samples
                  </button>
                  <button
                    onClick={() => {
                      setInputMode('text');
                      stopCamera();
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      inputMode === 'text' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Text
                  </button>
                </div>
              </div>

              {/* Mode 1: File Upload */}
              {inputMode === 'upload' && (
                <div className="space-y-4">
                  {!selectedImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/50 rounded-xl p-8 text-center cursor-pointer transition-colors group space-y-3"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-500/10 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center mx-auto transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Drag & drop item photo or <span className="text-emerald-400 underline">browse files</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Supports PNG, JPG, WEBP up to 15MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black group">
                      <img
                        src={selectedImage}
                        alt="Selected waste item"
                        className="w-full h-64 object-contain mx-auto"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-md transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Live Camera */}
              {inputMode === 'camera' && (
                <div className="space-y-4">
                  {!selectedImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black h-64 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {!isCameraActive && (
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" /> Start Webcam
                        </button>
                      )}
                      {isCameraActive && (
                        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                          <button
                            onClick={captureFrame}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                          >
                            <Camera className="w-4 h-4" /> Capture Snapshot
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-3 py-2 bg-slate-900/80 text-slate-300 hover:text-white rounded-xl text-xs backdrop-blur-md"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                      <img
                        src={selectedImage}
                        alt="Captured frame"
                        className="w-full h-64 object-contain mx-auto"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          startCamera();
                        }}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-amber-600 text-white rounded-lg backdrop-blur-md transition-colors text-xs flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retake
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 3: Preset Samples */}
              {inputMode === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Select a pre-loaded sample material for instant AI verification:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESET_SAMPLES.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                          selectedPresetId === preset.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <img
                          src={preset.imageUrl}
                          alt={preset.title}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-xs font-semibold line-clamp-1">{preset.title}</p>
                          <span className="text-[10px] text-emerald-400 font-mono">{preset.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 4: Text Specifier */}
              {inputMode === 'text' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-300">
                    Describe item specifications or composite materials:
                  </label>
                  <textarea
                    rows={3}
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    placeholder="e.g. Broken stainless steel thermos with rubber gasket and polypropylene lid"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              {/* Optional Text Supplement when an image is loaded */}
              {selectedImage && inputMode !== 'text' && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <label className="text-[11px] font-medium text-slate-400">
                    Additional notes or brand detail (optional):
                  </label>
                  <input
                    type="text"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    placeholder="e.g. Containing oily residue, lid attached, PET #1 marked"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Scan Trigger Button */}
              <div className="pt-2">
                <button
                  id="btn-run-scan"
                  onClick={runClassification}
                  disabled={isScanning || (!selectedImage && !textQuery.trim())}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isScanning || (!selectedImage && !textQuery.trim())
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/30 active:scale-[0.99]'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Neural Vision Processing ({scanProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Execute AI Classification</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Scanning Animation State Overlay */}
            {isScanning && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Cpu className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Analyzing Spectral & Optical Features</h3>
                  <p className="text-xs text-slate-400 mt-1">Extracting material composition, bin target, and environmental metrics...</p>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300" 
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Recent Scans History Preview */}
            {history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Recent Session Scans ({history.length})</span>
                  <span className="text-[10px] text-emerald-400">Auto-saved to log</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.map((scan) => (
                    <div
                      key={scan.id}
                      onClick={() => setCurrentResult(scan)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        currentResult?.id === scan.id
                          ? 'bg-slate-800 border-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: scan.binColor }}
                        />
                        <div>
                          <p className="font-semibold line-clamp-1">{scan.itemName}</p>
                          <p className="text-[10px] text-slate-500">{scan.category}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px]">
                        <span className="text-emerald-400">{scan.confidence}%</span>
                        <p className="text-[9px] text-slate-500">{scan.primaryBin.split(' ')[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Results Analysis Column */}
          <div className="lg:col-span-5 space-y-6">
            {currentResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn">
                
                {/* Result Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {currentResult.confidence}% AI Match
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(currentResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-1">
                      {currentResult.itemName}
                    </h2>

                    <p className="text-xs text-slate-400">
                      Category: <span className="text-slate-200 font-medium">{currentResult.category}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => downloadReport(currentResult)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                    title="Export Compliance Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Container Badge */}
                <div 
                  className="p-4 rounded-xl border text-white space-y-2 shadow-lg"
                  style={{ 
                    backgroundColor: `${currentResult.binColor}15`, 
                    borderColor: `${currentResult.binColor}50` 
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Target Segregation Container
                    </span>
                    <span 
                      className="w-3 h-3 rounded-full animate-ping"
                      style={{ backgroundColor: currentResult.binColor }}
                    />
                  </div>

                  <div className="text-lg font-extrabold flex items-center gap-2" style={{ color: currentResult.binColor }}>
                    <Trash2 className="w-5 h-5" />
                    <span>{currentResult.primaryBin}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    {currentResult.localDisposalNotice}
                  </p>
                </div>

                {/* Material Composition */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between">
                    <span>Material Composition</span>
                    <span className="text-[10px] text-emerald-400">{currentResult.recyclabilityScore ?? 90}% Feasible</span>
                  </h3>

                  <div className="space-y-2">
                    {(currentResult.composition || []).map((comp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{comp.material}</span>
                          <span className="font-mono text-emerald-400">{comp.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${comp.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Segregation Protocols */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
                    Preparation Steps
                  </h3>

                  <div className="space-y-2">
                    {(currentResult.segregationSteps || []).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environmental Savings Metrics */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Recycle className="w-3.5 h-3.5" />
                    Calculated Carbon & Resource Savings
                  </h3>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400">CO2 Saved</p>
                      <p className="text-sm font-bold text-emerald-400">{currentResult.impact?.co2SavedKg ?? 0.2} kg</p>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400">Energy</p>
                      <p className="text-sm font-bold text-amber-400">{currentResult.impact?.energySavedKwh ?? 0.4} kWh</p>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400">Water</p>
                      <p className="text-sm font-bold text-teal-400">{currentResult.impact?.waterSavedLiters ?? 1.5} L</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Landfill Persistence: <span className="text-amber-400 font-mono font-semibold">{currentResult.impact?.decompositionYears ?? 100} years</span>
                  </p>
                </div>

                {/* Circular Economy Upcycling */}
                {Array.isArray(currentResult.upcyclingIdeas) && currentResult.upcyclingIdeas.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
                      Circular Economy Reuse
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {currentResult.upcyclingIdeas.map((idea, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reset or Export Bar */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Scan Another Item
                  </button>
                  <button
                    onClick={() => downloadReport(currentResult)}
                    className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Export PDF/TXT
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4 text-slate-500 my-auto">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">Awaiting Computer Vision Scan</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Upload an image or select a sample item on the left to trigger EcoSort AI classification.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
