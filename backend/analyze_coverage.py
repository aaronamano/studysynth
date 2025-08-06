from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from PyPDF2 import PdfReader
from io import BytesIO
import numpy as np
from sentence_transformers import SentenceTransformer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

class StudyPlan(BaseModel):
    intensity: str
    learningStyle: str

class MediaPreferences(BaseModel):
    videos: bool = True
    diagrams: bool = False
    readings: bool = True
    summaries: bool = False

class StudyGuideRequest(BaseModel):
    pdf_file: UploadFile = File(...)
    constraints: str = ""
    strengths: List[str] = []
    weaknesses: List[str] = []
    mediaPreferences: MediaPreferences = None
    studyPlan: StudyPlan = None

@router.post("/analyze-coverage")
async def analyze_coverage(study_guide_request: StudyGuideRequest, study_guide_response: str):
    # ...existing code from main.py for analyze coverage route...
    try:
        pdf_file = study_guide_request.pdf_file
        pdf_bytes = await pdf_file.read()
        reader = PdfReader(BytesIO(pdf_bytes))
        pdf_text = ""
        for page in reader.pages:
            pdf_text += page.extract_text() or ""

        request_text = pdf_text
        if study_guide_request.constraints:
            request_text += "\n" + study_guide_request.constraints
        if study_guide_request.strengths:
            request_text += "\nStrengths: " + ", ".join(study_guide_request.strengths)
        if study_guide_request.weaknesses:
            request_text += "\nWeaknesses: " + ", ".join(study_guide_request.weaknesses)
        if study_guide_request.studyPlan:
            request_text += f"\nIntensity: {study_guide_request.studyPlan.intensity}, Learning Style: {study_guide_request.studyPlan.learningStyle}"

        model = SentenceTransformer('all-MiniLM-L6-v2')
        study_guide_request_embedding = model.encode(request_text)
        study_guide_response_embedding = model.encode(study_guide_response)

        similarity_score = float(np.dot(study_guide_request_embedding, study_guide_response_embedding) / (
            np.linalg.norm(study_guide_request_embedding) * np.linalg.norm(study_guide_response_embedding)
        ) * 100)

        return {
            "similarity": round(similarity_score, 2),
        }

    except Exception as e:
        return {"error": str(e)}

app.include_router(router)
