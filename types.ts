export type ToolType = 
  | 'merge' 
  | 'split' 
  | 'protect' 
  | 'compress' 
  | 'pdf-to-word'
  | 'pdf-to-ppt'
  | 'pdf-to-excel'
  | 'word-to-pdf'
  | 'ppt-to-pdf'
  | 'excel-to-pdf'
  | 'edit'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf';

export type ViewState = 'dashboard' | 'history' | ToolType;

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

declare global {
  interface Window {
    PDFLib: any;
    pdfjsLib: any;
  }
}