import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// This API route receives a study guide prompt and returns a calendar event suggestion
export async function POST(req: NextRequest) {
  try {
    const { prompt, perplexity_api_key } = await req.json();
    if (!prompt || !perplexity_api_key) {
      return NextResponse.json({ error: 'Missing prompt or API key' }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey: perplexity_api_key,
      baseURL: 'https://api.perplexity.ai',
    });

    // Ask the agent to extract a calendar event from the prompt
    const systemPrompt = `You are an AI assistant that extracts study session or project details from prompts and returns a JSON object for a calendar event. The object should have: title, start (ISO string), end (ISO string), and description. Use all hints in the prompt to infer the best start and end date/time for the event. The event can last hours, days, weeks, or months depending on the context (for example, a project or study plan may span weeks). Do not always use the same time range. If the prompt suggests a long-term event, set the end date accordingly. If no date is found, suggest a session for tomorrow at 6pm for 2 hours. Always return only the JSON object.`;
    const response = await client.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });
    
    // Try to parse the JSON from the response
    let event;
    const content = response.choices[0].message.content || '{}';
    // Extract the first JSON object from the response string
    const match = content.match(/\{[\s\S]*\}/);
    try {
      event = match ? JSON.parse(match[0]) : {};
    } catch (e) {
      console.error('Agent response:', content); // For debugging
      return NextResponse.json({ error: 'Failed to parse event from agent response', raw: content }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
