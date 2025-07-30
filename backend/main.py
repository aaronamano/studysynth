from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Models for Practice Materials Endpoint
class PracticeOptions(BaseModel):
    includePracticeProblems: bool
    includeMockExams: bool
    difficulty: str
    quantity: int

class PracticeMaterialsRequest(BaseModel):
    topics: str
    strengths: Optional[List[str]] = Field(default_factory=list)
    weaknesses: Optional[List[str]] = Field(default_factory=list)
    practiceOptions: PracticeOptions

# Models for Study Guide Endpoint
class MediaPreferences(BaseModel):
    videos: bool
    flashcards: bool
    diagrams: bool
    readings: bool
    summaries: bool

class StudyPlan(BaseModel):
    intensity: str
    learningStyle: str

class StudyGuideRequest(BaseModel):
    topics: str
    constraints: str
    strengths: List[str]
    weaknesses: List[str]
    mediaPreferences: MediaPreferences
    studyPlan: StudyPlan

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

@app.post("/api/practice-materials")
async def create_practice_materials(request: PracticeMaterialsRequest):
    try:
        prompt = f"""Generate:
{f'# Practice Problems' if request.practiceOptions.includePracticeProblems else ''}
{f'Generate {request.practiceOptions.quantity} practice problems with the following requirements:' if request.practiceOptions.includePracticeProblems else ''}
{f'- Format each problem starting with "Q1.", "Q2.", etc.' if request.practiceOptions.includePracticeProblems else ''}
{f'- Format each answer starting with "A1.", "A2.", etc.' if request.practiceOptions.includePracticeProblems else ''}
{f'- Difficulty level: {request.practiceOptions.difficulty}' if request.practiceProblems.includePracticeProblems else ''}
{f'- Focus on weak areas: {", ".join(request.weaknesses)}' if request.practiceOptions.includePracticeProblems and request.weaknesses else ''}

{f'# Mock Exam' if request.practiceOptions.includeMockExams else ''}
{f'Create a mock exam with the following requirements:' if request.practiceOptions.includeMockExams else ''}
{f'- Format questions as "Q1.", "Q2.", etc.' if request.practiceOptions.includeMockExams else ''}
{f'- Format answers as "A1.", "A2.", etc.' if request.practiceOptions.includeMockExams else ''}
{f'- Difficulty level: {request.practiceOptions.difficulty}' if request.practiceOptions.includeMockExams else ''}
{f'- Include a mix of question types' if request.practiceOptions.includeMockExams else ''}
{f'- Ensure 60% of questions focus on: {", ".join(request.weaknesses)}' if request.practiceOptions.includeMockExams and request.weaknesses else ''}

Topics to cover:
{request.topics}

Student Profile:
- Strengths: {", ".join(request.strengths) if request.strengths else 'None'}
- Areas needing improvement: {", ".join(request.weaknesses) if request.weaknesses else 'None'}
"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json'
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert at creating educational practice materials and mock exams. Generate clear, well-structured content with detailed solutions."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                }
            )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="OpenAI API request failed")

        data = response.json()
        practice_materials = data.get("choices", [{}])[0].get("message", {}).get("content")

        if not practice_materials:
            raise HTTPException(status_code=500, detail="No content received from OpenAI")

        return {"practiceMaterials": practice_materials}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate practice materials: {e}")

@app.post("/api/study-guide")
async def create_study_guide(request: StudyGuideRequest):
    try:
        media_preferences = "\n".join(
            [f"- {key.capitalize()}" for key, value in request.mediaPreferences.dict().items() if value]
        )

        prompt = f"""Generate a detailed study guide for the following topics:
{request.topics}

Additional Context:
{request.constraints}

Parameters:
- Strengths: {", ".join(request.strengths)}
- Areas for improvement: {", ".join(request.weaknesses)}
- Study Intensity: {request.studyPlan.intensity}
- Learning Style: {request.studyPlan.learningStyle}

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