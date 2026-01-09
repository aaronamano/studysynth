import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isUserGoogleCalendarConnected, disconnectUserGoogleCalendar } from '../../../../../lib/google-calendar-tokens';
import { getGoogleCalendarEvents } from '../../../../../lib/google-calendar-api';
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
    
    return NextResponse.json({ 
      isConnected,
      message: isConnected ? 'Google Calendar is connected' : 'Google Calendar is not connected'
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: `Failed to check connection status: ${error.message}` 
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

    return NextResponse.json({ 
      message: 'Google Calendar disconnected successfully'
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: `Failed to disconnect Google Calendar: ${error.message}` 
    }, { status: 500 });
  }
}