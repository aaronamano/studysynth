export interface StudyGuideDisplayProps {
  studyGuide: string | null;
  isGenerating: boolean;
}

export interface TopicTextareaProps {
  value: File | null
  onChange: (value: File | null) => void
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