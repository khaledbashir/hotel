// Server-only multi-format extraction
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// Use require for pdf-parse to avoid ESM/CJS default export conflicts
const pdfParse = require('pdf-parse');

export type FileType = 'pdf' | 'excel' | 'word';

export interface ExtractedData {
  fileType: FileType;
  text: string;
  pages?: number;
  tables?: any[];
}

export async function extractPDF(buffer: Buffer): Promise<ExtractedData> {
  // pdf-parse uses some legacy APIs that might trigger DOMMatrix warnings in some Node environments
  // but it's the most reliable simple extractor for standard PDFs
  const data = await pdfParse(buffer);
  
  return {
    fileType: 'pdf',
    text: data.text,
    pages: data.numpages,
  };
}

export async function extractExcel(buffer: Buffer): Promise<ExtractedData> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheets: string[] = [];
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(csv);
  });
  
  return {
    fileType: 'excel',
    text: sheets.join('\n\n--- Sheet ---\n\n'),
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
  
  if (type === 'application/pdf') {
    return extractPDF(buffer);
  } else if (type.includes('sheet') || type.includes('excel')) {
    return extractExcel(buffer);
  } else if (type.includes('word') || type.includes('document')) {
    return extractWord(buffer);
  } else {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return extractPDF(buffer);
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return extractExcel(buffer);
    if (['docx', 'doc'].includes(ext || '')) return extractWord(buffer);
    
    throw new Error(`Unsupported file type: ${type}`);
  }
}
