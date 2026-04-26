import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'studysynth_google_auth';

interface CalendarEvent {
  _id: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  googleEventId?: string;
  isGoogleEvent?: boolean;
}

async function getAuthFromCookies() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  
  if (!authCookie) {
    return null;
  }
  
  try {
    return JSON.parse(authCookie.value);
  } catch {
    return null;
  }
}

async function getGoogleCalendarEvents(auth: { tokens: { access_token?: string; refresh_token?: string } }) {
  if (!auth.tokens?.access_token) {
    return [];
  }
  
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({
    access_token: auth.tokens.access_token,
    refresh_token: auth.tokens.refresh_token
  });
  
  const calendar = google.calendar({ version: 'v3', auth: authClient });
  
  const now = new Date().toISOString();
  const timeMin = new Date(now).toISOString();
  const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
return response.data.items?.map(event => ({
      _id: event.id || `google-${Date.now()}`,
      startDate: event.start?.dateTime || event.start?.date || '',
      endDate: event.end?.dateTime || event.end?.date || '',
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      googleEventId: event.id || undefined,
      isGoogleEvent: true,
    })) || [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isStreaming = searchParams.get('stream') === 'true';

  try {
    const auth = await getAuthFromCookies();
    let googleEvents: CalendarEvent[] = [];
    
    if (auth?.tokens?.access_token) {
      googleEvents = await getGoogleCalendarEvents(auth);
    }

    const formattedGoogleEvents = googleEvents.map(event => ({
      ...event,
      start: event.startDate,
      end: event.endDate,
    }));

    if (isStreaming) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        start(controller) {
          const initialData = `data: ${JSON.stringify({ type: 'events', content: formattedGoogleEvents })}\n\n`;
          controller.enqueue(encoder.encode(initialData));
          controller.close();
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

    return NextResponse.json(formattedGoogleEvents, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to get events: ${error.message}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, title, description, syncToGoogle } = await req.json();

    if (!startDate || !endDate || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newEvent: CalendarEvent = {
      _id: Date.now().toString(),
      startDate,
      endDate,
      title,
      description: description || '',
    };

    const auth = await getAuthFromCookies();
    let googleEventId: string | undefined;

    if (syncToGoogle && auth?.tokens?.access_token) {
      const authClient = new google.auth.OAuth2();
      authClient.setCredentials({
        access_token: auth.tokens.access_token,
        refresh_token: auth.tokens.refresh_token
      });

      const calendar = google.calendar({ version: 'v3', auth: authClient });

      const googleEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: title,
          description: description || '',
          start: {
            dateTime: startDate,
            timeZone: 'UTC',
          },
          end: {
            dateTime: endDate,
            timeZone: 'UTC',
          },
        },
      });

      googleEventId = googleEvent.data.id || undefined;
      newEvent.googleEventId = googleEventId;
      newEvent.isGoogleEvent = true;
    }

    return NextResponse.json({ eventId: newEvent._id, googleEventId }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to add event: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { _id, title, startDate, endDate, description, googleEventId, isGoogleEvent } = await req.json();

    if (!_id || !title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields for update' }, { status: 400 });
    }

    const auth = await getAuthFromCookies();

    if (isGoogleEvent && googleEventId && auth?.tokens?.access_token) {
      const authClient = new google.auth.OAuth2();
      authClient.setCredentials({
        access_token: auth.tokens.access_token,
        refresh_token: auth.tokens.refresh_token
      });

      const calendar = google.calendar({ version: 'v3', auth: authClient });

      await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: {
          summary: title,
          description: description || '',
          start: {
            dateTime: startDate,
            timeZone: 'UTC',
          },
          end: {
            dateTime: endDate,
            timeZone: 'UTC',
          },
        },
      });
    }

    return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to update event: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const eventIds = searchParams.get('eventIds');
    const googleEventIds = searchParams.get('googleEventIds');

    const auth = await getAuthFromCookies();

    if (googleEventIds && auth?.tokens?.access_token) {
      const eventIdArray = googleEventIds.split(',').filter(id => id.trim());
      
      if (eventIdArray.length > 0) {
        const authClient = new google.auth.OAuth2();
        authClient.setCredentials({
          access_token: auth.tokens.access_token,
          refresh_token: auth.tokens.refresh_token
        });

        const calendar = google.calendar({ version: 'v3', auth: authClient });

        await Promise.all(
          eventIdArray.map(eventId => 
            calendar.events.delete({
              calendarId: 'primary',
              eventId,
            })
          )
        );
      }
    }

    if (eventIds) {
      return NextResponse.json({ message: `Event(s) deleted successfully` }, { status: 200 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to delete event: ${error.message}` }, { status: 500 });
  }
}