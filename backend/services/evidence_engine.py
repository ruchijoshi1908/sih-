import re
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from backend.models.job import JobPosting, JobSkill
from backend.models.skill import Skill

def get_skill_evidence_for_course(
    db: Session,
    skill_name: str,
    role_category: str,
    limit: int = 5
) -> Dict[str, Any]:
    """
    Retrieve real evidence from the job market database supporting why a skill is in-demand.
    Returns:
    - total_jobs_in_role: total jobs analyzed in this domain
    - jobs_requiring_skill: count of jobs requiring the skill
    - demand_percentage: percentage
    - supporting_postings: list of company, title, location, and relevant snippet
    """
    # 1. Total jobs in this role category
    total_jobs_query = db.query(JobPosting).filter(
        (JobPosting.role_category.ilike(f"%{role_category}%")) |
        (JobPosting.title.ilike(f"%{role_category}%"))
    )
    total_jobs = total_jobs_query.count()
    if total_jobs == 0:
        # Fallback to all jobs if category is generic
        total_jobs_query = db.query(JobPosting)
        total_jobs = total_jobs_query.count()

    # 2. Find skill in DB
    skill = db.query(Skill).filter(
        (Skill.name.ilike(skill_name)) | (Skill.normalized_name.ilike(skill_name))
    ).first()

    supporting_postings = []
    jobs_with_skill_count = 0

    if skill:
        job_skills = db.query(JobSkill).filter(JobSkill.skill_id == skill.id).all()
        job_ids = [js.job_posting_id for js in job_skills]
        
        postings = db.query(JobPosting).filter(
            JobPosting.id.in_(job_ids),
            (JobPosting.role_category.ilike(f"%{role_category}%")) |
            (JobPosting.title.ilike(f"%{role_category}%"))
        ).all()
        
        if not postings:
            # Fallback across all postings
            postings = db.query(JobPosting).filter(JobPosting.id.in_(job_ids)).all()
            
        jobs_with_skill_count = len(postings)
        
        # Extract snippets
        for posting in postings[:limit]:
            # Find relevant sentence mentioning the skill
            snippet = extract_relevant_snippet(posting.description, skill_name)
            supporting_postings.append({
                "job_id": posting.id,
                "title": posting.title,
                "company": posting.company,
                "location": posting.location,
                "source": posting.source,
                "date_posted": posting.date_posted,
                "snippet": snippet
            })

    demand_percentage = round((jobs_with_skill_count / max(total_jobs, 1)) * 100, 1)

    return {
        "skill": skill_name,
        "role_category": role_category,
        "total_jobs_analyzed": total_jobs,
        "jobs_requiring_skill": jobs_with_skill_count,
        "demand_percentage": demand_percentage,
        "evidence_summary": f"{demand_percentage}% of analyzed {role_category} jobs ({jobs_with_skill_count} of {total_jobs}) require {skill_name}.",
        "supporting_postings": supporting_postings
    }

def extract_relevant_snippet(description: str, skill_name: str) -> str:
    """Extract a clean sentence or clause from job description mentioning the skill."""
    sentences = re.split(r"[.\n;]", description)
    skill_lower = skill_name.lower()
    for sentence in sentences:
        if skill_lower in sentence.lower():
            return sentence.strip() + "."
    
    # Fallback to truncated description
    return description[:180] + "..."
