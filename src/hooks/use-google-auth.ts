'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  GoogleUser,
  getStoredAuth,
  clearStoredAuth
} from '@/lib/google-auth';
import { safeLocalStorage } from '@/lib/storage';

interface UseGoogleAuthReturn {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const { user: storedUser } = await getStoredAuth();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorage = (event: globalThis.StorageEvent) => {
      if (event.key === 'studysynth_google_auth') {
        checkAuth();
      }
    };

    const handleMessage = (event: globalThis.MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('message', handleMessage);
    };
  }, [checkAuth]);

  const signIn = async () => {
    try {
      setIsLoading(true);
      const token = safeLocalStorage.getItem('token');
      
      const response = await fetch('/api/google-auth/auth', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate auth');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await clearStoredAuth();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    refetch: checkAuth
  };
}