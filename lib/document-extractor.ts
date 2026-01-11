// Modern multi-format extraction
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// Polyfill DOMMatrix for legacy PDF libraries in Node environment
if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {
    constructor() {}
    static fromFloat32Array() { return new DOMMatrix(); }
    static fromFloat64Array() { return new DOMMatrix(); }
  };
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
    // We use a dynamic import/require and clear the cache if needed, 
    // but the polyfill above should solve the evaluation error
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return {
      fileType: 'pdf',
      text: data.text || "",
      pages: data.numpages,
    };
  } catch (err) {
    console.error("PDF Extraction Error:", err);
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
