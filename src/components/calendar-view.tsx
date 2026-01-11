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
import type { Event, CustomToolbarProps } from '@/lib/types';
import { jwtDecode } from "jwt-decode";
import { safeLocalStorage } from "@/lib/storage";
import { useCalendarEvents } from '@/hooks/use-calendar-events';
import { GoogleCalendarIntegration } from './google-calendar-integration';

// Utility function to parse and render links in text
const parseLinksInText = (text: string) => {
  if (!text) return text;
  
  // Regex to match http:// or https:// URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    // Check if this part is a URL
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 hover:underline underline"
          onClick={(e) => e.stopPropagation()} // Prevent event selection when clicking link
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const locales = {
  'en-US': enUS,
};

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
  const [newEvent, setNewEvent] = useState<Event>({ title: '', start: new Date(), end: new Date(), description: '' });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [syncToGoogle, setSyncToGoogle] = useState<boolean>(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'googleCalendarDisconnected' && e.newValue === 'true') {
        // Refresh events to show unsynced state
        invalidateCache();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [invalidateCache]);

  const handleAddEvent = async () => {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      // Handle case where user is not logged in
      return;
    }
    jwtDecode(token);

    const response = await fetch('/api/calendar/sync-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        ...newEvent, 
        startDate: newEvent.start, 
        endDate: newEvent.end,
        description: newEvent.description,
        syncToGoogle: isGoogleConnected && syncToGoogle
      }),
    });
    if (response.ok) {
      const { googleError } = await response.json();
      invalidateCache();
      
      if (googleError) {
        console.warn('Google Calendar sync warning:', googleError);
      }
    }
  };

  const handleDeleteEvent = async (eventToDelete: Event) => {
    const token = safeLocalStorage.getItem('token');
    if (!token) return;

    const isGoogleEvent = (eventToDelete as { isGoogleEvent?: boolean }).isGoogleEvent;
    const response = await fetch(`/api/calendar/sync-events?eventId=${eventToDelete._id}&syncToGoogle=${isGoogleEvent}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        invalidateCache();
    } else {
        console.error("Failed to delete event");
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    const token = safeLocalStorage.getItem('token');
    if (!token) return;

    const isGoogleEvent = (updatedEvent as { isGoogleEvent?: boolean }).isGoogleEvent;
    const response = await fetch('/api/calendar/sync-events', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            _id: updatedEvent._id,
            title: updatedEvent.title,
            startDate: updatedEvent.start,
            endDate: updatedEvent.end,
            description: updatedEvent.description || '',
            syncToGoogle: isGoogleEvent,
        }),
    });

    if (response.ok) {
        invalidateCache();
        setSelectedEvent(null);
    } else {
        console.error("Failed to update event");
    }
  };

const eventStyleGetter = (event: Event, _start: Date, _end: Date, _isSelected: boolean) => {
    const isGoogleEvent = (event as { isGoogleEvent?: boolean }).isGoogleEvent;
    const style = {
        backgroundColor: isGoogleEvent ? '#4285F4' : '#8B5CF6',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        display: 'block',
        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
    };
    return {
        style: style
    };
};

  const CustomEvent = ({ event }: { event: Event }) => {
    const isGoogleEvent = (event as { isGoogleEvent?: boolean }).isGoogleEvent;
    return (
      <div className="rbc-event-content">
        <div className="font-semibold text-xs flex items-center gap-1">
          {isGoogleEvent && (
            <span className="text-blue-200">G</span>
          )}
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
        <GoogleCalendarIntegration 
          onConnectionChange={setIsGoogleConnected}
        />
        <Card className='mb-4'>
          <CardContent className='p-4'>
            <h3 className='text-lg font-semibold mb-2'>Add New Study Session</h3>
            <div className='flex flex-col space-y-2'>
              <Input
                type='text'
                placeholder='Title'
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <div className="space-y-2">
                <Input
                  type='text'
                  placeholder='Description (optional)'
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
                {newEvent.description && (
                  <div className="text-xs text-purple-400 p-2 bg-black/40 rounded border border-purple-500/20">
                    <strong>Preview:</strong>
                    <div className="mt-1 whitespace-pre-wrap">
                      {parseLinksInText(newEvent.description)}
                    </div>
                  </div>
                )}
              </div>
              <div className='flex space-x-2'>
                <DatePicker
                  selected={newEvent.start}
                  onChange={(start) => setNewEvent({ ...newEvent, start: start as Date })}
                  showTimeSelect
                  dateFormat='Pp'
                  className='w-full bg-black/60 border-purple-500/30 text-purple-200 placeholder:text-purple-500'
                />
                <DatePicker
                  selected={newEvent.end}
                  onChange={(end) => setNewEvent({ ...newEvent, end: end as Date })}
                  showTimeSelect
                  dateFormat='Pp'
                  className='w-full bg-black/60 border-purple-500/30 text-purple-200 placeholder:text-purple-500'
                />
              </div>
              <div className="flex items-center space-x-2">
                {isGoogleConnected && (
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={syncToGoogle}
                      onChange={(e) => setSyncToGoogle(e.target.checked)}
                      className="rounded-full border-purple-500/30 bg-black/60 text-purple-600 focus:ring-purple-500/30"
                    />
                    <span className="text-purple-300">Sync to Google Calendar</span>
                  </label>
                )}
                <Button onClick={handleAddEvent} className="bg-purple-600">Add Event</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 500 }}
          onSelectEvent={event => setSelectedEvent(event)}
          view={view}
          onView={(view) => setView(view)}
          date={date}
          onNavigate={setDate}
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent,
          }}
          eventPropGetter={eventStyleGetter}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Upcoming Study Sessions</h2>
        <div className="space-y-4">
          {events.map((event, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{`${format(event.start, 'P')} ${format(event.start, 'p')} - ${format(event.end, 'p')}`}</p>
                {event.description && (
                  <div className="text-sm text-purple-400 mt-2 italic whitespace-pre-wrap">
                    {parseLinksInText(event.description)}
                  </div>
                )}
                <div className="flex space-x-2 mt-2">
                  <Button onClick={() => setSelectedEvent(event)} className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">Edit</Button>
                  <Button onClick={() => handleDeleteEvent(event)} className="bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle>Edit Study Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col space-y-2'>
                  <Input
                    type='text'
                    placeholder='Title'
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                  />
                  <div className="space-y-2">
                    <Input
                      type='text'
                      placeholder='Description (optional)'
                      value={selectedEvent.description || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    />
                    {selectedEvent.description && (
                      <div className="text-xs text-purple-400 p-2 bg-black/40 rounded border border-purple-500/20">
                        <strong>Preview:</strong>
                        <div className="mt-1 whitespace-pre-wrap">
                          {parseLinksInText(selectedEvent.description)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='flex space-x-2'>
                    <DatePicker
                      selected={selectedEvent.start}
                      onChange={(start) => setSelectedEvent({ ...selectedEvent, start: start as Date })}
                      showTimeSelect
                      dateFormat='Pp'
                      className='w-full bg-black/60 border-purple-500/30 text-purple-200 placeholder:text-purple-500'
                    />
                    <DatePicker
                      selected={selectedEvent.end}
                      onChange={(end) => setSelectedEvent({ ...selectedEvent, end: end as Date })}
                      showTimeSelect
                      dateFormat='Pp'
                      className='w-full bg-black/60 border-purple-500/30 text-purple-200 placeholder:text-purple-500'
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleUpdateEvent(selectedEvent)}>Update</Button>
                    <Button onClick={() => setSelectedEvent(null)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}