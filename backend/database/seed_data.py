import json
from pathlib import Path
from sqlalchemy.orm import Session

from backend.config import DATA_DIR
from backend.models import (
    Base,
    Course,
    CurriculumVersion,
    Skill,
    CourseSkill,
    JobPosting,
    JobSkill,
    DriftScore,
    Recommendation,
    EmployerValidation,
    PlacementOutcome
)
from backend.services.skill_normalizer import (
    CANONICAL_SKILLS,
    get_skill_category,
    normalize_skill_name,
    extract_known_skills_from_text
)
from backend.services.drift_calculator import calculate_curriculum_drift
from backend.services.evidence_engine import get_skill_evidence_for_course
from backend.services.ai_agent import AIServiceAgent

def seed_database(db: Session, force: bool = False):
    """Seed initial courses, job postings, skills, and placements if empty."""
    # Check if already seeded
    if not force and db.query(Course).count() > 0:
        print("[Database] Database already populated with seed data.")
        return

    print("[Database] Seeding initial skills, jobs, courses, and placements...")

    # 1. Seed Skills
    skill_lookup = {}
    unique_skills = set(CANONICAL_SKILLS.values())
    for s_name in sorted(unique_skills):
        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if not skill:
            skill = Skill(
                name=s_name,
                normalized_name=s_name.lower(),
                category=get_skill_category(s_name),
                domain="General"
            )
            db.add(skill)
            db.flush()
        skill_lookup[s_name] = skill

    db.commit()

    # 2. Seed Job Postings from JSON
    seed_jobs_file = DATA_DIR / "sample_jobs" / "job_market_seed.json"
    if seed_jobs_file.exists():
        with open(seed_jobs_file, "r", encoding="utf-8") as f:
            jobs_data = json.load(f)
            
        for job_item in jobs_data:
            existing = db.query(JobPosting).filter(JobPosting.title == job_item["title"], JobPosting.company == job_item["company"]).first()
            if not existing:
                job = JobPosting(
                    title=job_item["title"],
                    company=job_item["company"],
                    location=job_item.get("location", "Remote"),
                    role_category=job_item.get("role_category", "Data Science"),
                    experience_required=job_item.get("experience", "0-2 years"),
                    description=job_item.get("description", ""),
                    source=job_item.get("source", "LinkedIn Jobs"),
                    date_posted=job_item.get("date_posted", "2026-08-20")
                )
                db.add(job)
                db.flush()

                # Attach job skills
                for req_skill in job_item.get("required_skills", []):
                    norm = normalize_skill_name(req_skill)
                    if norm not in skill_lookup:
                        new_s = Skill(name=norm, normalized_name=norm.lower(), category=get_skill_category(norm))
                        db.add(new_s)
                        db.flush()
                        skill_lookup[norm] = new_s
                    
                    js = JobSkill(job_posting_id=job.id, skill_id=skill_lookup[norm].id, importance_weight=1.0)
                    db.add(js)

        db.commit()

    # 3. Seed Sample Syllabi & Initial Courses
    syllabi_dir = DATA_DIR / "sample_syllabi"
    
    # Course 1: Data Science (DS-201)
    ds_syllabus_text = ""
    ds_file = syllabi_dir / "data_science_v1.txt"
    if ds_file.exists():
        with open(ds_file, "r", encoding="utf-8") as f:
            ds_syllabus_text = f.read()

    course_ds = Course(
        code="DS-201",
        name="Applied Data Science & Machine Learning",
        domain="Data Science",
        target_role="Data Science",
        description="Comprehensive foundations of data science, predictive modeling, computational statistics, and algorithms.",
        current_version="1.0"
    )
    db.add(course_ds)
    db.flush()

    v1_ds = CurriculumVersion(
        course_id=course_ds.id,
        version_number="1.0",
        syllabus_filename="data_science_v1.txt",
        syllabus_text=ds_syllabus_text,
        changes_summary="Initial legacy baseline syllabus focusing on Python, C programming, and statistical mathematics.",
        status="active"
    )
    db.add(v1_ds)
    db.flush()

    # Extract & associate skills in v1
    ds_skills = extract_known_skills_from_text(ds_syllabus_text)
    for sk_name in ds_skills:
        if sk_name in skill_lookup:
            cs = CourseSkill(curriculum_version_id=v1_ds.id, skill_id=skill_lookup[sk_name].id, detected_in_syllabus=True)
            db.add(cs)

    # Initial Placement for DS v1
    p1 = PlacementOutcome(
        course_id=course_ds.id,
        curriculum_version_id=v1_ds.id,
        batch_name="Batch 2024-2025 (v1.0)",
        students_enrolled=100,
        students_placed=58,
        placement_rate=58.0,
        average_salary_lpa=5.8,
        top_hiring_companies="Infosys, Wipro, Tech Mahindra, Genpact"
    )
    db.add(p1)

    # Course 2: Web Development (WEB-101)
    web_syllabus_text = ""
    web_file = syllabi_dir / "web_development_v1.txt"
    if web_file.exists():
        with open(web_file, "r", encoding="utf-8") as f:
            web_syllabus_text = f.read()

    course_web = Course(
        code="WEB-101",
        name="Modern Web Application Development",
        domain="Web Development",
        target_role="Web Development",
        description="Core web application programming, frontend markup, server scripting, and relational data persistence.",
        current_version="1.0"
    )
    db.add(course_web)
    db.flush()

    v1_web = CurriculumVersion(
        course_id=course_web.id,
        version_number="1.0",
        syllabus_filename="web_development_v1.txt",
        syllabus_text=web_syllabus_text,
        changes_summary="Initial legacy web development curriculum (HTML5, CSS3, JavaScript, PHP, MySQL, jQuery).",
        status="active"
    )
    db.add(v1_web)
    db.flush()

    web_skills = extract_known_skills_from_text(web_syllabus_text)
    for sk_name in web_skills:
        if sk_name in skill_lookup:
            cs = CourseSkill(curriculum_version_id=v1_web.id, skill_id=skill_lookup[sk_name].id, detected_in_syllabus=True)
            db.add(cs)

    p2 = PlacementOutcome(
        course_id=course_web.id,
        curriculum_version_id=v1_web.id,
        batch_name="Batch 2024-2025 (v1.0)",
        students_enrolled=80,
        students_placed=48,
        placement_rate=60.0,
        average_salary_lpa=5.2,
        top_hiring_companies="TCS, Capgemini, WebCraft India"
    )
    db.add(p2)

    db.commit()

    # Calculate initial Drift Scores & Recommendations for both courses
    for course, version, taught in [(course_ds, v1_ds, ds_skills), (course_web, v1_web, web_skills)]:
        # Get industry demand for this role category
        all_role_jobs = db.query(JobPosting).filter(JobPosting.role_category.ilike(f"%{course.target_role}%")).all()
        total_role_jobs = len(all_role_jobs)
        
        industry_demand = {}
        for job in all_role_jobs:
            for js in job.job_skills:
                s_name = js.skill.name
                industry_demand[s_name] = industry_demand.get(s_name, 0) + 1
                
        # Normalize to percentage
        industry_demand_pct = {k: (v / max(total_role_jobs, 1)) * 100 for k, v in industry_demand.items()}
        
        drift_res = calculate_curriculum_drift(industry_demand_pct, taught)
        
        ds_record = DriftScore(
            course_id=course.id,
            curriculum_version_id=version.id,
            score=drift_res["score"],
            status=drift_res["status"],
            total_industry_skills=drift_res["total_skills_count"],
            matched_skills_count=drift_res["matched_skills_count"],
            missing_skills_count=drift_res["missing_skills_count"],
            formula_breakdown=drift_res["formula_breakdown"],
            metrics_json=drift_res["metrics"]
        )
        db.add(ds_record)

        # Generate Recommendations for missing skills with demand >= 40%
        missing_evidence = []
        for missing_item in drift_res["metrics"]["missing_skills"]:
            if missing_item["demand_pct"] >= 40.0:
                ev = get_skill_evidence_for_course(db, missing_item["skill"], course.target_role)
                missing_evidence.append(ev)
                
        recs = AIServiceAgent.generate_curriculum_recommendations(course.name, missing_evidence)
        for r_item in recs:
            s_obj = skill_lookup.get(r_item["skill_name"])
            if s_obj:
                rec_model = Recommendation(
                    curriculum_version_id=version.id,
                    skill_id=s_obj.id,
                    skill_name=r_item["skill_name"],
                    market_demand_percentage=r_item["market_demand_percentage"],
                    recommendation_text=r_item["recommendation_text"],
                    proposed_module=r_item.get("proposed_module"),
                    suggested_practical_activity=r_item.get("suggested_practical_activity"),
                    rationale_evidence=r_item["rationale_evidence"],
                    status="pending",
                    priority=r_item.get("priority", "High")
                )
                db.add(rec_model)

    db.commit()
    print("[Database] Database successfully seeded with full course catalog, job postings, and audit drift scores!")
