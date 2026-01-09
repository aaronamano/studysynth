import { google } from 'googleapis';
import { getUserGoogleCalendarTokens } from './google-calendar-tokens';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export async function getGoogleCalendarClient(userId: string) {
  const tokens = await getUserGoogleCalendarTokens(userId);
  if (!tokens) {
    throw new Error('User not connected to Google Calendar');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);

  return google.calendar({ version: 'v3', auth });
}

export async function getGoogleCalendarEvents(
  userId: string, 
  calendarId: string = 'primary',
  timeMin?: Date,
  timeMax?: Date
) {
  try {
    const calendar = await getGoogleCalendarClient(userId);

    const params: any = {
      calendarId,
      singleEvents: true,
      orderBy: 'startTime'
    };

    if (timeMin) params.timeMin = timeMin.toISOString();
    if (timeMax) params.timeMax = timeMax.toISOString();

    const response = await calendar.events.list(params);
    return response.data.items || [];
  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error);
    throw new Error('Failed to fetch Google Calendar events');
  }
}

export async function createGoogleCalendarEvent(
  userId: string,
  eventData: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
  },
  calendarId: string = 'primary'
) {
  try {
    const calendar = await getGoogleCalendarClient(userId);

    const event: GoogleCalendarEvent = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start.toISOString(),
      },
      end: {
        dateTime: eventData.end.toISOString(),
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error('Failed to create Google Calendar event');
  }
}

export async function updateGoogleCalendarEvent(
  userId: string,
  eventId: string,
  eventData: {
    summary?: string;
    description?: string;
    start?: Date;
    end?: Date;
  },
  calendarId: string = 'primary'
) {
  try {
    const calendar = await getGoogleCalendarClient(userId);

    const event: Partial<GoogleCalendarEvent> = {};
    
    if (eventData.summary) event.summary = eventData.summary;
    if (eventData.description) event.description = eventData.description;
    if (eventData.start) {
      event.start = { dateTime: eventData.start.toISOString() };
    }
    if (eventData.end) {
      event.end = { dateTime: eventData.end.toISOString() };
    }

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating Google Calendar event:', error);
    throw new Error('Failed to update Google Calendar event');
  }
}

export async function deleteGoogleCalendarEvent(
  userId: string,
  eventId: string,
  calendarId: string = 'primary'
) {
  try {
    const calendar = await getGoogleCalendarClient(userId);

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting Google Calendar event:', error);
    throw new Error('Failed to delete Google Calendar event');
  }
}