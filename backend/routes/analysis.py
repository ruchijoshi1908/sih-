from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models import Course, Skill, Recommendation, DriftScore
from backend.schemas.analysis import EvidenceOut, RecommendationOut
from backend.services.evidence_engine import get_skill_evidence_for_course

router = APIRouter(prefix="/api/analysis", tags=["Analysis & Evidence"])

@router.get("/evidence", response_model=EvidenceOut)
def get_evidence_for_skill(
    skill: str = Query(..., description="Canonical name of the skill (e.g. SQL, Generative AI)"),
    role_category: str = Query("Data Science", description="Target role category (e.g. Data Science, Web Development)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real job postings and market demand evidence backing why a skill is recommended.
    """
    evidence = get_skill_evidence_for_course(db, skill_name=skill, role_category=role_category, limit=5)
    return evidence

@router.get("/recommendations/{recommendation_id}", response_model=RecommendationOut)
def get_recommendation_detail(recommendation_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single recommendation."""
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return rec
