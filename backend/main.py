from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from study_guide import router as study_guide_router
from practice_problems import router as practice_materials_router
from analyze_coverage import router as analyze_coverage_router
from mock_exam import router as mock_exam_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://studysynth.vercel.app/"  # Replace with your actual Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to StudySynth API"}

app.include_router(study_guide_router)
app.include_router(practice_materials_router)
app.include_router(analyze_coverage_router)
app.include_router(mock_exam_router)