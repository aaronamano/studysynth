import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import type { DecodedToken } from '@/lib/types';

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

    const events = await calendarEvents.find({ userId: new ObjectId(userId) }).toArray();

    const formattedEvents = events.map(event => ({
      ...event,
      start: event.startDate,
      end: event.endDate,
    }));

    return NextResponse.json(formattedEvents, { status: 200 });
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

    const { startDate, endDate, title, description } = await req.json();

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

    return NextResponse.json({ eventId: result.insertedId }, { status: 201 });
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
  
      const { _id, title, startDate, endDate, description } = await req.json();
  
      if (!_id || !title || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing required fields for update' }, { status: 400 });
      }
  
      const client = await clientPromise;
      const db = client.db('studysynth');
      const calendarEvents = db.collection('calendarEvents');
  
      const result = await calendarEvents.updateOne(
        { _id: new ObjectId(_id), userId: new ObjectId(userId) },
        { $set: { title, startDate: new Date(startDate), endDate: new Date(endDate), description: description || '' } }
      );
  
      if (result.matchedCount === 0) {
          return NextResponse.json({ error: 'Event not found or user not authorized' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });
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
    
        if (!eventId) {
          return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }
    
        const client = await clientPromise;
        const db = client.db('studysynth');
        const calendarEvents = db.collection('calendarEvents');
    
        const result = await calendarEvents.deleteOne({
          _id: new ObjectId(eventId),
          userId: new ObjectId(userId),
        });
    
        if (result.deletedCount === 0) {
          return NextResponse.json({ error: 'Event not found or user not authorized' }, { status: 404 });
        }
    
        return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
      } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ error: `Failed to delete event: ${error.message}` }, { status: 500 });
      }
    }
