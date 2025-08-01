from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from io import BytesIO

load_dotenv()

router = APIRouter()

# Models for Study Guide Endpoint
class MediaPreferences(BaseModel):
    videos: bool
    flashcards: bool
    diagrams: bool
    readings: bool
    summaries: bool

# Models for Study Plan Request
class StudyPlan(BaseModel):
    intensity: str
    learningStyle: str

# Models for Study Guide Request
class StudyGuideRequest(BaseModel):
    pdf_file: UploadFile = File(...)
    constraints: str = ""
    strengths: List[str] = []
    weaknesses: List[str] = []
    mediaPreferences: MediaPreferences = None
    studyPlan: StudyPlan = None

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

@router.post("/study-guide")
async def create_study_guide(request: StudyGuideRequest):
    pdf_file = request.pdf_file
    constraints = request.constraints
    strengths = request.strengths
    weaknesses = request.weaknesses
    mediaPreferences = request.mediaPreferences or MediaPreferences()
    studyPlan = request.studyPlan or StudyPlan(intensity="medium", learningStyle="visual")
    try:
        # Extract text from PDF
        pdf_bytes = await pdf_file.read()
        reader = PdfReader(BytesIO(pdf_bytes))
        topics = ""
        for page in reader.pages:
            topics += page.extract_text() or ""

        media_preferences = "\n".join(
            [f"- {key.capitalize()}" for key, value in mediaPreferences.dict().items() if value]
        )

        prompt = f"""Generate a detailed study guide for the following topics:
{topics}

Additional Context:
{constraints}

Parameters:
- Strengths: {", ".join(strengths)}
- Areas for improvement: {", ".join(weaknesses)}
- Study Intensity: {studyPlan.intensity}
- Learning Style: {studyPlan.learningStyle}

Preferred Learning Materials:
{media_preferences}

Requirements for resources:
- Include relevant hyperlinks using markdown format [text](url)
- For each section, provide at least 2-3 high-quality external resources
- Prioritize official documentation and reputable educational platforms
- If suggesting videos, include direct links to specific tutorials
- Include links to relevant documentation, guides, and reference materials

Format the response as a markdown document with clear sections and headers."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://api.perplexity.ai/chat/completions',
                headers={
                    'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
                    'Content-Type': 'application/json'
                },
                json={
                    "model": "sonar-pro",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a professional study guide creator. Generate detailed, well-structured study guides in markdown format. Always include relevant hyperlinks to high-quality resources, official documentation, tutorials, and practice materials. Use markdown link format [text](url) for all references."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                }
            )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Perplexity API request failed")

        data = response.json()
        study_guide = data.get("choices", [{}])[0].get("message", {}).get("content")

        if not study_guide:
            raise HTTPException(status_code=500, detail="No content received from Perplexity")

        return {"studyGuide": study_guide}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate study guide: {e}")