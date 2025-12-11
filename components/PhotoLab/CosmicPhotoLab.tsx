import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, UploadCloud, Maximize, CheckCircle, Download, RefreshCw, 
  Zap, Sliders, Image as ImageIcon, Lock, Unlock, AlertTriangle, Scale, MoveDiagonal
} from 'lucide-react';

interface CosmicPhotoLabProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
}

const CosmicPhotoLab: React.FC<CosmicPhotoLabProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Resolution State
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [scalePercent, setScalePercent] = useState(100);
  const [aspectLocked, setAspectLocked] = useState(true);
  
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setError("Invalid file format. Please upload a standard image file (JPG, PNG).");
        return;
      }

      setOriginalFile(file);
      const reader = new FileReader();
      
      reader.onload = (ev) => {
        if (ev.target?.result) {
            const src = ev.target.result as string;
            // Load image to get dimensions
            const img = new Image();
            img.onload = () => {
                setOriginalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
                setTargetWidth(img.naturalWidth);
                setTargetHeight(img.naturalHeight);
                setScalePercent(100);
                setImageSrc(src);
                setStep(2);
            };
            img.onerror = () => setError("Failed to analyze image dimensions.");
            img.src = src;
        } else {
            setError("Failed to decode visual data stream.");
        }
      };
      
      reader.onerror = () => setError("Error reading file structure.");
      reader.readAsDataURL(file);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    setScalePercent(pct);
    setTargetWidth(Math.round(originalDimensions.w * (pct / 100)));
    setTargetHeight(Math.round(originalDimensions.h * (pct / 100)));
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (aspectLocked && originalDimensions.w > 0) {
        const ratio = originalDimensions.h / originalDimensions.w;
        setTargetHeight(Math.round(val * ratio));
        setScalePercent(Math.round((val / originalDimensions.w) * 100));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (aspectLocked && originalDimensions.h > 0) {
        const ratio = originalDimensions.w / originalDimensions.h;
        setTargetWidth(Math.round(val * ratio));
        setScalePercent(Math.round((val / originalDimensions.h) * 100));
    }
  };

  const processImage = async () => {
    if (!imageSrc || !originalFile) return;

    setProcessing(true);
    setError(null);
    
    try {
        // Create an off-screen canvas to resize the image
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error("Failed to initialize image processor.");

        const img = new Image();
        img.src = imageSrc;
        
        // Wait for image to load before drawing
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // Set high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the resized image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export to Data URL
        const mimeType = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        
        setResultUrl(dataUrl);

        // Calculate approximate size for display
        const head = 'data:' + mimeType + ';base64,';
        const sizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        const sizeStr = (sizeBytes / 1024 / 1024).toFixed(2) + ' MB';

        const actionDesc = scalePercent > 100 
            ? `Upscaled to ${targetWidth}x${targetHeight} (${scalePercent}%)`
            : `Downscaled to ${targetWidth}x${targetHeight} (${scalePercent}%)`;
            
        onComplete(
            `resized-${originalFile.name}`, 
            actionDesc, 
            sizeStr
        );
        
        // Add a small artificial delay for UX (showing the spinner)
        setTimeout(() => {
             setStep(3);
             setProcessing(false);
        }, 800);

    } catch (err) {
        console.error(err);
        setError("Image processing failed. Please try a smaller image.");
        setProcessing(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[85vh] flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <MoveDiagonal className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 tracking-wide">PIXEL PERFECT RESIZER</h2>
                <span className="text-xs text-indigo-400/70 font-mono tracking-[0.2em] uppercase">Resolution & Scale Engine</span>
            </div>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Return
        </button>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
           <div 
            className={`group relative w-full max-w-2xl border-2 border-dashed rounded-3xl p-20 text-center bg-[#13112c]/60 backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.1)] 
                ${error ? 'border-red-500/50 hover:border-red-400' : 'border-indigo-500/30 hover:bg-[#1a163a]/80 hover:border-indigo-400'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
            />
            
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform duration-500
                ${error ? 'bg-gradient-to-tr from-red-500 to-orange-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'}`}>
               {error ? <AlertTriangle className="w-10 h-10 text-white" /> : <ImageIcon className="w-10 h-10 text-white" />}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Select Image</h3>
            <p className="text-slate-400">Upload to resize, upscale, or downscale</p>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-500/10 text-red-400 px-6 py-4 rounded-xl border border-red-500/20 flex items-center gap-3 max-w-md animate-fade-in">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{error}</span>
            </div>
           )}
        </div>
      )}

      {/* STEP 2: RESIZE CONTROLS */}
      {step === 2 && imageSrc && (
        <div className="flex-1 flex flex-col lg:flex-row gap-8 animate-fade-in h-full">
            
            {/* LEFT: IMAGE PREVIEW */}
            <div className="flex-1 relative bg-[#090915] rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <img 
                    src={imageSrc} 
                    alt="Subject" 
                    className="max-h-[600px] max-w-full object-contain rounded-lg border border-white/20 shadow-2xl z-10" 
                />
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-cyan-400">
                    Original: {originalDimensions.w} x {originalDimensions.h}
                </div>
            </div>

            {/* RIGHT: CONTROL CARD */}
            <div className="w-full lg:w-96 flex flex-col justify-center">
                <div className="bg-[#1a163a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl space-y-8">
                    
                    <div className="flex items-center gap-3 mb-2">
                        <Sliders className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">Scale Resolution</h3>
                    </div>

                    {/* Scale Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>Scale Factor</span>
                            <span className={scalePercent > 100 ? 'text-purple-400' : scalePercent < 100 ? 'text-cyan-400' : 'text-white'}>
                                {scalePercent}%
                            </span>
                        </div>
                        <input
                             type="range"
                             min="1"
                             max="300"
                             value={scalePercent}
                             onChange={handleSliderChange}
                             className="w-full h-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-lg appearance-none cursor-pointer outline-none
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                             [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(99,102,241,0.8)]
                             hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>1%</span>
                            <span>100%</span>
                            <span>300%</span>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Dimensions Inputs */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>Target Dimensions</span>
                            <button 
                                onClick={() => setAspectLocked(!aspectLocked)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${aspectLocked ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                                title={aspectLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                            >
                                {aspectLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                <span className="text-[10px]">{aspectLocked ? 'Locked' : 'Unlocked'}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold block">Width (px)</label>
                                <input 
                                    type="number" 
                                    value={targetWidth}
                                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="pt-6">
                                <Scale className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold block">Height (px)</label>
                                <input 
                                    type="number" 
                                    value={targetHeight}
                                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4">
                        {processing ? (
                            <button disabled className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex items-center justify-center gap-3 cursor-wait">
                                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                                <span className="uppercase tracking-widest text-xs font-bold">Resizing...</span>
                            </button>
                        ) : (
                            <button 
                                onClick={processImage}
                                className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2 relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                <Zap className="w-5 h-5" />
                                <span>PROCESS IMAGE</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* STEP 3: RESULT */}
      {step === 3 && resultUrl && (
         <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
          <div className="w-24 h-24 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h3 className="text-4xl font-bold text-white mb-2">Process Complete</h3>
          <p className="text-slate-400 mb-10 text-lg">Your resized image is ready.</p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <a 
              href={resultUrl}
              download={`resized-${originalFile?.name || 'image.jpg'}`}
              className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              <Download className="w-6 h-6" />
              Download Image
            </a>
            <button 
              onClick={() => {
                setStep(1);
                setImageSrc(null);
                setProcessing(false);
                setError(null);
                setResultUrl(null);
              }}
              className="px-10 py-5 bg-white/5 text-slate-200 border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Resize Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmicPhotoLab;