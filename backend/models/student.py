from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from backend.database.base import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    target_role = Column(String(150), nullable=False)  # e.g., "Data Scientist", "Full Stack Developer"
    resume_filename = Column(String(255), nullable=True)
    extracted_skills = Column(JSON, nullable=True)  # list of skills found in resume
    matched_skills = Column(JSON, nullable=True)    # skills matching the target role
    missing_skills = Column(JSON, nullable=True)    # skills student needs to learn
    readiness_score = Column(Integer, default=0)    # 0 to 100%
    recommended_roadmap = Column(JSON, nullable=True) # step-by-step learning modules
    created_at = Column(DateTime, default=datetime.utcnow)
