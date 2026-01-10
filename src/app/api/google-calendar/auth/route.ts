import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getGoogleAuthURL } from '@/lib/google-calendar';
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

    const authUrl = getGoogleAuthURL(token);
    
    return NextResponse.json({ 
      authUrl,
      message: 'Google Calendar authorization URL generated successfully'
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ 
      error: `Failed to generate auth URL: ${err.message}` 
    }, { status: 500 });
  }
}