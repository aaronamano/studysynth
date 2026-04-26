'use client'

import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'studysynth_history_cache';
const HISTORY_KEY = 'studysynth_history';
const CACHE_DURATION = 10 * 60 * 1000;

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

  const fetchHistory = useCallback(async (forceRefresh = false) => {
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
        }
      }
    }

    try {
      setLoading(true);
      const storedData = localStorage.getItem(HISTORY_KEY);
      if (storedData) {
        const data = JSON.parse(storedData) as HistoryItem[];
        setHistory(data);
        
        const cacheData: CacheData = {
          history: data,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        setError(null);
      } else {
        setHistory([]);
      }
    } catch {
      setError('Error fetching history');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveHistory = useCallback(async (studyGuide: unknown) => {
    try {
      const storedData = localStorage.getItem(HISTORY_KEY);
      let currentHistory: HistoryItem[] = storedData ? JSON.parse(storedData) : [];
      
      const newItem: HistoryItem = {
        _id: Date.now().toString(),
        response: studyGuide as string,
        createdAt: new Date().toISOString(),
      };
      
      currentHistory = [newItem, ...currentHistory];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
      
      localStorage.removeItem(CACHE_KEY);
      await fetchHistory(true);
      
      return newItem;
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