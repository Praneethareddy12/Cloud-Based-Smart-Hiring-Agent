from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class EvaluationResult(BaseModel):
    candidate_name: str
    overall_score: float
    scores: Dict[str, float]
    bonus_points: float
    strengths: List[str]
    improvements: List[str]
    github: Dict[str, Any]
    projects: List[Dict[str, Any]]
    timestamp: datetime


class EvaluationHistoryItem(BaseModel):
    id: int
    candidate_name: str
    overall_score: float
    timestamp: datetime


class EvaluationResponse(BaseModel):
    candidate_name: str
    overall_score: float
    scores: Dict[str, float]
    bonus_points: float
    strengths: List[str]
    improvements: List[str]
    github: Dict[str, Any]
    projects: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None
