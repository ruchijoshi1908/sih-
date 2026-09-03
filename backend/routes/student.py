from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.job import JobPosting, JobSkill
from backend.models.student import StudentProfile
from backend.schemas.student import StudentProfileOut
from backend.services.pdf_parser import extract_text_from_file_bytes
from backend.services.ai_agent import AIServiceAgent

router = APIRouter(prefix="/api/students", tags=["Student Career & Skill Audit"])

@router.get("/roles")
def get_available_target_roles(db: Session = Depends(get_db)):
    """Retrieve distinct target roles available in the job market database."""
    roles = db.query(JobPosting.role_category).distinct().all()
    role_list = [r[0] for r in roles if r[0]]
    if not role_list:
        role_list = ["Data Science", "Web Development", "Cloud & DevOps", "AI Engineering"]
    return role_list

@router.post("/resume", response_model=StudentProfileOut)
async def analyze_student_resume(
    full_name: str = Form("Student Candidate"),
    target_role: str = Form("Data Science"),
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Extract student resume skills, compare against target industry role, 
    compute readiness score, and generate a personalized 4-week learning roadmap.
    """
    extracted_text = ""
    filename = "resume_input.txt"

    if file:
        filename = file.filename
        content = await file.read()
        extracted_text = extract_text_from_file_bytes(content, filename)
    elif resume_text:
        extracted_text = resume_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Please upload a resume file (.pdf/.txt) or paste resume text.")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Unable to extract text from resume.")

    # 1. Fetch industry skills required for target role
    target_jobs = db.query(JobPosting).filter(
        (JobPosting.role_category.ilike(f"%{target_role}%")) |
        (JobPosting.title.ilike(f"%{target_role}%"))
    ).all()
    
    if not target_jobs:
        target_jobs = db.query(JobPosting).all()
        
    role_skills_set = set()
    for j in target_jobs:
        for js in j.job_skills:
            role_skills_set.add(js.skill.name)

    role_skills = sorted(list(role_skills_set))

    # 2. Run AI Skill Extraction & Gap Analysis
    analysis_result = AIServiceAgent.analyze_student_resume(
        resume_text=extracted_text,
        target_role=target_role,
        target_role_required_skills=role_skills
    )

    # 3. Store Student Profile
    profile = StudentProfile(
        full_name=full_name,
        target_role=target_role,
        resume_filename=filename,
        extracted_skills=analysis_result["extracted_skills"],
        matched_skills=analysis_result["matched_skills"],
        missing_skills=analysis_result["missing_skills"],
        readiness_score=analysis_result["readiness_score"],
        recommended_roadmap=analysis_result["roadmap"]
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return StudentProfileOut(
        id=profile.id,
        full_name=profile.full_name,
        target_role=profile.target_role,
        extracted_skills=profile.extracted_skills,
        matched_skills=profile.matched_skills,
        missing_skills=profile.missing_skills,
        readiness_score=profile.readiness_score,
        roadmap=profile.recommended_roadmap
    )
