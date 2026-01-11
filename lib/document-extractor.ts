// Real multi-format extraction - no toys
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export type FileType = 'pdf' | 'excel' | 'word';

export interface ExtractedData {
  fileType: FileType;
  text: string;
  pages?: number;
  tables?: any[]; // Excel/Word tables
}

// PDF extraction
export async function extractPDF(buffer: Buffer): Promise<ExtractedData> {
  const data = await pdfParse(buffer);
  
  return {
    fileType: 'pdf',
    text: data.text,
    pages: data.numpages,
  };
}

// Excel extraction
export async function extractExcel(buffer: Buffer): Promise<ExtractedData> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const sheets: any[] = [];
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    // Convert to CSV string for better text context for LLM
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(csv);
  });
  
  const fullText = sheets.join('\n\n--- Sheet ---\n\n');
  
  return {
    fileType: 'excel',
    text: fullText,
    tables: sheets,
  };
}

// Word extraction
export async function extractWord(buffer: Buffer): Promise<ExtractedData> {
  const { value: text } = await mammoth.extractRawText({ buffer });
  
  return {
    fileType: 'word',
    text,
  };
}

// Unified extractor
export async function extractDocument(buffer: Buffer, mimeType: string, fileName?: string): Promise<ExtractedData> {
  const type = mimeType.toLowerCase();
  
  if (type === 'application/pdf') {
    return extractPDF(buffer);
  } else if (type.includes('sheet') || type.includes('excel')) {
    return extractExcel(buffer);
  } else if (type.includes('word') || type.includes('document')) {
    return extractWord(buffer);
  } else {
    // If mime type is unknown, try by extension
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return extractPDF(buffer);
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return extractExcel(buffer);
    if (['docx', 'doc'].includes(ext || '')) return extractWord(buffer);
    
    throw new Error(`Unsupported file type: ${type}`);
  }
}

// Convert to images for vision fallback
export async function fileToImages(file: File): Promise<string[]> {
  // For now, convert to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  
  return [`data:${file.type};base64,${base64}`];
}
