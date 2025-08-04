from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import httpx
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from io import BytesIO

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Models for Practice Options
class PracticeOptions(BaseModel):
    includePracticeProblems: bool = True
    includeMockExams: bool
    difficulty: str = "mixed"
    quantity: int = 10

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

@router.post("/practice-materials")
async def create_practice_materials(
    pdf_file: UploadFile = File(...),
    constraints: str = Form(""),
    strengths: List[str] = None,
    weaknesses: List[str] = None,
    practiceOptions: str = Form("")
):
    try:
        # Parse practiceOptions string to PracticeOptions model
        practice_options_obj = PracticeOptions.parse_raw(practiceOptions) if practiceOptions else PracticeOptions()

        # Extract text from PDF, limit to first 2 pages
        pdf_bytes = await pdf_file.read()
        reader = PdfReader(BytesIO(pdf_bytes))
        topics = ""
        for i, page in enumerate(reader.pages):
            if i >= 2:
                break
            page_text = page.extract_text() or ""
            topics += page_text

        # Build prompt string directly
        prompt = "Generate:\n"

        if practice_options_obj.includePracticeProblems:
            prompt += "# Practice Problems\n"
            prompt += f"Generate {practice_options_obj.quantity} practice problems with the following requirements:\n"
            prompt += '- Format each problem starting with "Q1.", "Q2.", etc.\n'
            prompt += '- Format each answer starting with "A1.", "A2.", etc.\n'
            prompt += f'- Difficulty level: {practice_options_obj.difficulty}\n'
            if weaknesses:
                prompt += f'- Focus on weak areas: {", ".join(weaknesses)}\n'

        if practice_options_obj.includeMockExams:
            prompt += "# Mock Exam\n"
            prompt += "Create a mock exam with the following requirements:\n"
            prompt += '- Format questions as "Q1.", "Q2.", etc.\n'
            prompt += '- Format answers as "A1.", "A2.", etc.\n'
            prompt += f'- Difficulty level: {practice_options_obj.difficulty}\n'
            prompt += '- Include a mix of question types\n'
            if weaknesses:
                prompt += f'- Ensure 60% of questions focus on: {", ".join(weaknesses)}\n'

        prompt += f"Topics to cover:\n{topics if topics else 'None'}\n"
        prompt += "Student Profile:\n"
        prompt += f"- Strengths: {', '.join(strengths) if strengths else 'None'}\n"
        prompt += f"- Areas needing improvement: {', '.join(weaknesses) if weaknesses else 'None'}\n"

        async with httpx.AsyncClient(timeout=30.0) as client:
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