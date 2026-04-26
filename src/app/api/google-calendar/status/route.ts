import { NextRequest, NextResponse } from 'next/server';
import { isUserGoogleCalendarConnected, disconnectUserGoogleCalendar } from '@/lib/google-calendar-tokens';

export async function GET(req: NextRequest) {
  try {
    const isConnected = await isUserGoogleCalendarConnected();
    
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
    const success = await disconnectUserGoogleCalendar();
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to disconnect Google Calendar' 
      }, { status: 500 });
    }

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