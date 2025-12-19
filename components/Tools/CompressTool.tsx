
import React, { useState, useRef, useEffect } from 'react';
import { PDFFile } from '../../types';
import { 
  ArrowLeft, Download, CheckCircle, RefreshCw, 
  Minimize2, ShieldCheck, Info, ChevronRight, Loader2,
  Gauge, Zap, FileText, AlertCircle, SlidersHorizontal, ArrowDownToLine, ArrowUpToLine
} from 'lucide-react';
import { compressPdf } from '../../services/pdfService';

interface CompressToolProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFile?: File;
}

type QualityLevel = 'standard' | 'balanced' | 'high';

const CompressTool: React.FC<CompressToolProps> = ({ onComplete, onCancel, initialFile }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<PDFFile | null>(null);
  const [quality, setQuality] = useState<QualityLevel>('balanced');
  const [compressionValue, setCompressionValue] = useState(70); // Initialized within 30-95 range
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [finalSize, setFinalSize] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) addFile(initialFile);
  }, [initialFile]);

  useEffect(() => {
    // Standard: below 45
    // Balanced: 45 to 75
    // High Quality: above 75
    if (compressionValue < 45) setQuality('standard');
    else if (compressionValue <= 75) setQuality('balanced');
    else setQuality('high');
  }, [compressionValue]);

  const addFile = (f: File) => {
    setFile({ file: f, id: Math.random().toString(36).substring(7) });
    setStep(2);
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setStep(3);
    try {
      // Rebuild and compress document using the quality percentage
      const res = await compressPdf(file, compressionValue / 100);
      const url = URL.createObjectURL(res);
      setDownloadUrl(url);
      const sizeStr = (res.size / 1024 / 1024).toFixed(2) + ' MB';
      setFinalSize(sizeStr);
      onComplete(file.file.name, 'Optimized PDF', sizeStr);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("An error occurred during optimization. Please try a different document.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const getQualityText = () => {
    if (compressionValue < 45) return "Standard: Efficient structure optimization for everyday use.";
    if (compressionValue <= 75) return "Balanced: Maintains high visual fidelity while reducing structural bloat.";
    return "High Quality: Conservative optimization preserving all complex metadata and layers.";
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-white/60 dark:border-white/5 shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Optimize & Compress <ArrowDownToLine size={24} className="text-emerald-500" />
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Rebuild PDF structure for peak efficiency and smaller footprint.</p>
        </div>
      </div>

      {step === 1 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-[40px] p-24 text-center cursor-pointer group relative overflow-hidden transition-all border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900/40"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-500 group-hover:scale-110 transition-transform">
            <Minimize2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Select PDF to Optimize</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Safe local processing. Your data never leaves your RAM.</p>
          <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={(e) => e.target.files && addFile(e.target.files[0])} />
        </div>
      )}

      {step === 2 && file && (
        <div className="animate-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-[32px] p-10 border-white/60 dark:border-white/5">
              <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-[24px]">
                  <FileText size={32} />
                </div>
                <div className="flex-1 truncate">
                  <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{file.file.name}</h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Initial Size: {(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimization Strategy</h5>
                  <div className="space-y-3">
                    <TrustLine text="Rebuild Document Tree" />
                    <TrustLine text="Enable Object Streams" />
                    <TrustLine text="Purge Duplicate Resources" />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                  <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Notice</h5>
                  <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                    Client-side compression focuses on structural bloat. For large scanned images, results may vary based on original encoding.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex items-center gap-3 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
               <ShieldCheck size={18} />
               Secure Workspace Active: Your documents remain entirely within your private browsing session.
            </div>
          </div>

          <div className="lg:col-span-4 glass-card rounded-[32px] p-8 space-y-8 bg-indigo-50/20 dark:bg-indigo-950/5 sticky top-24">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                <SlidersHorizontal size={14} /> Intensity
              </h4>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                quality === 'standard' ? 'bg-rose-100 text-rose-600' : 
                quality === 'balanced' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {quality === 'standard' ? 'Standard' : quality === 'balanced' ? 'Balanced' : 'High Quality'}
              </span>
            </div>

            <div className="space-y-4">
               <input 
                  type="range" 
                  min="30" 
                  max="95" 
                  step="5"
                  value={compressionValue}
                  onChange={(e) => setCompressionValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-white dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 ring-4 ring-indigo-500/5"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span>Smallest File</span>
                  <span>Highest Quality</span>
                </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Level</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{compressionValue}%</span>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-2xl text-[10px] font-medium text-slate-400 leading-relaxed">
               {getQualityText()}
            </div>

            <button 
              onClick={handleCompress}
              className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 transform active:scale-95"
            >
              Optimize Document <Zap size={18} />
            </button>
          </div>

        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-indigo-50 dark:border-indigo-950/20 border-t-indigo-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Applying Optimization</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3 italic">Stripping structural metadata and encoding object streams...</p>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Optimization Done</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">New document size: <span className="text-emerald-500 font-bold">{finalSize}</span>.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={downloadUrl} download={`Optimized-${file!.file.name}`} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3">
              <Download size={20} /> Save Optimized PDF
            </a>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Start New</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TrustLine = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
    <CheckCircle size={14} className="text-emerald-500" />
    {text}
  </div>
);

export default CompressTool;
