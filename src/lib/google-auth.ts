export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleAuthTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface GoogleAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GoogleUser | null;
  tokens: GoogleAuthTokens | null;
}

const GOOGLE_AUTH_KEY = 'studysynth_google_auth';

export async function getStoredAuth(): Promise<{ user: GoogleUser | null; tokens: GoogleAuthTokens | null }> {
  try {
    const data = localStorage.getItem(GOOGLE_AUTH_KEY);
    if (!data) return { user: null, tokens: null };
    
    const parsed = JSON.parse(data);
    return {
      user: parsed.user || null,
      tokens: parsed.tokens || null
    };
  } catch (error) {
    console.error('Error fetching Google Auth:', error);
    return { user: null, tokens: null };
  }
}

export async function saveStoredAuth(
  user: GoogleUser,
  tokens: GoogleAuthTokens
): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify({ user, tokens }));
      window.dispatchEvent(new globalThis.StorageEvent('storage', {
        key: GOOGLE_AUTH_KEY,
        newValue: JSON.stringify({ user, tokens })
      }));
    }
    return true;
  } catch (error) {
    console.error('Error saving Google Auth:', error);
    return false;
  }
}

export async function clearStoredAuth(): Promise<boolean> {
  try {
    localStorage.removeItem(GOOGLE_AUTH_KEY);
    localStorage.removeItem('studysynth_google_calendar');
    window.dispatchEvent(new globalThis.StorageEvent('storage', {
      key: GOOGLE_AUTH_KEY,
      oldValue: null
    }));
    return true;
  } catch (error) {
    console.error('Error clearing Google Auth:', error);
    return false;
  }
}

export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const data = localStorage.getItem(GOOGLE_AUTH_KEY);
    if (!data) return false;
    
    const parsed = JSON.parse(data);
    return !!(parsed.user && parsed.tokens?.access_token);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const { tokens } = await getStoredAuth();
  return tokens?.access_token || null;
}