import { NextResponse } from 'next/server';

// Define the expected shape of the request body for type safety
export interface StudyGuideRequest {
  topics: string;
  constraints: string;
  strengths: string[];
  weaknesses: string[];
  mediaPreferences: {
    videos: boolean;
    flashcards: boolean;
    diagrams: boolean;
    readings: boolean;
    summaries: boolean;
  };
  studyPlan: {
    intensity: string;
    learningStyle: string;
  };
}

// Retrieve the Perplexity API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Define the POST handler for the API route
export async function POST(request: Request) {
  try {
    // Parse the incoming request body as a StudyGuideRequest object
    const body: StudyGuideRequest = await request.json();

    // Construct a prompt string for the Perplexity API using user input
    const prompt = `Generate a detailed study guide for the following topics:
${body.topics}

Additional Context:
${body.constraints}

Parameters:
- Strengths: ${body.strengths.join(', ')}
- Areas for improvement: ${body.weaknesses.join(', ')}
- Study Intensity: ${body.studyPlan.intensity}
- Learning Style: ${body.studyPlan.learningStyle}

Preferred Learning Materials:
${Object.entries(body.mediaPreferences)
  .filter(([,value]) => value)
  .map(([key]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}`)
  .join('\n')}

Requirements for resources:
- Include relevant hyperlinks using markdown format [text](url)
- For each section, provide at least 2-3 high-quality external resources
- Prioritize official documentation and reputable educational platforms
- If suggesting videos, include direct links to specific tutorials
- Include links to relevant documentation, guides, and reference materials

Format the response as a markdown document with clear sections and headers.`;

    // Send a POST request to the Perplexity API with the constructed prompt
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          {
            role: "system",
            content: "You are a professional study guide creator. Generate detailed, well-structured study guides in markdown format. Always include relevant hyperlinks to high-quality resources, official documentation, tutorials, and practice materials. Use markdown link format [text](url) for all references."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    // If the API call fails, throw an error to be caught below
    if (!response.ok) {
      throw new Error('Perplexity API request failed');
    }

    // Parse the response from the Perplexity API
    const data = await response.json();
    // Extract the generated study guide content from the API response
    const studyGuide = data.choices[0].message.content;

    // Return the study guide as a JSON response with status 200 (OK)
    return NextResponse.json({ studyGuide }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate study guide' },
      { status: 500 }
    );
  }
}