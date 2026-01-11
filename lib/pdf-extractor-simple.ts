// Simplified PDF text extractor using pdf-lib for metadata
export async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    // Try the standard pdf-parse approach first
    const pdfParseModule = require('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    if (typeof pdfParse === 'function') {
      const data = await pdfParse(buffer);
      return data.text || "";
    }
  } catch (err) {
    console.error("pdf-parse failed, returning empty:", err);
  }
  
  // If pdf-parse fails, return a message indicating manual extraction needed
  return "";
}
