import os
import re
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

from app.preprocessing.text_cleaner import clean_text
from app.preprocessing.skill_extractor import get_skill_extractor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE_PATH = os.path.join(BASE_DIR, "artifacts", "job_matcher_cache.joblib")

class JobMatcher:
    def __init__(self, jobs_csv_path: Optional[str] = None):
        if jobs_csv_path is None:
            jobs_csv_path = os.path.join(BASE_DIR, "data", "raw", "jobs.csv")
            
        self.jobs_csv_path = jobs_csv_path
        self.df_jobs = None
        self.vectorizer = None
        self.job_vectors = None
        self.skill_extractor = get_skill_extractor()
        self._load_and_index_jobs()
        
    def _load_and_index_jobs(self):
        """Loads and indexes jobs from jobs.csv, with artifact caching for ultra-fast startup."""
        if os.path.exists(CACHE_PATH):
            try:
                cached = joblib.load(CACHE_PATH)
                self.df_jobs = cached["df_jobs"]
                self.vectorizer = cached["vectorizer"]
                self.job_vectors = cached["job_vectors"]
                print(f"Loaded {len(self.df_jobs)} pre-indexed jobs from cache.")
                return
            except Exception as e:
                print(f"Cache load failed: {e}. Reindexing...")

        if not os.path.exists(self.jobs_csv_path):
            print(f"Warning: jobs.csv not found at {self.jobs_csv_path}")
            return
            
        print(f"Indexing jobs from {self.jobs_csv_path}...")
        df = pd.read_csv(self.jobs_csv_path)
        if '' in df.columns or 'Unnamed: 0' in df.columns:
            first_col = df.columns[0]
            df = df.drop(columns=[first_col])
            
        df = df.dropna(subset=['Job Description'])
        df['Job Title'] = df['Job Title'].fillna('Software Role').astype(str)
        df['cleaned_description'] = df['Job Description'].apply(clean_text)
        
        # Pre-extract required skills for jobs using fast priority skills
        print("Extracting required skills for job postings...")
        job_skills_list = []
        for desc in df['cleaned_description']:
            extracted = self.skill_extractor.extract_skills(desc)
            skill_names = [s['canonical'] for s in extracted[:12]]
            job_skills_list.append(skill_names)
        df['required_skills'] = job_skills_list
        
        # Fit TF-IDF on all job descriptions
        print("Fitting TF-IDF on job descriptions...")
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True
        )
        self.job_vectors = self.vectorizer.fit_transform(df['cleaned_description'])
        self.df_jobs = df.reset_index(drop=True)
        
        # Save cache
        try:
            os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
            joblib.dump({
                "df_jobs": self.df_jobs,
                "vectorizer": self.vectorizer,
                "job_vectors": self.job_vectors
            }, CACHE_PATH)
            print("Successfully cached indexed jobs to disk.")
        except Exception as e:
            print(f"Failed to cache job index: {e}")
            
        print(f"Successfully indexed {len(self.df_jobs)} jobs.")

    def search_jobs(self, query: str = "", category: str = "", limit: int = 20) -> List[Dict]:
        """Searches jobs by title, keywords or category."""
        if self.df_jobs is None or len(self.df_jobs) == 0:
            return []
            
        filtered = self.df_jobs
        if category and category != "All":
            filtered = filtered[filtered['Job Title'].str.contains(category, case=False, na=False)]
            
        if query:
            q_clean = query.lower()
            filtered = filtered[
                filtered['Job Title'].str.lower().str.contains(q_clean, na=False) |
                filtered['Job Description'].str.lower().str.contains(q_clean, na=False)
            ]
            
        results = []
        for idx, row in filtered.head(limit).iterrows():
            results.append({
                "job_id": int(idx),
                "title": row['Job Title'],
                "description": row['Job Description'][:400] + ("..." if len(row['Job Description']) > 400 else ""),
                "required_skills": row['required_skills'],
                "category": row['Job Title']
            })
        return results

    def match_resume_to_jobs(
        self,
        resume_text: str,
        resume_skills: List[str],
        top_n: int = 10,
        skill_weight: float = 0.50,
        semantic_weight: float = 0.35,
        keyword_weight: float = 0.15
    ) -> List[Dict]:
        """
        Ranks jobs using combined semantic similarity and skill coverage.
        """
        if self.df_jobs is None or len(self.df_jobs) == 0:
            return []
            
        cleaned_resume = clean_text(resume_text)
        resume_vec = self.vectorizer.transform([cleaned_resume])
        
        # Cosine similarity across all jobs
        cos_sims = cosine_similarity(resume_vec, self.job_vectors)[0]
        
        resume_skill_set = set(s.lower() for s in resume_skills)
        resume_words = set(re.findall(r'\b\w+\b', cleaned_resume))
        
        matches = []
        for idx, row in self.df_jobs.iterrows():
            sem_score = float(cos_sims[idx])
            
            # Skill coverage
            job_req_skills = row['required_skills']
            if job_req_skills:
                matched_skills = [s for s in job_req_skills if s.lower() in resume_skill_set]
                missing_skills = [s for s in job_req_skills if s.lower() not in resume_skill_set]
                skill_score = len(matched_skills) / len(job_req_skills)
            else:
                matched_skills = []
                missing_skills = []
                skill_score = 0.5
                
            # Keyword overlap
            job_words = set(re.findall(r'\b\w+\b', row['cleaned_description']))
            if job_words:
                overlap_words = resume_words.intersection(job_words)
                keyword_score = len(overlap_words) / min(len(job_words), 100)
            else:
                keyword_score = 0.5
                
            # Combined explainable score (normalized 0 to 100)
            combined_score = round(
                (skill_score * skill_weight +
                 sem_score * semantic_weight +
                 keyword_score * keyword_weight) * 100,
                1
            )
            # Bound score between 15% and 98%
            combined_score = max(15.0, min(98.5, combined_score))
            
            explanation = (
                f"Candidate possesses {len(matched_skills)} of {len(job_req_skills)} key required skills "
                f"({int(skill_score * 100)}% skill coverage) with a semantic content alignment of {int(sem_score * 100)}%."
            )
            
            matches.append({
                "job_id": int(idx),
                "job_title": row['Job Title'],
                "compatibility_score": combined_score,
                "semantic_score": round(sem_score * 100, 1),
                "skill_coverage_score": round(skill_score * 100, 1),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "description": row['Job Description'],
                "short_description": row['Job Description'][:300] + "...",
                "match_explanation": explanation
            })
            
        # Sort descending by compatibility score
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        return matches[:top_n]

_matcher = None

def get_job_matcher() -> JobMatcher:
    global _matcher
    if _matcher is None:
        _matcher = JobMatcher()
    return _matcher
