from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.database.base import Base

class PlacementOutcome(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    curriculum_version_id = Column(Integer, ForeignKey("curriculum_versions.id"), nullable=False)
    batch_name = Column(String(100), nullable=False)  # e.g., "Batch 2024-2025"
    students_enrolled = Column(Integer, nullable=False)
    students_placed = Column(Integer, nullable=False)
    placement_rate = Column(Float, nullable=False)  # e.g. 58.0 or 72.0
    average_salary_lpa = Column(Float, default=0.0)  # in Lakhs Per Annum (e.g. 6.5)
    top_hiring_companies = Column(String(255), nullable=True)  # e.g. "Infosys, TCS, Cognizant, Startups"
    reporting_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="placements")
    version = relationship("CurriculumVersion", back_populates="placements")
