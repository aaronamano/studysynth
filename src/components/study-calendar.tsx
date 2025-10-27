"use client"

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
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

const initialEvents = [
  {
    title: 'Quantum Physics Midterm Prep',
    start: new Date(2025, 10, 15, 9, 0, 0),
    end: new Date(2025, 10, 15, 11, 0, 0),
  },
  {
    title: 'Organic Chemistry Final Review',
    start: new Date(2025, 10, 22, 13, 0, 0),
    end: new Date(2025, 10, 22, 15, 0, 0),
  },
];

export function StudyCalendar() {
  const [events, setEvents] = useState(initialEvents);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });

  const handleAddEvent = () => {
    setEvents([...events, newEvent]);
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
              <Button onClick={handleAddEvent}>Add Event</Button>
            </div>
          </CardContent>
        </Card>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 500 }}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
