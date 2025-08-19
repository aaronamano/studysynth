make sure to `git clone <URL>` this repository first then follow the steps below:

## Frontend setup
1. create a `.env` file under `studysynth\`
2. in the `.env` file add `PERPLEXITY_API_KEY=""` and `OPENAI_API_KEY=""`
3. in the terminal under `studysynth\frontend\`, run `pnpm install`
4. then in the terminal under `studysynth\frontend\` run `pnpm run dev`

## Backend setup
1. create a virtual environment in `studysynth\backend` by running `python3 -m venv venv`
2. run `source venv/bin/activate` then run `pip install -r requirements.txt`
3. run `fastapi dev main.py`
4. go to `http://127.0.0.1:8000/docs` to test the routes
5. press CTRL + C to quit
6. to leave environment type `deactivate`

## Docker
this is to deploy the backend
1. run `docker build -t studysynth-backend .`
2. run `docker run -p 8000:8000 --env-file .env studysynth-backend`

## API Routes
- POST /study-guide
- POST /mock-exam
- POST /practice-problems
- POST /analyze-coverage

## Routes
- `/`: default route for studysynth. this is the main page where users interact with the core features
- `/about`: about page which talks about studysynth
- `/login`: login page for users to login
- `/signup`: signup page for users to create an account
- `/reset`: page for users to reset their own password
- `/account`: page where user can manage their own account by inputting perplexity and openai api keys

## Components
### Features
- `media-preferences.tsx`: selects what study materials they'd like to use
- `study-plan-adjuster.tsx`: adjusts the intensity and learning style of the user's study plan
- `topic-input.tsx`: inputs the user's strengths and weaknesses
- `topic-pdf-import.tsx`: imports a pdf file that covers the main concepts to study for
### Displays
- `mock-exam-display.tsx`: renders mock exam content from the `POST /mock-exam` api response
- `practice-problems-display.tsx`: renders practice problems content from the `POST /practice-problems` api response
- `study-guide-display.tsx`: renders study guide content from the `POST /study-guide` api response
### Generators
- `mock-exam-generator.tsx`: calls the `POST /mock-exam` api route
- `practice-problems-generator.tsx`: calls the `POST /practice-problems` api route
- `study-guide-generator.tsx`: calls the `POST /study-guide` api route

## Account Schema
this is the account schema used for mongodb
```typescript
{
    _id: ObjectId(),
    name: string, // e.g. Tim Cheese
    password: string // doesn't show actual password but encrypted version of it
    perplexityKey: string = "" // not actual key but encrypted version; initally empty string cuz no key registered yet
    openaiKey: string = "" // not actual key but encrypted version; initally empty string cuz no key registered yet

}
```

