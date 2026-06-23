import os
import shutil
import tempfile
from typing import Any

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from backend.schemas.evaluation import EvaluationResponse
from backend.services.evaluation_service import evaluate_resume, get_history

router = APIRouter()


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_resume_route(resume: UploadFile = File(...)):
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    temp_dir = tempfile.mkdtemp()
    resume_path = os.path.join(temp_dir, resume.filename)

    try:
        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        result = evaluate_resume(resume_path)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to evaluate resume.")

        return JSONResponse(status_code=200, content=result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Evaluation error: {exc}")
    finally:
        resume.file.close()
        shutil.rmtree(temp_dir, ignore_errors=True)


@router.get("/history")
def history_route(limit: int = 20):
    return {"history": get_history(limit)}
