from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models import (
    Course,
    CurriculumVersion,
    Skill,
    CourseSkill,
    JobPosting,
    DriftScore,
    Recommendation,
    PlacementOutcome
)
from backend.schemas.course import CourseOut, CourseDetailOut, CourseCreate, CurriculumVersionOut
from backend.schemas.analysis import (
    DriftScoreOut,
    SkillGapMatrixOut,
    SkillGapItem,
    RecommendationOut,
    CreateVersionFromRecommendations
)
from backend.services.pdf_parser import extract_text_from_file_bytes
from backend.services.skill_normalizer import (
    normalize_skill_name,
    extract_known_skills_from_text,
    get_skill_category
)
from backend.services.drift_calculator import calculate_curriculum_drift
from backend.services.evidence_engine import get_skill_evidence_for_course
from backend.services.ai_agent import AIServiceAgent

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.get("", response_model=List[CourseOut])
def get_courses(db: Session = Depends(get_db)):
    """Retrieve list of all courses with their latest drift score and status."""
    courses = db.query(Course).all()
    results = []
    
    for c in courses:
        # Fetch latest drift score
        latest_drift = db.query(DriftScore).filter(DriftScore.course_id == c.id).order_by(DriftScore.calculated_at.desc()).first()
        v_count = db.query(CurriculumVersion).filter(CurriculumVersion.course_id == c.id).count()
        
        results.append(CourseOut(
            id=c.id,
            code=c.code,
            name=c.name,
            domain=c.domain,
            target_role=c.target_role,
            description=c.description,
            current_version=c.current_version,
            created_at=c.created_at,
            updated_at=c.updated_at,
            latest_drift_score=latest_drift.score if latest_drift else None,
            drift_status=latest_drift.status if latest_drift else "Not Audited",
            versions_count=v_count
        ))
    return results

@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    """Create a new course and initialize Version 1.0."""
    existing = db.query(Course).filter(Course.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Course with code '{payload.code}' already exists.")
        
    course = Course(
        code=payload.code,
        name=payload.name,
        domain=payload.domain,
        target_role=payload.target_role,
        description=payload.description,
        current_version="1.0"
    )
    db.add(course)
    db.flush()
    
    # Initialize version 1.0
    initial_text = payload.initial_syllabus_text or f"Course syllabus for {course.name}."
    v1 = CurriculumVersion(
        course_id=course.id,
        version_number="1.0",
        syllabus_text=initial_text,
        changes_summary="Initial course creation.",
        status="active"
    )
    db.add(v1)
    db.flush()
    
    # Extract any initial skills
    skills_found = extract_known_skills_from_text(initial_text)
    for s_name in skills_found:
        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if not skill:
            skill = Skill(name=s_name, normalized_name=s_name.lower(), category=get_skill_category(s_name))
            db.add(skill)
            db.flush()
        cs = CourseSkill(curriculum_version_id=v1.id, skill_id=skill.id)
        db.add(cs)
        
    db.commit()
    db.refresh(course)
    
    return CourseOut(
        id=course.id,
        code=course.code,
        name=course.name,
        domain=course.domain,
        target_role=course.target_role,
        description=course.description,
        current_version=course.current_version,
        created_at=course.created_at,
        updated_at=course.updated_at,
        latest_drift_score=None,
        drift_status="Not Audited",
        versions_count=1
    )

@router.get("/{course_id}", response_model=CourseDetailOut)
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed course information, version history, and taught skills."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    versions = db.query(CurriculumVersion).filter(CurriculumVersion.course_id == course_id).order_by(CurriculumVersion.created_at.desc()).all()
    
    v_out_list = []
    latest_skills = []
    
    for v in versions:
        skills = [cs.skill.name for cs in v.course_skills]
        if v.version_number == course.current_version:
            latest_skills = skills
            
        v_out_list.append(CurriculumVersionOut(
            id=v.id,
            version_number=v.version_number,
            syllabus_filename=v.syllabus_filename,
            changes_summary=v.changes_summary,
            status=v.status,
            created_at=v.created_at,
            skills=skills
        ))
        
    latest_drift = db.query(DriftScore).filter(DriftScore.course_id == course.id).order_by(DriftScore.calculated_at.desc()).first()

    return CourseDetailOut(
        id=course.id,
        code=course.code,
        name=course.name,
        domain=course.domain,
        target_role=course.target_role,
        description=course.description,
        current_version=course.current_version,
        created_at=course.created_at,
        updated_at=course.updated_at,
        latest_drift_score=latest_drift.score if latest_drift else None,
        drift_status=latest_drift.status if latest_drift else "Not Audited",
        versions_count=len(versions),
        versions=v_out_list,
        latest_skills=latest_skills
    )

@router.post("/{course_id}/syllabus")
async def upload_syllabus(
    course_id: int,
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a syllabus PDF or plain text to update/audit the course's active curriculum.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    extracted_text = ""
    filename = "manual_entry.txt"
    
    if file:
        filename = file.filename
        content = await file.read()
        extracted_text = extract_text_from_file_bytes(content, filename)
    elif raw_text:
        extracted_text = raw_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Please upload a syllabus file (.pdf/.txt) or provide syllabus text.")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Failed to extract readable text from the uploaded file.")

    # Find or update active version
    active_version = db.query(CurriculumVersion).filter(
        CurriculumVersion.course_id == course.id,
        CurriculumVersion.version_number == course.current_version
    ).first()

    if not active_version:
        active_version = CurriculumVersion(
            course_id=course.id,
            version_number=course.current_version,
            syllabus_filename=filename,
            syllabus_text=extracted_text,
            status="active"
        )
        db.add(active_version)
        db.flush()
    else:
        active_version.syllabus_filename = filename
        active_version.syllabus_text = extracted_text
        db.query(CourseSkill).filter(CourseSkill.curriculum_version_id == active_version.id).delete()
        db.flush()

    # Extract skills
    extracted_skills = AIServiceAgent.extract_skills_from_text(extracted_text, context_type="syllabus")
    for s_name in extracted_skills:
        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if not skill:
            skill = Skill(name=s_name, normalized_name=s_name.lower(), category=get_skill_category(s_name))
            db.add(skill)
            db.flush()
        cs = CourseSkill(curriculum_version_id=active_version.id, skill_id=skill.id, detected_in_syllabus=True)
        db.add(cs)

    db.commit()

    return {
        "message": f"Syllabus '{filename}' uploaded and parsed successfully.",
        "course_id": course.id,
        "version": active_version.version_number,
        "extracted_skills_count": len(extracted_skills),
        "extracted_skills": extracted_skills,
        "text_preview": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text
    }

@router.post("/{course_id}/audit", response_model=DriftScoreOut)
def run_course_audit(course_id: int, db: Session = Depends(get_db)):
    """
    Run full end-to-end Curriculum Audit:
    1. Retrieve taught skills from active curriculum version.
    2. Extract and compute current industry skill demand for the course's target role.
    3. Calculate explainable Drift Score (0-100).
    4. Link evidence from real job postings.
    5. Generate structured AI Recommendations for detected gaps.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    active_version = db.query(CurriculumVersion).filter(
        CurriculumVersion.course_id == course.id,
        CurriculumVersion.version_number == course.current_version
    ).first()

    if not active_version:
        raise HTTPException(status_code=400, detail="No active curriculum version found to audit.")

    # 1. Taught skills
    course_skills = [cs.skill.name for cs in active_version.course_skills]
    
    # 2. Industry jobs and skills for target role
    target_role = course.target_role or course.domain
    role_jobs = db.query(JobPosting).filter(
        (JobPosting.role_category.ilike(f"%{target_role}%")) |
        (JobPosting.title.ilike(f"%{target_role}%"))
    ).all()
    
    if not role_jobs:
        # Fallback to all jobs if category is not matched
        role_jobs = db.query(JobPosting).all()
        
    total_role_jobs = max(len(role_jobs), 1)
    
    industry_demand_counts = {}
    for job in role_jobs:
        for js in job.job_skills:
            s_name = js.skill.name
            industry_demand_counts[s_name] = industry_demand_counts.get(s_name, 0) + 1
            
    industry_demand_pct = {k: (v / total_role_jobs) * 100 for k, v in industry_demand_counts.items()}

    # 3. Calculate Drift Score
    drift_result = calculate_curriculum_drift(industry_demand_pct, course_skills)

    # 4. Save Drift Score record
    drift_record = DriftScore(
        course_id=course.id,
        curriculum_version_id=active_version.id,
        score=drift_result["score"],
        status=drift_result["status"],
        total_industry_skills=drift_result["total_skills_count"],
        matched_skills_count=drift_result["matched_skills_count"],
        missing_skills_count=drift_result["missing_skills_count"],
        formula_breakdown=drift_result["formula_breakdown"],
        metrics_json=drift_result["metrics"]
    )
    db.add(drift_record)
    
    # 5. Clear old pending recommendations for this version and create updated recommendations
    db.query(Recommendation).filter(
        Recommendation.curriculum_version_id == active_version.id,
        Recommendation.status == "pending"
    ).delete()

    missing_with_evidence = []
    for m_item in drift_result["metrics"]["missing_skills"]:
        if m_item["demand_pct"] >= 40.0:  # Focus on critical & high-demand missing skills
            ev = get_skill_evidence_for_course(db, m_item["skill"], target_role)
            missing_with_evidence.append(ev)
            
    generated_recs = AIServiceAgent.generate_curriculum_recommendations(course.name, missing_with_evidence)
    
    for r in generated_recs:
        skill = db.query(Skill).filter(Skill.name == r["skill_name"]).first()
        if not skill:
            skill = Skill(name=r["skill_name"], normalized_name=r["skill_name"].lower(), category=get_skill_category(r["skill_name"]))
            db.add(skill)
            db.flush()
            
        rec_entry = Recommendation(
            curriculum_version_id=active_version.id,
            skill_id=skill.id,
            skill_name=r["skill_name"],
            market_demand_percentage=r["market_demand_percentage"],
            recommendation_text=r["recommendation_text"],
            proposed_module=r.get("proposed_module"),
            suggested_practical_activity=r.get("suggested_practical_activity"),
            rationale_evidence=r["rationale_evidence"],
            priority=r.get("priority", "High"),
            status="pending"
        )
        db.add(rec_entry)

    db.commit()
    db.refresh(drift_record)

    return DriftScoreOut(
        course_id=course.id,
        course_name=course.name,
        curriculum_version=active_version.version_number,
        score=drift_record.score,
        status=drift_record.status,
        status_color=drift_result["status_color"],
        total_industry_skills=drift_record.total_industry_skills,
        matched_skills_count=drift_record.matched_skills_count,
        missing_skills_count=drift_record.missing_skills_count,
        formula_breakdown=drift_record.formula_breakdown,
        metrics=drift_result["metrics"],
        calculated_at=drift_record.calculated_at
    )

@router.get("/{course_id}/gaps", response_model=SkillGapMatrixOut)
def get_skill_gaps(course_id: int, db: Session = Depends(get_db)):
    """Retrieve the full visual Skill Gap Matrix for the active curriculum version."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    active_version = db.query(CurriculumVersion).filter(
        CurriculumVersion.course_id == course.id,
        CurriculumVersion.version_number == course.current_version
    ).first()

    if not active_version:
        raise HTTPException(status_code=404, detail="Active curriculum version not found")

    latest_drift = db.query(DriftScore).filter(
        DriftScore.course_id == course.id,
        DriftScore.curriculum_version_id == active_version.id
    ).order_by(DriftScore.calculated_at.desc()).first()

    course_skills = {cs.skill.name for cs in active_version.course_skills}
    
    # Get industry demand
    target_role = course.target_role or course.domain
    role_jobs = db.query(JobPosting).filter(
        (JobPosting.role_category.ilike(f"%{target_role}%")) |
        (JobPosting.title.ilike(f"%{target_role}%"))
    ).all()
    if not role_jobs:
        role_jobs = db.query(JobPosting).all()
        
    total_role_jobs = max(len(role_jobs), 1)
    
    industry_demand_counts = {}
    for job in role_jobs:
        for js in job.job_skills:
            s_name = js.skill.name
            industry_demand_counts[s_name] = industry_demand_counts.get(s_name, 0) + 1
            
    # Assemble gap items
    gap_items = []
    all_skill_names = set(industry_demand_counts.keys()) | course_skills
    
    for s_name in all_skill_names:
        demand_pct = round((industry_demand_counts.get(s_name, 0) / total_role_jobs) * 100, 1)
        in_curr = s_name in course_skills
        
        if in_curr and demand_pct >= 30:
            status_label = "MATCHED"
        elif in_curr and demand_pct < 30:
            status_label = "LOW DEMAND"
        elif not in_curr and demand_pct >= 40:
            status_label = "MISSING"
        else:
            status_label = "EMERGING"
            
        gap_items.append(SkillGapItem(
            skill=s_name,
            category=get_skill_category(s_name),
            industry_demand_percentage=demand_pct,
            taught_in_curriculum=in_curr,
            status=status_label,
            importance_weight=1.5 if demand_pct >= 60 else 1.0
        ))

    # Sort: Missing first, then Matched, descending by demand
    gap_items.sort(key=lambda x: (x.status != "MISSING", -x.industry_demand_percentage))

    return SkillGapMatrixOut(
        course_id=course.id,
        course_name=course.name,
        domain=course.domain,
        version=active_version.version_number,
        drift_score=latest_drift.score if latest_drift else 0.0,
        drift_status=latest_drift.status if latest_drift else "Not Audited",
        gaps=gap_items
    )

@router.get("/{course_id}/drift", response_model=DriftScoreOut)
def get_course_drift_score(course_id: int, db: Session = Depends(get_db)):
    """Retrieve the latest calculated drift score and formula breakdown."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    drift = db.query(DriftScore).filter(DriftScore.course_id == course.id).order_by(DriftScore.calculated_at.desc()).first()
    if not drift:
        raise HTTPException(status_code=404, detail="No audit has been run for this course yet.")

    return DriftScoreOut(
        course_id=course.id,
        course_name=course.name,
        curriculum_version=drift.version.version_number if drift.version else "1.0",
        score=drift.score,
        status=drift.status,
        status_color="green" if drift.score <= 30 else ("yellow" if drift.score <= 60 else "red"),
        total_industry_skills=drift.total_industry_skills,
        matched_skills_count=drift.matched_skills_count,
        missing_skills_count=drift.missing_skills_count,
        formula_breakdown=drift.formula_breakdown or "",
        metrics=drift.metrics_json or {},
        calculated_at=drift.calculated_at
    )

@router.get("/{course_id}/recommendations", response_model=List[RecommendationOut])
def get_course_recommendations(course_id: int, db: Session = Depends(get_db)):
    """Retrieve all recommendations generated for the course's active version."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    active_version = db.query(CurriculumVersion).filter(
        CurriculumVersion.course_id == course.id,
        CurriculumVersion.version_number == course.current_version
    ).first()

    if not active_version:
        return []

    recs = db.query(Recommendation).filter(Recommendation.curriculum_version_id == active_version.id).all()
    return recs

@router.post("/{course_id}/versions")
def create_updated_curriculum_version(
    course_id: int,
    payload: CreateVersionFromRecommendations,
    db: Session = Depends(get_db)
):
    """
    Apply approved recommendations and create an updated Curriculum Version (e.g. Version 2.0).
    Recalculates the improved Drift Score for the new version.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    old_version = db.query(CurriculumVersion).filter(
        CurriculumVersion.course_id == course.id,
        CurriculumVersion.version_number == course.current_version
    ).first()

    # Mark applied recommendations
    applied_skills = []
    if payload.applied_recommendation_ids:
        recs = db.query(Recommendation).filter(Recommendation.id.in_(payload.applied_recommendation_ids)).all()
        for r in recs:
            r.status = "applied"
            applied_skills.append(r.skill_name)
    else:
        # If none specified, apply all approved recommendations
        recs = db.query(Recommendation).filter(
            Recommendation.curriculum_version_id == old_version.id,
            Recommendation.status == "approved"
        ).all()
        for r in recs:
            r.status = "applied"
            applied_skills.append(r.skill_name)

    # Archive old version
    if old_version:
        old_version.status = "archived"

    # Create new version text
    old_text = old_version.syllabus_text if old_version else ""
    added_modules_text = "\n\n--- UPDATED INDUSTRY MODULES ADDED (Version " + payload.version_number + ") ---\n"
    for s_name in applied_skills:
        added_modules_text += f"\n- Module: Advanced Industry Practice in {s_name}\n  Practical projects and enterprise lab work included."

    new_syllabus_text = old_text + added_modules_text

    new_version = CurriculumVersion(
        course_id=course.id,
        version_number=payload.version_number,
        syllabus_filename=f"{course.code.lower()}_v{payload.version_number.replace('.', '_')}.txt",
        syllabus_text=new_syllabus_text,
        changes_summary=payload.changes_summary or f"Integrated approved industry skills: {', '.join(applied_skills)}.",
        status="active"
    )
    db.add(new_version)
    db.flush()

    # Update course current_version
    course.current_version = payload.version_number

    # Copy previous skills and add new applied skills
    previous_skills = [cs.skill.name for cs in old_version.course_skills] if old_version else []
    all_new_skills = set(previous_skills) | set(applied_skills)

    for sk_name in all_new_skills:
        skill = db.query(Skill).filter(Skill.name == sk_name).first()
        if not skill:
            skill = Skill(name=sk_name, normalized_name=sk_name.lower(), category=get_skill_category(sk_name))
            db.add(skill)
            db.flush()
        cs = CourseSkill(curriculum_version_id=new_version.id, skill_id=skill.id, detected_in_syllabus=True)
        db.add(cs)

    # Recalculate new Drift Score for v2.0
    target_role = course.target_role or course.domain
    role_jobs = db.query(JobPosting).filter(
        (JobPosting.role_category.ilike(f"%{target_role}%")) |
        (JobPosting.title.ilike(f"%{target_role}%"))
    ).all()
    if not role_jobs:
        role_jobs = db.query(JobPosting).all()
    total_role_jobs = max(len(role_jobs), 1)

    industry_demand_counts = {}
    for job in role_jobs:
        for js in job.job_skills:
            s_name = js.skill.name
            industry_demand_counts[s_name] = industry_demand_counts.get(s_name, 0) + 1
            
    industry_demand_pct = {k: (v / total_role_jobs) * 100 for k, v in industry_demand_counts.items()}
    new_drift = calculate_curriculum_drift(industry_demand_pct, list(all_new_skills))

    drift_record = DriftScore(
        course_id=course.id,
        curriculum_version_id=new_version.id,
        score=new_drift["score"],
        status=new_drift["status"],
        total_industry_skills=new_drift["total_skills_count"],
        matched_skills_count=new_drift["matched_skills_count"],
        missing_skills_count=new_drift["missing_skills_count"],
        formula_breakdown=new_drift["formula_breakdown"],
        metrics_json=new_drift["metrics"]
    )
    db.add(drift_record)

    db.commit()

    return {
        "message": f"Successfully created Version {payload.version_number} for {course.name}!",
        "course_id": course.id,
        "new_version": new_version.version_number,
        "applied_skills": applied_skills,
        "new_drift_score": new_drift["score"],
        "new_status": new_drift["status"],
        "drift_reduction": f"Curriculum drift reduced to {new_drift['score']}% ({new_drift['status']})"
    }
