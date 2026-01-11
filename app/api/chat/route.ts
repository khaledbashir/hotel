import { NextRequest, NextResponse } from 'next/server';
import { ZAI_BASE_URL, ZAI_API_KEY, ZAI_MODEL } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { question, contractData } = await request.json();

    const systemPrompt = `You are an expert hotel contract analyst. Answer questions about hotel contracts based on the provided data. Be specific and cite exact values from the contract data. If information is not available, say so clearly.

Contract Data:
${JSON.stringify(contractData, null, 2)}`;

    const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: ZAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Chat API error:', error);
      throw new Error(`Chat API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Could not generate answer';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { answer: 'Sorry, I encountered an error processing your question.' },
      { status: 500 }
    );
  }
}
