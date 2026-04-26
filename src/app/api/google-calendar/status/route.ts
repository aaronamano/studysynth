import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { disconnectUserGoogleCalendar } from '@/lib/google-calendar-tokens';

const GOOGLE_CALENDAR_KEY = 'studysynth_google_calendar';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isConnected = cookieStore.has(GOOGLE_CALENDAR_KEY);
    
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

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(GOOGLE_CALENDAR_KEY);
    
    await disconnectUserGoogleCalendar();
    
    return NextResponse.json({ 
      message: 'Google Calendar disconnected successfully'
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ 
      error: `Failed to disconnect Google Calendar: ${err.message}` 
    }, { status: 500 });
  }
}