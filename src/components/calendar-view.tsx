'use client'

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import DatePicker from 'react-datepicker';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import type { Event, CustomToolbarProps } from '@/lib/types';
import { useCalendarEvents } from '@/hooks/use-calendar-events';

const parseLinksInText = (text: string) => {
  if (!text) return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 hover:underline underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomToolbar = ({ label, onNavigate, onView }: CustomToolbarProps) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <Button onClick={() => onNavigate('PREV')}>Back</Button>
        <Button onClick={() => onNavigate('TODAY')}>Today</Button>
        <Button onClick={() => onNavigate('NEXT')}>Next</Button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <Button onClick={() => onView(Views.MONTH)}>Month</Button>
        <Button onClick={() => onView(Views.WEEK)}>Week</Button>
        <Button onClick={() => onView(Views.DAY)}>Day</Button>
        <Button onClick={() => onView(Views.AGENDA)}>Agenda</Button>
      </span>
    </div>
  );
};

export function CalendarView() {
  const { events, invalidateCache } = useCalendarEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleStorageChange = (e: globalThis.StorageEvent) => {
      if (e.key === 'googleCalendarDisconnected' && e.newValue === 'true') {
        invalidateCache();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [invalidateCache]);

  const handleDeleteEvent = async (eventToDelete: Event) => {
    const isGoogleEvent = (eventToDelete as { isGoogleEvent?: boolean }).isGoogleEvent;
    const response = await fetch(`/api/calendar/sync-events?eventId=${eventToDelete._id}&syncToGoogle=${isGoogleEvent}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      invalidateCache();
    } else {
      console.error("Failed to delete event");
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    const isGoogleEvent = (updatedEvent as { isGoogleEvent?: boolean }).isGoogleEvent;
    const response = await fetch('/api/calendar/sync-events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: updatedEvent._id,
        title: updatedEvent.title,
        startDate: updatedEvent.start,
        endDate: updatedEvent.end,
        description: updatedEvent.description || '',
      }),
    });
    if (response.ok) {
      invalidateCache();
      setSelectedEvent(null);
    } else {
      console.error("Failed to update event");
    }
  };

  const handleEventSelection = (eventId: string, checked: boolean) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (checked) { newSet.add(eventId); }
      else { newSet.delete(eventId); }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const localEventIds = events
      .filter(event => !(event as { isGoogleEvent?: boolean }).isGoogleEvent)
      .map(event => event._id!)
      .filter(Boolean);
    setSelectedEvents(new Set(localEventIds));
  };

  const handleClearSelection = () => { setSelectedEvents(new Set()); };

  const handleBatchDelete = async () => {
    if (selectedEvents.size === 0) return;
    const confirmed = window.confirm(`Delete ${selectedEvents.size} selected event(s)? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const eventIds = Array.from(selectedEvents).join(',');
      const response = await fetch(`/api/calendar/sync-events?eventIds=${eventIds}&syncToGoogle=true`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSelectedEvents(new Set());
        invalidateCache();
      } else {
        console.error("Failed to delete events");
      }
    } catch (error) {
      console.error("Error deleting events:", error);
    }
  };

  const eventStyleGetter = (event: Event) => {
    const isGoogleEvent = (event as { isGoogleEvent?: boolean }).isGoogleEvent;
    return {
      style: {
        backgroundColor: isGoogleEvent ? '#4285F4' : '#d97706',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '1px solid rgba(217, 119, 6, 0.3)',
        display: 'block',
        boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)'
      }
    };
  };

  const CustomEvent = ({ event }: { event: Event }) => {
    const isGoogleEvent = (event as { isGoogleEvent?: boolean }).isGoogleEvent;
    return (
      <div className="rbc-event-content">
        <div className="font-semibold text-xs flex items-center gap-1">
          {isGoogleEvent && <span className="text-blue-200">G</span>}
          {event.title}
        </div>
        {event.description && (
          <div className="text-xs opacity-90 mt-1 truncate">
            {parseLinksInText(event.description)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Calendar localizer={localizer} events={events} startAccessor='start' endAccessor='end' style={{ height: 500 }}
          onSelectEvent={event => setSelectedEvent(event)} view={view} onView={(view) => setView(view)} date={date} onNavigate={setDate}
          components={{ toolbar: CustomToolbar, event: CustomEvent }} eventPropGetter={eventStyleGetter} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-amber-300 mb-4">Upcoming Study Sessions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="upcoming-sessions" className="border-amber-500/30">
            <AccordionTrigger className="text-amber-300 hover:text-amber-200 py-4">
              <span className="flex items-center justify-between w-full">
                <span>Study Sessions ({events.length})</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2 bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={events.filter(e => !(e as { isGoogleEvent?: boolean }).isGoogleEvent && e._id).length > 0 && events.filter(e => !(e as { isGoogleEvent?: boolean }).isGoogleEvent && e._id).every(e => selectedEvents.has(e._id!))}
                      onCheckedChange={(checked) => { if (checked) handleSelectAll(); else handleClearSelection(); }} />
                    <span className="text-amber-300 text-sm">Select All</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-amber-400 text-sm">{selectedEvents.size} selected</div>
                    {selectedEvents.size > 0 && (
                      <Button onClick={handleBatchDelete} className="bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-sm px-3 py-1">
                        Delete Selected
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {events.map((event, index) => {
                  const isGoogleEvent = (event as { isGoogleEvent?: boolean }).isGoogleEvent;
                  const eventId = event._id;
                  const isSelectable = !isGoogleEvent && eventId;
                  return (
                    <Accordion key={index} type="single" collapsible className="w-full">
                      <AccordionItem value={`event-${index}`} className="border-amber-500/30 bg-black/40">
                        <AccordionTrigger className="text-amber-200 hover:text-amber-100 py-4 px-4 rounded-t-lg">
                          <div className="flex items-center justify-between w-full pr-2">
                            <div className="flex items-center gap-2">
                              {isSelectable && <Checkbox checked={selectedEvents.has(eventId)} onCheckedChange={(checked) => handleEventSelection(eventId, checked as boolean)} onClick={(e) => e.stopPropagation()} />}
                              <span className="font-medium">{event.title}</span>
                              <span className="text-amber-400 text-sm">{format(event.start, 'P')}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            <div className="text-amber-300 text-sm"><span className="font-medium">Time:</span> {format(event.start, 'P')} {format(event.start, 'p')} - {format(event.end, 'p')}</div>
                            {event.description && (
                              <div className="text-sm text-amber-400 italic whitespace-pre-wrap border-t border-amber-500/20 pt-3">
                                <span className="font-medium not-italic text-amber-300">Description:</span>
                                <div className="mt-1">{parseLinksInText(event.description)}</div>
                              </div>
                            )}
                            <div className="flex space-x-2 pt-2 border-t border-amber-500/20">
                              <Button onClick={() => setSelectedEvent(event)} className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-sm px-3 py-1">Edit</Button>
                              <Button onClick={() => handleDeleteEvent(event)} className="bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-sm px-3 py-1">Delete</Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
                {events.length === 0 && <div className="text-amber-400 text-center py-8 italic">No upcoming study sessions scheduled</div>}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}