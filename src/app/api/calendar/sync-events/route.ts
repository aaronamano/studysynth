import { NextRequest, NextResponse } from 'next/server';

const EVENTS_KEY = 'studysynth_calendar_events';

interface CalendarEvent {
  _id: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  googleEventId?: string;
  isGoogleEvent?: boolean;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isStreaming = searchParams.get('stream') === 'true';

  try {
    const storedData = localStorage.getItem(EVENTS_KEY);
    let localEvents: CalendarEvent[] = storedData ? JSON.parse(storedData) : [];

    const formattedLocalEvents = localEvents.map(event => ({
      ...event,
      start: event.startDate,
      end: event.endDate,
      isGoogleEvent: false
    }));

    if (isStreaming) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        start(controller) {
          const initialData = `data: ${JSON.stringify({ type: 'events', content: formattedLocalEvents })}\n\n`;
          controller.enqueue(encoder.encode(initialData));
          controller.close();
        }
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    return NextResponse.json(formattedLocalEvents, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to get events: ${error.message}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, title, description } = await req.json();

    if (!startDate || !endDate || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const storedData = localStorage.getItem(EVENTS_KEY);
    let events: CalendarEvent[] = storedData ? JSON.parse(storedData) : [];

    const newEvent: CalendarEvent = {
      _id: Date.now().toString(),
      startDate,
      endDate,
      title,
      description: description || '',
    };

    events.push(newEvent);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    return NextResponse.json({ eventId: newEvent._id }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to add event: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { _id, title, startDate, endDate, description } = await req.json();

    if (!_id || !title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields for update' }, { status: 400 });
    }

    const storedData = localStorage.getItem(EVENTS_KEY);
    let events: CalendarEvent[] = storedData ? JSON.parse(storedData) : [];

    const eventIndex = events.findIndex(e => e._id === _id);
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events[eventIndex] = {
      ...events[eventIndex],
      title,
      startDate,
      endDate,
      description: description || '',
    };

    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to update event: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const eventIds = searchParams.get('eventIds');

    if (eventIds) {
      const eventIdArray = eventIds.split(',').filter(id => id.trim());
      
      if (eventIdArray.length === 0) {
        return NextResponse.json({ error: 'At least one event ID is required for batch delete' }, { status: 400 });
      }

      const storedData = localStorage.getItem(EVENTS_KEY);
      let events: CalendarEvent[] = storedData ? JSON.parse(storedData) : [];

      events = events.filter(e => !eventIdArray.includes(e._id));
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

      return NextResponse.json({ message: `${eventIdArray.length} event(s) deleted successfully` }, { status: 200 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const storedData = localStorage.getItem(EVENTS_KEY);
    let events: CalendarEvent[] = storedData ? JSON.parse(storedData) : [];

    events = events.filter(e => e._id !== eventId);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: `Failed to delete event: ${error.message}` }, { status: 500 });
  }
}