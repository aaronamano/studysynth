import { NextRequest, NextResponse } from 'next/server';
import type { CalendarEvent } from '@/lib/types';
import type { StudyPlanData } from '@/lib/types';

class StudyAgent {
  private perplexityApiKey: string;

  constructor(apiKey: string) {
    this.perplexityApiKey = apiKey;
  }

  private async makeRequest(messages: any[]) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    return response.json();
  }

  async create_study_guide(prompt: string, studyData?: StudyPlanData): Promise<string> {
    const systemPrompt = `You are an expert study guide creator. Generate a comprehensive study guide based on the user's requirements.
    
    Consider the following when creating the study guide:
    - User's strengths and weaknesses to prioritize content
    - Learning style preferences (visual, auditory, kinesthetic, etc.)
    - Media preferences (videos, diagrams, readings, summaries)
    - Study intensity level (light, balanced, intensive)
    - Time constraints and exam dates mentioned in the prompt
    
    Create a structured, actionable study guide that helps the user achieve their learning goals effectively.`;

    const response = await this.makeRequest([
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Create a study guide for: ${prompt}\n\n${
          studyData ? `
          User Context:
          - Strengths: ${studyData.strengths.join(', ')}
          - Weaknesses: ${studyData.weaknesses.join(', ')}
          - Media Preferences: ${JSON.stringify(studyData.mediaPreferences)}
          - Study Plan: ${JSON.stringify(studyData.studyPlan)}
          ` : ''
        }`
      },
    ]);

    return response.choices[0].message.content || '';
  }

  async find_resources(studyGuide: string, mediaPreferences?: any): Promise<string[]> {
    const systemPrompt = `You are a research assistant that finds high-quality educational resources.
    
    Based on the study guide provided, search for relevant resources including:
    - YouTube videos (preferably under 10 minutes when mentioned)
    - Academic articles and papers
    - Free online resources
    - Interactive tutorials
    - Practice problems and exercises
    
    ORGANIZATION REQUIREMENTS:
    - Group resources by topic/concept when possible
    - Include clear topic labels for each resource
    - Provide working URLs when available
    - Focus on up-to-date, accessible resources
    
    Format each resource as: "[Resource description] [URL]"
    Example: "Khan Academy video on basic derivatives https://www.khanacademy.org/math/calculus-1"
    Make sure URLs are complete and start with http:// or https://`;

    const response = await this.makeRequest([
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Find resources for this study guide: ${studyGuide}\n\n${
          mediaPreferences ? `Media preferences: ${JSON.stringify(mediaPreferences)}` : ''
        }`
      },
    ]);

    const content = response.choices[0].message.content || '';
    // Extract URLs and resource information
    const resources = content.split('\n').filter((line: string) => line.trim().length > 0);
    return resources;
  }

  async create_calendar_subevents(
    studyGuide: string, 
    resources: string[], 
    constraints: string,
    studyData?: StudyPlanData
  ): Promise<CalendarEvent[]> {
    const systemPrompt = `You are a study planner that creates a series of calendar events for a study plan.
    
    Based on the study guide, available resources, and constraints, create an array of calendar subevents.
    Each event should be manageable and focused on specific topics.
    
    IMPORTANT: For each calendar event, you MUST include relevant resources in the description. Match resources to the specific topic of each event.
    
    Consider:
    - User's strengths and weaknesses (spend more time on weaknesses)
    - Study intensity (light = fewer/shorter sessions, intensive = more/longer sessions)
    - Time constraints and deadlines mentioned
    - Today's date: ${new Date().toISOString().split('T')[0]}
    
    RESOURCE MATCHING INSTRUCTIONS:
    - Analyze each resource and determine which study topic it best matches
    - Include 2-4 most relevant resources in each event's description
    - Extract ONLY the raw HTTP/HTTPS URLs from resources (no descriptions, no formatting)
    - Format each resource as just the raw URL on a new line
    - Prioritize resources that match the event's specific topic
    - Do NOT include resource titles, descriptions, or any formatting around URLs
    
    Return ONLY a JSON array with this exact structure:
    [
      {
        "startDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
        "endDate": "YYYY-MM-DDTHH:mm:ss.sssZ", 
        "title": "Study Topic Name",
        "description": "Detailed description of what to study including:\n\nTopic Overview: [brief overview]\n\nKey Concepts: [main concepts to cover]\n\nRecommended Resources:\nhttps://example.com/resource1\nhttps://example.com/resource2\nhttps://example.com/resource3"
      }
    ]`;

    const response = await this.makeRequest([
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Create calendar events for:
        
STUDY GUIDE:
${studyGuide}

AVAILABLE RESOURCES:
${resources.map((resource, index) => `${index + 1}. ${resource}`).join('\n')}

CONSTRAINTS: ${constraints}

${studyData ? `
USER CONTEXT:
- Strengths: ${studyData.strengths.join(', ')}
- Weaknesses: ${studyData.weaknesses.join(', ')}
- Study Intensity: ${studyData.studyPlan.intensity}
- Learning Style: ${studyData.studyPlan.learningStyle}
` : ''}

IMPORTANT: Match specific resources to each calendar event based on topic relevance. Include the most relevant resources in each event's description.`
      },
    ]);

    const content = response.choices[0].message.content || '[]';
    const match = content.match(/\[[\s\S]*\]/);
    
    try {
      const events = match ? JSON.parse(match[0]) : [];
      return events.map((event: any) => ({
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        title: event.title || '',
        description: event.description || ''
      }));
    } catch (e) {
      console.error('Failed to parse calendar events:', content);
      return [];
    }
  }

  async execute_workflow(prompt: string, studyData?: StudyPlanData): Promise<{
    studyGuide: string;
    events: CalendarEvent[];
  }> {
    // Step 1: Create study guide
    const studyGuide = await this.create_study_guide(prompt, studyData);
    
    // Step 2: Find resources (for embedding in event descriptions)
    const resources = await this.find_resources(studyGuide, studyData?.mediaPreferences);
    
    // Step 3: Create calendar subevents with resource matching
    const events = await this.create_calendar_subevents(studyGuide, resources, prompt, studyData);
    
    return { studyGuide, events };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, perplexity_api_key, studyData } = await req.json();
    if (!prompt || !perplexity_api_key) {
      return NextResponse.json({ error: 'Missing prompt or API key' }, { status: 400 });
    }

    const agent = new StudyAgent(perplexity_api_key);
    const result = await agent.execute_workflow(prompt, studyData);

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('AI Agent Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
