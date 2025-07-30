make sure to `git clone <URL>` this repository first then follow the steps below:

## Frontend setup
1. create a `.env` file under `studysynth\`
2. in the `.env` file add `PERPLEXITY_API_KEY=""` and `OPENAI_API_KEY=""`
3. in the terminal under `studysynth\`, run `pnpm install`
4. then in the terminal under `studysynth\` run `pnpm run dev`

## Backend setup
1. `cd backend` and create a virtual environment by running `python3 -m venv venv`
2. run `source .venv/bin/activate` then run `pip install -r requirements.txt`
3. run `uvicorn main:app --reload`
4. to leave environment type `deactivate`