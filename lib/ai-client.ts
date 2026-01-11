// Custom AI client for z.ai API (GLM-4.6v model)
// Vision model for multi-language contract extraction

const API_CONFIG = {
  baseURL: process.env.ZAI_BASE_URL || 'https://api.z.ai/api/coding/paas/v4',
  apiKey: process.env.ZAI_API_KEY,
  model: process.env.ZAI_MODEL || 'glm-4.6v',
};

export const ZAI_BASE_URL = API_CONFIG.baseURL;
export const ZAI_API_KEY = API_CONFIG.apiKey;
export const ZAI_MODEL = API_CONFIG.model;

export interface ExtractionResponse {
  hotelName: string;
  contractStartDate: string;
  contractEndDate: string;
  currency: string;
  cancellationPolicy?: string;
  paymentTerms?: string;
  roomRates: Array<{
    roomType: string;
    season: string;
    rate: number;
    mealPlan: string;
    currency: string;
    validFrom?: string;
    validTo?: string;
  }>;
  confidence?: number;
}

export async function extractContractFromImages(
  images: string[]
): Promise<ExtractionResponse> {
  if (!API_CONFIG.apiKey) {
    throw new Error('ZAI_API_KEY not configured');
  }

  const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert hotel contract data extraction specialist. Extract structured information from hotel contracts with high accuracy.

CRITICAL: Hunt for the HOTEL NAME aggressively in these locations:
1. Document header (top of first page)
2. Logo text or letterhead
3. Contract title line
4. First paragraph introduction
5. Any mention of "Hotel", "Resort", "Spa", "Inn", "Lodge"

NEVER return "Unknown Hotel" unless the document is completely blank or unreadable.

Return data ONLY in valid JSON format without markdown formatting.

Required structure:
{
  "hotelName": "string (MUST extract actual hotel name from document - look at headers, letterheads, logos)",
  "contractStartDate": "string (YYYY-MM-DD format)",
  "contractEndDate": "string (YYYY-MM-DD format)",
  "currency": "string (USD, EUR, GBP, etc.)",
  "cancellationPolicy": "string (full policy text if found)",
  "paymentTerms": "string (full terms if found)",
  "roomRates": [
    {
      "roomType": "string (e.g., 'Deluxe Room', 'Suite')",
      "season": "string (Low/Mid/High/Peak/Year_round - match exact values)",
      "rate": number (numeric value only)",
      "mealPlan": "string (RO/BB/HB/FB/AI - match exact values)",
      "currency": "string (same as main currency)",
      "validFrom": "YYYY-MM-DD or null",
      "validTo": "YYYY-MM-DD or null"
    }
  ],
  "confidence": number (0-1, rate your certainty)
}`,
        },
        {
          role: 'user',
          content: images.map(img => ({
            type: 'image_url',
            image_url: { url: img },
          })),
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Z.ai API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonContent = content.replace(/ \`\`\`json/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  
  try {
    const parsed = JSON.parse(jsonContent);
    // Ensure roomRates exists
    return {
      ...parsed,
      roomRates: parsed.roomRates || [],
    };
  } catch (e) {
    throw new Error('AI returned invalid JSON format from vision model.');
  }
}

export async function extractContractFromText(
  text: string
): Promise<ExtractionResponse> {
  if (!API_CONFIG.apiKey) {
    throw new Error('ZAI_API_KEY not configured');
  }

  // Pre-process text to remove excessive whitespace and clean up
  const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, 30000); 

  const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert hospitality contract analyst. Extract data from hotel contracts.

CRITICAL:
1. Identifying the Hotel: Look for the hotel name in headers or first page. DO NOT return "Unknown Hotel" if there's any mention of a company name.
2. JSON Format: You MUST return ONLY valid JSON. 

Expected JSON Structure:
{
  "hotelName": "Exact Hotel Name",
  "contractStartDate": "YYYY-MM-DD",
  "contractEndDate": "YYYY-MM-DD",
  "currency": "USD",
  "cancellationPolicy": "string",
  "paymentTerms": "string",
  "roomRates": [
    {
      "roomType": "Deluxe/Superior/etc",
      "season": "string",
      "rate": number,
      "mealPlan": "RO/BB/HB/FB/AI",
      "currency": "USD",
      "validFrom": "YYYY-MM-DD",
      "validTo": "YYYY-MM-DD"
    }
  ],
  "confidence": number
}`
        },
        {
          role: 'user',
          content: `Extract from this text:\n\n${cleanText}`
        },
      ],
      temperature: 0,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) throw new Error('Text extraction failed');
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonContent = content.replace(/ \`\`\`json/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  
  try {
    const parsed = JSON.parse(jsonContent);
    return {
      ...parsed,
      roomRates: parsed.roomRates || [],
      hotelName: parsed.hotelName || 'Unknown Hotel',
      currency: parsed.currency || 'USD'
    };
  } catch (e) {
    throw new Error('AI returned invalid JSON format from text model.');
  }
}
