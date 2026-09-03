from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.database.base import Base

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    company = Column(String(200), nullable=False)
    location = Column(String(200), default="Remote")
    role_category = Column(String(100), index=True, nullable=False)  # "Data Science", "Web Development", etc.
    experience_required = Column(String(100), default="0-2 years")
    description = Column(Text, nullable=False)
    source = Column(String(100), default="LinkedIn Jobs")
    date_posted = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job_skills = relationship("JobSkill", back_populates="job_posting", cascade="all, delete-orphan")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    importance_weight = Column(Float, default=1.0)  # 1.0 (standard), 1.5 (core/must-have)

    # Relationships
    job_posting = relationship("JobPosting", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")
