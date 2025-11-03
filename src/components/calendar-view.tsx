'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import DatePicker from 'react-datepicker';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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

import { jwtDecode } from "jwt-decode";

const CustomToolbar = ({ label, onNavigate, onView }) => {
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
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const response = await fetch('/api/calendar/events', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }));
          setEvents(formattedEvents);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle case where user is not logged in
      return;
    }
    const decodedToken: { userId: string } = jwtDecode(token);
    const userId = decodedToken.userId;

    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        ...newEvent, 
        startDate: newEvent.start, 
        endDate: newEvent.end 
      }),
    });
    if (response.ok) {
      const { eventId } = await response.json();
      setEvents([...events, { ...newEvent, _id: eventId }]);
    }
  };

  const handleDeleteEvent = async (eventToDelete) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`/api/calendar/events?eventId=${eventToDelete._id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        setEvents(events.filter(event => event._id !== eventToDelete._id));
    } else {
        console.error("Failed to delete event");
    }
  };

  const handleUpdateEvent = async (updatedEvent) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('/api/calendar/events', {
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
        }),
    });

    if (response.ok) {
        setEvents(events.map(event => event._id === updatedEvent._id ? updatedEvent : event));
        setSelectedEvent(null);
    } else {
        console.error("Failed to update event");
    }
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {
        backgroundColor: '#8B5CF6',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
    };
    return {
        style: style
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
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
              <div className='flex space-x-2'>
                <DatePicker
                  selected={newEvent.start}
                  onChange={(start) => setNewEvent({ ...newEvent, start: start as Date })}
                  showTimeSelect
                  dateFormat='Pp'
                  className='w-full'
                />
                <DatePicker
                  selected={newEvent.end}
                  onChange={(end) => setNewEvent({ ...newEvent, end: end as Date })}
                  showTimeSelect
                  dateFormat='Pp'
                  className='w-full'
                />
              </div>
              <Button onClick={handleAddEvent} className="bg-purple-600">Add Event</Button>
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
          onView={setView}
          date={date}
          onNavigate={setDate}
          components={{
            toolbar: CustomToolbar,
          }}
          eventPropGetter={eventStyleGetter}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Study Sessions</h2>
        <div className="space-y-4">
          {events.map((event, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{`${format(event.start, 'P')} ${format(event.start, 'p')} - ${format(event.end, 'p')}`}</p>
                <div className="flex space-x-2 mt-2">
                  <Button onClick={() => setSelectedEvent(event)} className="bg-yellow-600">Edit</Button>
                  <Button onClick={() => handleDeleteEvent(event)} className="bg-red-600">Delete</Button>
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
                  <div className='flex space-x-2'>
                    <DatePicker
                      selected={selectedEvent.start}
                      onChange={(start) => setSelectedEvent({ ...selectedEvent, start: start as Date })}
                      showTimeSelect
                      dateFormat='Pp'
                      className='w-full'
                    />
                    <DatePicker
                      selected={selectedEvent.end}
                      onChange={(end) => setSelectedEvent({ ...selectedEvent, end: end as Date })}
                      showTimeSelect
                      dateFormat='Pp'
                      className='w-full'
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