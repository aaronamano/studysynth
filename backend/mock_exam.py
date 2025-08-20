from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from io import BytesIO

load_dotenv()

app = FastAPI()

router = APIRouter()

# Models for Practice Options
class PracticeOptions(BaseModel):
    difficulty: str
    quantity: int

@router.post("/mock-exam")
async def create_practice_materials(
    pdf_file: UploadFile = File(...), # this is passed as a pdf file
    constraints: str = Form(""), # this is passed as a string
    strengths: str = Form(""), # this is passed as a string but make sure it is inputted as an array
    weaknesses: str = Form(""), # this is passed as a string but make sure it is inputted as an array
    practiceOptions: str = Form(""), # this is passed as a string but make sure it is inputted as object format
    openai_api_key: str = Form(...)
):
    try:
        # Debugging statement to see what parameters are inputted
        print("DEBUG - Received parameters:")
        print(f"pdf_file: {pdf_file.filename if pdf_file else None}")
        print(f"constraints: {constraints}")
        print(f"strengths: {strengths}")
        print(f"weaknesses: {weaknesses}")
        print(f"practiceOptions: {practiceOptions}")

        # Parse practiceOptions string to PracticeOptions model
        practice_options_obj = PracticeOptions.parse_raw(practiceOptions) if practiceOptions else PracticeOptions()

        # Parse strengths and weaknesses if they are JSON arrays
        import json
        try:
            strengths_list = json.loads(strengths) if strengths else []
        except Exception as e:
            strengths_list = []
        try:
            weaknesses_list = json.loads(weaknesses) if weaknesses else []
        except Exception as e:
            weaknesses_list = []

        # Extract text from PDF, limit to first 2 pages
        pdf_bytes = await pdf_file.read()
        reader = PdfReader(BytesIO(pdf_bytes))
        topics = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            topics += page_text

        # Build prompt string directly
        prompt = "Generate:\n"

        prompt += "# Mock Exam\n"
        prompt += f"Create a mock exam with {practice_options_obj.quantity} questions with the following requirements:\n"
        prompt += '- Format questions as "Q1.", "Q2.", etc.\n'
        prompt += '- Format answers as "A1.", "A2.", etc.\n'
        prompt += f'- Difficulty level: {practice_options_obj.difficulty}\n'
        prompt += '- Include a mix of question types (multiple choice, short answer, etc.)\n'
        if weaknesses_list:
            prompt += f'- Ensure at least 60% of questions focus on: {", ".join(weaknesses_list)}\n'
        if constraints:
            prompt += f'- Additional constraints: {constraints}\n'

        prompt += f"Topics to cover:\n{topics if topics else 'None'}\n"
        prompt += "Student Profile:\n"
        prompt += f"- Strengths: {', '.join(str(strength) for strength in strengths_list) if strengths_list else 'None'}\n"
        prompt += f"- Areas needing improvement: {', '.join(str(weakness) for weakness in weaknesses_list) if weaknesses_list else 'None'}\n"
        prompt += "At the end, provide an answer key for all questions generated above.\n"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {openai_api_key}',
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
        mock_exam = data.get("choices", [{}])[0].get("message", {}).get("content")

        if not mock_exam:
            raise HTTPException(status_code=500, detail="No content received from OpenAI")

        return {"mockExam": mock_exam}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mock exam: {e}")

app.include_router(router)
