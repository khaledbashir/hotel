// Multi-format file parser for hotel contracts
// Supports PDF, Excel, Word documents

import { readFileSync } from 'fs';
import xlsx from 'xlsx';
import mammoth from 'mammoth';
import pdfjs from 'pdfjs-dist';

export type FileType = 'pdf' | 'excel' | 'word';
export type ExtractionMethod = 'vision' | 'text' | 'hybrid';

export interface FileData {
  type: FileType;
  buffer: Buffer;
  base64: string;
  fileName: string;
  fileSize: number;
}

export interface ExtractedText {
  text: string;
  method: ExtractionMethod;
  pageCount?: number;
}

export async function parseFile(file: File): Promise<FileData> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase() as FileType;
  
  if (!['pdf', 'xlsx', 'xls', 'docx'].includes(ext)) {
    throw new Error(`Unsupported file format: ${ext}. Use PDF, Excel (.xlsx, .xls), or Word (.docx)`);
  }
  
  const type = ext === 'xlsx' || ext === 'xls' ? 'excel' : ext === 'docx' ? 'word' : 'pdf';
  const base64 = buffer.toString('base64');
  
  return {
    type,
    buffer,
    base64,
    fileName: file.name,
    fileSize: file.size,
  };
}

export async function extractTextFromFile(fileData: FileData): Promise<ExtractedText> {
  switch (fileData.type) {
    case 'pdf':
      return extractTextFromPDF(fileData.buffer);
    case 'excel':
      return extractTextFromExcel(fileData.buffer);
    case 'word':
      return extractTextFromWord(fileData.buffer);
    default:
      throw new Error(`Unsupported file type: ${fileData.type}`);
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedText> {
  try {
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}\n`;
    }
    
    return {
      text: fullText,
      method: 'text',
      pageCount: pdf.numPages,
    };
  } catch (error) {
    console.error('PDF text extraction error:', error);
    // Fallback to vision-based extraction
    return {
      text: '',
      method: 'vision',
      pageCount: 0,
    };
  }
}

async function extractTextFromExcel(buffer: Buffer): Promise<ExtractedText> {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    let fullText = '';
    
    workbook.SheetNames.forEach((sheetName, index) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetText = xlsx.utils.sheet_to_csv(sheet);
      fullText += `\n--- Sheet ${index + 1}: ${sheetName} ---\n${sheetText}\n`;
    });
    
    return {
      text: fullText,
      method: 'text',
    };
  } catch (error) {
    console.error('Excel text extraction error:', error);
    throw new Error('Failed to extract text from Excel file');
  }
}

async function extractTextFromWord(buffer: Buffer): Promise<ExtractedText> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value,
      method: 'text',
    };
  } catch (error) {
    console.error('Word text extraction error:', error);
    throw new Error('Failed to extract text from Word file');
  }
}

export function determineExtractionMethod(fileData: FileData, textResult: ExtractedText): ExtractionMethod {
  // PDF with good text extraction = hybrid (text + vision for tables)
  // Excel/Word = text-based
  // PDF with failed text extraction = vision-only
  
  if (fileData.type === 'excel' || fileData.type === 'word') {
    return 'text';
  }
  
  if (fileData.type === 'pdf') {
    if (textResult.text && textResult.text.length > 500) {
      return 'hybrid'; // Has good text, can combine with vision
    }
    return 'vision'; // Poor text extraction, rely on vision
  }
  
  return 'vision';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
