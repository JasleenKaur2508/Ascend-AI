import re
from typing import List, Dict, Optional
from app.preprocessing.text_cleaner import clean_text

class ATSScorer:
    def __init__(self):
        # Default educational weighting scheme
        self.default_weights = {
            "skill_match": 0.40,
            "semantic_relevance": 0.25,
            "keyword_overlap": 0.15,
            "qualification_relevance": 0.10,
            "experience_relevance": 0.10
        }
        
        self.qualification_keywords = [
            "bachelor", "b.tech", "btech", "b.e", "be", "bs", "master", "m.tech", 
            "mtech", "m.s", "ms", "phd", "computer science", "engineering", 
            "information technology", "diploma", "degree"
        ]
        
        self.experience_keywords = [
            "year", "years", "experience", "developed", "designed", "implemented", 
            "managed", "led", "architected", "delivered", "maintained", "built", "project"
        ]

    def score(
        self,
        resume_text: str,
        job_description: str,
        resume_skills: List[str],
        job_required_skills: List[str],
        semantic_score: float = 75.0,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict:
        """
        Calculates an explainable ATS compatibility breakdown and recommendations.
        """
        weights = custom_weights if custom_weights else self.default_weights
        
        cleaned_resume = clean_text(resume_text)
        cleaned_job = clean_text(job_description)
        
        # 1. Skill Match Score
        resume_skills_set = set(s.lower() for s in resume_skills)
        job_skills_set = set(s.lower() for s in job_required_skills)
        
        matched_skills = [s for s in job_required_skills if s.lower() in resume_skills_set]
        missing_skills = [s for s in job_required_skills if s.lower() not in resume_skills_set]
        
        if job_skills_set:
            skill_score = (len(matched_skills) / len(job_skills_set)) * 100
        else:
            skill_score = 70.0
            
        # 2. Keyword Overlap
        resume_tokens = set(re.findall(r'\b[a-z]{3,}\b', cleaned_resume))
        job_tokens = set(re.findall(r'\b[a-z]{3,}\b', cleaned_job))
        
        # Filter common stop words from keyword list
        stop_words = {"the", "and", "for", "with", "that", "this", "from", "are", "have", "will", "our", "you", "your", "can", "work"}
        significant_job_tokens = [t for t in job_tokens if t not in stop_words]
        
        matched_keywords = [t for t in significant_job_tokens if t in resume_tokens]
        missing_keywords = [t for t in significant_job_tokens if t not in resume_tokens][:15]
        
        if significant_job_tokens:
            keyword_score = (len(matched_keywords) / len(significant_job_tokens)) * 100
            keyword_score = min(100.0, keyword_score * 1.5)  # calibrated scaling
        else:
            keyword_score = 65.0
            
        # 3. Qualification Relevance
        qual_matches = [q for q in self.qualification_keywords if q in cleaned_resume]
        job_qual_needs = [q for q in self.qualification_keywords if q in cleaned_job]
        
        if job_qual_needs:
            matched_quals = [q for q in job_qual_needs if q in cleaned_resume]
            qual_score = (len(matched_quals) / len(job_qual_needs)) * 100
        else:
            qual_score = 90.0 if qual_matches else 60.0
            
        # 4. Experience & Action Verbs Relevance
        exp_matches = [e for e in self.experience_keywords if e in cleaned_resume]
        exp_score = min(100.0, (len(exp_matches) / 8.0) * 100)
        
        # 5. Composite Score Calculation
        composite_score = round(
            (skill_score * weights["skill_match"] +
             semantic_score * weights["semantic_relevance"] +
             keyword_score * weights["keyword_overlap"] +
             qual_score * weights["qualification_relevance"] +
             exp_score * weights["experience_relevance"]),
            1
        )
        composite_score = max(20.0, min(98.0, composite_score))
        
        # Actionable Recommendations
        recommendations = []
        if len(missing_skills) > 0:
            top_missing = missing_skills[:4]
            recommendations.append(
                f"Incorporate missing core skills explicitly into your resume: {', '.join(top_missing)}."
            )
        if len(missing_keywords) > 3:
            recommendations.append(
                f"Include key industry terms from the job posting such as '{missing_keywords[0]}', '{missing_keywords[1]}', and '{missing_keywords[2]}'."
            )
        if exp_score < 70:
            recommendations.append(
                "Use strong active verbs (e.g., 'Architected', 'Spearheaded', 'Optimized') to highlight quantifiable outcomes."
            )
        if qual_score < 70:
            recommendations.append(
                "Ensure your formal education degree and technical domain are clearly emphasized in an Education section."
            )
        if len(recommendations) == 0:
            recommendations.append("Your resume shows strong alignment with this role! Ensure your project bullet points quantify business impact.")
            
        return {
            "overall_ats_score": composite_score,
            "weights_used": weights,
            "breakdown": {
                "skill_match": round(skill_score, 1),
                "semantic_relevance": round(semantic_score, 1),
                "keyword_overlap": round(keyword_score, 1),
                "qualification_relevance": round(qual_score, 1),
                "experience_relevance": round(exp_score, 1)
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "matched_keywords_sample": matched_keywords[:12],
            "missing_keywords_sample": missing_keywords[:8],
            "recommendations": recommendations,
            "disclaimer": "This is an educational ATS-style heuristic compatibility analysis designed for interview and resume preparation, not an official commercial ATS output."
        }

_ats_scorer = None

def get_ats_scorer() -> ATSScorer:
    global _ats_scorer
    if _ats_scorer is None:
        _ats_scorer = ATSScorer()
    return _ats_scorer
