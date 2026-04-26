export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

const GOOGLE_CALENDAR_KEY = 'studysynth_google_calendar';

export async function getUserGoogleCalendarTokens(): Promise<GoogleCalendarTokens | null> {
  try {
    const data = localStorage.getItem(GOOGLE_CALENDAR_KEY);
    if (!data) return null;
    return JSON.parse(data) as GoogleCalendarTokens;
  } catch (error) {
    console.error('Error fetching Google Calendar tokens:', error);
    return null;
  }
}

export async function saveUserGoogleCalendarTokens(
  tokens: GoogleCalendarTokens
): Promise<boolean> {
  try {
    localStorage.setItem(GOOGLE_CALENDAR_KEY, JSON.stringify(tokens));
    return true;
  } catch (error) {
    console.error('Error saving Google Calendar tokens:', error);
    return false;
  }
}

export async function disconnectUserGoogleCalendar(): Promise<boolean> {
  try {
    localStorage.removeItem(GOOGLE_CALENDAR_KEY);
    return true;
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return false;
  }
}

export async function isUserGoogleCalendarConnected(): Promise<boolean> {
  try {
    const data = localStorage.getItem(GOOGLE_CALENDAR_KEY);
    if (!data) return false;
    const tokens = JSON.parse(data) as GoogleCalendarTokens;
    return !!tokens.access_token;
  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    return false;
  }
}