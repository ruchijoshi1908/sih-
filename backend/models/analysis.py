from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from backend.database.base import Base

class DriftScore(Base):
    __tablename__ = "drift_scores"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    curriculum_version_id = Column(Integer, ForeignKey("curriculum_versions.id"), nullable=False)
    score = Column(Float, nullable=False)  # 0 to 100
    status = Column(String(50), nullable=False)  # "Healthy", "Needs Update", "Outdated"
    total_industry_skills = Column(Integer, default=0)
    matched_skills_count = Column(Integer, default=0)
    missing_skills_count = Column(Integer, default=0)
    formula_breakdown = Column(Text, nullable=True)  # Human readable formula explanation for judges
    metrics_json = Column(JSON, nullable=True)  # Detailed dictionary with weighted calculations
    calculated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="drift_scores")
    version = relationship("CurriculumVersion", back_populates="drift_scores")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_version_id = Column(Integer, ForeignKey("curriculum_versions.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    market_demand_percentage = Column(Float, default=0.0)  # e.g., 71.0 for 71%
    recommendation_text = Column(Text, nullable=False)
    proposed_module = Column(String(255), nullable=True)
    suggested_practical_activity = Column(Text, nullable=True)
    rationale_evidence = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # "pending", "approved", "rejected", "partial", "applied"
    priority = Column(String(50), default="High")  # "Critical", "High", "Medium", "Low"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    version = relationship("CurriculumVersion", back_populates="recommendations")
    skill = relationship("Skill", back_populates="recommendations")
    validations = relationship("EmployerValidation", back_populates="recommendation", cascade="all, delete-orphan")

class EmployerValidation(Base):
    __tablename__ = "employer_validations"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=False)
    employer_name = Column(String(150), nullable=False)
    employer_company = Column(String(150), nullable=False)
    decision = Column(String(50), nullable=False)  # "approved", "rejected", "partial"
    comments = Column(Text, nullable=True)
    validated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    recommendation = relationship("Recommendation", back_populates="validations")
