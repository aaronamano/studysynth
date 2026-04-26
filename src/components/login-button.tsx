'use client'

import { useState } from 'react';
import { Button } from './ui/button';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { Loader2 } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showUserInfo?: boolean;
}

export function LoginButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  children,
  showUserInfo = true
}: LoginButtonProps) {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      try {
        setError(null);
        await signIn();
      } catch {
        setError('Failed to sign in with Google');
      }
    }
  };

  if (isLoading) {
    return (
      <Button 
        disabled 
        variant={variant} 
        size={size} 
        className={className}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        {showUserInfo && (
          <div className="flex items-center gap-2">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-sm font-medium text-amber-200">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span className="text-sm text-amber-200 hidden sm:inline">
              {user.name}
            </span>
          </div>
        )}
        <Button
          onClick={handleClick}
          variant="outline"
          size={size}
          className={className}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={className}
      >
        {children || (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </span>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}