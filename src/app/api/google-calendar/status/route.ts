import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isUserGoogleCalendarConnected, disconnectUserGoogleCalendar } from '@/lib/google-calendar-tokens';
import type { DecodedToken } from '@/lib/types';
import { MongoClient, Db } from 'mongodb';

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

    const isConnected = await isUserGoogleCalendarConnected(userId);
    
    return NextResponse.json({ 
      isConnected,
      message: isConnected ? 'Google Calendar is connected' : 'Google Calendar is not connected'
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ 
      error: `Failed to check connection status: ${err.message}` 
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

    const success = await disconnectUserGoogleCalendar(userId);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to disconnect Google Calendar' 
      }, { status: 500 });
    }

    // Remove googleEventId from all user's calendar events to unsync them
    try {
      const client = new MongoClient(process.env.MONGODB_URI as string);
      await client.connect();
      const db: Db = client.db();
      
      await db.collection('calendarEvents').updateMany(
        { userId },
        { $unset: { googleEventId: "" } }
      );
      
      await client.close();
    } catch (dbError) {
      console.error('Failed to unsync events:', dbError);
      // Continue with response even if unsyncing fails
    }

    return NextResponse.json({ 
      message: 'Google Calendar disconnected successfully and events unsynced'
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ 
      error: `Failed to disconnect Google Calendar: ${err.message}` 
    }, { status: 500 });
  }
}