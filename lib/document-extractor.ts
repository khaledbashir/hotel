// Modern multi-format extraction
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// Polyfill DOMMatrix and related APIs for legacy PDF libraries in Node environment
if (typeof global !== 'undefined') {
  if (!(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {
      constructor() {}
      static fromFloat32Array() { return new DOMMatrix(); }
      static fromFloat64Array() { return new DOMMatrix(); }
      translate() { return this; }
      scale() { return this; }
      rotate() { return this; }
    };
  }
  if (!(global as any).Path2D) {
    (global as any).Path2D = class Path2D {};
  }
  if (!(global as any).ImageData) {
    (global as any).ImageData = class ImageData {};
  }
}

export type FileType = 'pdf' | 'excel' | 'word';

export interface ExtractedData {
  fileType: FileType;
  text: string;
  pages?: number;
  tables?: any[];
}

export async function extractPDF(buffer: Buffer): Promise<ExtractedData> {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    const extractedText = data.text || "";
    console.log(`[PDF Extraction] Extracted ${extractedText.length} characters from ${data.numpages} pages`);
    return {
      fileType: 'pdf',
      text: extractedText,
      pages: data.numpages,
    };
  } catch (err) {
    console.error("PDF Extraction Error:", err);
    // Return empty but don't crash - let the caller decide what to do
    return {
      fileType: 'pdf',
      text: "",
      pages: 0
    };
  }
}

export async function extractExcel(buffer: Buffer): Promise<ExtractedData> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheets: string[] = [];
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    sheets.push(XLSX.utils.sheet_to_csv(sheet));
  });
  return {
    fileType: 'excel',
    text: sheets.join('\n\n'),
    tables: sheets,
  };
}

export async function extractWord(buffer: Buffer): Promise<ExtractedData> {
  const { value: text } = await mammoth.extractRawText({ buffer });
  return {
    fileType: 'word',
    text,
  };
}

export async function extractDocument(buffer: Buffer, mimeType: string, fileName?: string): Promise<ExtractedData> {
  const type = mimeType.toLowerCase();
  if (type === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf')) {
    return extractPDF(buffer);
  } else if (type.includes('sheet') || type.includes('excel') || fileName?.toLowerCase().endsWith('.xlsx')) {
    return extractExcel(buffer);
  } else if (type.includes('word') || type.includes('document') || fileName?.toLowerCase().endsWith('.docx')) {
    return extractWord(buffer);
  }
  return { fileType: 'word', text: "" };
}
