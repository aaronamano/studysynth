'use client'

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/lib/types';
import { safeLocalStorage } from '@/lib/storage';

const CACHE_KEY = 'calendar_events_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  events: Event[];
  timestamp: number;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Check cache first
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
        } catch (e) {
          // Invalid cache, proceed with fetch
        }
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        
        setEvents(formattedEvents);
        
        // Update cache
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
    } catch (error) {
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