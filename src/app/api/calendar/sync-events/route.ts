import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { isUserGoogleCalendarConnected, getUserGoogleCalendarTokens } from '@/lib/google-calendar-tokens';
import { getCalendarClient } from '@/lib/google-calendar';
import type { DecodedToken } from '@/lib/types';

interface GoogleCalendarEvent {
  id?: string | null;
  summary?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  end?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  description?: string | null;
}

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
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
          
          googleEvents = (response.data.items || []).map((event: GoogleCalendarEvent) => ({
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