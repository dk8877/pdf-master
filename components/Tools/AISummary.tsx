
import React, { useState, useRef, useEffect } from 'react';
import { PDFFile } from '../../types';
import { 
  ArrowLeft, FileText, Sparkles, ShieldCheck, 
  ChevronRight, Loader2, Copy, Check, Download, 
  Zap, Info, BrainCircuit, ListChecks, Clock, Save, FileDown
} from 'lucide-react';
import { extractPdfText, generateSummaryPdf } from '../../services/pdfService';
import { GoogleGenAI } from "@google/genai";

interface AISummaryProps {
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFile?: File;
}

const AISummary: React.FC<AISummaryProps> = ({ onComplete, onCancel, initialFile }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<PDFFile | null>(null);
  const [summaryType, setSummaryType] = useState<'short' | 'detailed'>('detailed');
  const [summary, setSummary] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) addFile(initialFile);
  }, [initialFile]);

  const addFile = (f: File) => {
    setFile({ file: f, id: Math.random().toString(36).substring(7) });
    setStep(2);
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportSummaryAsPdf = async () => {
    if (!summary) return;
    try {
      setProcessing(true);
      const blob = await generateSummaryPdf(file?.file.name || 'Document', summary);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Summary-${file?.file.name.split('.')[0] || 'Document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Failed to generate PDF export.");
    } finally {
      setProcessing(false);
    }
  };

  const generateSummary = async () => {
    if (!file) return;
    setProcessing(true);
    setStep(3);
    setError(null);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error("No readable text found in document.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Provide a ${summaryType} summary of the following PDF content. 
      Use clear sections: Quick Overview, Key Points (as bullets), and Important Sections.
      Keep it professional and helpful.
      
      Content:
      ${text.slice(0, 30000)}`;

      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      
      const result = response.text;
      if (!result) throw new Error("Generation failed.");
      setSummary(result);
      onComplete(file.file.name, 'AI Summarized', (file.file.size / 1024 / 1024).toFixed(2) + ' MB');
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Synthesis failed.");
      setStep(2);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-white/60 dark:border-white/5 shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            AI PDF Summary <Sparkles size={24} className="text-indigo-500" />
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Understand long PDFs faster with intelligent analysis.</p>
        </div>
      </div>

      {step === 1 && (
        <div onClick={() => fileInputRef.current?.click()} className="glass-card rounded-[40px] p-24 text-center cursor-pointer group transition-all border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900/40">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform">
            <BrainCircuit size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Upload PDF for Summary</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium px-4">Privacy-aware analysis. Text extraction happens on your device.</p>
          <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={(e) => e.target.files && addFile(e.target.files[0])} />
        </div>
      )}

      {step === 2 && file && (
        <div className="animate-reveal space-y-8">
          <div className="glass-card rounded-[32px] p-10 border-white/60 dark:border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-2xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{file.file.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ready for analysis</p>
                </div>
              </div>
            </div>
            {error && <div className="p-4 mb-8 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-3"><Info size={16} /> {error}</div>}
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">Summary Intensity</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setSummaryType('short')} className={`p-6 rounded-2xl text-left border-2 transition-all ${summaryType === 'short' ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 font-bold' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-white'}`}>
                  <p className={`font-bold mb-1 ${summaryType === 'short' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Short Overview</p>
                  <p className="text-[10px] text-slate-400 font-medium">Concise 1-page summary for rapid understanding.</p>
                </button>
                <button onClick={() => setSummaryType('detailed')} className={`p-6 rounded-2xl text-left border-2 transition-all ${summaryType === 'detailed' ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 font-bold' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-white'}`}>
                  <p className={`font-bold mb-1 ${summaryType === 'detailed' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Detailed Breakdown</p>
                  <p className="text-[10px] text-slate-400 font-medium">Full section analysis with deep insights.</p>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs font-medium">
              <ShieldCheck size={16} className="text-indigo-500" />
              Processing is local. Only extracted text is sent for synthesis.
            </div>
            <button onClick={generateSummary} className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 transform active:scale-95">
              Analyze & Summarize <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-indigo-50 dark:border-indigo-950/20 border-t-indigo-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">AI Thinking...</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3 italic">Extracting context and synthesizing key insights...</p>
        </div>
      )}

      {step === 4 && summary && (
        <div className="space-y-8 animate-reveal pb-20">
          <div className="glass-card rounded-[40px] p-10 md:p-16 relative bg-white/40 dark:bg-slate-900/20 shadow-2xl border-white/60 dark:border-white/5">
            <div className="flex justify-between items-center mb-10 flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500 text-white rounded-xl"><ListChecks size={20} /></div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Intelligent Summary</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1"><Zap size={10} /> Gemini Engine</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Saved ~15 mins</span>
                    </div>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={handleCopy} className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">{copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}</button>
                 <button onClick={exportSummaryAsPdf} className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-xl hover:bg-indigo-100 transition-all" title="Export as PDF Document"><FileDown size={18} /></button>
               </div>
            </div>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {summary.split('\n').map((line, i) => {
                if (line.trim() === '') return <br key={i} />;
                if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 list-disc mb-1">{line.substring(1).trim()}</li>;
                if (line.startsWith('#')) return <h4 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">{line.replace(/#/g, '').trim()}</h4>;
                return <p key={i} className="mb-4">{line}</p>;
              })}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={() => setStep(1)} className="px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">Analyze New</button>
             <button onClick={onCancel} className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all">Finish Session</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISummary;
