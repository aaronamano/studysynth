from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from study_guide import router as study_guide_router

# from analyze_coverage import router as analyze_coverage_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://studysynth.vercel.app",
        "https://studysynth-aaronamanos-projects.vercel.app",
        "https://studysynth-git-main-aaronamanos-projects.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to StudySynth API"}

@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working!", "status": "success"}

app.include_router(study_guide_router)

#app.include_router(analyze_coverage_router) used for testing purposes, so uncomment if needed
