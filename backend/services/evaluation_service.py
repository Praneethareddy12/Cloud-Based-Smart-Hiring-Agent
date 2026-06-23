import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from score import evaluate_resume_pipeline

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "evaluations.db"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT,
    overall_score REAL,
    scores_json TEXT,
    bonus_points REAL,
    strengths_json TEXT,
    improvements_json TEXT,
    github_json TEXT,
    projects_json TEXT,
    timestamp TEXT
)
"""


def ensure_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(CREATE_TABLE_SQL)
    conn.commit()
    conn.close()


def save_evaluation(
    candidate_name: str,
    overall_score: float,
    scores: Dict[str, float],
    bonus_points: float,
    strengths: list,
    improvements: list,
    github: dict,
    projects: list,
):
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO evaluations (candidate_name, overall_score, scores_json, bonus_points, strengths_json, improvements_json, github_json, projects_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            candidate_name,
            overall_score,
            json.dumps(scores, ensure_ascii=False),
            bonus_points,
            json.dumps(strengths, ensure_ascii=False),
            json.dumps(improvements, ensure_ascii=False),
            json.dumps(github, ensure_ascii=False),
            json.dumps(projects, ensure_ascii=False),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def get_history(limit: int = 20):
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, candidate_name, overall_score, timestamp FROM evaluations ORDER BY id DESC LIMIT ?",
        (limit,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row[0],
            "candidate_name": row[1],
            "overall_score": row[2],
            "timestamp": row[3],
        }
        for row in rows
    ]


def evaluate_resume(pdf_path: str) -> Dict[str, Any]:
    score, resume_data, github_data = evaluate_resume_pipeline(pdf_path)
    if score is None:
        raise ValueError("Failed to parse or evaluate resume PDF")

    overall_score = sum(
        min(getattr(score.scores, key).score, getattr(score.scores, key).max)
        for key in ["open_source", "self_projects", "production", "technical_skills"]
    )
    overall_score += score.bonus_points.total
    if hasattr(score, "deductions") and score.deductions:
        overall_score -= score.deductions.total
    # Cap overall score to 100 to enforce a 0-100 maximum
    overall_score = max(0.0, min(overall_score, 100.0))

    candidate_name = (
        resume_data.basics.name
        if resume_data and resume_data.basics and resume_data.basics.name
        else Path(pdf_path).stem
    )

    result = {
        "candidate_name": candidate_name,
        "overall_score": overall_score,
        "scores": {
            "open_source": score.scores.open_source.score,
            "self_projects": score.scores.self_projects.score,
            "production": score.scores.production.score,
            "technical_skills": score.scores.technical_skills.score,
        },
        "bonus_points": score.bonus_points.total,
        "strengths": score.key_strengths,
        "improvements": score.areas_for_improvement,
        "github": {
            "username": github_data.get("profile", {}).get("username") if github_data else None,
            "repositories": github_data.get("total_projects", 0) if github_data else 0,
            "profile": github_data.get("profile", {}),
        },
        "projects": github_data.get("projects", []) if github_data else [],
    }

    save_evaluation(
        candidate_name=candidate_name,
        overall_score=overall_score,
        scores=result["scores"],
        bonus_points=score.bonus_points.total,
        strengths=score.key_strengths,
        improvements=score.areas_for_improvement,
        github=result["github"],
        projects=result["projects"],
    )

    return result
