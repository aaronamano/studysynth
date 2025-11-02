import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
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

    const { startDate, endDate, title } = await req.json();

    if (!userId || !startDate || !endDate || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('studysynth');
    const calendarEvents = db.collection('calendarEvents');

    const result = await calendarEvents.insertOne({
      userId: new ObjectId(userId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      title,
    });

    return NextResponse.json({ eventId: result.insertedId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to add event: ${e.message}` }, { status: 500 });
  }
}