## Setup
- under `studysynth\`, run `pnpm install`
- then run `pnpm run dev` and click on `http://localhost:3000`

## API Routes
`/account/keys`
- GET, POST
  
`/study-guide`
- POST
  
`/calendar/events`
- GET, POST, PUT, DELETE
  
`/history`
- GET, POST
  
`/auth`
- POST `/auth/login`
- POST `/auth/reset`
- POST `/auth/signup`
- GET `/auth/user`
  
`/ai-agent`
- POST `/ai-agent`

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
    name: string, // e.g. Tim Cheese
    password: string, // doesn't show actual password but encrypted version of it
    perplexityKey: string = "", // not actual key but encrypted version; initally empty string cuz no key registered yet

}
```
### History collection schema
```typescript
{
    _id: ObjectId(),
    profileId: ObjectId(), // get the id of an existing user
    response: string | {} // usually return the API response in json or a string
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

