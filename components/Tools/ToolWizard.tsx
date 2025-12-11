import React, { useState, useRef } from 'react';
import { ToolType, PDFFile } from '../../types';
import { 
  UploadCloud, Trash2, FileText, Lock, ArrowLeft, Download, CheckCircle, 
  RefreshCw, Zap, Image as ImageIcon, FileSpreadsheet, Presentation, 
  PenTool, Type, Unlock, Sliders, Eye, X, Files, Scissors, Minimize2 
} from 'lucide-react';
import { mergePdfs, splitPdf, protectPdf, unlockPdf, compressPdf, imagesToPdf, pdfToImage, editPdf, convertOfficeToPdf, convertPdfToOffice, generatePdfPreview } from '../../services/pdfService';

interface ToolWizardProps {
  tool: ToolType;
  onComplete: (fileName: string, action: string, size: string) => void;
  onCancel: () => void;
}

const ToolWizard: React.FC<ToolWizardProps> = ({ tool, onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [password, setPassword] = useState('');
  const [editText, setEditText] = useState('Confidential'); // For Edit PDF
  const [compressionQuality, setCompressionQuality] = useState<number>(75);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToolTitle = () => {
    switch (tool) {
      case 'merge': return 'Merge PDF';
      case 'split': return 'Split PDF';
      case 'protect': return 'Protect PDF';
      case 'unlock': return 'Unlock PDF';
      case 'compress': return 'Compress PDF';
      case 'pdf-to-word': return 'PDF to Word';
      case 'pdf-to-ppt': return 'PDF to PowerPoint';
      case 'pdf-to-excel': return 'PDF to Excel';
      case 'word-to-pdf': return 'Word to PDF';
      case 'ppt-to-pdf': return 'PowerPoint to PDF';
      case 'excel-to-pdf': return 'Excel to PDF';
      case 'edit': return 'Edit PDF';
      case 'pdf-to-jpg': return 'PDF to JPG';
      case 'jpg-to-pdf': return 'JPG to PDF';
      default: return 'Tool';
    }
  };

  const getTransmutationIcons = () => {
    // Define base icons
    const PdfIcon = <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]"><FileText className="w-12 h-12 text-red-400" /></div>;
    const WordIcon = <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"><FileText className="w-12 h-12 text-blue-400" /></div>;
    const ExcelIcon = <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)]"><FileSpreadsheet className="w-12 h-12 text-green-400" /></div>;
    const PptIcon = <div className="bg-orange-500/20 p-4 rounded-xl border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.5)]"><Presentation className="w-12 h-12 text-orange-400" /></div>;
    const JpgIcon = <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]"><ImageIcon className="w-12 h-12 text-yellow-400" /></div>;
    const ZipIcon = <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]"><Minimize2 className="w-12 h-12 text-purple-400" /></div>;
    const MergeIcon = <div className="bg-cyan-500/20 p-4 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]"><Files className="w-12 h-12 text-cyan-400" /></div>;
    const SplitIcon = <div className="bg-cyan-500/20 p-4 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]"><Scissors className="w-12 h-12 text-cyan-400" /></div>;
    const LockIcon = <div className="bg-violet-500/20 p-4 rounded-xl border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.5)]"><Lock className="w-12 h-12 text-violet-400" /></div>;
    const UnlockIcon = <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]"><Unlock className="w-12 h-12 text-indigo-400" /></div>;
    const EditIcon = <div className="bg-fuchsia-500/20 p-4 rounded-xl border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.5)]"><PenTool className="w-12 h-12 text-fuchsia-400" /></div>;

    switch (tool) {
      case 'pdf-to-word': return { from: PdfIcon, to: WordIcon };
      case 'pdf-to-excel': return { from: PdfIcon, to: ExcelIcon };
      case 'pdf-to-ppt': return { from: PdfIcon, to: PptIcon };
      case 'pdf-to-jpg': return { from: PdfIcon, to: JpgIcon };
      case 'word-to-pdf': return { from: WordIcon, to: PdfIcon };
      case 'excel-to-pdf': return { from: ExcelIcon, to: PdfIcon };
      case 'ppt-to-pdf': return { from: PptIcon, to: PdfIcon };
      case 'jpg-to-pdf': return { from: JpgIcon, to: PdfIcon };
      case 'compress': return { from: PdfIcon, to: ZipIcon };
      case 'merge': return { from: PdfIcon, to: MergeIcon };
      case 'split': return { from: PdfIcon, to: SplitIcon };
      case 'protect': return { from: PdfIcon, to: LockIcon };
      case 'unlock': return { from: LockIcon, to: UnlockIcon };
      case 'edit': return { from: PdfIcon, to: EditIcon };
      default: return { from: PdfIcon, to: PdfIcon };
    }
  };

  const getAcceptedTypes = () => {
    switch(tool) {
        case 'word-to-pdf': return '.doc,.docx';
        case 'excel-to-pdf': return '.xls,.xlsx,.csv';
        case 'ppt-to-pdf': return '.ppt,.pptx';
        case 'jpg-to-pdf': return '.jpg,.jpeg,.png';
        default: return '.pdf';
    }
  };

  const addFiles = (newFilesList: File[]) => {
    const validFiles = newFilesList.map(file => ({
      file,
      id: Math.random().toString(36).substring(7)
    }));

    if (validFiles.length === 0) return;

    if (tool === 'merge' || tool === 'jpg-to-pdf') {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles([validFiles[0]]); // Single file for most tools
    }
    
    setStep(2);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    const nextFiles = files.filter(f => f.id !== id);
    setFiles(nextFiles);
    if (nextFiles.length === 0) {
      setStep(1);
    }
  };
  
  const handlePreview = async (blob: Blob | File) => {
    setIsGeneratingPreview(true);
    try {
      if (blob.type.includes('image')) {
        setPreviewUrl(URL.createObjectURL(blob));
        setShowPreview(true);
      } else if (blob.type.includes('pdf')) {
        const url = await generatePdfPreview(blob);
        setPreviewUrl(url);
        setShowPreview(true);
      } else {
        alert("Preview not available for this file type. Only PDF and Image files can be previewed.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate preview. The file might be corrupted or encrypted.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const processFiles = async () => {
    setStep(3);
    setError(null);
    setResultBlob(null);
    
    try {
      // Extended duration for transmutation animation
      await new Promise(r => setTimeout(r, 3000)); 

      if (typeof window.PDFLib === 'undefined') {
        throw new Error("PDF Engine not initialized. Please reload the console.");
      }

      let resultBlob: Blob;
      let actionDesc = '';

      if (files.length === 0) throw new Error("No source selected.");

      switch (tool) {
        case 'merge':
            if (files.length < 2) throw new Error("Need at least 2 files to merge.");
            resultBlob = await mergePdfs(files);
            actionDesc = `Fused ${files.length} documents`;
            break;
        case 'split':
            resultBlob = await splitPdf(files[0]);
            actionDesc = `Split ${files[0].file.name}`;
            break;
        case 'protect':
            if (!password) throw new Error("Password required.");
            resultBlob = await protectPdf(files[0], password);
            actionDesc = `Secured ${files[0].file.name}`;
            break;
        case 'unlock':
            if (!password) throw new Error("Password required to unlock.");
            resultBlob = await unlockPdf(files[0], password);
            actionDesc = `Unlocked ${files[0].file.name}`;
            break;
        case 'compress':
            resultBlob = await compressPdf(files[0], compressionQuality / 100);
            actionDesc = `Compressed ${files[0].file.name} (${compressionQuality}%)`;
            break;
        case 'pdf-to-word':
            resultBlob = await convertPdfToOffice(files[0], 'docx');
            actionDesc = `Converted to DOCX`;
            break;
        case 'pdf-to-ppt':
            resultBlob = await convertPdfToOffice(files[0], 'pptx');
            actionDesc = `Converted to PPTX`;
            break;
        case 'pdf-to-excel':
            resultBlob = await convertPdfToOffice(files[0], 'xlsx');
            actionDesc = `Converted to XLSX`;
            break;
        case 'word-to-pdf':
        case 'ppt-to-pdf':
        case 'excel-to-pdf':
            resultBlob = await convertOfficeToPdf(files);
            actionDesc = `Converted to PDF`;
            break;
        case 'jpg-to-pdf':
            resultBlob = await imagesToPdf(files);
            actionDesc = `Converted ${files.length} images to PDF`;
            break;
        case 'pdf-to-jpg':
            resultBlob = await pdfToImage(files[0], 'image/jpeg');
            actionDesc = `Converted to JPG`;
            break;
        case 'edit':
            resultBlob = await editPdf(files[0], editText);
            actionDesc = `Edited ${files[0].file.name}`;
            break;
        default:
            throw new Error("Unknown Protocol");
      }

      const url = URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      setResultBlob(resultBlob);
      
      const sizeStr = (resultBlob.size / 1024 / 1024).toFixed(2) + ' MB';
      
      onComplete(getResultFileName(), actionDesc, sizeStr);
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Processing failed.");
      setStep(2);
    }
  };

  const getResultFileName = () => {
    const base = files[0]?.file.name.substring(0, files[0].file.name.lastIndexOf('.')) || 'document';
    
    switch(tool) {
        case 'pdf-to-word': return `${base}.docx`;
        case 'pdf-to-ppt': return `${base}.pptx`;
        case 'pdf-to-excel': return `${base}.xlsx`;
        case 'pdf-to-jpg': return `${base}.jpg`;
        case 'unlock': return `${base}-unlocked.pdf`;
        default: return `${base}-processed.pdf`;
    }
  };

  const getIcon = () => {
      switch(tool) {
          case 'pdf-to-excel': case 'excel-to-pdf': return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
          case 'pdf-to-ppt': case 'ppt-to-pdf': return <Presentation className="w-8 h-8 text-orange-400" />;
          case 'pdf-to-jpg': case 'jpg-to-pdf': return <ImageIcon className="w-8 h-8 text-yellow-400" />;
          case 'edit': return <PenTool className="w-8 h-8 text-fuchsia-400" />;
          case 'unlock': return <Unlock className="w-8 h-8 text-indigo-400" />;
          case 'protect': return <Lock className="w-8 h-8 text-violet-400" />;
          default: return <UploadCloud className="w-8 h-8 text-cyan-400" />;
      }
  }

  const getCompressionLabel = (val: number) => {
    if (val < 30) return "Extreme (Smallest Size)";
    if (val < 70) return "Balanced (Recommended)";
    return "Visually Lossless (High Quality)";
  }

  const isResultPreviewable = () => {
      if (!resultBlob) return false;
      return resultBlob.type.includes('pdf') || resultBlob.type.includes('image');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* PREVIEW MODAL */}
      {showPreview && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowPreview(false)}>
              <div className="relative bg-[#1a163a] rounded-2xl border border-white/20 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0f0c29]/50">
                      <h3 className="text-white font-bold flex items-center gap-2">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          Document Preview
                      </h3>
                      <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white transition-colors">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-4 bg-black/20 overflow-auto flex-1 flex items-center justify-center">
                       <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded shadow-lg border border-white/10" />
                  </div>
              </div>
          </div>
      )}

      {/* GENERATING OVERLAY */}
      {isGeneratingPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 z-[60]">
              <div className="bg-[#1a163a] px-6 py-4 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl">
                  <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                  <span className="text-white font-medium">Generating Preview...</span>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-white tracking-wide">{getToolTitle()}</h2>
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-4 mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2 rounded-full" />
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-2">
            <div className={`
              w-4 h-4 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]
              ${s <= step ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-110' : 'bg-slate-700 border border-white/10'}
            `} />
          </div>
        ))}
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div 
          className="group relative border-2 border-dashed border-white/20 rounded-3xl p-16 text-center bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) {
              addFiles(Array.from(e.dataTransfer.files));
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <input 
            type="file" 
            accept={getAcceptedTypes()}
            multiple={tool === 'merge' || tool === 'jpg-to-pdf'} 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
          <div className="w-20 h-20 bg-[#1a163a] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Upload Files</h3>
          <p className="text-slate-400">
             {tool.includes('to-pdf') && !tool.includes('jpg') ? 'Drop your Office documents here' : 
              tool.includes('jpg') ? 'Drop images here' :
              'Drop PDF file here'}
          </p>
        </div>
      )}

      {/* STEP 2: CONFIGURE */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-[#1a163a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Selected Artifacts</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {files.map((f) => (
                <div key={f.id} className="group flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-fuchsia-400 shrink-0" />
                    <span className="truncate font-medium text-slate-200">{f.file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Preview Button */}
                    {(f.file.type.includes('pdf') || f.file.type.includes('image')) && (
                        <button 
                            onClick={() => handlePreview(f.file)}
                            className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
                            title="Preview File"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    
                    <span className="text-xs text-slate-500 font-mono hidden sm:block">{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    
                    <button onClick={() => removeFile(f.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {(tool === 'merge' || tool === 'jpg-to-pdf') && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 w-full py-3 border border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:border-cyan-400/50 hover:bg-white/5 transition-all text-sm font-medium"
              >
                + Add More Files
              </button>
            )}
          </div>

          {(tool === 'protect' || tool === 'unlock') && (
            <div className="bg-[#1a163a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
               <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3">
                 {tool === 'protect' ? 'Encryption Key' : 'Enter Current Password'}
               </label>
               <div className="relative">
                 {tool === 'protect' ? (
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 ) : (
                   <Unlock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 )}
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 text-white outline-none placeholder-slate-600"
                  placeholder={tool === 'protect' ? "Enter secure password" : "Password to unlock file"}
                 />
               </div>
            </div>
          )}

          {tool === 'edit' && (
            <div className="bg-[#1a163a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
               <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3">Add Watermark Text</label>
               <div className="relative">
                 <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                  type="text" 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 text-white outline-none placeholder-slate-600"
                  placeholder="Enter text to stamp on PDF"
                 />
               </div>
            </div>
          )}

          {tool === 'compress' && (
             <div className="bg-[#1a163a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-fuchsia-400" />
                    <label className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">Image Quality</label>
                 </div>
                 <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${
                    compressionQuality < 30 ? 'text-cyan-400' : compressionQuality < 70 ? 'text-yellow-400' : 'text-green-400'
                 }`}>
                   {getCompressionLabel(compressionQuality)}
                 </span>
               </div>
               
               <div className="flex items-center gap-6">
                 {/* Cosmic Slider */}
                 <div className="flex-1 relative">
                   <input
                     type="range"
                     min="0"
                     max="100"
                     value={compressionQuality}
                     onChange={(e) => setCompressionQuality(Number(e.target.value))}
                     className="w-full h-2 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-lg appearance-none cursor-pointer outline-none
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                     [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(34,211,238,0.8)]
                     hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                   />
                 </div>

                 {/* Number Input */}
                 <div className="relative w-20 group">
                   <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={compressionQuality}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setCompressionQuality(val);
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center font-mono font-bold text-white focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all appearance-none m-0"
                   />
                   <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium pointer-events-none">%</span>
                 </div>
               </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <button 
            onClick={processFiles}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all transform hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              {tool === 'protect' ? 'Engage Encryption' : tool === 'unlock' ? 'Unlock Document' : 'Initiate Sequence'}
            </span>
          </button>
        </div>
      )}

      {/* STEP 3: COSMIC TRANSMUTATION */}
      {step === 3 && (
        <div className="text-center py-20 animate-fade-in relative overflow-hidden">
          <style>{`
            @keyframes transmute-out {
              0% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0px); }
              40% { opacity: 0; transform: scale(1.5) rotate(10deg); filter: blur(8px); }
              100% { opacity: 0; transform: scale(1.5); }
            }
            @keyframes transmute-in {
              0% { opacity: 0; transform: scale(0.5); filter: blur(10px); }
              50% { opacity: 0; transform: scale(0.5); filter: blur(10px); }
              100% { opacity: 1; transform: scale(1); filter: blur(0px); }
            }
            @keyframes particle-drift {
              0% { transform: translate(0,0) scale(0); opacity: 0; }
              20% { opacity: 1; transform: translate(0,0) scale(1); }
              100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
            }
          `}</style>

          <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
            {/* Energy Field Background */}
            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            
            {/* Particles */}
            {[...Array(24)].map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              const dist = 80 + Math.random() * 40;
              const tx = Math.cos(angle) * dist + 'px';
              const ty = Math.sin(angle) * dist + 'px';
              return (
                <div 
                  key={i}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_5px_cyan]"
                  style={{
                    '--tx': tx,
                    '--ty': ty,
                    animation: 'particle-drift 3s infinite ease-in-out',
                    animationDelay: `${Math.random() * 2}s`
                  } as any}
                />
              );
            })}

            {/* Orbitals */}
            <div className="absolute inset-4 border border-cyan-500/30 rounded-full animate-spin [animation-duration:8s]" />
            <div className="absolute inset-8 border border-fuchsia-500/30 rounded-full animate-spin [animation-duration:6s] [animation-direction:reverse]" />

            {/* Icons Transmutation */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'transmute-out 3s infinite ease-in-out' }}>
               {getTransmutationIcons().from}
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'transmute-in 3s infinite ease-in-out' }}>
               {getTransmutationIcons().to}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 tracking-wide mb-2 animate-pulse">Transmuting Matter</h3>
          <p className="text-slate-400 text-sm uppercase tracking-[0.3em]">Reassembling Molecular Structure</p>
        </div>
      )}

      {step === 4 && downloadUrl && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">Success</h3>
          <p className="text-slate-400 mb-10">Your file is ready.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isResultPreviewable() && resultBlob && (
                <button 
                  onClick={() => handlePreview(resultBlob)}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-cyan-400 rounded-xl font-bold hover:bg-white/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
            )}
            <a 
              href={downloadUrl} 
              download={getResultFileName()}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] transition flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </a>
            <button 
              onClick={() => {
                setStep(1);
                setFiles([]);
                setPassword('');
                setDownloadUrl(null);
                setEditText('Confidential');
                setResultBlob(null);
              }}
              className="px-8 py-4 bg-white/5 text-slate-200 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Process New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolWizard;