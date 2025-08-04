from fastapi import FastAPI
from study_guide import router as study_guide_router
from practice_materials import router as practice_materials_router
from analyze_coverage import router as analyze_coverage_router

app = FastAPI()

app.include_router(study_guide_router)
app.include_router(practice_materials_router)
app.include_router(analyze_coverage_router)