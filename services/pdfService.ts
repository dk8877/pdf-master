import { PDFFile } from '../types';

// Helper to ensure PDFLib is loaded
export const ensurePdfLibLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.PDFLib;
};

// Helper to read file as ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const mergePdfs = async (files: PDFFile[]): Promise<Blob> => {
  const { PDFDocument } = window.PDFLib;
  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of files) {
    const arrayBuffer = await readFileAsArrayBuffer(pdfFile.file);
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page: any) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const splitPdf = async (file: PDFFile): Promise<Blob> => {
  const { PDFDocument } = window.PDFLib;
  const arrayBuffer = await readFileAsArrayBuffer(file.file);
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const pageCount = pdf.getPageCount();
  const splitIndex = Math.ceil(pageCount / 2); // Split first 50%

  const newPdf = await PDFDocument.create();
  // Copy first half
  const pages = await newPdf.copyPages(pdf, Array.from({ length: splitIndex }, (_, i) => i));
  pages.forEach((page: any) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const protectPdf = async (file: PDFFile, password: string): Promise<Blob> => {
  const { PDFDocument } = window.PDFLib;
  const arrayBuffer = await readFileAsArrayBuffer(file.file);
  const pdf = await PDFDocument.load(arrayBuffer);

  pdf.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    }
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const compressPdf = async (file: PDFFile): Promise<Blob> => {
  const { PDFDocument } = window.PDFLib;
  const arrayBuffer = await readFileAsArrayBuffer(file.file);
  const pdf = await PDFDocument.load(arrayBuffer);

  pdf.setTitle(file.file.name.replace('.pdf', ''));
  pdf.setCreator('PDF Master Open Access');
  pdf.setProducer('PDF Master Open Access');
  
  const pdfBytes = await pdf.save({ useObjectStreams: false }); 
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Real Implementation: Images to PDF
export const imagesToPdf = async (files: PDFFile[]): Promise<Blob> => {
  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.create();

  for (const fileObj of files) {
      const imageBytes = await readFileAsArrayBuffer(fileObj.file);
      let image;
      const fileType = fileObj.file.type;
      
      try {
        if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (fileType === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        }
      } catch (e) {
        console.warn("Failed to embed image", fileObj.file.name);
        continue;
      }
      
      if (image) {
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
      }
  }
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Real Implementation: PDF to Image (First Page)
export const pdfToImage = async (file: PDFFile, format: 'image/jpeg' | 'image/png'): Promise<Blob> => {
    if (!window.pdfjsLib) {
        throw new Error("PDF Renderer not loaded");
    }
    
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
       window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const arrayBuffer = await readFileAsArrayBuffer(file.file);
    const loadingTask = window.pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    
    const page = await pdf.getPage(1);
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error("Canvas context failed");

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image generation failed"));
        }, format, 0.95);
    });
};

// Real Implementation: Edit PDF (Add Watermark/Text)
export const editPdf = async (file: PDFFile, text: string): Promise<Blob> => {
  const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
  const arrayBuffer = await readFileAsArrayBuffer(file.file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  pages.forEach((page: any) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: 50,
      y: height - 50,
      size: 24,
      font: font,
      color: rgb(0.95, 0.1, 0.1), // Red color
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Mock Implementation for Office Formats
export const convertOfficeToPdf = async (files: PDFFile[]): Promise<Blob> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  // In a real app, this would send to a backend. 
  // Here we just wrap the file content in a PDF container or return a dummy.
  // For UX simulation, we create a blank PDF saying "Converted".
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Converted content of: ${files[0].file.name}`, {
      x: 50,
      y: 700,
      size: 24,
      font,
      color: rgb(0, 0, 0),
  });
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const convertPdfToOffice = async (file: PDFFile, type: 'docx' | 'xlsx' | 'pptx'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Mock return original bytes as blob but with different type for download simulation
    return new Blob([await readFileAsArrayBuffer(file.file)], { 
        type: 'application/octet-stream' 
    });
}