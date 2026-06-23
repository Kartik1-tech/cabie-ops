import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing "text" in request body' },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY is not defined in environment variables.');
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a logistics ops manager. Triage the input and extract actionable insights.
Be extremely concise to ensure ultra-fast generation.
Return STRICT JSON ONLY following this schema:
{
  "priorities": [{ "issue": "string", "priority": "number", "reason": "string" }],
  "actions": ["string"],
  "messages": [{ "recipient": "string", "content": "string" }],
  "escalations": ["string"]
}
No markdown formatting, no \`\`\`json wrappers, no explanations. Output ONLY the raw JSON object.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
      return NextResponse.json(
        { error: 'No content received from OpenRouter' },
        { status: 500 }
      );
    }

    // Clean up potential markdown code block wrappers
    resultText = resultText.trim();
    if (resultText.startsWith('```json')) {
      resultText = resultText.slice(7);
    } else if (resultText.startsWith('```')) {
      resultText = resultText.slice(3);
    }
    if (resultText.endsWith('```')) {
      resultText = resultText.slice(0, -3);
    }
    resultText = resultText.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (parseError) {
      console.error('Failed to parse JSON from OpenRouter:', resultText);
      return NextResponse.json(
        { error: 'Invalid JSON returned by LLM', rawText: resultText },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error('Error in /api/orchestrate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
