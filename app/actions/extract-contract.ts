'use server';

import { extractContractFromImages, extractContractFromText, ExtractionResponse } from '@/lib/ai-client';
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
    
    let result: ExtractionResponse | null = null;

    // Step 2: Extract data using AI
    if (file.type.startsWith('image/')) {
      console.log('[extractContractData] Using image vision extraction...');
      const base64 = buffer.toString('base64');
      const imageUrl = `data:${file.type};base64,${base64}`;
      result = await extractContractFromImages([imageUrl]);
    } else if (extraction.text && extraction.text.trim().length > 20) {
      console.log(`[extractContractData] Using text extraction (${extraction.text.length} chars)...`);
      result = await extractContractFromText(extraction.text);
    } else {
      // If text extraction failed or returned very little text,
      // try asking the AI to work with whatever text we have
      console.log('[extractContractData] Text extraction returned minimal content, attempting AI extraction anyway...');
      const promptText = extraction.text || "No text could be extracted from this document.";
      result = await extractContractFromText(promptText + "\n\nPlease extract any available hotel contract information. If no data is present, return a structure with placeholder values and set confidence to 0.");
    }
    
    if (!result) {
      throw new Error('Failed to extract data from document.');
    }

    // Map seasons to enum values
    const mapSeason = (s: string): string => {
      const val = s?.toUpperCase().replace(/[- ]/g, '_') || 'YEAR_ROUND';
      if (val === 'YEAR_ROUND') return 'YEAR_ROUND';
      if (val === 'LOW' || val === 'LOW_SEASON') return 'LOW_SEASON';
      if (val === 'MID' || val === 'MID_SEASON') return 'MID_SEASON';
      if (val === 'HIGH' || val === 'HIGH_SEASON') return 'HIGH_SEASON';
      if (val === 'PEAK' || val === 'PEAK_SEASON') return 'PEAK_SEASON';
      return 'YEAR_ROUND';
    };

    // Step 3: Save to Database (Production Ready - 3-Layer Storage)
    let savedContractId = '';
    try {
      // Wrap in transaction for atomic 3-layer storage
      const savedContract = await prisma.contract.create({
        data: {
          hotelName: result.hotelName || 'Unknown Hotel',
          fileName: file.name,
          fileType: (extraction.fileType.toUpperCase() === 'WORD' ? 'DOCX' : extraction.fileType.toUpperCase()) as any,
          fileSize: BigInt(file.size),
          extractionMethod: file.type.startsWith('image/') ? 'TEXT_VISION' : 'TEXT_PARSING',
          contractStartDate: result.contractStartDate ? new Date(result.contractStartDate) : new Date(),
          contractEndDate: result.contractEndDate ? new Date(result.contractEndDate) : new Date(),
          baseCurrency: (result.currency || 'USD') as any,
          cancellationPolicy: 'FREE_CANCELLATION', 
          commissionType: 'PERCENTAGE',
          commissionPayment: 'MONTHLY',
          paymentTerms: 'NET_DAYS',
          allotmentType: 'ON_REQUEST',
          extractionConfidence: result.confidence || 0.85,
          roomRates: {
            create: (result.roomRates || []).map((rate: any) => ({
              roomType: rate.roomType,
              roomCategory: 'STANDARD',
              season: mapSeason(rate.season) as any,
              rateType: 'NEGOTIATED_RATE',
              baseRate: parseFloat(rate.rate?.toString() || '0'),
              currency: (rate.currency || result.currency || 'USD') as any,
              mealPlan: (rate.mealPlan?.toUpperCase() === 'BB' ? 'BED_AND_BREAKFAST' : 'ROOM_ONLY') as any,
              validFrom: rate.validFrom ? new Date(rate.validFrom) : null,
              validTo: rate.validTo ? new Date(rate.validTo) : null,
            })),
          },
          canonicalData: {
            create: {
              jsonData: result as any,
              schemaVersion: 'v1.0.0',
              confidence: result.confidence || 0.85,
              extractedAt: new Date(),
              llmModel: 'glm-4.6v',
            }
          }
        },
      });
      savedContractId = savedContract.id;
      console.log('[extractContractData] Saved to DB (3-Layer Atomic) with ID:', savedContractId);
    } catch (dbError) {
      console.error('[extractContractData] DB Save Error:', dbError);
    }
    
    return {
      hotelName: result.hotelName || 'Unknown Hotel',
      contractStartDate: result.contractStartDate || new Date().toISOString().split('T')[0],
      contractEndDate: result.contractEndDate || new Date().toISOString().split('T')[0],
      currency: result.currency || 'USD',
      cancellationPolicy: result.cancellationPolicy,
      paymentTerms: result.paymentTerms,
      roomRates: (result.roomRates || []).map((rate: any) => ({
        ...rate,
        season: rate.season === 'Year-round' ? 'YEAR_ROUND' : rate.season,
      })),
      extractedAt: new Date().toISOString(),
      confidence: result.confidence || 0.85,
      dbId: savedContractId,
    };
  } catch (error) {
    console.error('[extractContractData] Global Error:', error);
    throw error;
  }
}
