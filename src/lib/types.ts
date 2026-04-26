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

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export interface GoogleCalendarIntegrationProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
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

export interface TopicTextareaProps {
  value: File | string | null
  onChange: (value: File | string | null) => void
  inputType: 'pdf' | 'text'
  onInputTypeChange: (type: 'pdf' | 'text') => void
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

export interface CalendarEvent {
  _id: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  googleEventId?: string;
  isGoogleEvent?: boolean;
}

export interface CustomToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: "month" | "week" | "day" | "agenda") => void;
}