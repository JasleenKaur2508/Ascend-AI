import pytest
import os
import sys
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["models_loaded"] is True
    assert data["jobs_indexed"] > 0

def test_classify_resume_endpoint():
    payload = {
        "text": "Experienced Python Software Engineer specializing in Django, FastAPI, PostgreSQL, Docker and Microservices."
    }
    response = client.post("/api/ml/classify-resume", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    assert "category" in res["prediction"]

def test_extract_skills_endpoint():
    payload = {
        "text": "Core competencies include React, Node.js, Express, MongoDB, TypeScript and Tailwind CSS."
    }
    response = client.post("/api/ml/extract-skills", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["count"] > 0

def test_match_job_endpoint():
    payload = {
        "resume_text": "Full stack developer proficient in React, Node.js, Express, and MongoDB.",
        "resume_skills": ["React", "Node.js", "Express", "MongoDB"],
        "top_n": 3
    }
    response = client.post("/api/ml/match-job", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["count"] == 3
    assert "compatibility_score" in res["matches"][0]

def test_ats_score_endpoint():
    payload = {
        "resume_text": "Experienced Java Developer building microservices with Spring Boot, Hibernate, Kafka, and Docker.",
        "job_description": "We are seeking a Senior Java Developer with Spring Boot, Hibernate, and AWS experience.",
        "resume_skills": ["Java", "Spring Boot", "Hibernate", "Docker"],
        "job_required_skills": ["Java", "Spring Boot", "Hibernate", "AWS"]
    }
    response = client.post("/api/ml/ats-score", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["overall_ats_score"] > 50.0

def test_skill_gap_endpoint():
    payload = {
        "resume_skills": ["Python", "Pandas", "NumPy"],
        "job_required_skills": ["Python", "Pandas", "NumPy", "TensorFlow", "Docker"]
    }
    response = client.post("/api/ml/skill-gap", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["possessed_count"] == 3
    assert res["missing_count"] == 2

def test_course_recommendations_endpoint():
    payload = {
        "missing_skills": ["Docker", "Kubernetes"],
        "target_role": "DevOps Engineer",
        "limit": 4
    }
    response = client.post("/api/ml/recommend-courses", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["count"] > 0

def test_interview_questions_endpoint():
    payload = {
        "job_title": "Machine Learning Engineer",
        "candidate_skills": ["Python", "Scikit-learn"],
        "missing_skills": ["PyTorch"]
    }
    response = client.post("/api/ml/interview-questions", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["count"] >= 3

def test_career_roadmap_endpoint():
    payload = {
        "candidate_skills": ["React", "JavaScript"],
        "missing_skills": ["Node.js", "MongoDB"],
        "target_role": "Full Stack Developer"
    }
    response = client.post("/api/ml/career-roadmap", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert len(res["stages"]) == 6

def test_colab_metrics_endpoint():
    response = client.get("/api/ml/colab-metrics")
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    assert "best_model" in res["data"]
    assert "linear_svm_accuracy" in res["data"]
    assert "models_evaluated" in res["data"]
    assert res["data"]["test_instances_evaluated"] == 34

def test_model_metrics_endpoint():
    response = client.get("/api/ml/model-metrics")
    assert response.status_code == 200
    res = response.json()
    assert "best_model" in res["data"]
    assert "models" in res["data"]

def test_eda_endpoint():
    response = client.get("/api/ml/eda")
    assert response.status_code == 200
    res = response.json()
    assert "datasets" in res["data"]
