import { NextResponse } from 'next/server';

export interface StudyGuideRequest {
  topics: string;
  strengths: string[];
  weaknesses: string[];
  practiceOptions: {
    includePracticeProblems: boolean;
    includeMockExams: boolean;
    difficulty: string;
    quantity: number;
  };
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topics, strengths = [], weaknesses = [], practiceOptions } = body;

    const prompt = `Generate:
${practiceOptions.includePracticeProblems ? '# Practice Problems' : ''}
${practiceOptions.includePracticeProblems ? `
Generate ${practiceOptions.quantity} practice problems with the following requirements:
- Format each problem starting with "Q1.", "Q2.", etc.
- Format each answer starting with "A1.", "A2.", etc.
- Difficulty level: ${practiceOptions.difficulty}
- Focus on weak areas: ${weaknesses.join(', ')}
` : ''}

${practiceOptions.includeMockExams ? '# Mock Exam' : ''}
${practiceOptions.includeMockExams ? `
Create a mock exam with the following requirements:
- Format questions as "Q1.", "Q2.", etc.
- Format answers as "A1.", "A2.", etc.
- Difficulty level: ${practiceOptions.difficulty}
- Include a mix of question types
- Ensure 60% of questions focus on: ${weaknesses.join(', ')}
` : ''}

Topics to cover:
${topics}

Student Profile:
- Strengths: ${strengths.join(', ')}
- Areas needing improvement: ${weaknesses.join(', ')}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating educational practice materials and mock exams. Generate clear, well-structured content with detailed solutions."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const practiceMaterials = data.choices[0]?.message?.content;

    if (!practiceMaterials) {
      throw new Error('No content received from OpenAI');
    }

    return NextResponse.json({ practiceMaterials }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate practice materials' },
      { status: 500 }
    );
  }
}
