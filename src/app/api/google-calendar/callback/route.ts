import { NextRequest, NextResponse } from 'next/server';
import { oauth2Client } from '@/lib/google-calendar';

const GOOGLE_CALENDAR_KEY = 'studysynth_google_calendar';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ 
        error: 'Authorization code is required' 
      }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    
    const calendarTokens = {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined
    };
    
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar Connected</title>
          <script>
            if (window.opener) {
              window.opener.localStorage.setItem('studysynth_google_calendar', JSON.stringify(${JSON.stringify(calendarTokens)}));
              window.opener.localStorage.setItem('redirect_to_calendar', 'true');
              window.opener.postMessage({ 
                type: 'GOOGLE_CALENDAR_CONNECTED',
                success: true
              }, '*');
              window.close();
            } else {
              localStorage.setItem('studysynth_google_calendar', JSON.stringify(${JSON.stringify(calendarTokens)}));
              localStorage.setItem('redirect_to_calendar', 'true');
              window.location.reload();
            }
          </script>
        </head>
        <body>
          <p>Connecting Google Calendar... You will be redirected shortly.</p>
        </body>
      </html>
    `;

    const response = new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

    response.cookies.set(GOOGLE_CALENDAR_KEY, JSON.stringify(calendarTokens), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Google Calendar OAuth callback error:', err);
    return NextResponse.json({ 
      error: `Failed to connect Google Calendar: ${err.message}` 
    }, { status: 500 });
  }
}