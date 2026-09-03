from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models import JobPosting, JobSkill, Skill
from backend.services.skill_normalizer import normalize_skill_name, get_skill_category
from backend.services.ai_agent import AIServiceAgent

router = APIRouter(prefix="/api/n8n", tags=["n8n Automation & Webhooks"])

@router.get("/status")
def get_n8n_automation_status():
    """Retrieve the status and definitions of connected n8n workflows."""
    return {
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "workflows": [
            {
                "id": "wf_job_market_updater",
                "name": "01 — Job Market Data Ingestion & Skill Extractor",
                "trigger": "Cron Schedule (Daily at 00:00 UTC)",
                "target_endpoint": "/api/n8n/trigger-job-sync",
                "status": "Active / Ready"
            },
            {
                "id": "wf_audit_notification",
                "name": "02 — Curriculum Drift Alert & Employer Dispatch",
                "trigger": "Webhook on Course Audit Completion",
                "target_endpoint": "/api/n8n/audit-alert",
                "status": "Active / Ready"
            }
        ]
    }

@router.post("/trigger-job-sync")
def n8n_ingest_job_batch(payload: List[Dict[str, Any]], db: Session = Depends(get_db)):
    """
    Webhook endpoint called by n8n workflow to batch ingest newly scraped job postings.
    """
    ingested_count = 0
    for item in payload:
        title = item.get("title")
        company = item.get("company")
        if not title or not company:
            continue
            
        existing = db.query(JobPosting).filter(JobPosting.title == title, JobPosting.company == company).first()
        if existing:
            continue
            
        job = JobPosting(
            title=title,
            company=company,
            location=item.get("location", "Remote"),
            role_category=item.get("role_category", "Data Science"),
            experience_required=item.get("experience", "0-2 years"),
            description=item.get("description", ""),
            source=item.get("source", "n8n Scraper"),
            date_posted=item.get("date_posted", datetime.utcnow().strftime("%Y-%m-%d"))
        )
        db.add(job)
        db.flush()

        # Skill extraction
        req_skills = item.get("required_skills") or AIServiceAgent.extract_skills_from_text(job.description, "job")
        for s_raw in req_skills:
            norm = normalize_skill_name(s_raw)
            skill = db.query(Skill).filter(Skill.name == norm).first()
            if not skill:
                skill = Skill(name=norm, normalized_name=norm.lower(), category=get_skill_category(norm))
                db.add(skill)
                db.flush()
            js = JobSkill(job_posting_id=job.id, skill_id=skill.id)
            db.add(js)

        ingested_count += 1

    db.commit()

    return {
        "status": "success",
        "message": f"Successfully ingested {ingested_count} new job postings via n8n automation pipeline.",
        "ingested_count": ingested_count
    }

@router.post("/audit-alert")
def n8n_audit_alert_dispatch(payload: Dict[str, Any]):
    """
    Webhook endpoint called when a high drift score course completes an audit.
    Dispatches notifications to partner employers.
    """
    course_name = payload.get("course_name", "Unknown Course")
    drift_score = payload.get("drift_score", 0)
    missing_skills = payload.get("missing_skills", [])
    
    return {
        "status": "dispatched",
        "channel": "Slack / Email (Simulated)",
        "recipient_count": 4,
        "message": f"Alert sent for course '{course_name}' with Drift Score {drift_score}% requiring validation for: {', '.join(missing_skills)}."
    }
