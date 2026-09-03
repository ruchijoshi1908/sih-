from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models import Course, CurriculumVersion, PlacementOutcome
from backend.schemas.placement import (
    PlacementOutcomeCreate,
    PlacementOutcomeOut,
    PlacementComparisonOut
)

router = APIRouter(prefix="/api/placements", tags=["Placement Outcomes & ROI"])

@router.post("", response_model=PlacementOutcomeOut, status_code=status.HTTP_201_CREATED)
def record_placement_outcome(payload: PlacementOutcomeCreate, db: Session = Depends(get_db)):
    """
    Enter placement results for a specific course and curriculum version.
    """
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    version = db.query(CurriculumVersion).filter(CurriculumVersion.id == payload.curriculum_version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Curriculum version not found")

    if payload.students_enrolled <= 0:
        raise HTTPException(status_code=400, detail="Students enrolled must be greater than 0.")

    rate = round((payload.students_placed / payload.students_enrolled) * 100, 1)

    outcome = PlacementOutcome(
        course_id=course.id,
        curriculum_version_id=version.id,
        batch_name=payload.batch_name,
        students_enrolled=payload.students_enrolled,
        students_placed=payload.students_placed,
        placement_rate=rate,
        average_salary_lpa=payload.average_salary_lpa or 0.0,
        top_hiring_companies=payload.top_hiring_companies
    )
    db.add(outcome)
    db.commit()
    db.refresh(outcome)

    return PlacementOutcomeOut(
        id=outcome.id,
        course_id=outcome.course_id,
        curriculum_version_id=outcome.curriculum_version_id,
        version_number=version.version_number,
        batch_name=outcome.batch_name,
        students_enrolled=outcome.students_enrolled,
        students_placed=outcome.students_placed,
        placement_rate=outcome.placement_rate,
        average_salary_lpa=outcome.average_salary_lpa,
        top_hiring_companies=outcome.top_hiring_companies,
        reporting_date=outcome.reporting_date
    )

@router.get("/course/{course_id}/outcomes", response_model=PlacementComparisonOut)
def get_placement_outcomes_comparison(course_id: int, db: Session = Depends(get_db)):
    """
    Compare placement performance across curriculum versions (Before vs After feedback loop).
    Calculates percentage point gain and relative improvement.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    placements = db.query(PlacementOutcome).filter(
        PlacementOutcome.course_id == course_id
    ).order_by(PlacementOutcome.reporting_date.asc()).all()

    history_out = []
    for p in placements:
        ver = db.query(CurriculumVersion).filter(CurriculumVersion.id == p.curriculum_version_id).first()
        history_out.append(PlacementOutcomeOut(
            id=p.id,
            course_id=p.course_id,
            curriculum_version_id=p.curriculum_version_id,
            version_number=ver.version_number if ver else "1.0",
            batch_name=p.batch_name,
            students_enrolled=p.students_enrolled,
            students_placed=p.students_placed,
            placement_rate=p.placement_rate,
            average_salary_lpa=p.average_salary_lpa,
            top_hiring_companies=p.top_hiring_companies,
            reporting_date=p.reporting_date
        ))

    if len(history_out) < 2:
        return PlacementComparisonOut(
            course_id=course.id,
            course_name=course.name,
            has_comparison=False,
            version_1_rate=history_out[0].placement_rate if len(history_out) == 1 else None,
            history=history_out
        )

    # Compare earliest vs latest version
    v1_item = history_out[0]
    v2_item = history_out[-1]
    
    pp_diff = round(v2_item.placement_rate - v1_item.placement_rate, 1)
    relative_pct = round(((v2_item.placement_rate - v1_item.placement_rate) / max(v1_item.placement_rate, 1)) * 100, 1)
    salary_diff = round(v2_item.average_salary_lpa - v1_item.average_salary_lpa, 1)

    return PlacementComparisonOut(
        course_id=course.id,
        course_name=course.name,
        has_comparison=True,
        version_1_rate=v1_item.placement_rate,
        version_2_rate=v2_item.placement_rate,
        percentage_points_change=pp_diff,
        relative_growth_pct=relative_pct,
        salary_change_lpa=salary_diff,
        history=history_out
    )
