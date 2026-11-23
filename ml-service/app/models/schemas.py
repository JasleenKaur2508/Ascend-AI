from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ClassifyResumeRequest(BaseModel):
    text: str = Field(..., description="Raw or cleaned resume text")

class ExtractSkillsRequest(BaseModel):
    text: str = Field(..., description="Resume or job description text")

class MatchJobRequest(BaseModel):
    resume_text: str
    resume_skills: List[str] = []
    top_n: int = 10
    skill_weight: float = 0.50
    semantic_weight: float = 0.35
    keyword_weight: float = 0.15

class ATSScoreRequest(BaseModel):
    resume_text: str
    job_description: str
    resume_skills: List[str] = []
    job_required_skills: List[str] = []
    semantic_score: float = 75.0
    custom_weights: Optional[Dict[str, float]] = None

class SkillGapRequest(BaseModel):
    resume_skills: List[str]
    job_required_skills: List[str]

class RecommendCoursesRequest(BaseModel):
    missing_skills: List[str]
    target_role: Optional[str] = ""
    limit: int = 6

class InterviewQuestionsRequest(BaseModel):
    job_title: str
    job_description: Optional[str] = ""
    candidate_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    predicted_category: Optional[str] = ""

class CareerRoadmapRequest(BaseModel):
    candidate_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    target_role: Optional[str] = "Software Engineer"
    predicted_category: Optional[str] = ""

class SummaryEnhanceRequest(BaseModel):
    resume_text: str
    predicted_category: str
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience_highlights: List[str] = []
    target_job_title: Optional[str] = None
    job_description: Optional[str] = None

class CandidateScreenItem(BaseModel):
    candidate_id: str
    candidate_name: str
    resume_text: str

class BatchScreeningRequest(BaseModel):
    job_id: Optional[int] = None
    job_title: str
    job_description: str
    candidates: List[CandidateScreenItem]
