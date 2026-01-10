'use client'

import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '@/lib/storage';

const CACHE_KEY = 'google_calendar_status_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  isConnected: boolean;
  timestamp: number;
}

export function useGoogleCalendarStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (forceRefresh = false) => {
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
          const { isConnected: cachedIsConnected, timestamp }: CacheData = JSON.parse(cachedData) as CacheData;
          const now = Date.now();
          
          if (now - timestamp < CACHE_DURATION) {
            setIsConnected(cachedIsConnected);
            setLoading(false);
            return;
          }
        } catch {
          // Invalid cache, proceed with fetch
        }
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/google-calendar/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.isConnected);
        
        // Update cache
        const cacheData: CacheData = {
          isConnected: data.isConnected,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        setError(null);
      } else {
        setError('Failed to check calendar status');
      }
    } catch {
      setError('Error checking calendar status');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return false;
    }

    try {
      const response = await fetch('/api/google-calendar/status', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Invalidate cache after disconnecting
        localStorage.removeItem(CACHE_KEY);
        // Refetch to get updated status
        await checkStatus(true);
        return true;
      } else {
        setError('Failed to disconnect calendar');
        return false;
      }
    } catch {
      setError('Error disconnecting calendar');
      return false;
    }
  }, [checkStatus]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    checkStatus(true);
  }, [checkStatus]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isConnected,
    loading,
    error,
    refetch: () => checkStatus(true),
    disconnect,
    invalidateCache,
  };
}