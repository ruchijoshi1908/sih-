from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class DriftScoreOut(BaseModel):
    course_id: int
    course_name: str
    curriculum_version: str
    score: float
    status: str
    status_color: str
    total_industry_skills: int
    matched_skills_count: int
    missing_skills_count: int
    formula_breakdown: str
    metrics: Dict[str, Any]
    calculated_at: datetime

class SkillGapItem(BaseModel):
    skill: str
    category: str
    industry_demand_percentage: float
    taught_in_curriculum: bool
    status: str  # "MATCHED", "MISSING", "EMERGING", "LOW DEMAND"
    importance_weight: float = 1.0

class SkillGapMatrixOut(BaseModel):
    course_id: int
    course_name: str
    domain: str
    version: str
    drift_score: float
    drift_status: str
    gaps: List[SkillGapItem]

class SupportingPosting(BaseModel):
    job_id: int
    title: str
    company: str
    location: str
    source: str
    date_posted: Optional[str] = None
    snippet: str

class EvidenceOut(BaseModel):
    skill: str
    role_category: str
    total_jobs_analyzed: int
    jobs_requiring_skill: int
    demand_percentage: float
    evidence_summary: str
    supporting_postings: List[SupportingPosting]

class EmployerValidationOut(BaseModel):
    id: int
    employer_name: str
    employer_company: str
    decision: str
    comments: Optional[str] = None
    validated_at: datetime

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    curriculum_version_id: int
    skill_name: str
    market_demand_percentage: float
    recommendation_text: str
    proposed_module: Optional[str] = None
    suggested_practical_activity: Optional[str] = None
    rationale_evidence: str
    priority: str
    status: str
    validations: List[EmployerValidationOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

class EmployerValidationCreate(BaseModel):
    employer_name: str
    employer_company: str
    decision: str  # "approved", "rejected", "partial"
    comments: Optional[str] = None

class CreateVersionFromRecommendations(BaseModel):
    version_number: str  # e.g. "2.0"
    changes_summary: str
    applied_recommendation_ids: List[int] = []
