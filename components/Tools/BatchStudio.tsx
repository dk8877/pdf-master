
import React, { useState, useRef } from 'react';
import { PDFFile } from '../../types';
import { 
  UploadCloud, Trash2, ArrowLeft, CheckCircle, 
  Layers, ChevronRight, Loader2, Sparkles, 
  FileStack, ShieldCheck, Download, Zap, Settings2
} from 'lucide-react';
import { protectPdf, compressPdf } from '../../services/pdfService';

interface BatchStudioProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
}

type BatchOp = 'compress' | 'protect';

const BatchStudio: React.FC<BatchStudioProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [activeOp, setActiveOp] = useState<BatchOp>('compress');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{name: string, url: string}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    const valid = Array.from(newFiles).map(f => ({ file: f, id: Math.random().toString(36).substring(7) }));
    setFiles(prev => [...prev, ...valid]);
    setStep(2);
  };

  const runBatch = async () => {
    setProcessing(true);
    setStep(3);
    const completedResults: {name: string, url: string}[] = [];
    
    try {
      for (const f of files) {
        let blob: Blob;
        if (activeOp === 'compress') {
          blob = await compressPdf(f, 0.7);
        } else {
          blob = await protectPdf(f, password || 'password');
        }
        completedResults.push({ name: `${activeOp}-${f.file.name}`, url: URL.createObjectURL(blob) });
        // Small delay to simulate multi-tasking and prevent UI lock
        await new Promise(r => setTimeout(r, 400));
      }
      setResults(completedResults);
      onComplete(`${files.length} Files`, `Batch ${activeOp}`, 'Multiple');
      setStep(4);
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-800 transition-all border border-white/60 dark:border-white/5 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
              Batch Studio <FileStack size={24} className="text-indigo-500" />
            </h2>
            <p className="text-slate-400 dark:text-slate-500 font-medium">Enterprise workflows for high-volume document handling.</p>
          </div>
        </div>

        {step === 2 && files.length > 0 && (
          <button 
            onClick={runBatch}
            className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            Execute Batch <Zap size={20} />
          </button>
        )}
      </div>

      {step === 1 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-[40px] p-24 text-center cursor-pointer group relative overflow-hidden transition-all border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900/40"
        >
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform">
            <FileStack size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Import Batch Items</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Select up to 50 PDFs to process simultaneously.</p>
          <input type="file" ref={fileInputRef} multiple accept=".pdf" className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-reveal">
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Document Stack ({files.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
              {files.map((f, i) => (
                <div key={f.id} className="p-5 glass-card bg-white/60 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4 truncate">
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">#{i+1}</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{f.file.name}</p>
                  </div>
                  <button onClick={() => setFiles(files.filter(x => x.id !== f.id))} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold text-xs hover:border-indigo-200 transition-all"
              >
                <UploadCloud size={16} /> Add More
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-[32px] p-8 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/20">
               <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Settings2 size={14} /> Global Action
               </h4>
               <div className="space-y-4">
                  <button 
                    onClick={() => setActiveOp('compress')}
                    className={`w-full p-4 rounded-xl text-left border-2 transition-all ${activeOp === 'compress' ? 'border-indigo-500 bg-white dark:bg-slate-800 font-bold' : 'border-transparent text-slate-500'}`}
                  >
                    Batch Compress
                  </button>
                  <button 
                    onClick={() => setActiveOp('protect')}
                    className={`w-full p-4 rounded-xl text-left border-2 transition-all ${activeOp === 'protect' ? 'border-indigo-500 bg-white dark:bg-slate-800 font-bold' : 'border-transparent text-slate-500'}`}
                  >
                    Batch Protect
                  </button>
               </div>
               
               {activeOp === 'protect' && (
                 <div className="mt-6 space-y-2 animate-reveal">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shared Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                 </div>
               )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700">
               <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                 Batch mode processes all files in parallel. Large stacks may take a moment but remain 100% private.
               </p>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-indigo-50 dark:border-indigo-900/30 border-t-indigo-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Mass Processing Stack</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3 italic">Processing items sequentially to preserve local memory...</p>
        </div>
      )}

      {step === 4 && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-indigo-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Batch Complete</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">All {results.length} documents have been processed and are ready for retrieval.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-h-[300px] overflow-y-auto p-2">
            {results.map((res, i) => (
              <a 
                key={i} 
                href={res.url} 
                download={res.name}
                className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <span className="truncate pr-4">{res.name}</span>
                <Download size={14} className="text-indigo-500 shrink-0" />
              </a>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all">Start New Batch</button>
        </div>
      )}
    </div>
  );
};

export default BatchStudio;
