
export type ToolType = 
  | 'merge' 
  | 'split' 
  | 'protect' 
  | 'unlock'
  | 'compress' 
  | 'pdf-to-word'
  | 'pdf-to-ppt'
  | 'pdf-to-excel'
  | 'word-to-pdf'
  | 'ppt-to-pdf'
  | 'excel-to-pdf'
  | 'edit'
  | 'edit-pro'
  | 'photo-lab'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'batch'
  | 'ai-summary';

export type ViewState = 'dashboard' | 'history' | 'privacy' | ToolType;

export interface HistoryItem {
  id: string;
  fileName: string;
  action: string;
  timestamp: Date;
  size: string;
}

export interface PDFFile {
  file: File;
  id: string;
}

export interface MergePage {
  id: string;
  originalFileId: string;
  fileName: string;
  pageIndex: number; // 0-based
  thumbnail: string;
  rotation: number;
  width: number;
  height: number;
}

declare global {
  interface Window {
    PDFLib: any;
    pdfjsLib: any;
    PptxGenJS: any;
  }
}
