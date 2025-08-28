# Setup
## Frontend
- under `studysynth\frontend\`, run `pnpm install` then `pnpm run dev`
## Backend
- create a virtual environment under `studysynth\backend\` by running `python3 -m venv venv`
- run `source venv/bin/activate` then run `pip install -r requirements.txt`

# Testing the API Routes
## OG way
1. make sure you're under `studysynth\backend\` and that you're in a virtual environment by running `source venv/bin/activate`
2. run `fastapi dev main.py`
3. go to `http://127.0.0.1:8000/docs` to test the routes
3. press CTRL + C to quit in the terminal
4. to leave environment type `deactivate`
## Docker alternative
1. run `docker build -t studysynth .`
2. then run `docker run -p 8000:8000 studysynth`

make sure to run this command in `Dockerfile`:
```
CMD ["fastapi", "dev", "main.py", "--host", "127.0.0.1", "--port", "8000:8000"]
```
3. go to `http://127.0.0.1:8000/docs`

## API Routes
- POST `/study-guide`
- POST `/mock-exam`
- POST `/practice-problems`
- POST `/analyze-coverage`

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
    password: string, // doesn't show actual password but encrypted version of it
    perplexityKey: string = "", // not actual key but encrypted version; initally empty string cuz no key registered yet
    openaiKey: string = "" // not actual key but encrypted version; initally empty string cuz no key registered yet

}
```

