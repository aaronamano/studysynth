import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
const pdf = require('pdf-parse');

interface MediaPreferences {
  videos: boolean;
  diagrams: boolean;
  readings: boolean;
  summaries: boolean;
}

interface StudyPlan {
  intensity: string;
  learningStyle: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdf_file = formData.get('pdf_file') as File;
    const constraints = formData.get('constraints') as string;
    const strengths = formData.get('strengths') as string;
    const weaknesses = formData.get('weaknesses') as string;
    const mediaPreferencesStr = formData.get('mediaPreferences') as string;
    const studyPlanStr = formData.get('studyPlan') as string;
    const perplexity_api_key = formData.get('perplexity_api_key') as string;

    const mediaPreferences: MediaPreferences = mediaPreferencesStr ? JSON.parse(mediaPreferencesStr) : {};
    const studyPlan: StudyPlan = studyPlanStr ? JSON.parse(studyPlanStr) : {};

    let topics = '';
    if (pdf_file) {
      const fileBuffer = Buffer.from(await pdf_file.arrayBuffer());
      const data = await pdf(fileBuffer);
      topics = data.text;
    }

    const prompt = `Generate a detailed study guide for the following topics:
${topics}

Additional Context:
${constraints}

Parameters:
- Strengths: ${strengths || 'None'}
- Areas for improvement: ${weaknesses || 'None'}
- Study Intensity: ${studyPlan.intensity}
- Learning Style: ${studyPlan.learningStyle}

Preferred Learning Materials:
${JSON.stringify(mediaPreferences, null, 2)}

Requirements for resources:
- Include relevant hyperlinks using markdown format [text](url)
- For each section, provide at least 2-3 high-quality external resources
- Prioritize official documentation and reputable educational platforms
- If suggesting videos, include direct links to specific tutorials
- Include links to relevant documentation, guides, and reference materials

Format the response as a markdown document with clear sections and headers.`;

    const client = new OpenAI({
      apiKey: perplexity_api_key,
      baseURL: 'https://api.perplexity.ai',
    });

    const response = await client.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional study guide creator. Generate detailed, well-structured study guides in. Always include relevant hyperlinks to high-quality resources, official documentation, tutorials, and practice materials. Use markdown link format [text](url) for all references.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const study_guide_content = response.choices[0].message.content;

    return NextResponse.json({ study_guide: study_guide_content });
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to generate study guide: ${e.message}` }, { status: 500 });
  }
}
