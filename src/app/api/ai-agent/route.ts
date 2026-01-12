import { NextRequest } from 'next/server';
import type { CalendarEvent } from '@/lib/types';
import type { StudyPlanData } from '@/lib/types';

class StudyAgent {
  private perplexityApiKey: string;

  constructor(apiKey: string) {
    this.perplexityApiKey = apiKey;
  }

  private async makeRequest(messages: { role: string; content: string }[]) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    return response.json();
  }

  private async performSearch(query: string): Promise<Array<{ title: string; url: string; snippet: string; date?: string }>> {
    try {
      const response = await fetch('https://api.perplexity.ai/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          max_results: 10,
          search_type: 'news', // Focus on recent educational content
          domain_filter: null, // Allow all domains for broader resources
        }),
      });

      if (!response.ok) {
        console.warn(`Search API error: ${response.status}, falling back to chat completions`);
        return [];
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.warn('Search API failed, falling back to chat completions:', error);
      return [];
    }
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

  async find_resources(studyGuide: string, mediaPreferences?: Record<string, unknown>): Promise<string[]> {
    // First, try to extract key topics from the study guide
    const topicExtractionPrompt = `Extract 5-7 key study topics from this study guide. Return only the topics, one per line, without numbering or extra text:\n\n${studyGuide}`;
    
    const topicResponse = await this.makeRequest([
      { role: 'user', content: topicExtractionPrompt }
    ]);
    
    const topics = topicResponse.choices[0].message.content
      ?.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0) || [];

    const resources: string[] = [];
    
    // Search for each topic using the search API
    for (const topic of topics) {
      try {
        // Create search queries based on media preferences
        const searchQueries = this.createSearchQueries(topic, mediaPreferences);
        
        for (const query of searchQueries) {
          const searchResults = await this.performSearch(query);
          
          for (const result of searchResults.slice(0, 2)) { // Take top 2 results per query
            const resource = this.formatResource(result, topic);
            if (resource && !resources.includes(resource)) {
              resources.push(resource);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to search for topic: ${topic}`, error);
      }
    }
    
    // If search didn't yield enough results, fall back to chat completion
    if (resources.length < 5) {
      const fallbackResources = await this.fallbackResourceSearch(studyGuide, mediaPreferences);
      resources.push(...fallbackResources.filter(r => !resources.includes(r)));
    }
    
    return resources.slice(0, 15); // Limit to 15 resources
  }

  private createSearchQueries(topic: string, mediaPreferences?: Record<string, unknown>): string[] {
    const queries = [];
    const baseQuery = `${topic} educational tutorial`;
    
    // Always start with general educational query
    queries.push(baseQuery);
    
    // Add specific queries based on media preferences
    if (mediaPreferences) {
      const prefs = mediaPreferences as Record<string, boolean>;
      
      if (prefs.videos) {
        queries.push(`${topic} YouTube tutorial explanation`);
      }
      
      if (prefs.readings) {
        queries.push(`${topic} article guide study notes`);
      }
      
      if (prefs.diagrams) {
        queries.push(`${topic} visual diagram infographic`);
      }
      
      if (prefs.summaries) {
        queries.push(`${topic} summary cheat sheet quick reference`);
      }
    } else {
      // Default preferences if not specified
      queries.push(`${topic} YouTube tutorial explanation`);
      queries.push(`${topic} study guide notes`);
    }
    
    return queries;
  }

  private formatResource(result: { title: string; url: string; snippet: string; date?: string }, _topic: string): string {
    // Check if the URL is accessible (basic validation)
    if (!result.url || !result.title) return '';
    
    // Clean up the title and snippet
    const title = result.title.replace(/\s+/g, ' ').trim();
    const snippet = result.snippet ? result.snippet.replace(/\s+/g, ' ').trim().substring(0, 150) : '';
    
    return `${title} - ${result.url}${snippet ? ` (${snippet})` : ''}`;
  }

  private cleanJsonString(jsonString: string): string {
    return jsonString
      // Remove common control characters that cause parsing issues
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F]/g, '')
      // Fix common JSON escaping issues with quotes in strings
      .replace(/(\w+): "([^"]*?)"/g, (match, key, value) => {
        // Escape any unescaped quotes within string values
        const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
        return `${key}: "${escapedValue}"`;
      })
      // Fix malformed JSON with trailing commas
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      // Handle broken Unicode escapes
      .replace(/\\u[0-9]{0,3}/g, (match) => {
        if (match.length < 6) {
          return '\\u0000'; // Invalid escape, replace with null character
        }
        return match;
      })
      .trim();
  }

  private extractEventsFromText(content: string): Array<{ startDate: Date; endDate: Date; title: string; description: string }> {
    // Look for individual event-like objects in the text
    const eventPattern = /{[\s\S]*?}/g;
    const matches = content.match(eventPattern) || [];
    const events = [];
    
    for (const match of matches) {
      try {
        // Try to extract basic fields from each event object
        const titleMatch = match.match(/"title"\s*:\s*"([^"]+)"/);
        const startMatch = match.match(/"startDate"\s*:\s*"([^"]+)"/);
        const endMatch = match.match(/"endDate"\s*:\s*"([^"]+)"/);
        const descMatch = match.match(/"description"\s*:\s*"([^"]*?)"/);
        
        if (titleMatch && startMatch && endMatch) {
          events.push({
            title: titleMatch[1],
            startDate: new Date(startMatch[1]),
            endDate: new Date(endMatch[1]),
            description: descMatch ? descMatch[1] : ''
          });
        }
      } catch {
        // Continue to next match if this one fails
      }
    }
    
    return events;
  }

  private async fallbackResourceSearch(studyGuide: string, mediaPreferences?: Record<string, unknown>): Promise<string[]> {
    const systemPrompt = `You are an expert at finding high-quality educational resources. Find relevant, up-to-date resources for given study guide.
    
    For each topic mentioned in the study guide, find:
    - YouTube videos (preferably under 10 minutes)
    - Educational articles and blog posts
    - Free online courses or tutorials
    - Practice problems and exercises
    - Interactive learning tools
    
    Focus on resources that are:
    - Free or have substantial free tiers
    - From reputable educational sources
    - Recently updated or still relevant
    - Matching the user's media preferences if specified
    
    CRITICAL: Only include resources with working URLs. Avoid broken or inaccessible links.
    
    Return your response as a numbered list of resources with brief descriptions and working URLs.`;

    const response = await this.makeRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Find educational resources for this study guide:\n\n${studyGuide}\n\n${
        mediaPreferences ? `Media preferences: ${JSON.stringify(mediaPreferences)}` : ''
      }` },
    ]);

    const content = response.choices[0].message.content || '';
    
    // Parse the numbered list into an array
    const resources = content
      .split('\n')
      .filter((line: string) => line.match(/^\d+\./))
      .map((line: string) => line.replace(/^\d+\.\s*/, ''))
      .filter((resource: string) => resource.length > 0 && resource.includes('http'));

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
    - Extract both the description/title AND the raw HTTP/HTTPS URL from resources
    - Format each resource as: "[resource description/title](raw url)"
    - Ensure URLs start with http:// or https://
    - Prioritize resources that match the event's specific topic
    - Include both the resource description and the complete URL for each resource
    
    Return ONLY a JSON array with this exact structure:
    [
      {
        "startDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
        "endDate": "YYYY-MM-DDTHH:mm:ss.sssZ", 
        "title": "Study Topic Name",
        "description": "Detailed description of what to study including:\n\nTopic Overview: [brief overview]\n\nKey Concepts: [main concepts to cover]\n\nRecommended Resources:\n[Khan Academy video on derivatives](https://www.khanacademy.org/math/calculus-1)\n[Interactive calculus tutorial](https://www.calculus.org/tutorial)\n[Practice problems worksheet](https://www.mathproblems.com/calculus)"
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
    
    try {
      // First try to extract JSON from markdown code blocks
      let jsonContent = content;
      
      // Remove markdown code block wrappers if present
      const codeBlockMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1];
      } else {
        // Fallback to original regex if no code blocks
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
          jsonContent = match[0];
        }
      }
      
      // Clean the JSON content to remove control characters and common issues
      const cleanedJsonContent = this.cleanJsonString(jsonContent);
      
      const events = JSON.parse(cleanedJsonContent);
      return events.map((event: { startDate: string; endDate: string; title?: string; description?: string }) => ({
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        title: event.title || '',
        description: event.description || ''
      }));
    } catch (error) {
      console.error('Failed to parse calendar events:', content);
      console.error('Parse error:', error);
      
      // Try a more lenient approach - extract individual event objects
      try {
        const events = this.extractEventsFromText(content);
        if (events.length > 0) {
          console.log('Successfully extracted events using fallback method');
          return events;
        }
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError);
      }
      
      return [];
    }
  }

  async execute_workflow(prompt: string, studyData?: StudyPlanData, onProgress?: (data: { type: string; content: string; step?: number }) => void): Promise<{
    studyGuide: string;
    events: CalendarEvent[];
  }> {
    // Step 1: Create study guide
    onProgress?.({ type: 'progress', content: 'Creating study guide...', step: 1 });
    const studyGuide = await this.create_study_guide(prompt, studyData);
    onProgress?.({ type: 'study_guide', content: studyGuide, step: 1 });
    
    // Step 2: Find resources (for embedding in event descriptions)
    onProgress?.({ type: 'progress', content: 'Finding educational resources...', step: 2 });
    const resources = await this.find_resources(studyGuide, studyData?.mediaPreferences);
    onProgress?.({ type: 'resources', content: resources.join('\n'), step: 2 });
    
    // Step 3: Create calendar subevents with resource matching
    onProgress?.({ type: 'progress', content: 'Creating calendar events...', step: 3 });
    const events = await this.create_calendar_subevents(studyGuide, resources, prompt, studyData);
    onProgress?.({ type: 'events', content: JSON.stringify(events), step: 3 });
    
    return { studyGuide, events };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, perplexity_api_key, studyData, stream = false } = await req.json();
    if (!prompt || !perplexity_api_key) {
      return Response.json({ error: 'Missing prompt or API key' }, { status: 400 });
    }

    const agent = new StudyAgent(perplexity_api_key);

    // If streaming is requested, return Server-Sent Events
    if (stream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            await agent.execute_workflow(prompt, studyData, (data) => {
              const formattedData = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(formattedData));
            });

            // Send completion signal
            const completionData = `data: ${JSON.stringify({ type: 'complete' })}\n\n`;
            controller.enqueue(encoder.encode(completionData));
            controller.close();
          } catch (error) {
            const errorData = `data: ${JSON.stringify({ 
              type: 'error', 
              content: error instanceof Error ? error.message : 'Unknown error' 
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        }
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Default non-streaming response
    const result = await agent.execute_workflow(prompt, studyData);
    return Response.json(result);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('AI Agent Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
