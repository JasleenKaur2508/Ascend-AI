import pytest
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.preprocessing.text_cleaner import clean_text, extract_contact_info, get_text_statistics
from app.preprocessing.skill_extractor import get_skill_extractor
from app.services.resume_parser import get_resume_parser
from app.services.ats_scorer import get_ats_scorer
from app.services.job_matcher import get_job_matcher
from app.recommendations.course_recommender import get_course_recommender

def test_clean_text_preserves_tech_tokens():
    raw = "Senior Engineer skilled in C++, C#, .NET, Node.js and React.js with 5 years experience! Contact: test@example.com"
    cleaned = clean_text(raw)
    assert "cpp" in cleaned
    assert "csharp" in cleaned
    assert "dotnet" in cleaned
    assert "nodejs" in cleaned
    assert "reactjs" in cleaned
    assert "test@example.com" not in cleaned

def test_extract_contact_info():
    raw = "John Doe\nEmail: john.doe@university.edu\nPhone: (555) 123-4567\nhttps://linkedin.com/in/johndoe\nhttps://github.com/johndoe"
    contact = extract_contact_info(raw)
    assert contact["email"] == "john.doe@university.edu"
    assert "johndoe" in contact["linkedin"]
    assert "johndoe" in contact["github"]

def test_skill_extractor():
    extractor = get_skill_extractor()
    sample = "Extensive experience building machine learning models with Python, scikit-learn, pandas, PyTorch and Docker."
    skills = extractor.extract_skills(sample)
    skill_names = [s["canonical"].lower() for s in skills]
    assert "python" in skill_names
    assert "machine learning" in skill_names
    assert "docker" in skill_names

def test_canonical_artifacts_exist():
    artifacts_dir = os.path.join(BASE_DIR, "artifacts")
    required = [
        "logistic_regression_tfidf.joblib",
        "linear_svm_tfidf.joblib",
        "label_encoder.joblib",
        "skill_vocabulary.joblib",
        "evaluation_metrics.json"
    ]
    for filename in required:
        assert os.path.exists(os.path.join(artifacts_dir, filename)), f"Missing canonical artifact: {filename}"

def test_resume_parser_prediction():
    parser = get_resume_parser()
    sample_resume = """
    Data Scientist with experience in Machine Learning, Python, Pandas, Scikit-learn, SQL, and Deep Learning.
    Education: Bachelor of Technology in Computer Science
    Experience: Developed predictive algorithms and automated ETL data pipelines using Pandas and NumPy.
    """
    parsed = parser.parse_resume(sample_resume)
    assert "predicted_category" in parsed
    assert parsed["prediction_confidence"] > 30.0
    assert len(parsed["extracted_skills"]) > 0
    assert len(parsed["education"]) > 0

def test_ats_scorer():
    scorer = get_ats_scorer()
    resume_text = "Experienced Python developer with Django, PostgreSQL, Docker, and REST API development skills."
    job_desc = "Seeking a Backend Python Developer proficient in Python, Django, PostgreSQL, and Docker containerization."
    resume_skills = ["Python", "Django", "PostgreSQL", "Docker"]
    job_skills = ["Python", "Django", "PostgreSQL", "Docker", "Kubernetes"]
    
    result = scorer.score(resume_text, job_desc, resume_skills, job_skills)
    assert result["overall_ats_score"] > 60.0
    assert "Python" in result["matched_skills"]
    assert "Kubernetes" in result["missing_skills"]
    assert "disclaimer" in result

def test_course_recommender():
    recommender = get_course_recommender()
    recs = recommender.recommend_for_skills(["Kubernetes", "Docker"], target_role="DevOps Engineer")
    assert len(recs) > 0
    rec_skills = [r["skill"].lower() for r in recs]
    assert any("docker" in s or "kubernetes" in s for s in rec_skills)
