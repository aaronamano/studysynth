'use client'

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
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
    } catch {
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
    } catch {
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
          <svg className="w-8 h-8" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="m13 13h22v22h-22z" fill="#fff"/>
            <path d="m25.68 20.92 1.008 1.44 1.584-1.152v8.352h1.728v-10.944h-1.44z" fill="#1e88e5"/>
            <path d="m22.943 23.745c.625-.574 1.013-1.37 1.013-2.249 0-1.747-1.533-3.168-3.417-3.168-1.602 0-2.972 1.009-3.33 2.453l1.657.421c.165-.664.868-1.146 1.673-1.146.942 0 1.709.646 1.709 1.44s-.767 1.44-1.709 1.44h-.997v1.728h.997c1.081 0 1.993.751 1.993 1.64 0 .904-.866 1.64-1.931 1.64-.962 0-1.784-.61-1.914-1.418l-1.687.276c.262 1.636 1.81 2.87 3.6 2.87 2.007 0 3.64-1.511 3.64-3.368-0-1.023-.504-1.941-1.297-2.559z" fill="#1e88e5"/>
            <path d="m34 42h-20l-1-4 1-4h20l1 4z" fill="#fbc02d"/>
            <path d="m38 35 4-1v-20l-4-1-4 1v20z" fill="#4caf50"/>
            <path d="m34 14 1-4-1-4h-25c-1.657 0-3 1.343-3 3v25l4 1 4-1v-20z" fill="#1e88e5"/>
            <path d="m34 34v8l8-8z" fill="#e53935"/>
            <g fill="#1565c0">
              <path d="m39 6h-5v8h8v-5c0-1.657-1.343-3-3-3z"/>
              <path d="m9 42h5v-8h-8v5c0 1.657 1.343 3 3 3z"/>
            </g>
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