import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { isUserGoogleCalendarConnected, getUserGoogleCalendarTokens } from '@/lib/google-calendar-tokens';
import { getCalendarClient } from '@/lib/google-calendar';
import type { DecodedToken } from '@/lib/types';
import { calendar_v3 } from 'googleapis';

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isStreaming = searchParams.get('stream') === 'true';

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      if (isStreaming) {
        return new Response('data: {"error":"Authorization header missing"}\n\n', {
          status: 401,
          headers: { 'Content-Type': 'text/event-stream' }
        });
      }
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      if (isStreaming) {
        return new Response('data: {"error":"Token missing"}\n\n', {
          status: 401,
          headers: { 'Content-Type': 'text/event-stream' }
        });
      }
      return NextResponse.json({ message: 'Token missing' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      if (isStreaming) {
        return new Response('data: {"error":"Invalid token"}\n\n', {
          status: 401,
          headers: { 'Content-Type': 'text/event-stream' }
        });
      }
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // If streaming is requested, return Server-Sent Events
    if (isStreaming) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const client = await clientPromise;
            const db = client.db('studysynth');
            const calendarEvents = db.collection('calendarEvents');

            // Initial fetch
            const localEvents = await calendarEvents.find({ userId: new ObjectId(userId) }).toArray();
            const formattedLocalEvents = localEvents.map(event => ({
              ...event,
              start: event.startDate,
              end: event.endDate,
              isGoogleEvent: false
            }));

            const isGoogleConnected = await isUserGoogleCalendarConnected(userId);
            let googleEvents: { id: string; title: string; start: string; end: string; description?: string; isGoogleEvent: boolean }[] = [];

            if (isGoogleConnected) {
              try {
                const tokens = await getUserGoogleCalendarTokens(userId);
                if (tokens) {
                  const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);
                  const response = await calendar.events.list({
                    calendarId: 'primary',
                    singleEvents: true,
                    orderBy: 'startTime',
                    timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  });
                  
                  googleEvents = (response.data.items || []).map((event: calendar_v3.Schema$Event) => ({
                    id: event.id || '',
                    title: event.summary || '',
                    start: event.start?.dateTime || event.start?.date || '',
                    end: event.end?.dateTime || event.end?.date || '',
                    description: event.description || undefined,
                    isGoogleEvent: true
                  }));
                }
              } catch (error) {
                console.error('Error fetching Google Calendar events:', error);
              }
            }

            const allEvents = [...formattedLocalEvents, ...googleEvents];
            
            // Send initial data
            const initialData = `data: ${JSON.stringify({ type: 'events', content: allEvents })}\n\n`;
            controller.enqueue(encoder.encode(initialData));

            // Set up a change stream to watch for calendar events updates
            const changeStream = calendarEvents.watch([{ $match: { 'operationType': { $in: ['insert', 'update', 'delete'] } } }]);

            for await (const change of changeStream) {
              if (change.operationType !== 'invalidate') {
                // Refetch events when changes occur
                const updatedLocalEvents = await calendarEvents.find({ userId: new ObjectId(userId) }).toArray();
                const updatedFormattedLocalEvents = updatedLocalEvents.map(event => ({
                  ...event,
                  start: event.startDate,
                  end: event.endDate,
                  isGoogleEvent: false
                }));

                const allUpdatedEvents = [...updatedFormattedLocalEvents, ...googleEvents];
                const updateData = `data: ${JSON.stringify({ type: 'events', content: allUpdatedEvents })}\n\n`;
                controller.enqueue(encoder.encode(updateData));
              }
            }
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
    const client = await clientPromise;
    const db = client.db('studysynth');
    const calendarEvents = db.collection('calendarEvents');

    const localEvents = await calendarEvents.find({ userId: new ObjectId(userId) }).toArray();

    const formattedLocalEvents = localEvents.map(event => ({
      ...event,
      start: event.startDate,
      end: event.endDate,
      isGoogleEvent: false
    }));

    const isGoogleConnected = await isUserGoogleCalendarConnected(userId);
    let googleEvents: { id: string; title: string; start: string; end: string; description?: string; isGoogleEvent: boolean }[] = [];

    if (isGoogleConnected) {
      try {
        const tokens = await getUserGoogleCalendarTokens(userId);
        if (tokens) {
          const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);
          const response = await calendar.events.list({
            calendarId: 'primary',
            singleEvents: true,
            orderBy: 'startTime',
            timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
          
          googleEvents = (response.data.items || []).map((event: calendar_v3.Schema$Event) => ({
            id: event.id || '',
            title: event.summary || '',
            start: event.start?.dateTime || event.start?.date || '',
            end: event.end?.dateTime || event.end?.date || '',
            description: event.description || undefined,
            isGoogleEvent: true
          }));
        }
      } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
      }
    }

    const allEvents = [...formattedLocalEvents, ...googleEvents];

    return NextResponse.json(allEvents, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    if (isStreaming) {
      return new Response(`data: {"error":"Failed to get events: ${error.message}"}\n\n`, {
        status: 500,
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }
    return NextResponse.json({ error: `Failed to get events: ${error.message}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token missing' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { startDate, endDate, title, description, syncToGoogle } = await req.json();

    if (!userId || !startDate || !endDate || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('studysynth');
    const calendarEvents = db.collection('calendarEvents');

    const result = await calendarEvents.insertOne({
      userId: new ObjectId(userId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      title,
      description: description || '',
    });

    let googleEventId = null;
    let googleError = null;

    if (syncToGoogle) {
      try {
        const isGoogleConnected = await isUserGoogleCalendarConnected(userId);
        if (isGoogleConnected) {
          const tokens = await getUserGoogleCalendarTokens(userId);
          if (tokens) {
            const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);
            const response = await calendar.events.insert({
              calendarId: 'primary',
              requestBody: {
                summary: title,
                description: description || '',
                start: {
                  dateTime: new Date(startDate).toISOString(),
                },
                end: {
                  dateTime: new Date(endDate).toISOString(),
                },
              },
            });
            
            googleEventId = response.data.id;

            await calendarEvents.updateOne(
              { _id: result.insertedId },
              { $set: { googleEventId } }
            );
          }
        } else {
          googleError = 'Google Calendar is not connected';
        }
      } catch (error: unknown) {
        const err = error as Error;
        googleError = `Failed to sync to Google Calendar: ${err.message}`;
      }
    }

    return NextResponse.json({ 
      eventId: result.insertedId,
      googleEventId,
      googleError
    }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to add event: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token missing' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { _id, title, startDate, endDate, description, syncToGoogle } = await req.json();

    if (!_id || !title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields for update' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('studysynth');
    const calendarEvents = db.collection('calendarEvents');

    // Get the existing event to check for Google sync
    const existingEvent = await calendarEvents.findOne({ _id: new ObjectId(_id), userId: new ObjectId(userId) });
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found or user not authorized' }, { status: 404 });
    }

    // Update local event
    const result = await calendarEvents.updateOne(
      { _id: new ObjectId(_id), userId: new ObjectId(userId) },
      { $set: { title, startDate: new Date(startDate), endDate: new Date(endDate), description: description || '' } }
    );

    let googleError = null;

    // Update Google Calendar event if it exists and sync is requested
    if (syncToGoogle && existingEvent.googleEventId) {
      try {
        const isGoogleConnected = await isUserGoogleCalendarConnected(userId);
        if (isGoogleConnected) {
          const tokens = await getUserGoogleCalendarTokens(userId);
          if (tokens) {
            const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);
            await calendar.events.update({
              calendarId: 'primary',
              eventId: existingEvent.googleEventId,
              requestBody: {
                summary: title,
                description: description || '',
                start: {
                  dateTime: new Date(startDate).toISOString(),
                },
                end: {
                  dateTime: new Date(endDate).toISOString(),
                },
              },
            });
          }
        } else {
          googleError = 'Google Calendar is not connected';
        }
      } catch (error: unknown) {
        const err = error as Error;
        googleError = `Failed to update Google Calendar event: ${err.message}`;
      }
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Event not found or user not authorized' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Event updated successfully',
      googleError
    }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to update event: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token missing' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const syncToGoogle = searchParams.get('syncToGoogle') === 'true';

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('studysynth');
    const calendarEvents = db.collection('calendarEvents');

    // Get the existing event to check for Google sync
    const existingEvent = await calendarEvents.findOne({ _id: new ObjectId(eventId), userId: new ObjectId(userId) });
    let googleError = null;

    // Delete from Google Calendar if it exists and sync is requested
    if (syncToGoogle && existingEvent?.googleEventId) {
      try {
        const isGoogleConnected = await isUserGoogleCalendarConnected(userId);
        if (isGoogleConnected) {
          const tokens = await getUserGoogleCalendarTokens(userId);
          if (tokens) {
            const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);
            await calendar.events.delete({
              calendarId: 'primary',
              eventId: existingEvent.googleEventId,
            });
          }
        } else {
          googleError = 'Google Calendar is not connected';
        }
      } catch (error: unknown) {
        const err = error as Error;
        googleError = `Failed to delete Google Calendar event: ${err.message}`;
      }
    }

    // Delete local event
    const result = await calendarEvents.deleteOne({
      _id: new ObjectId(eventId),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Event not found or user not authorized' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Event deleted successfully',
      googleError
    }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to delete event: ${error.message}` }, { status: 500 });
  }
}