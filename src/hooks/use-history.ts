'use client'

import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '@/lib/storage';

const CACHE_KEY = 'studysynth_history_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export interface HistoryItem {
  _id: string;
  response: string;
  createdAt: string;
}

interface CacheData {
  history: HistoryItem[];
  timestamp: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchHistory = useCallback(async (forceRefresh = false) => {
    if (isFetching && !forceRefresh) return;
    
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
          const { history: cachedHistory, timestamp }: CacheData = JSON.parse(cachedData) as CacheData;
          const now = Date.now();
          
          if (now - timestamp < CACHE_DURATION) {
            setHistory(cachedHistory);
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
      setIsFetching(true);
      const response = await fetch('/api/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        
        // Update cache
        const cacheData: CacheData = {
          history: data,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        setError(null);
      } else {
        setError('Failed to fetch history');
      }
    } catch {
      setError('Error fetching history');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  const saveHistory = useCallback(async (studyGuide: unknown) => {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return null;
    }

    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studyGuide }),
      });

      if (response.ok) {
        // Invalidate cache after saving
        localStorage.removeItem(CACHE_KEY);
        // Refetch to get updated data
        await fetchHistory(true);
        return await response.json();
      } else {
        setError('Failed to save history');
        return null;
      }
    } catch {
      setError('Error saving history');
      return null;
    }
  }, [fetchHistory]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    fetchHistory(true);
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: () => fetchHistory(true),
    saveHistory,
    invalidateCache,
  };
}