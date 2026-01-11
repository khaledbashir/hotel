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
    
    console.log(`[extractContractData] Extracted text length: ${extraction.text?.length || 0}`);
    if (extraction.text) {
      console.log(`[extractContractData] Text sample: ${extraction.text.substring(0, 200)}...`);
    }
    
    // Step 2: Use text-based extraction for documents (PDF/Word/Excel)
    if (extraction.text && extraction.text.trim().length > 20) {
      console.log(`[extractContractData] Using text extraction (${extraction.text.length} chars)...`);
      result = await extractContractFromText(extraction.text);
    } else {
      // If text extraction failed or returned very little text,
      // try asking the AI to work with whatever text we have
      console.log('[extractContractData] Text extraction returned minimal content, attempting AI extraction anyway...');
      const promptText = extraction.text || "No text could be extracted from this document.";
      result = await extractContractFromText(promptText + "\n\nPlease extract any available hotel contract information. If no data is present, return a structure with placeholder values and set confidence to 0.");
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
      roomRates: result.roomRates || [],
      extractedAt: new Date().toISOString(),
      confidence: result.confidence || 0.85,
    };
  } catch (error) {
    console.error('[extractContractData] Global Error:', error);
    throw error;
  }
}
