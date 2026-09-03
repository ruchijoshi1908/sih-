from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models import Recommendation, EmployerValidation, CurriculumVersion, Course
from backend.schemas.analysis import RecommendationOut, EmployerValidationCreate, EmployerValidationOut

router = APIRouter(prefix="/api/employer", tags=["Employer Validation Portal"])

@router.get("/recommendations", response_model=List[RecommendationOut])
def get_employer_recommendations_queue(
    status_filter: Optional[str] = "all",
    db: Session = Depends(get_db)
):
    """
    Retrieve recommendations for employers to review and validate.
    """
    query = db.query(Recommendation)
    if status_filter and status_filter != "all":
        query = query.filter(Recommendation.status == status_filter)
        
    recs = query.order_by(Recommendation.created_at.desc()).all()
    return recs

@router.post("/recommendations/{recommendation_id}/validate", response_model=EmployerValidationOut)
def validate_recommendation(
    recommendation_id: int,
    payload: EmployerValidationCreate,
    db: Session = Depends(get_db)
):
    """
    Employer records decision: APPROVE, REJECT, or PARTIAL with optional comments.
    """
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    decision_lower = payload.decision.lower()
    if decision_lower not in ["approved", "rejected", "partial"]:
        raise HTTPException(status_code=400, detail="Decision must be 'approved', 'rejected', or 'partial'.")

    # Update recommendation status
    rec.status = decision_lower

    # Save validation audit entry
    validation = EmployerValidation(
        recommendation_id=rec.id,
        employer_name=payload.employer_name,
        employer_company=payload.employer_company,
        decision=decision_lower,
        comments=payload.comments
    )
    db.add(validation)
    db.commit()
    db.refresh(validation)

    return validation
