import { cookies } from 'next/headers';

export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

const GOOGLE_CALENDAR_KEY = 'studysynth_google_calendar';

async function getTokensFromCookiesOrLocal(): Promise<GoogleCalendarTokens | null> {
  try {
    const cookieStore = await cookies();
    const cookieData = cookieStore.get(GOOGLE_CALENDAR_KEY);
    
    if (cookieData) {
      return JSON.parse(cookieData.value) as GoogleCalendarTokens;
    }
    
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(GOOGLE_CALENDAR_KEY);
      if (!data) return null;
      return JSON.parse(data) as GoogleCalendarTokens;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Google Calendar tokens:', error);
    return null;
  }
}

export async function getUserGoogleCalendarTokens(): Promise<GoogleCalendarTokens | null> {
  return getTokensFromCookiesOrLocal();
}

export async function saveUserGoogleCalendarTokens(
  tokens: GoogleCalendarTokens
): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GOOGLE_CALENDAR_KEY, JSON.stringify(tokens));
    }
    return true;
  } catch (error) {
    console.error('Error saving Google Calendar tokens:', error);
    return false;
  }
}

export async function disconnectUserGoogleCalendar(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GOOGLE_CALENDAR_KEY);
    }
    return true;
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return false;
  }
}

export async function isUserGoogleCalendarConnected(): Promise<boolean> {
  const tokens = await getTokensFromCookiesOrLocal();
  return !!tokens?.access_token;
}