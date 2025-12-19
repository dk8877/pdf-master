
import React, { useState, useRef, useEffect } from 'react';
import { ToolType, PDFFile } from '../../types';
import { 
  UploadCloud, Trash2, FileText, Lock, ArrowLeft, Download, CheckCircle, 
  RefreshCw, Zap, Image as ImageIcon, FileSpreadsheet, Presentation, 
  PenTool, Unlock, Sliders, Eye, X, Loader2, ChevronRight, Layers,
  FileImage, FileUp, ShieldAlert, KeyRound, Type
} from 'lucide-react';
import { 
  mergePdfs, splitPdf, protectPdf, unlockPdf, compressPdf, imagesToPdf, 
  pdfToImage, editPdf, convertOfficeToPdf, convertOfficeToPdf as convertOfficeToPdfReal, convertPdfToOffice, generatePdfPreview 
} from '../../services/pdfService';

interface ToolWizardProps {
  tool: ToolType;
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
  initialFiles?: File[];
}

const ToolWizard: React.FC<ToolWizardProps> = ({ tool, onComplete, onCancel, initialFiles }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [password, setPassword] = useState('');
  const [editText, setEditText] = useState('Confidential');
  const [compressionQuality, setCompressionQuality] = useState<number>(75);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFiles?.length) addFiles(initialFiles);
  }, [initialFiles]);

  const addFiles = (newFilesList: File[]) => {
    const validFiles = newFilesList.map(file => ({ file, id: Math.random().toString(36).substring(7) }));
    if (tool === 'merge' || tool === 'jpg-to-pdf') {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles([validFiles[0]]);
    }
    setStep(2);
    setError(null);
  };

  const processFiles = async () => {
    if ((tool === 'protect' || tool === 'unlock') && !password) {
      setError("Please provide a password.");
      return;
    }

    setStep(3);
    try {
      await new Promise(r => setTimeout(r, 1500)); 
      let res: Blob;
      let action = '';
      if (!files.length) throw new Error("Please upload a file first.");

      switch (tool) {
        case 'merge': res = await mergePdfs(files); action = 'Merged'; break;
        case 'split': res = await splitPdf(files[0]); action = 'Split'; break;
        case 'protect': res = await protectPdf(files[0], password); action = 'Encrypted'; break;
        case 'unlock': res = await unlockPdf(files[0], password); action = 'Unlocked'; break;
        case 'compress': res = await compressPdf(files[0], compressionQuality / 100); action = 'Optimized'; break;
        case 'edit': res = await editPdf(files[0], editText); action = 'Modified'; break;
        case 'pdf-to-jpg': res = await pdfToImage(files[0], 'image/jpeg'); action = 'Converted to Image'; break;
        case 'jpg-to-pdf': res = await imagesToPdf(files); action = 'Converted to PDF'; break;
        case 'pdf-to-ppt': res = await convertPdfToOffice(files[0], 'pptx'); action = 'Converted to Slides'; break;
        case 'pdf-to-word': res = await convertPdfToOffice(files[0], 'docx'); action = 'Converted to Word'; break;
        case 'pdf-to-excel': res = await convertPdfToOffice(files[0], 'xlsx'); action = 'Extracted Data'; break;
        case 'word-to-pdf': 
        case 'ppt-to-pdf': 
        case 'excel-to-pdf': 
          res = await convertOfficeToPdfReal(files); action = 'Converted to PDF'; break;
        default: res = await convertPdfToOffice(files[0], 'docx'); action = 'Processed'; break;
      }

      const url = URL.createObjectURL(res);
      setDownloadUrl(url);
      setResultBlob(res);
      onComplete(files[0].file.name, action, (res.size / 1024 / 1024).toFixed(2) + ' MB');
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setStep(2);
    }
  };

  const isMultiFile = tool === 'merge' || tool === 'jpg-to-pdf';

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-white dark:border-white/5 shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">{tool.replace(/-/g, ' ')}</h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Follow the steps below to process your file.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-12 max-w-md">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 flex flex-col gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-700 ${s <= step ? 'bg-indigo-500 shadow-sm' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${s <= step ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-600'}`}>Step 0{s}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-[40px] p-24 text-center cursor-pointer group relative overflow-hidden transition-all border-dashed border-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-900/40"
        >
          <UploadCloud className="w-20 h-20 text-indigo-100 dark:text-indigo-900 group-hover:text-indigo-400 mx-auto mb-8 transition-all group-hover:scale-110" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Upload Document</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Click to browse or drop your {isMultiFile ? 'files' : 'file'} into the horizon.</p>
          <input type="file" ref={fileInputRef} multiple={isMultiFile} className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 glass-card rounded-[32px] p-8 border-white/60 dark:border-white/5">
              <h4 className="text-slate-800 dark:text-slate-200 font-bold mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" /> Current Selection
              </h4>
              <div className="space-y-3">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-white dark:border-white/5">
                    <div className="flex items-center gap-4 truncate">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-indigo-500 shadow-sm">
                        {f.file.type.includes('image') ? <ImageIcon size={20}/> : <FileText size={20} />}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold truncate max-w-xs">{f.file.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button onClick={() => setFiles(files.filter(x => x.id !== f.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
                {isMultiFile && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-bold hover:border-indigo-200 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    <UploadCloud size={14} /> Add More Files
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 glass-card rounded-[32px] p-8 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/5">
               <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Zap size={14} /> Settings
               </h4>
               
               <div className="space-y-6">
                 {(tool === 'protect' || tool === 'unlock') && (
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       <KeyRound size={12} /> {tool === 'protect' ? 'Set Password' : 'Enter Password'}
                     </label>
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="Enter security key..."
                       className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                     />
                   </div>
                 )}

                 {tool === 'edit' && (
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       <Type size={12} /> Header Annotation
                     </label>
                     <input 
                       type="text" 
                       value={editText}
                       onChange={(e) => setEditText(e.target.value)}
                       placeholder="Confidential, Draft, etc."
                       className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                     />
                   </div>
                 )}

                 {tool === 'compress' && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Sliders size={12} /> Optimization Level ({compressionQuality}%)
                      </label>
                      <input 
                        type="range" 
                        min="10" 
                        max="90" 
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                        <span>Max Compress</span>
                        <span>Best Quality</span>
                      </div>
                    </div>
                 )}

                 <div className="pt-4">
                   <button 
                    onClick={processFiles}
                    disabled={files.length === 0}
                    className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 transform active:scale-95 disabled:opacity-50"
                  >
                    Run Operation <ChevronRight size={18} />
                  </button>
                 </div>
               </div>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-500 text-xs font-bold uppercase animate-reveal">
              <ShieldAlert size={16} /> {error}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="py-32 text-center animate-reveal">
          <div className="w-20 h-20 border-4 border-indigo-50 dark:border-indigo-950/20 border-t-indigo-500 rounded-3xl animate-spin mx-auto mb-10 shadow-sm"></div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Processing Documents</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mt-3 italic">Applying transformations securely within your local workspace.</p>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="glass-card rounded-[40px] p-20 text-center animate-reveal">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-indigo-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Operation Complete</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-12">The document has been successfully processed and verified.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={downloadUrl} 
              download={`Master-${files[0].file.name.split('.')[0]}.${tool.includes('pdf-to') ? (tool.split('-').pop()) : 'pdf'}`}
              className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <Download size={20} /> Get Document
            </a>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolWizard;
