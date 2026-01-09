import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isUserGoogleCalendarConnected } from '../../../../../lib/google-calendar-tokens';
import { getGoogleCalendarEvents, createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from '../../../../../lib/google-calendar-api';
import type { DecodedToken } from '@/lib/types';

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.userId;
  } catch (error) {
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

    const isConnected = await isUserGoogleCalendarConnected(userId);
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Google Calendar is not connected' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    const startDate = timeMin ? new Date(timeMin) : undefined;
    const endDate = timeMax ? new Date(timeMax) : undefined;

    const events = await getGoogleCalendarEvents(userId, 'primary', startDate, endDate);

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
      isGoogleEvent: true
    }));

    return NextResponse.json(formattedEvents, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: `Failed to fetch Google Calendar events: ${error.message}` 
    }, { status: 500 });
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

    const isConnected = await isUserGoogleCalendarConnected(userId);
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Google Calendar is not connected' 
      }, { status: 400 });
    }

    const { title, startDate, endDate, description } = await req.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, startDate, endDate' 
      }, { status: 400 });
    }

    const event = await createGoogleCalendarEvent(userId, {
      summary: title,
      description: description || '',
      start: new Date(startDate),
      end: new Date(endDate)
    });

    return NextResponse.json({ 
      eventId: event.id,
      message: 'Google Calendar event created successfully'
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: `Failed to create Google Calendar event: ${error.message}` 
    }, { status: 500 });
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

    const isConnected = await isUserGoogleCalendarConnected(userId);
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Google Calendar is not connected' 
      }, { status: 400 });
    }

    const { eventId, title, startDate, endDate, description } = await req.json();

    if (!eventId) {
      return NextResponse.json({ 
        error: 'Missing required field: eventId' 
      }, { status: 400 });
    }

    const event = await updateGoogleCalendarEvent(userId, eventId, {
      summary: title,
      description: description,
      start: startDate ? new Date(startDate) : undefined,
      end: endDate ? new Date(endDate) : undefined
    });

    return NextResponse.json({ 
      eventId: event.id,
      message: 'Google Calendar event updated successfully'
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: `Failed to update Google Calendar event: ${error.message}` 
    }, { status: 500 });
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

    const isConnected = await isUserGoogleCalendarConnected(userId);
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Google Calendar is not connected' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ 
        error: 'Event ID is required' 
      }, { status: 400 });
    }

    await deleteGoogleCalendarEvent(userId, eventId);

    return NextResponse.json({ 
      message: 'Google Calendar event deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: `Failed to delete Google Calendar event: ${error.message}` 
    }, { status: 500 });
  }
}