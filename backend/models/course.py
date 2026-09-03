from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.database.base import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    domain = Column(String(100), nullable=False)  # "Data Science", "Web Development", etc.
    description = Column(Text, nullable=True)
    target_role = Column(String(150), nullable=False)  # e.g., "Data Scientist", "Full Stack Web Developer"
    current_version = Column(String(20), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    versions = relationship("CurriculumVersion", back_populates="course", cascade="all, delete-orphan")
    drift_scores = relationship("DriftScore", back_populates="course", cascade="all, delete-orphan")
    placements = relationship("PlacementOutcome", back_populates="course", cascade="all, delete-orphan")

class CurriculumVersion(Base):
    __tablename__ = "curriculum_versions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    version_number = Column(String(20), nullable=False)  # e.g. "1.0", "2.0"
    syllabus_filename = Column(String(255), nullable=True)
    syllabus_text = Column(Text, nullable=False)
    changes_summary = Column(Text, nullable=True)
    status = Column(String(50), default="active")  # "active", "archived", "draft"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="versions")
    course_skills = relationship("CourseSkill", back_populates="version", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="version", cascade="all, delete-orphan")
    drift_scores = relationship("DriftScore", back_populates="version", cascade="all, delete-orphan")
    placements = relationship("PlacementOutcome", back_populates="version", cascade="all, delete-orphan")
