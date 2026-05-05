'use client'

import { useState, useEffect, useCallback } from 'react';
import type { CalendarEventInput } from '@/lib/types';

const CACHE_KEY = 'calendar_events_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  events: CalendarEventInput[];
  timestamp: number;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const { events: cachedEvents, timestamp }: CacheData = JSON.parse(cachedData) as CacheData;
          const now = Date.now();
          
          if (now - timestamp < CACHE_DURATION) {
            const formattedEvents = cachedEvents.map((event) => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
            }));
            setEvents(formattedEvents);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Cache parse error:', error);
        }
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/calendar/sync-events', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json() as Array<{ _id?: string; title: string; start: string; end: string; description?: string }>;
        const formattedEvents: CalendarEventInput[] = data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        
        setEvents(formattedEvents);
        
        const cacheData: CacheData = {
          events: formattedEvents.map((event) => ({
            ...event,
            start: event.start instanceof Date ? event.start.toISOString() : event.start,
            end: event.end instanceof Date ? event.end.toISOString() : event.end,
          })),
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        setError(null);
      } else {
        setError('Failed to fetch events');
      }
    } catch {
      setError('Error fetching events');
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    fetchEvents(true);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: () => fetchEvents(true),
    invalidateCache,
  };
}