export interface StudyGuideDisplayProps {
  studyGuide: string | null;
  isGenerating: boolean;
}

export interface TopicTextareaProps {
  value: File | null
  onChange: (value: File | null) => void
}

export interface PdfFileWithContent extends File {
  extractedContent?: string;
  pages?: number;
}

export interface TopicInputProps {
  items: string[]
  setItems: React.Dispatch<React.SetStateAction<string[]>>
  placeholder: string
  label: string
}

export interface MediaPreferencesProps {
  preferences: {
    videos: boolean;
    diagrams: boolean;
    readings: boolean;
    summaries: boolean;
  };
  setPreferences: (prefs: MediaPreferencesProps["preferences"]) => void;
}

export interface StudyPlanAdjusterProps {
  studyPlan: {
    intensity: string;
    learningStyle: string;
  };
  setStudyPlan: (plan: { intensity: string; learningStyle: string }) => void;
}

export interface StudyGuideHistory {
  _id: string;
  response: string;
  createdAt: string;
}

export interface Event {
  _id?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

// api/study-guide
export interface MediaPreferences {
  videos: boolean;
  diagrams: boolean;
  readings: boolean;
  summaries: boolean;
}

export interface StudyPlan {
  intensity: string;
  learningStyle: string;
}

// api/history, api/calendar/events, api/auth/user, and api/account/keys
export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export interface CustomToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: "month" | "week" | "day" | "agenda") => void;
}

// api/ai-agent
export interface StudyPlanData {
  strengths: string[];
  weaknesses: string[];
  mediaPreferences: {
    videos: boolean;
    diagrams: boolean;
    readings: boolean;
    summaries: boolean;
  };
  studyPlan: {
    intensity: string;
    learningStyle: string;
  };
  userToken?: string;
}

export interface CalendarEvent {
  startDate: Date;
  endDate: Date;
  title: string;
  description: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
}

// events-display.tsx
export interface EventsDisplayProps {
  events: CalendarEvent[]
  isGenerating: boolean
}

export interface GoogleCalendarIntegrationProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}