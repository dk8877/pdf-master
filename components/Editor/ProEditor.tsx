import React, { useState, useRef, useEffect } from 'react';
import { PDFFile } from '../../types';
import { 
  ArrowLeft, Download, CheckCircle, RefreshCw, Zap, 
  Type, Image as ImageIcon, Eraser, Move, PenTool,
  Save, Layout, ImagePlus
} from 'lucide-react';
import { pdfToImage, saveProEditedPdf } from '../../services/pdfService';

interface ProEditorProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
}

interface EditorElement {
  id: string;
  type: 'text' | 'image';
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  content: string; // Text content or Data URL for display
  file?: File; // For images, the original file
}

const ProEditor: React.FC<ProEditorProps> = ({ onComplete, onCancel }) => {
  // Step 1: Upload, 2: Editor, 3: Processing, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<PDFFile | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'eraser'>('select');
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  // Image Replacement State
  const [replacingId, setReplacingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load PDF Background on file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setLoading(true);
      const pdfFileObj = { file: selectedFile, id: 'main' };
      setFile(pdfFileObj);

      try {
        // Convert page 1 to image for the editor background
        const blob = await pdfToImage(pdfFileObj, 'image/png');
        setBgImage(URL.createObjectURL(blob));
        setStep(2);
      } catch (err) {
        console.error(err);
        alert("Failed to load PDF visual preview.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Calculate click position as percentage
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'text') {
      const newElement: EditorElement = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'text',
        x,
        y,
        content: 'Double click to edit'
      };
      setElements([...elements, newElement]);
      setActiveTool('select'); // Switch back after placement
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imgFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newElement: EditorElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          x: 40, // Default center-ish
          y: 40,
          content: ev.target?.result as string,
          file: imgFile
        };
        setElements([...elements, newElement]);
        setActiveTool('select');
      };
      reader.readAsDataURL(imgFile);
    }
  };

  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replacingId) {
      const imgFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setElements(elements.map(el => 
          el.id === replacingId ? { ...el, content: ev.target?.result as string, file: imgFile } : el
        ));
        setReplacingId(null);
        if (replaceInputRef.current) replaceInputRef.current.value = '';
      };
      reader.readAsDataURL(imgFile);
    }
  };

  const addPlaceholder = () => {
    const placeholderSvg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="8 8"/>
        <path d="M150 80 L150 120 M130 100 L170 100" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-linecap="round"/>
        <text x="50%" y="150" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="sans-serif" font-size="14">Double Click to Upload</text>
      </svg>
    `.trim());

    const newElement: EditorElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      x: 50,
      y: 50,
      content: `data:image/svg+xml;utf8,${placeholderSvg}`,
      file: undefined
    };
    setElements([...elements, newElement]);
    setActiveTool('select');
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const updateText = (id: string, newText: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, content: newText } : el));
  };

  const savePdf = async () => {
    if (!file) return;
    setStep(3);
    
    try {
      // Simulate heavy processing for "Pro" feel
      await new Promise(r => setTimeout(r, 2000));
      
      const resultBlob = await saveProEditedPdf(file, elements);
      const url = URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      
      const sizeStr = (resultBlob.size / 1024 / 1024).toFixed(2) + ' MB';
      onComplete(`edited-${file.file.name}`, 'Pro Edit (Layer Fusion)', sizeStr);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("Failed to save PDF");
      setStep(2);
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-lg border border-amber-400/30">
                <PenTool className="w-6 h-6 text-amber-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-wide">EDIT PDF PRO</h2>
                <span className="text-xs text-amber-500/80 font-mono tracking-[0.2em] uppercase">Advanced Vector Workspace</span>
            </div>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Exit Studio
        </button>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
           <div 
            className="group relative w-full max-w-2xl border-2 border-dashed border-amber-500/30 rounded-3xl p-20 text-center bg-[#1a163a]/40 backdrop-blur-sm hover:bg-[#1a163a]/60 hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.1)]"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <input 
              type="file" 
              accept=".pdf"
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
            />
            
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(251,191,36,0.4)] group-hover:scale-110 transition-transform duration-500">
               <Layout className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Initialize Workspace</h3>
            <p className="text-slate-400">Import your PDF to begin the advanced editing session</p>
            
            {loading && (
                <div className="mt-8 flex items-center justify-center gap-2 text-amber-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-xs uppercase tracking-widest">Rasterizing Vector Layers...</span>
                </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: EDITOR INTERFACE */}
      {step === 2 && bgImage && (
        <div className="flex-1 relative flex gap-6 h-[700px] animate-fade-in">
          {/* Floating Toolbar */}
          <div className="w-20 flex flex-col gap-4 bg-[#0f0c29]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20">
             <div className="mb-2 text-center">
                 <div className="w-full h-[1px] bg-white/10 mb-2"></div>
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest">Tools</span>
             </div>

             <button 
                onClick={() => setActiveTool('select')}
                className={`p-3 rounded-xl transition-all ${activeTool === 'select' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Select & Move"
             >
                <Move className="w-6 h-6" />
             </button>

             <button 
                onClick={() => setActiveTool('text')}
                className={`p-3 rounded-xl transition-all ${activeTool === 'text' ? 'bg-fuchsia-500/20 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)] border border-fuchsia-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Add Text"
             >
                <Type className="w-6 h-6" />
             </button>

             <button 
                onClick={() => imageInputRef.current?.click()}
                className={`p-3 rounded-xl transition-all ${activeTool === 'image' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Add Image"
             >
                <ImageIcon className="w-6 h-6" />
             </button>
             <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />

             <button 
                onClick={addPlaceholder}
                className="p-3 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/5"
                title="Add Placeholder Image"
             >
                <ImagePlus className="w-6 h-6" />
             </button>
             <input type="file" ref={replaceInputRef} accept="image/*" className="hidden" onChange={handleReplaceImage} />

             <button 
                onClick={() => setActiveTool('eraser')}
                className={`p-3 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] border border-red-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Eraser Mode"
             >
                <Eraser className="w-6 h-6" />
             </button>

             <div className="mt-auto">
                <button 
                    onClick={savePdf}
                    className="w-full p-3 bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform flex flex-col items-center gap-1"
                >
                    <Save className="w-5 h-5" />
                    <span className="text-[10px] font-bold">SAVE</span>
                </button>
             </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-[#050510] rounded-2xl border border-white/10 overflow-hidden relative shadow-inner flex items-center justify-center p-8">
            <div 
                ref={canvasRef}
                className="relative shadow-2xl transition-all cursor-crosshair"
                style={{ height: '100%', aspectRatio: '0.707' }} // Approx A4 ratio
                onClick={handleCanvasClick}
            >
                {/* PDF Page Background */}
                <img src={bgImage} alt="PDF Page" className="w-full h-full object-contain bg-white" />

                {/* Overlays */}
                {elements.map((el) => (
                    <div
                        key={el.id}
                        className={`absolute cursor-move group ${activeTool === 'eraser' ? 'hover:opacity-50 hover:bg-red-500/20' : ''}`}
                        style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeTool === 'eraser') removeElement(el.id);
                        }}
                    >
                        {el.type === 'text' ? (
                            <div 
                                contentEditable={editingId === el.id}
                                suppressContentEditableWarning
                                ref={(node) => {
                                  if (node && editingId === el.id) {
                                      setTimeout(() => node.focus(), 0);
                                  }
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (activeTool === 'select') {
                                        setEditingId(el.id);
                                    }
                                }}
                                onBlur={(e) => {
                                    updateText(el.id, e.currentTarget.innerText);
                                    setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className={`text-black text-lg font-bold p-2 border-2 rounded transition-colors outline-none
                                  ${editingId === el.id 
                                      ? 'border-cyan-400 bg-white/90 cursor-text shadow-lg z-50 min-w-[50px]' 
                                      : (activeTool === 'select' ? 'border-dashed border-cyan-400/50 bg-white/10 cursor-move' : 'border-transparent')
                                  }
                                `}
                            >
                                {el.content}
                            </div>
                        ) : (
                            <div 
                                className={`p-1 border-2 ${activeTool === 'select' ? 'border-dashed border-amber-400/50' : 'border-transparent'} hover:border-amber-400 rounded transition-colors`}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (activeTool === 'select') {
                                        setReplacingId(el.id);
                                        replaceInputRef.current?.click();
                                    }
                                }}
                            >
                                <img src={el.content} alt="Placed" className="max-w-[150px] max-h-[150px] object-contain" />
                            </div>
                        )}
                        
                        {activeTool === 'select' && editingId !== el.id && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px]" onClick={() => removeElement(el.id)}>
                                ×
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 pointer-events-none">
                {activeTool === 'text' && "Click anywhere to place text"}
                {activeTool === 'select' && "Double-click text to edit, double-click image to replace"}
                {activeTool === 'eraser' && "Click an element to delete it"}
                {activeTool === 'image' && "Upload an image to place it"}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: PROCESSING/SUCCESS (Reusing Styles) */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-amber-400 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-amber-400/10 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-wide">Synthesizing PDF</h3>
          <p className="text-amber-400/70 mt-4 text-sm uppercase tracking-widest">Merging Vector Layers & Rendering</p>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
          <div className="w-24 h-24 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h3 className="text-4xl font-bold text-white mb-2">Masterpiece Ready</h3>
          <p className="text-slate-400 mb-10 text-lg">Your enhanced document has been compiled successfully.</p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <a 
              href={downloadUrl} 
              download={`edited-${file?.file.name}`}
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              <Download className="w-6 h-6" />
              Download Pro PDF
            </a>
            <button 
              onClick={() => {
                setStep(1);
                setFile(null);
                setElements([]);
                setDownloadUrl(null);
              }}
              className="px-10 py-5 bg-white/5 text-slate-200 border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProEditor;