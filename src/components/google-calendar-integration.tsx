'use client'

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { safeLocalStorage } from '@/lib/storage';

interface GoogleCalendarIntegrationProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export function GoogleCalendarIntegration({ onConnectionChange }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = async () => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/google-calendar/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.isConnected);
        onConnectionChange?.(data.isConnected);
      }
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = safeLocalStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to connect Google Calendar');
        return;
      }

      const response = await fetch('/api/google-calendar/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.authUrl, '_blank', 'width=500,height=600');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to connect Google Calendar');
      }
    } catch (error) {
      setError('An error occurred while connecting to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = safeLocalStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/google-calendar/status', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsConnected(false);
        onConnectionChange?.(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disconnect Google Calendar');
      }
    } catch (error) {
      setError('An error occurred while disconnecting Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      checkConnectionStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="relative flex items-center justify-between p-4 bg-black/60 border border-purple-500/20 rounded-lg backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-200">
            Google Calendar {isConnected ? 'Connected' : 'Not Connected'}
          </p>
          <p className="text-xs text-purple-500">
            {isConnected 
              ? 'Events will sync with your calendar'
              : 'Connect to sync events automatically'
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm px-4 py-2 h-8"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="outline"
            className="text-sm px-4 py-2 h-8"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        )}
      </div>
      
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 text-xs text-red-400 bg-red-900/40 border border-red-500/30 p-2 rounded backdrop-blur-sm">
          {error}
        </div>
      )}
    </div>
  );
}