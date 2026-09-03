from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from backend.database.base import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    normalized_name = Column(String(100), index=True, nullable=False)
    category = Column(String(100), default="Technical")
    domain = Column(String(100), default="General")  # "Data Science", "Web Development", etc.
    description = Column(Text, nullable=True)

    # Relationships
    course_skills = relationship("CourseSkill", back_populates="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="skill", cascade="all, delete-orphan")

class CourseSkill(Base):
    __tablename__ = "course_skills"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_version_id = Column(Integer, ForeignKey("curriculum_versions.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency_level = Column(String(50), default="Intermediate")  # "Basic", "Intermediate", "Advanced"
    detected_in_syllabus = Column(Boolean, default=True)
    module_reference = Column(String(255), nullable=True)

    # Relationships
    version = relationship("CurriculumVersion", back_populates="course_skills")
    skill = relationship("Skill", back_populates="course_skills")
