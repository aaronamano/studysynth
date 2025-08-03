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