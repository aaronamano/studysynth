'use client'

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/lib/types';

const CACHE_KEY = 'calendar_events_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  events: Event[];
  timestamp: number;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<Event[]>([]);
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
            const formattedEvents = cachedEvents.map((event: Event) => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
            }));
            setEvents(formattedEvents);
            setLoading(false);
            return;
          }
        } catch {
        }
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/calendar/sync-events', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event: { _id?: string; title: string; start: string; end: string; description?: string }) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        
        setEvents(formattedEvents);
        
        const cacheData: CacheData = {
          events: formattedEvents.map((event: Event) => ({
            ...event,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
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