import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '@/lib/google-calendar';
import { saveUserGoogleCalendarTokens } from '@/lib/google-calendar-tokens';
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
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ 
        error: 'Authorization code is required' 
      }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ 
        error: 'User token is required' 
      }, { status: 400 });
    }

    const userId = await getUserIdFromToken(state);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Invalid user token' 
      }, { status: 401 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    
    const success = await saveUserGoogleCalendarTokens(userId, {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined
    });

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to save Google Calendar tokens' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Google Calendar connected successfully',
      success: true
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Google Calendar OAuth callback error:', err);
    return NextResponse.json({ 
      error: `Failed to connect Google Calendar: ${err.message}` 
    }, { status: 500 });
  }
}