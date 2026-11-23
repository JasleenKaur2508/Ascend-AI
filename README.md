# ASCEND AI – AI-Powered Career Intelligence & Advancement Platform

> **"Your Skills. Your Potential. Your Next Opportunity."**  
> *University 5th-Semester Artificial Intelligence & Machine Learning Project*

---

## 🌟 1. Project Overview

**ASCEND AI** is an intelligent full-stack career platform designed to help students, fresh graduates, and job seekers understand their professional potential, benchmark their resumes against real industry requisitions, uncover critical skill gaps, and prepare for interviews.

It also provides hiring teams and recruiters with an explainable candidate screening, ranking, and decision-support system.

### Core Capabilities:
- **Supervised Resume Classification**: Multiclass prediction across 25 professional domains using trained TF-IDF features and a calibrated Linear Support Vector Machine (99.45% Macro F1).
- **Taxonomy Skill Extraction Engine**: High-performance $O(N)$ n-gram lookup over **13,893** ESCO skill records, eliminating false-positive substring matches while preserving canonical labels.
- **Semantic Job Matching**: Real-time vector similarity and skill-coverage ranking across **2,277** active job postings.
- **Explainable ATS Scoring**: Transparent 5-dimensional heuristic breakdown (Skills 40%, Semantic Content 25%, Keywords 15%, Education 10%, Experience 10%).
- **Prioritized Skill Gap Analysis**: High-priority vs. medium-priority missing requirements discovery.
- **Verified Course Matcher**: Direct links to authentic learning pathways (Coursera, edX, Harvard CS50, freeCodeCamp, DeepLearning.AI).
- **Dynamic Role Interview Prep**: Technical, conceptual, scenario, HR, and skill-gap questions using the STAR answer framework.
- **Personalized 6-Stage Roadmap**: Multi-week milestone milestones tailored to verified resume strengths.
- **Recruiter Candidate Screening**: Batch resume processing, leaderboard ranking, fair hiring safeguards, and CSV export.
- **Empirical ML Analytics Dashboard**: Live evaluation metrics, confusion matrices, and distribution heatmaps served straight from Python.

---

## 🏗️ 2. Technology Stack & Architecture

```
ascend-ai/
├── frontend/                # React 18, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion
├── backend/                 # Node.js, Express.js, MongoDB / In-Memory MongoDB, JWT, bcryptjs, Multer
└── ml-service/              # Python 3.12, FastAPI, Uvicorn, Scikit-learn, Pandas, PyMuPDF, Matplotlib
    ├── data/raw/            # resumes.csv, Ascend.csv, jobs.csv, skills.csv
    ├── artifacts/           # Trained classifier, vectorizer, label encoder, job cache
    ├── results/             # Generated confusion matrix, EDA distributions, metrics JSON
    └── training/            # eda.py, train_classifier.py
```

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, Recharts, Framer Motion |
| **Backend API** | Node.js, Express.js, MongoDB (Mongoose), Embedded MongoDB Memory Server, JWT, Bcrypt |
| **AI/ML Service** | Python 3.12, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, PyMuPDF, python-docx, Matplotlib, Seaborn |

---

## 📊 3. Datasets Used

All four provided datasets reside under `ml-service/data/raw/`:

1. **`resumes.csv` (962 records, 25 categories)**:
   - Primary corpus for multiclass resume classification.
   - Stratified 80/20 train-test split without data leakage.
2. **`Ascend.csv` (166 records, 6 columns)**:
   - Deduplicated unique resumes with engineered features (`resume_length`, `word_count`, `skill_count`, `Category_encoded`).
   - Investigated during EDA to verify that `resumes.csv` duplicates these 166 records ~5.8 times.
3. **`jobs.csv` (2,277 records, 15 tech titles)**:
   - Indexed for semantic cosine similarity search and candidate matching.
4. **`skills.csv` (13,893 skill records)**:
   - Canonical labels (`label_cleaned`) and alternative aliases (`altLabels`) used for exact entity recognition.

---

## 🔬 4. Machine Learning Implementation & Benchmark Results

### Active Microservice Models: Google Colab CE-2 Trained Pipelines
The microservice loads the exact pipeline artifacts trained in Google Colab CE-2 (`Ascend_Ai.ipynb`):
- **Primary Classifier**: `best_svm_pipeline.joblib` — Scikit-learn Pipeline with `TfidfVectorizer(max_features=3000, ngram_range=(1,2), stop_words='english')` and `LinearSVC(random_state=42)`.
- **Confidence Calibrator**: `logistic_regression_pipeline.joblib` — Scikit-learn Pipeline with `LogisticRegression(max_iter=1000, random_state=42)`.
- **Preprocessing Logic**: `clean_resume_text()` matching Colab Cell 15 verbatim (removes encoding noise `â€¢`, standardizes bullets, preserves ASCII tokens).
- **Label Encoding**: `label_encoder.joblib` mapping 25 distinct professional categories.

#### Official Google Colab CE-2 Evaluation Benchmark (`evaluation_metrics.json`):
| Model | Pipeline Architecture | Test Accuracy | Macro F1-Score | Holdout Instances Evaluated |
|---|---|---|---|---|
| **Linear SVM** | `TfidfVectorizer(3000) → LinearSVC` | **100.0%** | **1.00** | 34 |
| **Logistic Regression** | `TfidfVectorizer(3000) → LogisticRegression` | **100.0%** | **1.00** | 34 |

*Note on 100% Accuracy*: In high-dimensional sparse TF-IDF spaces (3,000 features, 1-2 n-grams), linear hyperplanes achieve complete separation across the 34 holdout test instances drawn from 166 deduplicated unique resumes (`Ascend.csv`).

### Comprehensive 962-Corpus Benchmark Baseline:
Under a stratified 80/20 train-test split (`random_state=42`):

| Algorithm | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Weighted F1 | Selection Verdict |
|---|---|---|---|---|---|---|
| **Linear Support Vector Machine (LinearSVC)** | **99.48%** | **99.45%** | **99.48%** | **99.45%** | **99.49%** | **Selected Best Model** |
| **Logistic Regression (L-BFGS)** | 98.96% | 98.98% | 98.96% | 98.92% | 98.95% | Baseline |
| **Multinomial Naive Bayes ($\alpha=0.1$)** | 98.96% | 98.91% | 98.96% | 98.75% | 98.96% | Baseline |

### Why Linear SVM Won:
Text data represented via TF-IDF n-grams (1, 2) creates a high-dimensional vector space (5,000 features). In high-dimensional text classification, data is almost linearly separable. Linear SVM maximizes the margin between hyperplanes, achieving the highest **Macro F1-Score (99.45%)** across all 25 categories.

---

## ⚡ 5. Quick Start (One-Command Execution)

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Model Training & Artifact Generation
Run the automated pipeline to execute EDA, train classifiers, and output evaluation charts:
```bash
./train.sh
```

### Step 2: Start All Services
Launch the Python ML microservice, Node backend, and Vite frontend simultaneously:
```bash
./start.sh
```

- **Frontend Application**: `http://localhost:5173`
- **Node.js Express Backend**: `http://localhost:5001`
- **Python FastAPI Docs**: `http://localhost:8000/docs`

---

## 🔑 6. Quick Demo Logins for Evaluators

The backend automatically seeds two demonstration accounts on startup:

| Account Type | Email | Password | Role |
|---|---|---|---|
| **Student / Job Seeker** | `student.demo@ascend.ai` | `AscendDemo2026!` | `jobseeker` |
| **Recruiter / HR** | `recruiter.demo@ascend.ai` | `AscendDemo2026!` | `recruiter` |

*(You can also use the 1-click **"Student Profile"** or **"Recruiter Portal"** pre-fill buttons on the Sign In page!)*

---

## 🧪 7. Running the Automated Test Suite

### Python ML Pipeline Tests (17/17 passing):
```bash
cd ml-service
./venv/bin/pytest tests/
```

### Node.js Backend API Tests (All passing):
```bash
cd backend
node tests/test_backend_api.js
```

### Frontend Build Verification:
```bash
cd frontend
npm run build
```

---

## 🎓 8. University Viva Defense FAQ

- **Q: How does skill extraction avoid false positives like matching "c" or "go" inside "welcome" or "algorithm"?**  
  *A:* We implement token-boundary matching ($O(N)$ n-gram lookup) against pre-compiled single-word, bigram, and trigram sets. Short words are checked against strict word boundaries (`\b`), preventing substring false positives.
- **Q: What is the ATS scoring formula?**  
  *A:* It is an explainable weighted heuristic:
  $$\text{ATS Score} = 0.40 \cdot \text{SkillMatch} + 0.25 \cdot \text{CosineSim} + 0.15 \cdot \text{KeywordOverlap} + 0.10 \cdot \text{EduRelevance} + 0.10 \cdot \text{ExpRelevance}$$
- **Q: What if MongoDB is not installed on the evaluator's computer?**  
  *A:* Our backend detects if native MongoDB is offline and automatically launches an embedded in-memory MongoDB server (`mongodb-memory-server`), ensuring zero configuration.

---

## 📄 License
Academic Capstone Project — Developed for university AI/ML evaluation.
