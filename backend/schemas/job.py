from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class JobPostingBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = "Remote"
    role_category: str
    experience_required: Optional[str] = "0-2 years"
    description: str
    source: Optional[str] = "Manual Entry"
    date_posted: Optional[str] = None
    required_skills: List[str] = []

class JobPostingCreate(JobPostingBase):
    pass

class JobPostingOut(JobPostingBase):
    id: int
    created_at: datetime
    skills: List[str] = []

    class Config:
        from_attributes = True

class JobStatsOut(BaseModel):
    total_jobs: int
    role_categories_count: dict
    top_demanded_skills: List[dict]
