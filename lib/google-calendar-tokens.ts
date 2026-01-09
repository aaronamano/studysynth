import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface UserGoogleCalendar {
  userId: ObjectId;
  googleCalendarTokens: GoogleCalendarTokens | null;
  calendarId: string;
  isConnected: boolean;
}

export async function getUserGoogleCalendarTokens(userId: string): Promise<GoogleCalendarTokens | null> {
  try {
    const client = await clientPromise;
    const db = client.db('studysynth');
    const userGoogleCalendar = db.collection('userGoogleCalendar');

    const result = await userGoogleCalendar.findOne({ userId: new ObjectId(userId) });
    return result?.googleCalendarTokens || null;
  } catch (error) {
    console.error('Error fetching user Google Calendar tokens:', error);
    return null;
  }
}

export async function saveUserGoogleCalendarTokens(
  userId: string, 
  tokens: GoogleCalendarTokens,
  calendarId: string = 'primary'
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db('studysynth');
    const userGoogleCalendar = db.collection('userGoogleCalendar');

    await userGoogleCalendar.updateOne(
      { userId: new ObjectId(userId) },
      { 
        $set: {
          userId: new ObjectId(userId),
          googleCalendarTokens: tokens,
          calendarId,
          isConnected: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return true;
  } catch (error) {
    console.error('Error saving user Google Calendar tokens:', error);
    return false;
  }
}

export async function disconnectUserGoogleCalendar(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db('studysynth');
    const userGoogleCalendar = db.collection('userGoogleCalendar');

    await userGoogleCalendar.updateOne(
      { userId: new ObjectId(userId) },
      { 
        $set: {
          googleCalendarTokens: null,
          isConnected: false,
          updatedAt: new Date()
        }
      }
    );

    return true;
  } catch (error) {
    console.error('Error disconnecting user Google Calendar:', error);
    return false;
  }
}

export async function isUserGoogleCalendarConnected(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db('studysynth');
    const userGoogleCalendar = db.collection('userGoogleCalendar');

    const result = await userGoogleCalendar.findOne({ userId: new ObjectId(userId) });
    return result?.isConnected || false;
  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    return false;
  }
}