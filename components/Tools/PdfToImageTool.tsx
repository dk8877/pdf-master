
import React, { useState, useRef, useEffect } from 'react';
import { PDFFile } from '../../types';
import { 
  ArrowLeft, ImageIcon, CheckCircle, RefreshCw, 
  Download, ChevronRight, Sliders, ImagePlus,
  ShieldCheck, Loader2, Zap, FileDown
} from 'lucide-react';
import { pdfToImage } from '../../services/pdfService';

interface PdfToImageToolProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFile?: File;
}

const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onComplete, onCancel, initialFile }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<PDFFile | null>(null);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/png');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) setFile({ file: initialFile, id: Math.random().toString(36).substring(7) }), setStep(2);
  }, [initialFile]);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setStep(3);
    try {
      const blob = await pdfToImage(file, format);
      setResultUrl(URL.createObjectURL(blob));
      onComplete(file.file.name, `Converted to ${format.split('/')[1].toUpperCase()}`, (blob.size / 1024 / 1024).toFixed(2) + ' MB');
      setStep(4);
    } catch (e) {
      console.error(e);
      setStep(2);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl text-slate-400 hover:text-slate-800 transition-all border border-white/60 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            PDF to Image <ImageIcon size={24} className="text-yellow-500" />
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Turn PDF pages into crystal clear image assets.</p>
        </div>
      </div>

      {step === 1 && (
        <div onClick={() => fileInputRef.current?.click()} className="glass-card rounded-[40px] p-24 text-center cursor-pointer group border-dashed border-2 border-indigo-100 hover:bg-white transition-all">
          <div className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-yellow-500 group-hover:scale-110 transition-transform">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Select PDF to Convert</h3>
          <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={(e) => e.target.files && (setFile({ file: e.target.files[0], id: '1' }), setStep(2))} />
        </div>
      )}

      {step === 2 && file && (
        <div className="animate-reveal space-y-8">
          <div className="glass-card rounded-[32px] p-10 border-white/60 shadow-sm">
            <h4 className="text-slate-800 font-bold mb-8">Target: {file.file.name}</h4>
            <div className="space-y-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Output Format</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setFormat('image/png')} className={`p-6 rounded-2xl text-left border-2 transition-all ${format === 'image/png' ? 'border-yellow-500 bg-yellow-50/30 font-bold' : 'border-transparent bg-slate-50'}`}>PNG (Lossless)</button>
                <button onClick={() => setFormat('image/jpeg')} className={`p-6 rounded-2xl text-left border-2 transition-all ${format === 'image/jpeg' ? 'border-yellow-500 bg-yellow-50/30 font-bold' : 'border-transparent bg-slate-50'}`}>JPG (Web Ready)</button>
              </div>
            </div>
            <button onClick={convert} className="w-full mt-10 py-5 bg-yellow-500 text-white font-bold rounded-2xl shadow-xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-3 transform active:scale-95">
              Convert Page to Image <ChevronRight size={18} />
            </button>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs text-center font-bold uppercase tracking-widest">
            100% Client-Side Conversion. Your data stays here.
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-yellow-50 border-t-yellow-500 rounded-3xl animate-spin mx-auto mb-10"></div>
          <h3 className="text-3xl font-bold text-slate-800">Rendering Assets...</h3>
        </div>
      )}

      {step === 4 && resultUrl && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm"><CheckCircle size={48} /></div>
          <h3 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">Conversion Complete</h3>
          <p className="text-slate-400 font-medium mb-12">Your high-resolution asset is ready.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={resultUrl} download={`Converted-${file!.file.name.split('.')[0]}.${format.split('/')[1]}`} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3"><Download size={20} /> Download Image</a>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white border text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Start New</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToImageTool;
