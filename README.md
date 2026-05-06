# About
[StudySynth](https://studysynth.vercel.app) is an agentic fullstack tool that generates user-tailored study plans and an outline that integrates with your Google Docs and Google Calendar

# Setup
1. run these commmands in order:
    ```bash
    git clone https://github.com/aaronamano/studysynth
    cd studysynth
    pnpm install
    ```
2. create a `.env` file under the root directory with these variables:
    ```text
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_REDIRECT_URI=
    GEMINI_API_KEY=
    ```
    *you can also refer to `.env.example`*
3. run the app:
    ```
    pnpm run dev
    ```
4. click on `http://localhost:3000`
