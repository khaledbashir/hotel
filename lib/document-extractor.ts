// Modern multi-format extraction using unpdf (lightweight, no DOM dependencies)
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { extractText } from 'unpdf';

export type FileType = 'pdf' | 'excel' | 'word';

export interface ExtractedData {
  fileType: FileType;
  text: string;
  pages?: number;
  tables?: any[];
}

export async function extractPDF(buffer: Buffer): Promise<ExtractedData> {
  try {
    const { text, totalPages } = await extractText(buffer);
    console.log(`[PDF Extraction] Extracted ${text.length} characters from ${totalPages} pages`);
    return {
      fileType: 'pdf',
      text: text || "",
      pages: totalPages,
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
