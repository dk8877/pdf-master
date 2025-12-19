
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Download, RefreshCw, 
  Zap, Sliders, Image as ImageIcon, Lock, Unlock, AlertTriangle, Scale, MoveDiagonal, Loader2, ChevronRight
} from 'lucide-react';

interface CosmicPhotoLabProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFile?: File;
}

const CosmicPhotoLab: React.FC<CosmicPhotoLabProps> = ({ onComplete, onCancel, initialFile }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [scalePercent, setScalePercent] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) loadFile(initialFile);
  }, [initialFile]);

  const loadFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
        setError("Please upload an image file (JPG, PNG, WebP).");
        return;
    }
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
            setOriginalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
            setTargetWidth(img.naturalWidth);
            setTargetHeight(img.naturalHeight);
            setImageSrc(src);
            setStep(2);
        };
        img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    setScalePercent(pct);
    setTargetWidth(Math.round(originalDimensions.w * (pct / 100)));
    setTargetHeight(Math.round(originalDimensions.h * (pct / 100)));
  };

  const processImage = async () => {
    if (!imageSrc || !originalFile) return;
    setProcessing(true);
    try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Processing error");
        
        const img = new Image();
        img.src = imageSrc;
        await new Promise(r => img.onload = r);
        
        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        const dataUrl = canvas.toDataURL(originalFile.type, 0.95);
        setResultUrl(dataUrl);
        
        // Convert base64 to blob for size calculation
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        onComplete(`scaled-${originalFile.name}`, `${scalePercent > 100 ? 'Upscaled' : 'Downscaled'} to ${targetWidth}x${targetHeight}`, (blob.size / 1024 / 1024).toFixed(2) + ' MB');
        setTimeout(() => { setStep(3); setProcessing(false); }, 1200);
    } catch (err) {
        setError("Failed to transform image.");
        setProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-800 transition-all border border-white dark:border-white/5 shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Pixel Studio</h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Fine-tune image resolutions with high-fidelity scaling.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col items-center pt-12">
          <div onClick={() => fileInputRef.current?.click()} className="glass-card w-full max-w-2xl rounded-[40px] p-24 text-center cursor-pointer border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all group">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && loadFile(e.target.files[0])} />
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform">
               <ImageIcon size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Import Studio Asset</h3>
            <p className="text-slate-400 dark:text-slate-500 font-medium">JPEG, PNG, or WebP formats supported.</p>
            {error && <div className="mt-6 text-rose-500 text-xs font-bold uppercase flex items-center justify-center gap-2"><AlertTriangle size={14}/> {error}</div>}
          </div>
        </div>
      )}

      {step === 2 && imageSrc && (
        <div className="flex flex-col lg:flex-row gap-8 animate-reveal">
            <div className="flex-1 glass-card rounded-[40px] flex items-center justify-center p-12 bg-slate-50/20 dark:bg-slate-900/10 relative min-h-[500px]">
                <img src={imageSrc} alt="Preview" className="max-h-[600px] max-w-full rounded-2xl shadow-2xl object-contain border-white/80 dark:border-white/5 border-8" />
                <div className="absolute bottom-10 right-10 px-4 py-2 bg-slate-800 text-white rounded-xl text-[11px] font-bold tracking-widest uppercase">
                    Original: {originalDimensions.w} x {originalDimensions.h}
                </div>
            </div>

            <div className="w-full lg:w-[400px] glass-card rounded-[40px] p-10 h-fit border-white/80 dark:border-white/5 shadow-2xl">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3"><Sliders size={20} className="text-indigo-500" /> Resolution Control</h3>
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <span>Scale factor: {scalePercent}%</span>
                        </div>
                        <input type="range" min="10" max="300" step="5" value={scalePercent} onChange={handleSliderChange} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                          <span>Downscale</span>
                          <span>100%</span>
                          <span>Upscale</span>
                        </div>
                    </div>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Width</span>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-bold text-sm">{targetWidth} px</div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Height</span>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-bold text-sm">{targetHeight} px</div>
                        </div>
                    </div>
                    <div className="pt-8">
                        <button onClick={processImage} disabled={processing} className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 transform active:scale-95">
                            {processing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />} Run Transformation
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {step === 3 && resultUrl && (
         <div className="glass-card rounded-[40px] p-24 text-center animate-reveal">
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm"><CheckCircle size={48} /></div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Transformation Ready</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">The asset has been re-rendered to <span className="text-indigo-500 font-bold">{targetWidth}x{targetHeight}</span>.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={resultUrl} download={`studio-output-${originalFile?.name}`} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"><Download size={20} /> Download Asset</a>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Studio Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmicPhotoLab;
