import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { oauth2Client } from '@/lib/google-calendar';
import { saveStoredAuth, GoogleUser, GoogleAuthTokens } from '@/lib/google-auth';

const AUTH_COOKIE_NAME = 'studysynth_google_auth';
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
    
    if (!tokens.access_token) {
      return NextResponse.json({ 
        error: 'Failed to obtain access token' 
      }, { status: 500 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfo = await oauth2.userinfo.get();

    const user: GoogleUser = {
      id: userInfo.data.id || '',
      email: userInfo.data.email || '',
      name: userInfo.data.name || '',
      picture: userInfo.data.picture || undefined
    };

    const authTokens: GoogleAuthTokens = {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined
    };

    await saveStoredAuth(user, authTokens);

    const userJson = JSON.stringify(user);
    const tokensJson = JSON.stringify(authTokens);
    const calendarTokensJson = JSON.stringify(authTokens);
    const cookieValue = JSON.stringify({ user, tokens: authTokens });

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Signed In</title>
          <script>
            const userData = ${userJson};
            const tokensData = ${tokensJson};
            const calendarTokensData = ${calendarTokensJson};
            if (window.opener) {
              window.opener.localStorage.setItem('studysynth_google_auth', JSON.stringify({
                user: userData,
                tokens: tokensData
              }));
              window.opener.localStorage.setItem('studysynth_google_calendar', JSON.stringify(calendarTokensData));
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS',
                success: true,
                user: userData
              }, '*');
              window.close();
            } else {
              localStorage.setItem('studysynth_google_auth', JSON.stringify({
                user: userData,
                tokens: tokensData
              }));
              localStorage.setItem('studysynth_google_calendar', JSON.stringify(calendarTokensData));
              window.location.href = '/';
            }
          </script>
        </head>
        <body>
          <p>Signed in successfully! Redirecting...</p>
        </body>
      </html>
    `;

    const response = new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    response.cookies.set(GOOGLE_CALENDAR_KEY, calendarTokensJson, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Google Auth callback error:', err);
    return NextResponse.json({ 
      error: `Failed to sign in: ${err.message}` 
    }, { status: 500 });
  }
}