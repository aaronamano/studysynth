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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Google Calendar Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Status: {isConnected ? 'Connected' : 'Not Connected'}
              </p>
              <p className="text-xs text-gray-600">
                {isConnected 
                  ? 'Your events will sync with Google Calendar'
                  : 'Connect to sync events with Google Calendar'
                }
              </p>
            </div>
            <div className="flex space-x-2">
              {!isConnected ? (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              ) : (
                <Button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
              {error}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <p>• Connect your Google Account to sync events</p>
            <p>• Events created will be added to your Google Calendar</p>
            <p>• Your Google Calendar events will appear here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}