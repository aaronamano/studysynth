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

Returns an array of calendar events ready to be saved to the user's calendar with automatic Google Calendar sync when connected.

## Google Calendar Integration

The agent automatically attempts to sync generated events to Google Calendar when:

1. **User has connected their Google Calendar account** through the Google Calendar Integration component
2. **Sync is enabled** (automatically set to true for agent-generated events)
3. **Valid OAuth tokens** are available

### Sync Behavior:
- Events are saved to local database first
- If Google Calendar is connected, events are automatically pushed to Google Calendar
- Users receive feedback on how many events were synced to Google Calendar
- Failed sync doesn't prevent local event creation
- Events include full study guide information and resources in descriptions

### Error Handling:
- Google Calendar sync failures are logged but don't stop event creation
- Users get notified of both successful local saves and Google Calendar sync status
- Graceful degradation when Google Calendar is not connected

## API Routes
- `/account/keys`: GET, POST
- `/study-guide`: POST
  
- `/calendar/events`: GET, POST, PUT, DELETE
  
- `/history`: GET, POST
  
- `/auth`:
  - `/auth/login`: POST
  - `/auth/reset`: POST
  - `/auth/signup`: POST
  - `/auth/user`: POST
  
- `/ai-agent`: POST

## Routes
- `/`: default route for studysynth. this is the main page where users interact with the core features
- `/about`: about page which talks about studysynth
- `/account`: page where user can manage their own account by inputting perplexity api key
- `/login`: login page for users to login
- `/reset`: page for users to reset their own password
- `/signup`: signup page for users to create an account
- `/history`: study guides the user has saved

## Components
### Input Features
- `media-preferences.tsx`: selects what study materials they'd like to use
- `study-plan-adjuster.tsx`: adjusts the intensity and learning style of the user's study plan
- `topic-input.tsx`: inputs the user's strengths and weaknesses
- `topic-pdf-import.tsx`: imports a pdf file that covers the main concepts to study for
### Study Guide Feature
- `study-guide-display.tsx`: this is where the LLM response is rendered from `POST /api/study-guide`
- `study-guide-generator.tsx`: this is where the users prompts the Perplexity LLM and calls `POST /api/study-guide` 
### Calendar Feature
- `calendar-view.tsx`: calendar feature for users to manually schedule study plans and interact with them

## Database Schema
**Make sure to DM me so I can share the MongoDB URL and database with you**
### Account collection schema
```typescript
{
    _id: ObjectId(),
    name: String, // e.g. Tim Cheese
    password: String, // doesn't show actual password but encrypted version of it
    perplexityKey: String = "", // not actual key but encrypted version; initally empty string cuz no key registered yet

}
```
### History collection schema
```typescript
{
    _id: ObjectId(),
    profileId: ObjectId(), // get the id of an existing user
    response: String | {} // usually return the API response in json or a string
}
```
### Calendar Event collection schema
```typescript
{
    _id: ObjectId(),
    userId: ObjectId(), // user's id
    startDate: Date(), // start date
    endDate: Date(), // end date
    title: String | "",
    description: String | ""
}
```