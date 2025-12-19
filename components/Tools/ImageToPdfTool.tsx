
import React, { useState, useRef } from 'react';
import { PDFFile } from '../../types';
import { 
  ArrowLeft, FileImage, CheckCircle, Download, 
  RefreshCw, Layers, ChevronRight, ImagePlus, 
  Trash2, ShieldCheck, FileDown, Zap, SlidersHorizontal
} from 'lucide-react';
import { imagesToPdf } from '../../services/pdfService';

interface ImageToPdfToolProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
}

const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = (newList: File[]) => {
    const valid = newList.filter(f => f.type.startsWith('image/')).map(f => ({ file: f, id: Math.random().toString(36).substring(7) }));
    setFiles(prev => [...prev, ...valid]);
    setStep(2);
  };

  const createPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setStep(3);
    try {
      const blob = await imagesToPdf(files, { orientation });
      setDownloadUrl(URL.createObjectURL(blob));
      onComplete(`${files.length} Images`, 'Images to PDF', (blob.size / 1024 / 1024).toFixed(2) + ' MB');
      setStep(4);
    } catch (e) {
      console.error(e);
      setStep(2);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 rounded-2xl text-slate-400 hover:text-slate-800 transition-all border border-white/60 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Image to PDF <FileImage size={24} className="text-blue-500" />
          </h2>
          <p className="text-slate-400 font-medium">Turn your visual assets into a professional document stack.</p>
        </div>
      </div>

      {step === 1 && (
        <div onClick={() => fileInputRef.current?.click()} className="glass-card rounded-[40px] p-24 text-center cursor-pointer group border-dashed border-2 border-indigo-100 hover:bg-white transition-all">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-500 group-hover:scale-110 transition-transform">
            <FileImage size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload Images</h3>
          <p className="text-slate-400 font-medium">Select multiple images to combine into one PDF.</p>
          <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && addImages(Array.from(e.target.files))} />
        </div>
      )}

      {step === 2 && (
        <div className="animate-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {files.map((f, i) => (
              <div key={f.id} className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-xl group">
                <img src={URL.createObjectURL(f.file)} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setFiles(files.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-800/80 rounded text-[9px] font-bold text-white tracking-widest uppercase">Page {i+1}</div>
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 transition-all">
              <ImagePlus size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
            </button>
          </div>

          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="glass-card rounded-[32px] p-8 bg-white/40 border-white/60">
              <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"><SlidersHorizontal size={14} /> Layout Options</h4>
              <div className="space-y-3">
                <button onClick={() => setOrientation('portrait')} className={`w-full p-4 rounded-xl text-left border-2 transition-all ${orientation === 'portrait' ? 'border-blue-500 bg-blue-50/30 font-bold' : 'border-transparent text-slate-500'}`}>Portrait</button>
                <button onClick={() => setOrientation('landscape')} className={`w-full p-4 rounded-xl text-left border-2 transition-all ${orientation === 'landscape' ? 'border-blue-500 bg-blue-50/30 font-bold' : 'border-transparent text-slate-500'}`}>Landscape</button>
              </div>
              <button onClick={createPdf} className="w-full mt-10 py-5 bg-blue-500 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 transform active:scale-95">Generate PDF <ChevronRight size={18} /></button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 text-xs text-center font-bold uppercase">100% Private Offline Process</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-500 rounded-3xl animate-spin mx-auto mb-10"></div>
          <h3 className="text-3xl font-bold text-slate-800">Building Document Layers...</h3>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm"><CheckCircle size={48} /></div>
          <h3 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">PDF Created</h3>
          <p className="text-slate-400 font-medium mb-12">{files.length} images combined into a clean PDF workstation result.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={downloadUrl} download={`Gallery-${Date.now()}.pdf`} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3"><Download size={20} /> Download PDF</a>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white border text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToPdfTool;
