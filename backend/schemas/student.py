from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class StudentResumeAnalyzeRequest(BaseModel):
    full_name: str
    target_role: str  # e.g., "Data Scientist", "Full Stack Developer", "Cloud Engineer"
    resume_text: Optional[str] = None

class StudentRoadmapItem(BaseModel):
    week: str
    focus_skill: str
    goal: str
    topics: str
    actionable_project: str

class StudentProfileOut(BaseModel):
    id: Optional[int] = None
    full_name: str
    target_role: str
    extracted_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    readiness_score: int
    roadmap: List[Dict[str, Any]]
