from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from io import BytesIO
import json

load_dotenv()

app = FastAPI()

router = APIRouter()

# Models for media preferences
class MediaPreferences(BaseModel):
    videos: bool
    diagrams: bool
    readings: bool
    summaries: bool

# Models for study plan
class StudyPlan(BaseModel):
    intensity: str
    learningStyle: str

@router.post("/study-guide")
async def create_study_guide(
    pdf_file: UploadFile = File(...), # this is passed as a pdf file
    constraints: str = Form(""), # this is passed as a string
    strengths: str = Form(""), # this is passed as a string but make sure it is inputted as an array
    weaknesses: str = Form(""), # this is passed as a string but make sure it is inputted as an array
    mediaPreferences: str = Form(""), # this is passed as a string but make sure it is inputted as object format
    studyPlan: str = Form("") # this is passed as a string but make sure it is inputted as object format
):
    try:

        # Parse mediaPreferences and studyPlan from strings to models
        media_preferences_obj = MediaPreferences.parse_raw(mediaPreferences) if mediaPreferences else MediaPreferences()
        study_plan_obj = StudyPlan.parse_raw(studyPlan) if studyPlan else StudyPlan()

        # Extract text from PDF, limit to first 2 pages
        pdf_bytes = await pdf_file.read()
        reader = PdfReader(BytesIO(pdf_bytes))
        topics = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            topics += page_text

        prompt = f"""Generate a detailed study guide for the following topics:
{topics}

Additional Context:
{constraints}

Parameters:
- Strengths: {', '.join(strengths) if strengths else 'None'}
- Areas for improvement: {', '.join(weaknesses) if weaknesses else 'None'}
- Study Intensity: {study_plan_obj.intensity}
- Learning Style: {study_plan_obj.learningStyle}

Preferred Learning Materials:
{json.dumps(media_preferences_obj.dict(), indent=2)}

Requirements for resources:
- Include relevant hyperlinks using markdown format [text](url)
- For each section, provide at least 2-3 high-quality external resources
- Prioritize official documentation and reputable educational platforms
- If suggesting videos, include direct links to specific tutorials
- Include links to relevant documentation, guides, and reference materials

Format the response as a markdown document with clear sections and headers."""

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                'https://api.perplexity.ai/chat/completions',
                headers={
                    'Authorization': f'Bearer {os.getenv("PERPLEXITY_API_KEY")}',
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

app.include_router(router)