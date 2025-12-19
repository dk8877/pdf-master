
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, ToolType, HistoryItem } from './types';
import ToolWizard from './components/Tools/ToolWizard';
import SmartMerge from './components/Tools/SmartMerge';
import SplitTool from './components/Tools/SplitTool';
import CompressTool from './components/Tools/CompressTool';
import BatchStudio from './components/Tools/BatchStudio';
import AISummary from './components/Tools/AISummary';
import PdfToImageTool from './components/Tools/PdfToImageTool';
import ImageToPdfTool from './components/Tools/ImageToPdfTool';
import ProEditor from './components/Editor/ProEditor';
import CosmicPhotoLab from './components/PhotoLab/CosmicPhotoLab';
import PrivacyScreen from './components/Privacy/PrivacyScreen';
import { CreatorWidget, ProfileModal } from './components/CreatorProfile';
import { 
  Files, Scissors, ShieldCheck, Box, FileText, FileSpreadsheet, 
  Presentation, Image as ImageIcon, PenTool, Unlock, Wand2, X, 
  UploadCloud, Sparkles, Search, ChevronRight, HelpCircle,
  FileImage, FileCheck, ArrowUpRight, History, Shield, Layout,
  Sun, Moon, Heart, FileStack, ShieldAlert, BrainCircuit, ArrowDownToLine
} from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isPendingProcess, setIsPendingProcess] = useState(false);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (window.PDFLib) { setPdfLibLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    script.onload = () => setPdfLibLoaded(true);
    script.onerror = () => setLoadError("Failed to load PDF engine.");
    document.body.appendChild(script);
  }, []);

  const addToHistory = (fileName: string, action: string, size: string) => {
    setHistory(prev => [{ id: Math.random().toString(36).substr(7), fileName, action, timestamp: new Date(), size }, ...prev]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setDroppedFile(e.dataTransfer.files[0]);
      setIsPendingProcess(true);
      setActiveView('dashboard');
    }
  };

  const toolCategories = [
    {
      name: 'Essential Tools',
      tools: [
        { id: 'ai-summary', title: 'AI PDF Summary', desc: 'Understand long PDFs faster with intelligent insights.', icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-50', badge: 'AI' },
        { id: 'photo-lab', title: 'Image Resizer & Upscaler', desc: 'Easily upscale or downscale your images with precision control.', icon: Wand2, color: 'text-indigo-600', bg: 'bg-indigo-50', badge: 'AI' },
        { id: 'merge', title: 'Smart PDF Merge', desc: 'Visually combine, reorder, and rotate pages from multiple PDFs.', icon: Files, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'compress', title: 'Compress PDF', desc: 'High-precision compression that balances file size and professional quality.', icon: ArrowDownToLine, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'split', title: 'Split PDF', desc: 'Visual separation with range, individual, or manual selection.', icon: Scissors, color: 'text-rose-400', bg: 'bg-rose-50' },
      ]
    },
    {
      name: 'Conversion Suite',
      tools: [
        { id: 'pdf-to-jpg', title: 'PDF to Image', desc: 'Turn PDF pages into clear images (PNG/JPG) with resolution control.', icon: ImageIcon, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { id: 'jpg-to-pdf', title: 'Image to PDF', desc: 'Combine multiple images into a professional PDF with reordering.', icon: FileImage, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'pdf-to-word', title: 'PDF to Word', desc: 'Convert PDFs into easy to edit DOC and DOCX documents.', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'pdf-to-ppt', title: 'PDF to PowerPoint', desc: 'Turn PDFs into editable PPT and PPTX slideshows.', icon: Presentation, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'pdf-to-excel', title: 'PDF to Excel', desc: 'Extract data from PDFs into clean Excel spreadsheets.', icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'word-to-pdf', title: 'Word to PDF', desc: 'Make DOC and DOCX files readable by converting them to PDF.', icon: FileText, color: 'text-sky-500', bg: 'bg-sky-50' },
        { id: 'ppt-to-pdf', title: 'PowerPoint to PDF', desc: 'Make PPT slideshows universally readable as PDF.', icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'excel-to-pdf', title: 'Excel to PDF', desc: 'Convert spreadsheets to clean, professional PDFs.', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' },
      ]
    },
    {
      name: 'Enterprise & Productivity',
      tools: [
        { id: 'batch', title: 'Batch Studio', desc: 'Process stacks of PDFs simultaneously with unified actions.', icon: FileStack, color: 'text-indigo-500', bg: 'bg-indigo-50', badge: 'PRO' },
        { id: 'edit-pro', title: 'Pro Editor', desc: 'Advanced markup, drawing, and multi-layered PDF editing.', icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'protect', title: 'Protect PDF', desc: 'Encrypt your PDF with a password for secure sharing.', icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-100' },
        { id: 'unlock', title: 'Unlock PDF', desc: 'Remove password security from protected PDF documents.', icon: Unlock, color: 'text-slate-400', bg: 'bg-slate-50' },
      ]
    }
  ];

  const filteredCategories = toolCategories.map(cat => ({ 
    ...cat, 
    tools: cat.tools.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())) 
  })).filter(c => c.tools.length > 0);

  const handleToolComplete = (f: string, a: string, s: string) => { 
    addToHistory(f, a, s); 
    setDroppedFile(null); 
    setIsPendingProcess(false); 
  };

  if (loadError) return <div className="p-20 text-center">{loadError}</div>;
  if (!pdfLibLoaded) return <div className="p-20 text-center animate-pulse">Syncing Engine...</div>;

  return (
    <div 
      className="relative flex flex-col min-h-screen text-slate-600 dark:text-slate-400 font-sans transition-colors duration-1000 overflow-x-hidden"
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="mesh-container">
        <div className="mesh-orb w-[1200px] h-[1200px] bg-indigo-100/30 dark:bg-indigo-900/10 -top-[10%] -left-[10%] animate-float-slow"></div>
        <div className="mesh-orb w-[1000px] h-[1000px] bg-blue-100/30 dark:bg-blue-900/10 top-[20%] -right-[15%] animate-float-medium"></div>
      </div>
      
      <nav className="sticky top-0 z-50 px-3 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 md:px-6 md:py-3 glass-card rounded-2xl md:rounded-3xl border-white/10 shadow-lg">
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => {setActiveView('dashboard'); setSearchQuery('');}} className="flex items-center gap-2 transition-all">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg"><Box size={16} /></div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg tracking-tight">PDF Master</span>
            </button>
            <div className="hidden sm:flex items-center gap-4 md:gap-6">
              <NavPill label="Tools" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
              <NavPill label="History" active={activeView === 'history'} onClick={() => setActiveView('history')} />
              <NavPill label="Privacy" active={activeView === 'privacy'} onClick={() => setActiveView('privacy')} />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-indigo-500 rounded-xl hover:bg-white/50">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="h-4 md:h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 md:mx-0" />
            <CreatorWidget onOpen={() => setIsProfileOpen(true)} />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        {activeView === 'dashboard' && (
          <div className="animate-reveal">
            <header className="mb-8 md:mb-20 pt-4 md:pt-12 text-center max-w-3xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 md:mb-6">
                <Heart size={10} className="fill-indigo-500" /> Crafted with Love
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-6 md:mb-8 stagger-reveal">
                <span>Simplify your</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Document Workflow.</span>
              </h1>
              <div className="w-full max-w-2xl relative stagger-reveal px-2 md:px-0">
                <div className="relative glass-card flex items-center px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[40px] border-white/95 shadow-xl">
                  <Search className="text-indigo-500" size={18} />
                  <input type="text" placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none flex-1 ml-3 md:ml-4 text-base md:text-lg font-medium text-slate-800 dark:text-slate-100" />
                </div>
              </div>
            </header>
            <div className="space-y-12 md:space-y-20 pb-24 md:pb-32">
              {filteredCategories.map(cat => (
                <section key={cat.name} className="animate-reveal">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight mb-4 md:mb-8 px-2">{cat.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {cat.tools.map(t => <ToolCard key={t.id} tool={t} onClick={() => setActiveView(t.id as ViewState)} />)}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {activeView === 'ai-summary' && <AISummary onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFile={droppedFile || undefined} />}
        {activeView === 'merge' && <SmartMerge onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFiles={droppedFile ? [droppedFile] : undefined} />}
        {activeView === 'split' && <SplitTool onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFile={droppedFile || undefined} />}
        {activeView === 'compress' && <CompressTool onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFile={droppedFile || undefined} />}
        {activeView === 'batch' && <BatchStudio onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} />}
        {activeView === 'pdf-to-jpg' && <PdfToImageTool onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFile={droppedFile || undefined} />}
        {activeView === 'jpg-to-pdf' && <ImageToPdfTool onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} />}
        {activeView === 'edit-pro' && <ProEditor onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} />}
        {activeView === 'photo-lab' && <CosmicPhotoLab onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFile={droppedFile || undefined} />}
        {activeView === 'privacy' && <PrivacyScreen onBack={() => setActiveView('dashboard')} />}
        {activeView === 'history' && <HistoryView history={history} clear={() => setHistory([])} />}
        
        {['protect', 'unlock', 'pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel', 'word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'edit'].includes(activeView) && (
          <ToolWizard tool={activeView as ToolType} onCancel={() => setActiveView('dashboard')} onComplete={handleToolComplete} initialFiles={droppedFile ? [droppedFile] : undefined} />
        )}
      </main>

      {isDragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-indigo-600/10 backdrop-blur-md animate-reveal">
           <div className="glass-card w-full max-w-4xl p-12 md:p-24 rounded-[32px] md:rounded-[48px] border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-center animate-pulse">
              <UploadCloud size={48} md:size={64} className="text-indigo-500 mb-6 md:mb-8" />
              <h2 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight mb-2 md:mb-4">Initialize Import</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">Release to stage your document for transformation.</p>
           </div>
        </div>
      )}

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

const ToolCard: React.FC<{ tool: any, onClick: () => void }> = ({ tool, onClick }) => (
  <button onClick={onClick} className="group relative min-h-[160px] md:h-[220px] rounded-[24px] md:rounded-[32px] glass-card overflow-hidden transition-all duration-700 text-left hover:scale-[1.02] hover:-translate-y-1 active:scale-95">
    <div className="p-5 md:p-8 flex flex-col h-full relative z-10">
      <div className={`w-10 h-10 md:w-14 md:h-14 p-2.5 md:p-4 rounded-xl md:rounded-2xl ${tool.bg} ${tool.color} mb-4 md:mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
        <tool.icon size={20} md:size={24} />
      </div>
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600">{tool.title}</h3>
        {tool.badge && (
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest shrink-0 ml-2">{tool.badge}</span>
        )}
      </div>
      <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed opacity-80 line-clamp-2 md:line-clamp-none">{tool.desc}</p>
    </div>
  </button>
);

const NavPill = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${active ? 'text-indigo-600 bg-indigo-50/80 shadow-sm' : 'text-slate-400 hover:text-slate-800'}`}>{label}</button>
);

const HistoryView = ({ history, clear }: { history: any[], clear: () => void }) => (
  <div className="animate-reveal glass-card rounded-2xl md:rounded-[32px] p-6 md:p-10 min-h-[400px]">
    <header className="flex justify-between items-center mb-6 md:mb-10">
      <h2 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Recent Activity</h2>
      <button onClick={clear} className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-rose-500">Clear All</button>
    </header>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
          <tr><th className="px-4 md:px-6 py-4 text-left">Document</th><th className="px-4 md:px-6 py-4 text-left">Action</th><th className="px-4 md:px-6 py-4 text-right">Time</th></tr>
        </thead>
        <tbody>
          {history.map(item => <tr key={item.id} className="hover:bg-white/40"><td className="px-4 md:px-6 py-5 md:py-6 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">{item.fileName}</td><td className="px-4 md:px-6 py-5 md:py-6 text-slate-500 text-xs md:text-sm">{item.action}</td><td className="px-4 md:px-6 py-5 md:py-6 text-right font-mono text-[10px] md:text-xs text-slate-400">{item.timestamp.toLocaleTimeString()}</td></tr>)}
          {history.length === 0 && <tr><td colSpan={3} className="py-24 md:py-32 text-center text-slate-300 font-bold">No history in this session.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

export default App;
