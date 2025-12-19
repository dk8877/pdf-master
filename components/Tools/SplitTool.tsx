
import React, { useState, useRef, useEffect } from 'react';
import { PDFFile, MergePage } from '../../types';
import { 
  ArrowLeft, Scissors, LayoutGrid, CheckCircle, 
  RefreshCw, Layers, ChevronRight, FileStack, 
  Trash2, Download, MousePointer2, Settings, List
} from 'lucide-react';
import { getPagesData, extractPagesAsBlobs } from '../../services/pdfService';

interface SplitToolProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFile?: File;
}

type SplitMode = 'range' | 'individual' | 'selection';

const SplitTool: React.FC<SplitToolProps> = ({ onComplete, onCancel, initialFile }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pages, setPages] = useState<MergePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('individual');
  const [rangeInput, setRangeInput] = useState('1-5, 6-10');
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [resultBlobs, setResultBlobs] = useState<Blob[]>([]);
  const [processing, setProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) addFile(initialFile);
  }, [initialFile]);

  const addFile = async (f: File) => {
    setLoading(true);
    const pdfFile = { file: f, id: Math.random().toString(36).substring(7) };
    setFile(pdfFile);
    try {
      const data = await getPagesData(pdfFile);
      setPages(data);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePageSelection = (id: string) => {
    setSelectedPageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const executeSplit = async () => {
    if (!file) return;
    setProcessing(true);
    setStep(3);
    try {
      let ranges: number[][] = [];
      if (splitMode === 'individual') {
        ranges = pages.map((_, i) => [i]);
      } else if (splitMode === 'selection') {
        const selectedIndices = pages.filter(p => selectedPageIds.has(p.id)).map(p => p.pageIndex);
        if (selectedIndices.length > 0) ranges = [selectedIndices];
      } else {
        // Simple range parser "1-5, 6-10"
        ranges = rangeInput.split(',').map(r => {
          const [start, end] = r.trim().split('-').map(n => parseInt(n) - 1);
          return Array.from({ length: (end - start + 1) }, (_, i) => start + i);
        }).filter(r => r.length > 0);
      }

      if (ranges.length === 0) throw new Error("No pages selected.");
      
      const blobs = await extractPagesAsBlobs(file, ranges);
      setResultBlobs(blobs);
      onComplete(file.file.name, `Split into ${blobs.length} files`, 'Multiple');
      setStep(4);
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all border border-white/60 dark:border-white/5 shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Advanced PDF Split <Scissors size={24} className="text-rose-500" />
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Extract, separate, or divide your documents with ease.</p>
        </div>
      </div>

      {step === 1 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-[40px] p-24 text-center cursor-pointer group transition-all border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900/40"
        >
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 group-hover:scale-110 transition-transform">
            <Scissors size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Select PDF to Split</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Split happens 100% offline in your browser sandbox.</p>
          <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={(e) => e.target.files && addFile(e.target.files[0])} />
        </div>
      )}

      {step === 2 && file && (
        <div className="animate-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((page, idx) => (
                <div 
                  key={page.id} 
                  onClick={() => splitMode === 'selection' && togglePageSelection(page.id)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    splitMode === 'selection' && selectedPageIds.has(page.id) ? 'border-rose-500 ring-4 ring-rose-500/10 scale-[0.98]' : 'border-transparent'
                  }`}
                >
                  <img src={page.thumbnail} alt={`Page ${idx+1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-slate-800/80 rounded text-[9px] font-bold text-white tracking-widest">
                    #{idx+1}
                  </div>
                  {splitMode === 'selection' && selectedPageIds.has(page.id) && (
                    <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                      <CheckCircle size={24} className="text-rose-500 fill-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="glass-card rounded-[32px] p-8 bg-white/40 dark:bg-slate-900/40 border-white/60 dark:border-white/5">
              <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings size={14} /> Split Logic
              </h4>
              <div className="space-y-3">
                <button onClick={() => setSplitMode('individual')} className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 ${splitMode === 'individual' ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 font-bold' : 'border-transparent text-slate-500'}`}>
                  <List size={18} /> Split by Every Page
                </button>
                <button onClick={() => setSplitMode('selection')} className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 ${splitMode === 'selection' ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 font-bold' : 'border-transparent text-slate-500'}`}>
                  <MousePointer2 size={18} /> Select Specific Pages
                </button>
                <button onClick={() => setSplitMode('range')} className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 ${splitMode === 'range' ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 font-bold' : 'border-transparent text-slate-500'}`}>
                  <LayoutGrid size={18} /> Split by Range
                </button>
              </div>

              {splitMode === 'range' && (
                <div className="mt-6 space-y-2 animate-reveal">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Page Ranges (e.g. 1-2, 3-5)</label>
                  <input 
                    type="text" 
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 outline-none"
                    placeholder="1-5, 6-10..."
                  />
                </div>
              )}

              <button 
                onClick={executeSplit}
                className="w-full mt-10 py-5 bg-rose-500 text-white font-bold rounded-2xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 transform active:scale-95"
              >
                Perform Split <ChevronRight size={18} />
              </button>
            </div>
            
            <p className="text-[10px] font-medium text-slate-400 text-center">
              Processing happens entirely on your CPU. No data leaves this device.
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-rose-50 dark:border-rose-950/20 border-t-rose-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Dividing Document</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3 italic">Creating independent PDF structures for each chunk...</p>
        </div>
      )}

      {step === 4 && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Split Successful</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">Separated into {resultBlobs.length} independent files.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-h-[300px] overflow-y-auto p-2">
            {resultBlobs.map((blob, i) => (
              <a 
                key={i} 
                href={URL.createObjectURL(blob)} 
                download={`Split-${i+1}-${file!.file.name}`}
                className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <span className="truncate pr-4">Part {i+1}.pdf</span>
                <Download size={14} className="text-rose-500 shrink-0" />
              </a>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all">Start New Split</button>
        </div>
      )}
    </div>
  );
};

export default SplitTool;
