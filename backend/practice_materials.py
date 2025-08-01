from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Models for Practice Options
class PracticeOptions(BaseModel):
    includePracticeProblems: bool
    includeMockExams: bool
    difficulty: str
    quantity: int

# Models for Practice Materials Request
class PracticeMaterialsRequest(BaseModel):
    pdf_file: UploadFile = File(...)
    strengths: List[str] = []
    weaknesses: List[str] = []
    practiceOptions: PracticeOptions

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

@router.post("/practice-materials")
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