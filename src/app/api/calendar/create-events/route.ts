import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import type { DecodedToken } from '@/lib/types';

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { token, events } = await req.json();
    
    if (!token || !events) {
      return new Response('data: {"error":"Missing token or events"}\n\n', {
        status: 400,
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return new Response('data: {"error":"Invalid token"}\n\n', {
        status: 401,
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const client = await clientPromise;
          const db = client.db('studysynth');
          const calendarEvents = db.collection('calendarEvents');

          // Send initial progress
          const progressData = `data: ${JSON.stringify({ type: 'progress', content: 'Creating calendar events...', step: 1 })}\n\n`;
          controller.enqueue(encoder.encode(progressData));

          // Insert events one by one with progress updates
          const insertedEvents = [];
          for (let i = 0; i < events.length; i++) {
            const event = events[i];
            
            const result = await calendarEvents.insertOne({
              userId: new ObjectId(userId),
              startDate: new Date(event.startDate),
              endDate: new Date(event.endDate),
              title: event.title,
              description: event.description || '',
            });

            insertedEvents.push({
              ...event,
              _id: result.insertedId,
              userId
            });

            // Send progress for each event
            const eventProgress = `data: ${JSON.stringify({ 
              type: 'progress', 
              content: `Creating event ${i + 1} of ${events.length}: ${event.title}`,
              step: i + 1,
              total: events.length
            })}\n\n`;
            controller.enqueue(encoder.encode(eventProgress));
          }

          // Send completion signal
          const completionData = `data: ${JSON.stringify({ 
            type: 'complete', 
            content: 'All calendar events created successfully',
            events: insertedEvents
          })}\n\n`;
          controller.enqueue(encoder.encode(completionData));
          controller.close();
        } catch (error) {
          const errorData = `data: ${JSON.stringify({ 
            type: 'error', 
            content: error instanceof Error ? error.message : 'Unknown error' 
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(`data: {"error":"Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}"}\n\n`, {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' }
    });
  }
}