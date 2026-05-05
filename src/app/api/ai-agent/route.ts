import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { CalendarEvent, StudyPlanData } from '@/lib/types';
import { GoogleGenAI, Type } from '@google/genai';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
});

const StudyPlanDataSchema = z.object({
  topics: z.array(z.string()).optional(),
  fileContent: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  dateRange: DateRangeSchema.optional(),
});

const AgentRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  studyData: StudyPlanDataSchema.optional(),
  stream: z.boolean().optional().default(false),
});

const CalendarEventSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  title: z.string(),
  description: z.string(),
});

const AgentResponseSchema = z.object({
  studyGuide: z.string(),
  events: z.array(CalendarEventSchema),
  googleDocUrl: z.string().optional(),
});

const AUTH_COOKIE_NAME = 'studysynth_google_auth';
const CALENDAR_AUTH_COOKIE = 'studysynth_google_calendar';

async function getGoogleAuth() {
  const cookieStore = await cookies();

  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (authCookie) {
    try {
      return JSON.parse(authCookie.value);
    } catch {
      // Continue to check calendar auth
    }
  }

  const calendarCookie = cookieStore.get(CALENDAR_AUTH_COOKIE);
  if (calendarCookie) {
    try {
      const parsed = JSON.parse(calendarCookie.value);
      return { tokens: parsed };
    } catch {
      return null;
    }
  }

  return null;
}

async function createGoogleDoc(studyGuide: string, title: string, auth: { tokens: { access_token?: string; refresh_token?: string } }) {
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({
    access_token: auth.tokens.access_token,
    refresh_token: auth.tokens.refresh_token,
  });

  const docs = google.docs({ version: 'v1', auth: authClient });

  const doc = await docs.documents.create({
    requestBody: { title },
  });

  const docId = doc.data.documentId;
  if (!docId) throw new Error('Failed to create Google Doc');

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: studyGuide,
          },
        },
      ],
    },
  });

  return `https://docs.google.com/document/d/${docId}/edit`;
}

async function syncEventsToGoogleCalendar(events: CalendarEvent[], auth: { tokens: { access_token?: string; refresh_token?: string } }) {
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({
    access_token: auth.tokens.access_token,
    refresh_token: auth.tokens.refresh_token,
  });

  const calendar = google.calendar({ version: 'v3', auth: authClient });

  const results = await Promise.allSettled(
    events.map(event =>
      calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description || '',
          start: { dateTime: event.startDate, timeZone: 'UTC' },
          end: { dateTime: event.endDate, timeZone: 'UTC' },
        },
      })
    )
  );

  const createdEvents: CalendarEvent[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.data?.id) {
      createdEvents.push({
        ...events[index],
        googleEventId: result.value.data.id as string,
        isGoogleEvent: true,
      });
    }
  });
  return createdEvents;
}

class StudyAgent {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async create_study_guide(prompt: string, studyData?: StudyPlanData): Promise<string> {
    const fileContent = studyData?.fileContent ? `\n\nExtracted PDF/Text Content:\n${studyData.fileContent}` : '';
    
    const systemPrompt = `You are an expert study guide creator. Generate a comprehensive, timeline-based study guide based on the user's requirements.

    Consider the following when creating the study guide:
    - User's strengths and weaknesses to prioritize content and time allocation
    - Time constraints and exam dates mentioned in the prompt
    - Create a DAY-BY-DAY timeline study plan
    - Include specific topics to study each day
    - Add recommended resources for each topic
    - Format the output in a clean, structured way suitable for a Google Doc

    Create a structured, actionable study guide that helps the user achieve their learning goals effectively.`;

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `${systemPrompt}\n\nCreate a study guide for: ${prompt}${fileContent}\n\n${
            studyData ? `
            User Context:
            - Strengths: ${studyData.strengths?.join(', ') || 'None'}
            - Weaknesses: ${studyData.weaknesses?.join(', ') || 'None'}
            - Study Period: ${studyData.dateRange ? `${studyData.dateRange.startDate} to ${studyData.dateRange.endDate}` : 'Not specified'}
            ` : ''
          }`
        }]
      }],
    });

    return result.text || '';
  }

  async find_resources(studyGuide: string): Promise<string[]> {
    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `Find 10-15 high-quality educational resources for this study guide. Include YouTube videos, articles, and tutorials with working URLs.

          Study Guide:
          ${studyGuide}

          Return format (one per line): "Title - URL (brief description)"
          Only include resources with real, working URLs.`
        }]
      }],
    });

    const content = result.text || '';
    const resources = content
      .split('\n')
      .filter((line: string) => line.includes('http'))
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 15);

    if (resources.length < 5) {
      const fallbackResources = await this.fallbackResourceSearch(studyGuide);
      resources.push(...fallbackResources.filter(r => !resources.includes(r)));
    }

    return resources.slice(0, 15);
  }

  private async fallbackResourceSearch(studyGuide: string): Promise<string[]> {
    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `Find 5-10 educational resources with working URLs for this study guide:

          ${studyGuide}

          Return format (one per line): "Title - URL (brief description)"
          Only include resources with real URLs.`
        }]
      }],
    });

    const content = result.text || '';

    return content
      .split('\n')
      .filter((line: string) => line.includes('http'))
      .filter((resource: string) => resource.trim().length > 0);
  }

  async create_calendar_subevents(
    studyGuide: string,
    resources: string[],
    prompt: string,
    studyData?: StudyPlanData
  ): Promise<CalendarEvent[]> {
    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `Create calendar events for this study plan. Focus on specific topics from the study guide.

          Include 2-4 relevant resources per event. Format: "[title](url)". Match resources to each event's topic.

          STUDY GUIDE:
          ${studyGuide}

          RESOURCES:
          ${resources.map((r, i) => `${i + 1}. ${r}`).join('\n')}

          ${studyData ? `
          USER CONTEXT:
          - Strengths: ${studyData.strengths?.join(', ') || 'None'}
          - Weaknesses: ${studyData.weaknesses?.join(', ') || 'None'}
          - Study Period: ${studyData.dateRange ? `${studyData.dateRange.startDate} to ${studyData.dateRange.endDate}` : 'Not specified'}
          ` : ''}

          Return JSON array: [{"startDate": "YYYY-MM-DDTHH:mm:ss.sssZ", "endDate": "YYYY-MM-DDTHH:mm:ss.sssZ", "title": "Topic", "description": "Details and resources"}]`
        }]
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['startDate', 'endDate', 'title', 'description']
          }
        }
      }
    });

    try {
      const content = result.text || '[]';
      const events = JSON.parse(content);
      const validatedEvents = z.array(CalendarEventSchema).parse(events);
      return validatedEvents.map((event) => ({
        _id: randomUUID(),
        startDate: event.startDate,
        endDate: event.endDate,
        title: event.title,
        description: event.description
      }));
    } catch (error) {
      console.error('Failed to parse calendar events:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
      }
      return [];
    }
  }

  async execute_workflow(
    prompt: string,
    studyData?: StudyPlanData,
    onProgress?: (data: { type: string; content: string; step?: number }) => void,
    auth?: { tokens: { access_token?: string; refresh_token?: string } }
  ): Promise<{
    studyGuide: string;
    events: CalendarEvent[];
    googleDocUrl?: string;
  }> {
    onProgress?.({ type: 'progress', content: 'Creating study guide...', step: 1 });
    const studyGuide = await this.create_study_guide(prompt, studyData);
    onProgress?.({ type: 'study_guide', content: studyGuide, step: 1 });

    onProgress?.({ type: 'progress', content: 'Finding educational resources...', step: 2 });
    const resources = await this.find_resources(studyGuide);
    onProgress?.({ type: 'resources', content: resources.join('\n'), step: 2 });

    onProgress?.({ type: 'progress', content: 'Creating calendar events...', step: 3 });
    const events = await this.create_calendar_subevents(studyGuide, resources, prompt, studyData);
    onProgress?.({ type: 'events', content: JSON.stringify(events), step: 3 });

    let googleDocUrl: string | undefined;
    if (auth?.tokens?.access_token) {
      onProgress?.({ type: 'progress', content: 'Creating Google Doc & syncing calendar...', step: 4 });
      const results = await Promise.allSettled([
        createGoogleDoc(studyGuide, `Study Guide: ${prompt.slice(0, 50)}`, auth)
          .then(url => {
            onProgress?.({ type: 'google_doc', content: url, step: 4 });
            return url;
          })
          .catch(error => {
            console.error('Failed to create Google Doc:', error);
            return undefined;
          }),
        syncEventsToGoogleCalendar(events, auth)
          .then(syncedEvents => {
            onProgress?.({ type: 'calendar_synced', content: `${syncedEvents.length} events synced`, step: 5 });
            return syncedEvents;
          })
          .catch(error => {
            console.error('Failed to sync to Google Calendar:', error);
            return [];
          })
      ]);

      if (results[0].status === 'fulfilled') {
        googleDocUrl = results[0].value;
      }
    }

    return { studyGuide, events, googleDocUrl };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = AgentRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { prompt, studyData, stream } = validationResult.data;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const auth = await getGoogleAuth();
    const agent = new StudyAgent(geminiApiKey);

    if (stream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            await agent.execute_workflow(
              prompt,
              studyData,
              (data) => {
                const formattedData = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(formattedData));
              },
              auth
            );

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

    const result = await agent.execute_workflow(prompt, studyData, undefined, auth);

    try {
      const validatedResult = AgentResponseSchema.parse(result);
      return Response.json(validatedResult);
    } catch (error) {
      console.error('Response validation failed:', error);
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Invalid response format', details: error.errors },
          { status: 500 }
        );
      }
      return Response.json(result);
    }
  } catch (e: unknown) {
    const error = e as Error;
    console.error('AI Agent Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
