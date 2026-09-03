from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.session import get_db
from backend.models.job import JobPosting, JobSkill
from backend.models.skill import Skill
from backend.schemas.job import JobPostingOut, JobPostingCreate, JobStatsOut
from backend.services.skill_normalizer import (
    normalize_skill_name,
    get_skill_category,
    extract_known_skills_from_text
)
from backend.services.ai_agent import AIServiceAgent

router = APIRouter(prefix="/api/jobs", tags=["Job Market Intelligence"])

@router.get("", response_model=List[JobPostingOut])
def get_job_postings(
    role: Optional[str] = Query(None, description="Filter by role category (e.g. Data Science, Web Development)"),
    search: Optional[str] = Query(None, description="Search keyword in title or company"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve job market postings with required skills."""
    query = db.query(JobPosting)
    
    if role and role != "All":
        query = query.filter(JobPosting.role_category.ilike(f"%{role}%"))
    if search:
        query = query.filter(
            (JobPosting.title.ilike(f"%{search}%")) |
            (JobPosting.company.ilike(f"%{search}%")) |
            (JobPosting.description.ilike(f"%{search}%"))
        )
        
    postings = query.order_by(JobPosting.created_at.desc()).limit(limit).all()
    
    results = []
    for p in postings:
        skills = [js.skill.name for js in p.job_skills]
        results.append(JobPostingOut(
            id=p.id,
            title=p.title,
            company=p.company,
            location=p.location,
            role_category=p.role_category,
            experience_required=p.experience_required,
            description=p.description,
            source=p.source,
            date_posted=p.date_posted,
            created_at=p.created_at,
            skills=skills
        ))
    return results

@router.post("", response_model=JobPostingOut, status_code=status.HTTP_201_CREATED)
def create_job_posting(payload: JobPostingCreate, db: Session = Depends(get_db)):
    """Add a new job posting to the labour market intelligence database and extract skills."""
    job = JobPosting(
        title=payload.title,
        company=payload.company,
        location=payload.location,
        role_category=payload.role_category,
        experience_required=payload.experience_required,
        description=payload.description,
        source=payload.source or "Manual / n8n Webhook",
        date_posted=payload.date_posted
    )
    db.add(job)
    db.flush()

    # Extract skills automatically if none passed, or combine
    passed_skills = payload.required_skills or []
    extracted_skills = AIServiceAgent.extract_skills_from_text(payload.description, context_type="job")
    combined_skills = set([normalize_skill_name(s) for s in passed_skills]) | set(extracted_skills)

    for s_name in combined_skills:
        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if not skill:
            skill = Skill(name=s_name, normalized_name=s_name.lower(), category=get_skill_category(s_name))
            db.add(skill)
            db.flush()
        js = JobSkill(job_posting_id=job.id, skill_id=skill.id)
        db.add(js)

    db.commit()
    db.refresh(job)

    return JobPostingOut(
        id=job.id,
        title=job.title,
        company=job.company,
        location=job.location,
        role_category=job.role_category,
        experience_required=job.experience_required,
        description=job.description,
        source=job.source,
        date_posted=job.date_posted,
        created_at=job.created_at,
        skills=list(combined_skills)
    )

@router.get("/stats", response_model=JobStatsOut)
def get_job_market_stats(db: Session = Depends(get_db)):
    """Get aggregated statistics on job counts, role categories, and top demanded skills."""
    total_jobs = db.query(JobPosting).count()
    
    # Counts by category
    categories = db.query(JobPosting.role_category, func.count(JobPosting.id)).group_by(JobPosting.role_category).all()
    role_counts = {cat: count for cat, count in categories}
    
    # Top demanded skills across all jobs
    skill_counts = (
        db.query(Skill.name, func.count(JobSkill.job_posting_id))
        .join(JobSkill, Skill.id == JobSkill.skill_id)
        .group_by(Skill.name)
        .order_by(func.count(JobSkill.job_posting_id).desc())
        .limit(10)
        .all()
    )
    
    top_skills = [
        {
            "skill": name,
            "job_count": count,
            "demand_percentage": round((count / max(total_jobs, 1)) * 100, 1),
            "category": get_skill_category(name)
        }
        for name, count in skill_counts
    ]

    return JobStatsOut(
        total_jobs=total_jobs,
        role_categories_count=role_counts,
        top_demanded_skills=top_skills
    )
