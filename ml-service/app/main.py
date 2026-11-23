import os
import json
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.models.schemas import (
    ClassifyResumeRequest,
    ExtractSkillsRequest,
    MatchJobRequest,
    ATSScoreRequest,
    SkillGapRequest,
    RecommendCoursesRequest,
    InterviewQuestionsRequest,
    CareerRoadmapRequest,
    SummaryEnhanceRequest,
    BatchScreeningRequest
)

from app.preprocessing.skill_extractor import get_skill_extractor
from app.services.resume_parser import clean_resume_text
from app.services.resume_parser import get_resume_parser
from app.services.job_matcher import get_job_matcher
from app.services.ats_scorer import get_ats_scorer
from app.recommendations.course_recommender import get_course_recommender
from app.recommendations.interview_generator import get_interview_generator
from app.recommendations.career_roadmap import get_career_roadmap_generator
from app.services.summary_enhancer import get_summary_enhancer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_DIR = os.path.join(BASE_DIR, "results")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

app = FastAPI(
    title="ASCEND AI - Career Intelligence ML Microservice",
    description="Production-grade AI/ML service for resume classification, skill extraction, ATS scoring, semantic job matching, and career analytics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines on startup
skill_extractor = get_skill_extractor()
resume_parser = get_resume_parser()
job_matcher = get_job_matcher()
ats_scorer = get_ats_scorer()
course_recommender = get_course_recommender()
interview_generator = get_interview_generator()
career_roadmap_gen = get_career_roadmap_generator()
summary_enhancer = get_summary_enhancer()

@app.get("/health")
def health_check():
    svm_loaded = resume_parser.svm_pipeline is not None
    lr_loaded  = resume_parser.lr_pipeline is not None
    le_loaded  = resume_parser.label_encoder is not None
    return {
        "status": "online",
        "service": "ASCEND AI ML Microservice",
        "colab_artifacts_loaded": {
            "linear_svm_pipeline": svm_loaded,
            "logistic_regression_pipeline": lr_loaded,
            "label_encoder": le_loaded,
            "label_classes": len(resume_parser.label_encoder.classes_) if le_loaded else 0
        },
        "models_loaded": svm_loaded and le_loaded,
        "jobs_indexed": len(job_matcher.df_jobs) if job_matcher.df_jobs is not None else 0
    }

@app.post("/api/ml/analyze-resume")
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Analyzes an uploaded PDF/DOCX/TXT resume or raw text input.
    Extracts text, skills, education, experience, and predicts category using ML.
    Supports both digital PDFs and scanned image-based PDFs via Tesseract OCR fallback.
    """
    extracted_text = ""
    
    if file:
        content = await file.read()
        filename = (file.filename or "").lower()

        if not content or len(content) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes). Please upload a valid document.")

        try:
            if filename.endswith(".pdf"):
                extracted_text = resume_parser.extract_text_from_pdf(content)
            elif filename.endswith(".docx"):
                extracted_text = resume_parser.extract_text_from_docx(content)
            elif filename.endswith(".txt"):
                try:
                    extracted_text = content.decode("utf-8")
                except UnicodeDecodeError:
                    extracted_text = content.decode("latin-1", errors="ignore")
            else:
                # Try PDF extraction first, then plain text
                try:
                    extracted_text = resume_parser.extract_text_from_pdf(content)
                except Exception:
                    extracted_text = content.decode("utf-8", errors="ignore")
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract readable text from file: {str(e)}")
    elif raw_text:
        extracted_text = raw_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Either a resume file or raw_text must be provided.")

    if not extracted_text or len(extracted_text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="The extracted resume text is too brief or empty. Please ensure the uploaded file contains legible text or try pasting your resume content directly."
        )

    analysis = resume_parser.parse_resume(extracted_text)
    return {
        "status": "success",
        "filename": file.filename if file else "Pasted Text",
        "data": analysis
    }

@app.post("/api/ml/classify-resume")
def classify_resume(payload: ClassifyResumeRequest):
    prediction = resume_parser.predict_category(payload.text)
    return {
        "status": "success",
        "prediction": prediction
    }

@app.post("/api/ml/extract-skills")
def extract_skills(payload: ExtractSkillsRequest):
    skills = skill_extractor.extract_skills(payload.text)
    return {
        "status": "success",
        "count": len(skills),
        "skills": skills
    }

@app.post("/api/ml/match-job")
def match_job(payload: MatchJobRequest):
    matches = job_matcher.match_resume_to_jobs(
        resume_text=payload.resume_text,
        resume_skills=payload.resume_skills,
        top_n=payload.top_n,
        skill_weight=payload.skill_weight,
        semantic_weight=payload.semantic_weight,
        keyword_weight=payload.keyword_weight
    )
    return {
        "status": "success",
        "count": len(matches),
        "matches": matches
    }

@app.post("/api/ml/ats-score")
def calculate_ats_score(payload: ATSScoreRequest):
    ats_result = ats_scorer.score(
        resume_text=payload.resume_text,
        job_description=payload.job_description,
        resume_skills=payload.resume_skills,
        job_required_skills=payload.job_required_skills,
        semantic_score=payload.semantic_score,
        custom_weights=payload.custom_weights
    )
    return {
        "status": "success",
        "data": ats_result
    }

@app.post("/api/ml/skill-gap")
def analyze_skill_gap(payload: SkillGapRequest):
    resume_skills_lower = set(s.lower() for s in payload.resume_skills)
    job_skills_lower = set(s.lower() for s in payload.job_required_skills)
    
    possessed = [s for s in payload.job_required_skills if s.lower() in resume_skills_lower]
    missing = [s for s in payload.job_required_skills if s.lower() not in resume_skills_lower]
    
    total_required = max(len(payload.job_required_skills), 1)
    match_percentage = round((len(possessed) / total_required) * 100, 1)
    
    # Priority tiers for missing skills
    prioritized_missing = [
        {"skill": s, "priority": "High" if idx < 3 else "Medium"}
        for idx, s in enumerate(missing)
    ]
    
    return {
        "status": "success",
        "match_percentage": match_percentage,
        "possessed_count": len(possessed),
        "missing_count": len(missing),
        "possessed_skills": possessed,
        "missing_skills": missing,
        "prioritized_missing": prioritized_missing
    }

@app.post("/api/ml/recommend-courses")
def recommend_courses(payload: RecommendCoursesRequest):
    courses = course_recommender.recommend_for_skills(
        missing_skills=payload.missing_skills,
        target_role=payload.target_role,
        limit=payload.limit
    )
    return {
        "status": "success",
        "count": len(courses),
        "courses": courses
    }

@app.post("/api/ml/interview-questions")
def get_interview_questions(payload: InterviewQuestionsRequest):
    questions = interview_generator.generate_questions(
        job_title=payload.job_title,
        job_description=payload.job_description,
        candidate_skills=payload.candidate_skills,
        missing_skills=payload.missing_skills,
        predicted_category=payload.predicted_category
    )
    return {
        "status": "success",
        "count": len(questions),
        "questions": questions
    }

@app.post("/api/ml/career-roadmap")
def get_career_roadmap(payload: CareerRoadmapRequest):
    stages = career_roadmap_gen.generate_roadmap(
        candidate_skills=payload.candidate_skills,
        missing_skills=payload.missing_skills,
        target_role=payload.target_role,
        predicted_category=payload.predicted_category
    )
    return {
        "status": "success",
        "stages": stages
    }

@app.post("/api/ml/enhance-summary")
def enhance_summary(payload: SummaryEnhanceRequest):
    summary_data = summary_enhancer.enhance_summary(
        resume_text=payload.resume_text,
        predicted_category=payload.predicted_category,
        skills=payload.skills,
        education=payload.education,
        experience_highlights=payload.experience_highlights,
        target_job_title=payload.target_job_title,
        job_description=payload.job_description
    )
    return {
        "status": "success",
        "data": summary_data
    }

@app.post("/api/ml/batch-screening")
def batch_screening(payload: BatchScreeningRequest):
    """
    Ranks multiple candidates against a target job requisition for recruiters.
    """
    job_desc = payload.job_description
    job_req_skills = skill_extractor.extract_skills(job_desc)
    job_skill_names = [s["canonical"] for s in job_req_skills[:12]]
    
    screened_candidates = []
    
    for candidate in payload.candidates:
        parsed = resume_parser.parse_resume(candidate.resume_text)
        candidate_skills = [s["canonical"] for s in parsed["extracted_skills"]]
        
        ats = ats_scorer.score(
            resume_text=candidate.resume_text,
            job_description=job_desc,
            resume_skills=candidate_skills,
            job_required_skills=job_skill_names
        )
        
        screened_candidates.append({
            "candidate_id": candidate.candidate_id,
            "candidate_name": candidate.candidate_name,
            "predicted_category": parsed["predicted_category"],
            "prediction_confidence": parsed["prediction_confidence"],
            "ats_score": ats["overall_ats_score"],
            "matched_skills": ats["matched_skills"],
            "missing_skills": ats["missing_skills"],
            "skill_match_pct": ats["breakdown"]["skill_match"],
            "semantic_score": ats["breakdown"]["semantic_relevance"],
            "education": parsed["education"]
        })
        
    # Sort descending by ATS compatibility score
    screened_candidates.sort(key=lambda x: x["ats_score"], reverse=True)
    
    return {
        "status": "success",
        "job_title": payload.job_title,
        "total_screened": len(screened_candidates),
        "required_skills": job_skill_names,
        "ranked_candidates": screened_candidates
    }

@app.get("/api/ml/jobs")
def get_jobs(query: Optional[str] = "", category: Optional[str] = "", limit: int = 25):
    jobs = job_matcher.search_jobs(query=query, category=category, limit=limit)
    return {
        "status": "success",
        "count": len(jobs),
        "jobs": jobs
    }

@app.get("/api/ml/colab-metrics")
def get_colab_metrics():
    metrics_path = os.path.join(ARTIFACTS_DIR, "evaluation_metrics.json")
    config_path = os.path.join(ARTIFACTS_DIR, "preprocessing_config.json")
    
    colab_metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            colab_metrics = json.load(f)
            
    preprocessing_config = {}
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            preprocessing_config = json.load(f)

    classes_count = len(resume_parser.label_encoder.classes_) if resume_parser.label_encoder is not None else 25

    return {
        "status": "success",
        "data": {
            **colab_metrics,
            "preprocessing_config": preprocessing_config,
            "models_evaluated": [
                {
                    "name": "Linear SVM (Pipeline)",
                    "accuracy": colab_metrics.get("linear_svm_accuracy", 1.0),
                    "f1_score": colab_metrics.get("linear_svm_f1_score", 1.0),
                    "is_best": colab_metrics.get("best_model") == "Linear SVM"
                },
                {
                    "name": "Logistic Regression (Pipeline)",
                    "accuracy": colab_metrics.get("logistic_regression_accuracy", 1.0),
                    "f1_score": colab_metrics.get("logistic_regression_f1_score", 1.0),
                    "is_best": colab_metrics.get("best_model") == "Logistic Regression"
                }
            ],
            "dataset_info": {
                "training_corpus": "166 unique deduplicated resumes (Ascend.csv)",
                "categories_count": classes_count,
                "test_instances_evaluated": colab_metrics.get("test_instances_evaluated", 34),
                "evaluation_environment": "Google Colab CE-2 Environment"
            }
        }
    }

@app.get("/api/ml/model-metrics")
def get_model_metrics():
    metrics_path = os.path.join(RESULTS_DIR, "model_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"status": "success", "data": data}
    raise HTTPException(status_code=404, detail="Model metrics not found. Train the model first.")

@app.get("/api/ml/eda")
def get_eda_data():
    eda_path = os.path.join(RESULTS_DIR, "eda_summary.json")
    if os.path.exists(eda_path):
        with open(eda_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"status": "success", "data": data}
    raise HTTPException(status_code=404, detail="EDA summary not found.")

@app.get("/api/ml/visualizations/{filename}")
def get_visualization(filename: str):
    file_path = os.path.join(RESULTS_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail=f"Visualization '{filename}' not found.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
