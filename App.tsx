import React, { useState, useEffect } from 'react';
import { ViewState, ToolType, HistoryItem } from './types';
import ToolWizard from './components/Tools/ToolWizard';
import { 
  Files, 
  Scissors, 
  ShieldCheck, 
  Minimize2, 
  LayoutDashboard, 
  History, 
  Menu,
  Box,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const scriptId = 'pdf-lib-script';
    
    if (window.PDFLib) {
      setPdfLibLoaded(true);
      return;
    }

    if (document.getElementById(scriptId)) {
      const interval = setInterval(() => {
        if (window.PDFLib) {
          setPdfLibLoaded(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.onload = () => {
      setPdfLibLoaded(true);
    };
    script.onerror = () => {
      setLoadError("Failed to load PDF library. Please check your internet connection.");
    };
    document.body.appendChild(script);

    const timeout = setTimeout(() => {
      if (!window.PDFLib && !loadError) {
        setLoadError("Loading is taking longer than expected. Please check your connection.");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  const addToHistory = (fileName: string, action: string, size: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(7),
      fileName,
      action,
      timestamp: new Date(),
      size
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'history', label: 'Time Logs', icon: History },
  ];

  const tools: { id: ToolType; title: string; desc: string; icon: any; color: string; badge?: string }[] = [
    { id: 'merge', title: 'Merge PDF', desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: Files, color: 'text-red-400' },
    { id: 'split', title: 'Split PDF', desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: Scissors, color: 'text-red-400' },
    { id: 'compress', title: 'Compress PDF', desc: 'Reduce file size while optimizing for maximal PDF quality.', icon: Minimize2, color: 'text-green-400' },
    { id: 'pdf-to-word', title: 'PDF to Word', desc: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', icon: FileText, color: 'text-blue-400' },
    { id: 'pdf-to-ppt', title: 'PDF to PowerPoint', desc: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', icon: Presentation, color: 'text-orange-400' },
    { id: 'pdf-to-excel', title: 'PDF to Excel', desc: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', icon: FileSpreadsheet, color: 'text-green-500' },
    { id: 'word-to-pdf', title: 'Word to PDF', desc: 'Make DOC and DOCX files easy to read by converting them to PDF.', icon: FileText, color: 'text-blue-500' },
    { id: 'ppt-to-pdf', title: 'PowerPoint to PDF', desc: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', icon: Presentation, color: 'text-orange-500' },
    { id: 'excel-to-pdf', title: 'Excel to PDF', desc: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', icon: FileSpreadsheet, color: 'text-green-600' },
    { id: 'edit', title: 'Edit PDF', desc: 'Add text, images, shapes or freehand annotations to a PDF document.', icon: PenTool, color: 'text-fuchsia-400', badge: 'New!' },
    { id: 'pdf-to-jpg', title: 'PDF to JPG', desc: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', icon: ImageIcon, color: 'text-yellow-400' },
    { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', icon: ImageIcon, color: 'text-yellow-500' },
    { id: 'protect', title: 'Protect PDF', desc: 'Encrypt your PDF with a password.', icon: ShieldCheck, color: 'text-violet-400' },
  ];

  if (loadError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f0c29] text-white z-50">
        <div className="text-center p-8 max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
             <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">System Malfunction</h2>
          <p className="text-slate-400 mb-6">{loadError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition text-white font-medium shadow-[0_0_15px_rgba(8,145,178,0.5)]">Reboot System</button>
        </div>
      </div>
    );
  }

  if (!pdfLibLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f0c29] text-white z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-4 border-fuchsia-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
          </div>
          <h2 className="text-3xl font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">INITIALIZING</h2>
          <p className="text-cyan-200/50 mt-4 text-sm uppercase tracking-[0.2em] animate-pulse">Loading PDF Core Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden bg-[#0f0c29]">
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}} />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f0c29]/80 backdrop-blur-xl z-40 flex items-center px-4 border-b border-white/10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition">
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <Box className="w-5 h-5 text-fuchsia-500" />
            <span className="text-white font-bold text-lg tracking-wider">PDF MASTER</span>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          bg-[#0f0c29]/40 backdrop-blur-xl border-r border-white/5
        `}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wider">PDF MASTER</h1>
              </div>
            </div>

            <nav className="space-y-2 flex-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as ViewState);
                    setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center gap-4 px-4 py-3 rounded-r-xl border-l-2 transition-all duration-300 ${
                    activeView === item.id 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-400 text-cyan-400' 
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeView === item.id ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`} />
                  <span className="font-medium tracking-wide text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Viewport */}
        <main className="flex-1 p-4 lg:p-10 pt-24 lg:pt-10 overflow-y-auto h-screen scroll-smooth">
          <div className="max-w-7xl mx-auto pb-10">
            
            {/* View: Dashboard */}
            {activeView === 'dashboard' && (
              <div className="animate-fade-in-up">
                <header className="mb-12 relative">
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                    All <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">Tools</span>
                  </h2>
                  <p className="text-slate-400 text-lg">Make use of our collection of PDF tools to process your digital documents.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveView(tool.id)}
                      className="group relative p-6 rounded-3xl bg-[#1a163a]/40 border border-white/10 hover:border-cyan-400/50 text-left transition-all duration-300 hover:bg-[#1a163a]/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden h-64 flex flex-col"
                    >
                       {/* Badge */}
                       {tool.badge && (
                         <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                           {tool.badge}
                         </div>
                       )}

                       <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       
                       <div className="relative z-10 flex flex-col h-full">
                         <div className="flex-1">
                            <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-cyan-400/30 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]`}>
                                <tool.icon className={`w-6 h-6 ${tool.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{tool.title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 line-clamp-3">{tool.desc}</p>
                         </div>
                       </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View: Tool Wizard */}
            {activeView !== 'dashboard' && activeView !== 'history' && (
              <ToolWizard 
                key={activeView}
                tool={activeView as ToolType}
                onCancel={() => setActiveView('dashboard')}
                onComplete={(fileName, action, size) => {
                  addToHistory(fileName, action, size);
                }}
              />
            )}

            {/* View: History */}
            {activeView === 'history' && (
              <div className="animate-fade-in">
                 <h2 className="text-3xl font-bold text-white mb-8">Time Logs</h2>
                 {history.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                     <History className="w-16 h-16 mb-4 opacity-50" />
                     <p>No operations recorded in this quadrant yet.</p>
                   </div>
                 ) : (
                   <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden">
                     <div className="overflow-x-auto">
                       <table className="w-full text-left">
                         <thead className="bg-white/5 border-b border-white/10">
                           <tr>
                             <th className="p-6 text-xs font-bold text-cyan-400 uppercase tracking-wider">File Name</th>
                             <th className="p-6 text-xs font-bold text-cyan-400 uppercase tracking-wider">Operation</th>
                             <th className="p-6 text-xs font-bold text-cyan-400 uppercase tracking-wider">Mass</th>
                             <th className="p-6 text-xs font-bold text-cyan-400 uppercase tracking-wider">Timestamp</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                           {history.map((item) => (
                             <tr key={item.id} className="hover:bg-white/5 transition duration-200">
                               <td className="p-6 font-medium text-white">{item.fileName}</td>
                               <td className="p-6 text-slate-300">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                                   {item.action}
                                 </span>
                               </td>
                               <td className="p-6 text-slate-400 font-mono text-xs">{item.size}</td>
                               <td className="p-6 text-slate-500 text-xs">
                                 {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default App;