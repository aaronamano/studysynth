import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthURL } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectUri = searchParams.get('redirectUri') || undefined;

    const authUrl = getGoogleAuthURL(undefined, redirectUri);
    
    return NextResponse.json({ 
      authUrl,
      message: 'Google authorization URL generated successfully'
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ 
      error: `Failed to generate auth URL: ${err.message}` 
    }, { status: 500 });
  }
}