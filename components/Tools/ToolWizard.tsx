import React, { useState, useRef } from 'react';
import { ToolType, PDFFile } from '../../types';
import { UploadCloud, Trash2, FileText, Lock, ArrowLeft, Download, CheckCircle, RefreshCw, Zap, Image as ImageIcon, FileSpreadsheet, Presentation, PenTool, Type } from 'lucide-react';
import { mergePdfs, splitPdf, protectPdf, compressPdf, imagesToPdf, pdfToImage, editPdf, convertOfficeToPdf, convertPdfToOffice } from '../../services/pdfService';

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
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToolTitle = () => {
    switch (tool) {
      case 'merge': return 'Merge PDF';
      case 'split': return 'Split PDF';
      case 'protect': return 'Protect PDF';
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

  const processFiles = async () => {
    setStep(3);
    setError(null);
    
    try {
      await new Promise(r => setTimeout(r, 1500)); // Simulate processing time

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
        case 'compress':
            resultBlob = await compressPdf(files[0]);
            actionDesc = `Compressed ${files[0].file.name}`;
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
        default: return `${base}-processed.pdf`;
    }
  };

  const getIcon = () => {
      switch(tool) {
          case 'pdf-to-excel': case 'excel-to-pdf': return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
          case 'pdf-to-ppt': case 'ppt-to-pdf': return <Presentation className="w-8 h-8 text-orange-400" />;
          case 'pdf-to-jpg': case 'jpg-to-pdf': return <ImageIcon className="w-8 h-8 text-yellow-400" />;
          case 'edit': return <PenTool className="w-8 h-8 text-fuchsia-400" />;
          default: return <UploadCloud className="w-8 h-8 text-cyan-400" />;
      }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
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
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-mono">{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button onClick={() => removeFile(f.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
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

          {tool === 'protect' && (
            <div className="bg-[#1a163a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
               <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3">Encryption Key</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 text-white outline-none placeholder-slate-600"
                  placeholder="Enter secure password"
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
              {tool === 'protect' ? 'Engage Encryption' : 'Initiate Sequence'}
            </span>
          </button>
        </div>
      )}

      {/* STEP 3 & 4 (Processing/Success) - Reused structure */}
      {step === 3 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-wide">Processing</h3>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">Reconfiguring Structure</p>
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