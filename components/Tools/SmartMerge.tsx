
import React, { useState, useRef, useEffect } from 'react';
import { PDFFile, MergePage } from '../../types';
import { 
  UploadCloud, Trash2, FileText, ArrowLeft, Download, CheckCircle, 
  RefreshCw, Layers, ChevronRight, RotateCw, AlertCircle, Sparkles, MoveLeft, MoveRight, X, Loader2
} from 'lucide-react';
import { getPagesData, mergeSpecificPages } from '../../services/pdfService';

interface SmartMergeProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFiles?: File[];
}

const SmartMerge: React.FC<SmartMergeProps> = ({ onComplete, onCancel, initialFiles }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [filesMap, setFilesMap] = useState<Map<string, PDFFile>>(new Map());
  const [pages, setPages] = useState<MergePage[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [processingMerge, setProcessingMerge] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFiles?.length) addFiles(initialFiles);
  }, [initialFiles]);

  const addFiles = async (newFilesList: File[]) => {
    setError(null);
    setLoadingPages(true);
    setStep(2);
    const newFilesMap = new Map(filesMap);
    let allNewPages: MergePage[] = [];

    for (const file of newFilesList) {
      const id = Math.random().toString(36).substring(7);
      const pdfFile: PDFFile = { file, id };
      newFilesMap.set(id, pdfFile);
      try {
        const filePages = await getPagesData(pdfFile);
        allNewPages = [...allNewPages, ...filePages];
      } catch (err) {
        console.error("Error loading pages from", file.name, err);
        setError(`Could not load "${file.name}". Is it a valid PDF?`);
      }
    }

    setFilesMap(newFilesMap);
    setPages(prev => [...prev, ...allNewPages]);
    setLoadingPages(false);
  };

  useEffect(() => {
    // Basic smart diagnostic: Check for orientation mix
    const diagnostics: string[] = [];
    if (pages.length === 0) return;
    
    const orientations = new Set(pages.map(p => (p.width > p.height ? 'landscape' : 'portrait')));
    if (orientations.size > 1) {
      diagnostics.push("Mixed orientations detected (Portrait & Landscape).");
    }
    const sizes = new Set(pages.map(p => `${Math.round(p.width)}x${Math.round(p.height)}`));
    if (sizes.size > 1) {
      diagnostics.push("Multiple page dimensions found in stack.");
    }
    setIssues(diagnostics);
  }, [pages]);

  const rotatePage = (id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const removePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;
    const newPages = [...pages];
    [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
    setPages(newPages);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Create a ghost image if needed, but the real-time reorder is usually enough
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Smooth real-time reordering
    const newPages = [...pages];
    const draggedItem = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedItem);
    setPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const startMerge = async () => {
    if (pages.length === 0) return;
    
    setProcessingMerge(true);
    setStep(3);
    setError(null);
    
    try {
      // Small artificial delay for perceived quality
      await new Promise(r => setTimeout(r, 1200));
      
      const blob = await mergeSpecificPages(filesMap, pages);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      onComplete(`merged-${Date.now()}.pdf`, 'Smart Merged', (blob.size / 1024 / 1024).toFixed(2) + ' MB');
      setStep(4);
    } catch (err) {
      console.error(err);
      setError("The merge process failed. Please ensure your files aren't corrupted or password protected.");
      setStep(2);
    } finally {
      setProcessingMerge(false);
    }
  };

  const resetTool = () => {
    setPages([]);
    setFilesMap(new Map());
    setStep(1);
    setError(null);
    setDownloadUrl(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-white/60 dark:border-white/5 shadow-sm group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
              Smart PDF Merge <Sparkles size={24} className="text-indigo-500" />
            </h2>
            <p className="text-slate-400 dark:text-slate-500 font-medium">Shuffling the digital deck with visual precision.</p>
          </div>
        </div>

        {step === 2 && pages.length > 0 && !loadingPages && (
          <button 
            onClick={startMerge}
            className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 transform active:scale-95"
          >
            Finalize Merge <ChevronRight size={20} />
          </button>
        )}
      </div>

      {step === 1 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-[40px] p-24 text-center cursor-pointer group relative overflow-hidden transition-all border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900/40"
        >
          <UploadCloud className="w-20 h-20 text-indigo-100 dark:text-indigo-900 group-hover:text-indigo-400 mx-auto mb-8 transition-all group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Import Documents</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium px-4">Drop multiple PDFs to generate a visual page sequence.</p>
          <input type="file" ref={fileInputRef} multiple accept=".pdf" className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-reveal">
          {error && (
            <div className="flex items-center gap-4 p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-3xl animate-reveal">
              <AlertCircle className="text-rose-500 shrink-0" size={20} />
              <p className="text-sm text-rose-600 dark:text-rose-400 font-bold">{error}</p>
            </div>
          )}

          {/* Diagnostic Bar */}
          {issues.length > 0 && !error && (
            <div className="flex items-start gap-4 p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-3xl animate-reveal">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">Intelligent Check</p>
                {issues.map((issue, idx) => <p key={idx} className="text-sm text-amber-600/80 dark:text-amber-500/80 font-medium">{issue}</p>)}
              </div>
            </div>
          )}

          {loadingPages ? (
             <div className="py-20 text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-500 rounded-2xl animate-spin mx-auto mb-6"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Generating Visual Deck...</p>
             </div>
          ) : (
            <>
              {pages.length === 0 ? (
                <div className="py-20 text-center glass-card rounded-[32px] border-dashed border-2">
                   <p className="text-slate-400 font-bold">No pages in deck. Add PDFs to start.</p>
                   <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl font-bold text-sm">Upload Now</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {pages.map((page, index) => (
                    <div 
                      key={page.id} 
                      className={`group relative flex flex-col gap-2 transition-all duration-300 transform ${draggedIndex === index ? 'scale-95 rotate-1 opacity-50 z-20' : 'scale-100 rotate-0'}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="relative aspect-[3/4] glass-card rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-white/80 dark:border-white/5 shadow-sm group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                        <img 
                          src={page.thumbnail} 
                          alt={`Page ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 pointer-events-none select-none" 
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); rotatePage(page.id); }}
                            className="p-2 bg-white/90 text-slate-800 rounded-lg hover:bg-white shadow-lg transform transition-transform active:scale-90"
                            title="Rotate 90°"
                          >
                            <RotateCw size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-lg transform transition-transform active:scale-90"
                            title="Remove Page"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-800/80 backdrop-blur-md rounded-md text-[9px] font-bold text-white tracking-widest uppercase">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[80px]">{page.fileName}</span>
                        <div className="flex gap-1">
                          <button disabled={index === 0} onClick={() => movePage(index, 'left')} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30"><MoveLeft size={12}/></button>
                          <button disabled={index === pages.length - 1} onClick={() => movePage(index, 'right')} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30"><MoveRight size={12}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all hover:bg-white/50 dark:hover:bg-slate-900/20"
                  >
                    <UploadCloud size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Files</span>
                  </button>
                  <input type="file" ref={fileInputRef} multiple accept=".pdf" className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
                </div>
              )}

              <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                  <RefreshCw size={16} className="text-indigo-500" />
                  Processed securely in-browser. No files uploaded to any server.
                </div>
                <div className="flex items-center gap-6">
                   <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{pages.length} Pages ready for merge</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-indigo-50 border-t-indigo-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Orchestrating Merge</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3">Synthesizing page layers and flattening metadata...</p>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-indigo-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Smart Merge Complete</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">Your customized PDF is ready for the world.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={downloadUrl} 
              download={`Master-Merged-${Date.now()}.pdf`}
              className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <Download size={20} /> Save Document
            </a>
            <button onClick={resetTool} className="px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Start New Sequence</button>
            <button onClick={onCancel} className="px-12 py-5 text-slate-400 hover:text-slate-800 font-bold transition-all">Back to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMerge;
