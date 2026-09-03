from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class CourseBase(BaseModel):
    code: str
    name: str
    domain: str
    target_role: str
    description: Optional[str] = None

class CourseCreate(CourseBase):
    initial_syllabus_text: Optional[str] = None

class CourseSkillOut(BaseModel):
    id: int
    name: str
    category: str
    proficiency_level: Optional[str] = "Intermediate"

    class Config:
        from_attributes = True

class CurriculumVersionOut(BaseModel):
    id: int
    version_number: str
    syllabus_filename: Optional[str] = None
    changes_summary: Optional[str] = None
    status: str
    created_at: datetime
    skills: Optional[List[str]] = []

    class Config:
        from_attributes = True

class CourseOut(CourseBase):
    id: int
    current_version: str
    created_at: datetime
    updated_at: datetime
    latest_drift_score: Optional[float] = None
    drift_status: Optional[str] = None
    versions_count: Optional[int] = 1

    class Config:
        from_attributes = True

class CourseDetailOut(CourseOut):
    versions: List[CurriculumVersionOut] = []
    latest_skills: List[str] = []
