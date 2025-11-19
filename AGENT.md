# Study Agent Implementation

## Overview
The Study Agent is implemented in `/client/src/app/api/ai-agent/route.ts` and provides a comprehensive workflow for generating study guides, finding resources, and creating calendar events.

## Architecture

### StudyAgent Class
The agent is implemented as a TypeScript class with three main tools that execute in sequence:

1. **create_study_guide** - Generates a comprehensive study guide based on user input
2. **find_resources** - Finds relevant educational resources using Perplexity AI
3. **create_calendar_subevents** - Creates a series of calendar events for study sessions

### Tool Implementation

#### `create_study_guide(prompt: string, studyData?: StudyPlanData): Promise<string>`
- Generates a structured study guide using Perplexity AI
- Considers user's strengths, weaknesses, learning style, and media preferences
- Prioritizes content based on user's weaknesses
- Adapts to study intensity level

#### `find_resources(studyGuide: string, mediaPreferences?: any): Promise<string[]>`
- Searches for high-quality educational resources
- Includes YouTube videos (preferring <10 minutes), articles, free resources
- Returns resources with descriptions and URLs
- Filters based on media preferences

#### `create_calendar_subevents(studyGuide: string, resources: string[], constraints: string, studyData?: StudyPlanData): Promise<CalendarEvent[]>`
- Creates an array of calendar events for study sessions
- Each event follows the structure:
```typescript
{
    startDate: Date,
    endDate: Date,
    title: string,
    description: string
}
```
- Considers time constraints, deadlines, and study intensity
- Spends more time on weaknesses, less on strengths
- References today's date for accurate scheduling

### Workflow Execution

The `execute_workflow` method orchestrates the three tools in sequence:
1. Creates study guide from user prompt and context
2. Finds relevant resources based on the guide
3. Generates calendar events using the guide, resources, and constraints

### Integration with Frontend

The agent integrates with `study-guide-generator.tsx`:
- Receives user constraints, strengths, weaknesses, media preferences, and study plan
- Returns multiple calendar events that are saved to the user's calendar
- Provides feedback on successful/failed event creation

### Context Understanding

#### Duration Determination
- Parses natural language like "my test is in 2 days", "exam a month from today"
- Uses current date: `new Date().toISOString().split('T')[0]`
- Creates appropriate time spans based on study intensity

#### User Context Utilization
- **Strengths/Weaknesses**: Prioritizes study time on weak areas
- **Media Preferences**: Filters resources by type (videos, diagrams, readings, summaries)
- **Study Intensity**: 
  - Light: fewer/shorter sessions
  - Balanced: moderate schedule
  - Intensive: more/longer sessions
- **Learning Style**: Adapts content delivery method

#### Resource Quality
- Focuses on up-to-date, accessible resources
- Prefers free content when possible
- Includes brief descriptions and working URLs
- Filters for preferred media types

## Usage

The agent is called via POST request to `/api/ai-agent` with:
```json
{
  "prompt": "user constraints or requirements",
  "perplexity_api_key": "api_key",
  "studyData": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "mediaPreferences": {
      "videos": true,
      "diagrams": false,
      "readings": true,
      "summaries": false
    },
    "studyPlan": {
      "intensity": "balanced",
      "learningStyle": "visual"
    }
  }
}
```

Returns an array of calendar events ready to be saved to the user's calendar.