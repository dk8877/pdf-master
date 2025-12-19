
import React, { useState, useRef, useEffect } from 'react';
import { PDFFile } from '../../types';
import { 
  ArrowLeft, Download, CheckCircle, RefreshCw, 
  Type, Image as ImageIcon, Eraser, Move, PenTool,
  Save, Layout, ImagePlus, ChevronLeft, Loader2,
  Square, Circle, Minus, X, Bookmark
} from 'lucide-react';
import { pdfToImage, saveProEditedPdf } from '../../services/pdfService';

interface ProEditorProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle' | 'line';
  x: number;
  y: number;
  content?: string;
  file?: File;
  width?: number;
  height?: number;
  color?: string;
}

const ProEditor: React.FC<ProEditorProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<PDFFile | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'eraser' | 'rect' | 'circle' | 'line'>('select');
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShapeId, setCurrentShapeId] = useState<string | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const DRAFT_KEY_PREFIX = 'pdf_master_draft_';

  const saveDraft = () => {
    if (!file) return;
    const draftData = {
      elements: elements.map(el => ({ ...el, file: undefined })), // Don't save File blobs in localStorage
      fileName: file.file.name,
      timestamp: Date.now()
    };
    localStorage.setItem(`${DRAFT_KEY_PREFIX}${file.file.name}`, JSON.stringify(draftData));
    
    // Visual feedback for save
    const btn = document.getElementById('save-draft-btn');
    if (btn) {
      const originalContent = btn.innerHTML;
      btn.innerHTML = 'Saved!';
      btn.classList.add('bg-indigo-500', 'text-white');
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.remove('bg-indigo-500', 'text-white');
      }, 2000);
    }
  };

  const checkDraft = (fileName: string) => {
    const saved = localStorage.getItem(`${DRAFT_KEY_PREFIX}${fileName}`);
    if (saved) {
      setShowRestorePrompt(true);
    }
  };

  const restoreDraft = () => {
    if (!file) return;
    const saved = localStorage.getItem(`${DRAFT_KEY_PREFIX}${file.file.name}`);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setElements(draft.elements);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    setShowRestorePrompt(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setLoading(true);
      const pdfFileObj = { file: selectedFile, id: 'main' };
      setFile(pdfFileObj);

      try {
        const blob = await pdfToImage(pdfFileObj, 'image/png');
        setBgImage(URL.createObjectURL(blob));
        setStep(2);
        checkDraft(selectedFile.name);
      } catch (err) {
        console.error(err);
        alert("Failed to load PDF.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getPointerPos = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'eraser' || activeTool === 'text' || activeTool === 'image') return;
    const { x, y } = getPointerPos(e);
    const id = Math.random().toString(36).substr(2, 9);
    const newElement: EditorElement = { id, type: activeTool, x, y, width: 0, height: 0, color: '#ef4444' };
    setElements([...elements, newElement]);
    setCurrentShapeId(id);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentShapeId) return;
    const { x, y } = getPointerPos(e);
    setElements(prev => prev.map(el => el.id === currentShapeId ? { ...el, width: x - el.x, height: y - el.y } : el));
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentShapeId(null);
      if (currentShapeId) {
         setElements(prev => prev.map(el => {
            if (el.id === currentShapeId && (el.type === 'rect' || el.type === 'circle')) {
                const newX = (el.width || 0) < 0 ? el.x + (el.width || 0) : el.x;
                const newY = (el.height || 0) < 0 ? el.y + (el.height || 0) : el.y;
                const newW = Math.abs(el.width || 0);
                const newH = Math.abs(el.height || 0);
                return { ...el, x: newX, y: newY, width: newW, height: newH };
            }
            return el;
         }).filter(el => el.id !== currentShapeId || (Math.abs(el.width || 0) > 0.5 || Math.abs(el.height || 0) > 0.5)));
      }
      setActiveTool('select'); 
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDrawing) return; 
    if (activeTool === 'text') {
      const { x, y } = getPointerPos(e);
      setElements([...elements, { id: Math.random().toString(36).substr(2, 9), type: 'text', x, y, content: 'Type something...' }]);
      setActiveTool('select');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imgFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setElements([...elements, { id: Math.random().toString(36).substr(2, 9), type: 'image', x: 50, y: 50, content: ev.target?.result as string, file: imgFile }]);
        setActiveTool('select');
      };
      reader.readAsDataURL(imgFile);
    }
  };

  const savePdf = async () => {
    if (!file) return;
    setStep(3);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const resultBlob = await saveProEditedPdf(file, elements);
      setDownloadUrl(URL.createObjectURL(resultBlob));
      onComplete(`edited-${file.file.name}`, 'Quick Edit', (resultBlob.size / 1024 / 1024).toFixed(2) + ' MB');
      
      // Clear draft on successful export
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${file.file.name}`);
      
      setStep(4);
    } catch (err) {
      console.error(err);
      setStep(2);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-800 transition-all border border-white dark:border-white/5 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Quick Editor</h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Add annotations, text, and images with precision.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col items-center justify-center pt-12">
           <div onClick={() => fileInputRef.current?.click()} className="glass-card w-full max-w-2xl rounded-[40px] p-24 text-center cursor-pointer border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all group">
            <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform">
               <Layout size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Import PDF to Edit</h3>
            <p className="text-slate-400 dark:text-slate-500 font-medium">Documents are rendered locally for privacy.</p>
            {loading && <div className="mt-8 flex items-center justify-center gap-3 text-indigo-500 font-bold text-xs tracking-widest uppercase"><Loader2 className="animate-spin" size={16} /> Initializing Workspace</div>}
          </div>
        </div>
      )}

      {step === 2 && bgImage && (
        <div className="flex gap-8 h-[750px] animate-reveal">
          <div className="w-20 flex flex-col gap-4 py-6 px-3 glass-card rounded-[32px] border-white/60 dark:border-white/5 h-fit shadow-xl relative">
             {[
               { id: 'select', icon: Move, label: 'Select' },
               { id: 'text', icon: Type, label: 'Text' },
               { id: 'rect', icon: Square, label: 'Rect' },
               { id: 'circle', icon: Circle, label: 'Circle' },
               { id: 'line', icon: Minus, label: 'Line' },
               { id: 'image', icon: ImageIcon, label: 'Image' },
               { id: 'eraser', icon: Eraser, label: 'Clear' },
             ].map((tool) => (
               <button 
                  key={tool.id}
                  onClick={() => tool.id === 'image' ? imageInputRef.current?.click() : setActiveTool(tool.id as any)}
                  className={`p-4 rounded-2xl transition-all flex justify-center ${activeTool === tool.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600'}`}
                  title={tool.label}
               >
                  <tool.icon size={22} />
               </button>
             ))}
             <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
             
             <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-2"></div>
             
             <button 
                id="save-draft-btn"
                onClick={saveDraft}
                className="p-4 text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 rounded-2xl flex justify-center transition-all"
                title="Save Draft"
             >
                <Bookmark size={22} />
             </button>

             <button 
                onClick={savePdf} 
                className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg flex justify-center transition-all hover:-translate-y-1"
                title="Export PDF"
             >
                <Save size={22} />
             </button>
          </div>

          <div className="flex-1 glass-card rounded-[40px] overflow-hidden flex flex-col items-center justify-center p-12 bg-slate-50/30 dark:bg-slate-900/10 relative">
            {showRestorePrompt && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 glass-card bg-white/90 dark:bg-slate-800/90 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border-indigo-200 dark:border-indigo-900 animate-slide-up">
                <div className="flex items-center gap-3">
                  <Bookmark size={20} className="text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Found a saved draft for this file.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={restoreDraft}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
                  >
                    Restore
                  </button>
                  <button 
                    onClick={() => setShowRestorePrompt(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <div 
              ref={canvasRef} 
              className="relative shadow-2xl bg-white select-none overflow-hidden ring-1 ring-black/5" 
              style={{ height: '100%', aspectRatio: '0.707' }} 
              onClick={handleCanvasClick} 
              onMouseDown={handleMouseDown} 
              onMouseMove={handleMouseMove} 
              onMouseUp={handleMouseUp} 
              onMouseLeave={handleMouseUp}
            >
                <img src={bgImage} alt="PDF" className="w-full h-full object-contain pointer-events-none" />
                {elements.map((el) => (
                    <div key={el.id} className={`absolute cursor-move ${activeTool === 'eraser' ? 'hover:opacity-50 hover:ring-2 hover:ring-rose-400' : ''}`} style={{ left: `${el.x}%`, top: `${el.y}%`, width: el.width ? `${el.width}%` : undefined, height: el.height ? `${el.height}%` : undefined, transform: (el.type === 'text' || el.type === 'image') ? 'translate(-50%, -50%)' : 'none' }} onClick={(e) => { e.stopPropagation(); if (activeTool === 'eraser') setElements(elements.filter(x => x.id !== el.id)); }}>
                        {el.type === 'text' && <div contentEditable={editingId === el.id} suppressContentEditableWarning onDoubleClick={(e) => { e.stopPropagation(); if (activeTool === 'select') setEditingId(el.id); }} onBlur={(e) => { setElements(elements.map(x => x.id === el.id ? { ...x, content: e.currentTarget.innerText } : x)); setEditingId(null); }} className={`text-slate-800 text-sm font-bold p-1 border-2 border-transparent hover:border-indigo-400 rounded-lg whitespace-nowrap ${editingId === el.id ? 'bg-white border-indigo-500 shadow-2xl scale-105 transition-all' : ''}`}>{el.content}</div>}
                        {el.type === 'image' && <div className="p-1 border-2 border-transparent hover:border-indigo-400 rounded-lg"><img src={el.content} alt="Placed" className="max-w-[120px] max-h-[120px] object-contain rounded shadow-sm" /></div>}
                        {el.type === 'rect' && <div className="w-full h-full border-2 border-rose-500/80 bg-rose-500/5"></div>}
                        {el.type === 'circle' && <div className="w-full h-full border-2 border-rose-500/80 rounded-full bg-rose-500/5"></div>}
                        {el.type === 'line' && <svg className="w-full h-full overflow-visible pointer-events-none"><line x1="0" y1="0" x2="100%" y2="100%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2"/></svg>}
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-indigo-50 dark:border-indigo-900/30 border-t-indigo-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Applying Modifications</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3">Flattening and encoding document layers...</p>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-indigo-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm"><CheckCircle size={48} /></div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Ready for Export</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">Your edits have been successfully merged into a new PDF.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={downloadUrl} download={`edited-${file?.file.name}`} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"><Download size={20} /> Get Final File</a>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Edit Another</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProEditor;
