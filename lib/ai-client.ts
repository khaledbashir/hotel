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
          content: 'You are an expert hotel contract data extraction specialist. Extract structured information from hotel contracts with high accuracy. Return data ONLY in JSON format.',
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
    return JSON.parse(jsonContent);
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
          content: 'You are an expert hotel contract analyst. Extract data in JSON format.',
        },
        {
          role: 'user',
          content: `Extract structured hotel contract data from this text:\n\n${text}`,
        },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) throw new Error('Text extraction failed');
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonContent = content.replace(/ \`\`\`json/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  
  try {
    return JSON.parse(jsonContent);
  } catch (e) {
    throw new Error('AI returned invalid JSON format from text model.');
  }
}
