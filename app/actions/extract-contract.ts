'use server';

import { extractContractFromImages, extractContractFromText } from '@/lib/ai-client';
import { extractDocument } from '@/lib/document-extractor';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Server action to extract contract data from uploaded document
export async function extractContractData(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  console.log('[extractContractData] Starting extraction for:', file.name);
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Step 1: Extract text (and potentially metadata) from the document
    const extraction = await extractDocument(buffer, file.type, file.name);
    
    let result;
    
    // Step 2: Use text-based extraction for documents (PDF/Word/Excel)
    if (extraction.text && extraction.text.trim().length > 20) {
      console.log('[extractContractData] Using text extraction...');
      result = await extractContractFromText(extraction.text);
    } else if (file.type.startsWith('image/')) {
      // Only use vision if it's an actual image format
      console.log('[extractContractData] Using vision extraction for image...');
      const base64 = buffer.toString('base64');
      const imageDataUrl = `data:${file.type};base64,${base64}`;
      result = await extractContractFromImages([imageDataUrl]);
    } else {
      // If we're here, text extraction failed and it's not an image
      throw new Error('Could not extract text from this document. Please ensure it is not a scanned image PDF without OCR.');
    }
    
    // Step 3: Save to Database (Production Ready)
    try {
      const savedContract = await prisma.contract.create({
        data: {
          hotelName: result.hotelName || 'Unknown Hotel',
          contractStartDate: result.contractStartDate ? new Date(result.contractStartDate) : new Date(),
          contractEndDate: result.contractEndDate ? new Date(result.contractEndDate) : new Date(),
          currency: result.currency || 'USD',
          cancellationPolicy: result.cancellationPolicy,
          paymentTerms: result.paymentTerms,
          roomRates: {
            create: (result.roomRates || []).map((rate: any) => ({
              roomType: rate.roomType,
              season: (rate.season as any) || 'Year-round',
              rate: parseFloat(rate.rate.toString()),
              mealPlan: (rate.mealPlan as any) || 'RO',
              currency: rate.currency || result.currency || 'USD',
              validFrom: rate.validFrom ? new Date(rate.validFrom) : null,
              validTo: rate.validTo ? new Date(rate.validTo) : null,
            })),
          },
        },
      });
      console.log('[extractContractData] Saved to DB with ID:', savedContract.id);
    } catch (dbError) {
      console.error('[extractContractData] DB Save Error (continuing):', dbError);
      // We don't fail the extraction if DB save fails, but we log it
    }
    
    return {
      ...result,
      extractedAt: new Date().toISOString(),
      confidence: result.confidence || 0.85,
    };
  } catch (error) {
    console.error('[extractContractData] Global Error:', error);
    throw error;
  }
}
