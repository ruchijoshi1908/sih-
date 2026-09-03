from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class PlacementOutcomeCreate(BaseModel):
    course_id: int
    curriculum_version_id: int
    batch_name: str
    students_enrolled: int
    students_placed: int
    average_salary_lpa: Optional[float] = 0.0
    top_hiring_companies: Optional[str] = None

class PlacementOutcomeOut(BaseModel):
    id: int
    course_id: int
    curriculum_version_id: int
    version_number: Optional[str] = None
    batch_name: str
    students_enrolled: int
    students_placed: int
    placement_rate: float
    average_salary_lpa: float
    top_hiring_companies: Optional[str] = None
    reporting_date: datetime

    class Config:
        from_attributes = True

class PlacementComparisonOut(BaseModel):
    course_id: int
    course_name: str
    has_comparison: bool
    version_1_rate: Optional[float] = None
    version_2_rate: Optional[float] = None
    percentage_points_change: Optional[float] = None
    relative_growth_pct: Optional[float] = None
    salary_change_lpa: Optional[float] = None
    history: List[PlacementOutcomeOut] = []
