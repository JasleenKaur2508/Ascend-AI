# ASCEND AI — An End-to-End AI Career Assistant

> **"Your Skills. Your Potential. Your Next Opportunity."**  
> *University 5th-Semester Artificial Intelligence & Machine Learning Capstone Project (CE-2 Validated)*

---

## 1. Project Title and Overview

**ASCEND AI** is an end-to-end Artificial Intelligence and Machine Learning career intelligence platform built with a **React + Vite** frontend, **Node.js + Express + MongoDB** backend, and a dedicated **Python FastAPI + Scikit-learn** ML microservice, synchronized directly with its reproducible Google Colab research notebook (`Ascend_AI_CE2_Final_Complete.ipynb`).

The platform enables **students and job seekers** to upload their resumes (PDF, DOCX, or TXT, including scanned image-based PDFs via Tesseract OCR fallback), classify their professional domain, evaluate resume–job alignment using TF-IDF cosine similarity and an explainable 5-dimensional ATS-style matching rubric, uncover prioritized skill gaps, discover verified learning courses, generate personalized 6-stage career roadmaps, and practice role-specific STAR interview questions. Simultaneously, it provides **recruiters and hiring teams** with an explainable batch candidate screening, multi-resume ranking, and CSV export workflow.

---

## 2. Problem Statement

Job seekers and graduating students frequently struggle to evaluate how their resumes align with industry job descriptions, which technical competencies they are missing for a target role, and how applicant tracking heuristics filter their profiles. Conversely, recruiters manually screening dozens of heterogeneous resumes against a single job requisition face high cognitive overhead and inconsistent evaluation criteria.

ASCEND AI solves both challenges through three clearly separated, transparent NLP and ML mechanisms:
1. **Supervised Multiclass Resume Category Classification** (`TfidfVectorizer` + `LogisticRegression` and `LinearSVC` with balanced class weights across 25 professional domains).
2. **Unsupervised Resume–Job Text Similarity Matching** (`TfidfVectorizer` + Cosine Similarity over 2,270 unique job descriptions).
3. **Explainable ATS-Style Heuristic & Skill-Gap Analysis** (O(N) n-gram taxonomy extraction over 13,893 ESCO skills combined with a weighted 5-factor scoring formula).

---

## 3. Key Features

- **Multi-Format Resume Ingestion & OCR Fallback**: Parses standard digital PDFs (`PyMuPDF`), Word documents (`python-docx`), raw text, and scanned image PDFs (`pytesseract` OCR fallback).
- **Supervised Resume Domain Classification**: Predicts the candidate's primary career category across 25 domains with calibrated top-3 probability distributions.
- **O(N) Taxonomy Skill Extraction Engine**: Extracts canonical technical and domain skills from raw text using unigrams, bigrams, and trigrams matched against a curated ESCO skill vocabulary (`skill_vocabulary.joblib`) while filtering generic English stopwords and non-skill noise.
- **TF-IDF Cosine Similarity Job Matcher**: Benchmarks candidate profiles against 2,270 unique industry job descriptions (`jobs.csv`) and ranks the highest-compatibility openings.
- **Explainable 5-Dimensional ATS-Style Scorer**: Computes a transparent composite readiness score broken down into Skill Coverage (40%), TF-IDF Semantic Similarity (25%), Action & Qualification Keywords (15%), Education Alignment (10%), and Experience Evidence (10%).
- **Dynamic Role-Synchronized Skill Gap Analysis**: Synchronizes the selected target role across the Candidate Dashboard, Skill Gap Analysis, Course Recommendations, Career Roadmap, and Interview Prep modules.
- **Deduplicated Verified Course Recommendations**: Maps each missing skill to a unique, verified learning pathway from Coursera, edX, DeepLearning.AI, freeCodeCamp, Harvard CS50, and official documentation (strictly 1 distinct course per missing skill).
- **AI Career Assistant (Summary Enhancer, 6-Stage Roadmap & Interview Prep)**: Generates ATS-optimized executive summaries, 6-stage milestone learning roadmaps, and personalized technical/behavioral interview questions with STAR method guidance.
- **Recruiter Batch Candidate Screening**: Evaluates multiple candidate profiles against a custom job description and required skill set in real time, producing ranked leaderboards, match tier badges, and one-click CSV exports.
- **Live ML Analytics & Notebook Synchronization**: Displays the exact reproducible holdout metrics, 3-fold stratified cross-validation scores, confusion matrices, and dataset statistics exported by `Ascend_AI_CE2_Final_Complete.ipynb`.

---

## 4. System Architecture

```text
+-------------------------------------------------------------------------+
|                        FRONTEND (React 18 + Vite)                       |
|   Light Liquid-Glass UI | Interactive 3D Neural Background | Recharts   |
|                    Runs on: http://localhost:5173                       |
+------------------------------------+------------------------------------+
                                     | REST API (JWT Bearer Auth / JSON / Multipart)
                                     v
+-------------------------------------------------------------------------+
|                    BACKEND API (Node.js + Express.js)                   |
|     JWT Auth | Multer Upload Memory Stream | Role & Career Controllers  |
|                    Runs on: http://localhost:5001                       |
+-----------------+----------------------------------+--------------------+
                  | Mongoose ODM                     | Internal HTTP Proxy
                  v                                  v
+----------------------------------+   +----------------------------------+
|     DATABASE (MongoDB /          |   |   ML MICROSERVICE (Python 3.12   |
|   Embedded Memory Server)        |   |        FastAPI + Scikit-learn)   |
| Users, Resumes, Jobs, Courses,   |   |  Loads Canonical Colab Artifacts |
|     AnalysisResults, Roadmaps    |   |   Runs on: http://localhost:8000 |
+----------------------------------+   +----------------------------------+
```

---

## 5. Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v7, Axios, Framer Motion, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, `mongodb-memory-server` (zero-config fallback), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `multer`, `form-data` |
| **ML Microservice** | Python 3.12, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, Joblib, PyMuPDF (`fitz`), `pytesseract`, Pillow, `python-docx`, Matplotlib, Seaborn |
| **Academic Notebook** | Jupyter / Google Colab (`Ascend_AI_CE2_Final_Complete.ipynb`) |

---

## 6. Project Folder Structure

```text
ascend-ai/
├── Ascend_AI_CE2_Final_Complete.ipynb   # Final executed 21-section Google Colab ML notebook
├── README.md                            # Complete project documentation
├── start.sh                             # One-command launcher for ML service, Backend, and Frontend
├── train.sh                             # Reproducible model training & artifact regeneration script
├── frontend/                            # React 18 + Vite client application
│   ├── src/
│   │   ├── components/                  # InteractiveNeuralBackground, CustomCursor, Navbar, Sidebar
│   │   ├── context/                     # AuthContext (JWT session & target role state sync)
│   │   ├── pages/                       # Landing, Dashboard, ResumeAnalysis, JobMatch, SkillGap,
│   │   │                                # Courses, Roadmap, Interview, Recruiter, Analytics, Profile
│   │   ├── services/                    # Axios API client (multipart & JSON handlers)
│   │   └── utils/                       # roleStandards.js (curated role skills & gap calculator)
│   └── package.json
├── backend/                             # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                      # MongoDB connection (with in-memory fallback) & demo seeder
│   │   ├── controllers/                 # auth, resume, job, career, recruiter, analytics controllers
│   │   ├── middleware/                  # JWT authentication & Multer memory upload middleware
│   │   ├── models/                      # User, Resume, Job, Course, AnalysisResult schemas
│   │   ├── routes/                      # Express route definitions
│   │   ├── services/                    # mlService.js (FastAPI communication bridge)
│   │   └── server.js                    # Express application entrypoint
│   ├── tests/
│   │   └── test_backend_api.js          # Automated Node.js backend integration tests
│   └── package.json
└── ml-service/                          # Python FastAPI ML & NLP Microservice
    ├── app/
    │   ├── main.py                      # FastAPI endpoints (/health, /api/ml/*)
    │   ├── preprocessing/               # text_cleaner.py, skill_extractor.py
    │   ├── recommendations/             # course_recommender.py, career_roadmap.py,
    │   │                                # interview_generator.py, summary_enhancer.py
    │   └── services/                    # resume_parser.py, job_matcher.py, ats_scorer.py
    ├── artifacts/                       # Canonical trained model artifacts exported by notebook/training
    │   ├── logistic_regression_tfidf.joblib
    │   ├── linear_svm_tfidf.joblib
    │   ├── label_encoder.joblib
    │   ├── skill_vocabulary.joblib
    │   └── evaluation_metrics.json
    ├── data/raw/                        # Project datasets (resumes.csv, jobs.csv, skills.csv, Ascend.csv)
    ├── results/                         # Generated evaluation metrics & confusion matrix PNGs
    ├── training/                        # train_classifier.py, eda.py
    └── tests/                           # test_ml_pipeline.py, test_api_endpoints.py
```

---

## 7. Datasets Used

All four datasets are stored in `ml-service/data/raw/` and are loaded by both `Ascend_AI_CE2_Final_Complete.ipynb` (supporting both `resumes(2).csv` / `resumes.csv` naming conventions) and the FastAPI ML service:

| Dataset File | Colab Upload Alias | Raw Rows | Cleaned / Deduplicated Rows | Key Columns | Purpose in ASCEND AI |
|---|---|---:|---:|---|---|
| **`resumes.csv`** | `resumes(2).csv` | 962 | **166 unique resumes** (796 exact duplicates removed) | `Category`, `Resume` | Supervised multiclass resume classification across 25 professional categories |
| **`jobs.csv`** | `jobs(2).csv` | 2,277 | **2,270 unique jobs** (7 duplicates removed) | `Job Title`, `Job Description` | TF-IDF cosine similarity job recommendation and role requirement benchmarking |
| **`skills.csv`** | `skills(3).csv` | 13,893 | **13,891 non-empty rows** (`10,697` filtered skill terms) | `label_cleaned`, `altLabels` | Canonical ESCO taxonomy dictionary for O(N) n-gram skill extraction |
| **`Ascend.csv`** | `Ascend(2).csv` | 166 | **166 engineered profiles** | `Category`, `Resume`, `resume_length`, `word_count`, `skill_count`, `Category_encoded` | Independent engineered resume feature verification dataset |

> **Why Deduplication Before Splitting Is Essential**: `resumes.csv` contains 962 rows produced by repeating 166 unique resumes approximately 5.8 times. Splitting the raw 962 rows without deduplication leaks identical resumes into both training and test sets, artificially inflating accuracy to ~99.48%. In our final notebook and production pipeline, all 796 duplicate rows are removed **before** performing the stratified 80/20 train-test split (`132` training resumes, `34` unseen test resumes, `random_state=42`).

---

## 8. Machine Learning Pipeline

### 8.1 Text Preprocessing & Feature Engineering
1. **Unicode & Artifact Normalization (`clean_text`)**: Strips BOM characters (`\ufeff`), non-breaking spaces (`\xa0`), mojibake bullets (`â€¢`, `•`), and normalizes dashes (`–`, `—` → `-`) and whitespace.
2. **Engineered Profile Features**: Computes character length (`resume_length`), token count (`word_count`), and extracted skill cardinality (`skill_count`).
3. **TF-IDF Vectorization**: Each classifier encapsulates `TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 2), sublinear_tf=True)` inside a Scikit-learn `Pipeline` so vocabulary and IDF weights are fitted strictly on `X_train` (`132` rows), preventing data leakage into `X_test` (`34` rows).

### 8.2 Supervised Classification Models Trained
- **Model 1 — Logistic Regression (`logistic_regression_tfidf.joblib`)**:
  - `Pipeline([("tfidf", TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 2), sublinear_tf=True)), ("classifier", LogisticRegression(max_iter=1500, class_weight="balanced", random_state=42))])`
- **Model 2 — Linear Support Vector Machine (`linear_svm_tfidf.joblib`)**:
  - `Pipeline([("tfidf", TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 2), sublinear_tf=True)), ("classifier", LinearSVC(class_weight="balanced", random_state=42))])`

### 8.3 Distinction Between Classification, Similarity Matching, and ATS Scoring
- **Resume Category Classification**: A supervised 25-class prediction task that identifies which professional domain (`Data Science`, `Java Developer`, `DevOps Engineer`, `Testing`, etc.) a resume belongs to. Classification accuracy measures how often the model predicts the dataset's `Category` label on unseen holdout resumes—**it is not an ATS score or hiring probability**.
- **Resume–Job Cosine Similarity**: An unsupervised vector-space comparison computing the cosine of the angle between the TF-IDF bigram vectors of a resume and a job description. It measures lexical/topical overlap ($0\%–100\%$).
- **ATS-Style Heuristic Readiness Score**: An explainable decision-support composite metric combining:
  $$\text{ATS Score} = 0.40 \cdot \text{SkillMatch} + 0.25 \cdot \text{SemanticSimilarity} + 0.15 \cdot \text{KeywordAlignment} + 0.10 \cdot \text{EducationMatch} + 0.10 \cdot \text{ExperienceEvidence}$$

---

## 9. Model Evaluation Results

All metrics below are reproduced directly by executing `Ascend_AI_CE2_Final_Complete.ipynb` and `ml-service/training/train_classifier.py` on the deduplicated 166-resume corpus (`132` train / `34` test, 25 classes, `random_state=42`):

| Model | Holdout Test Accuracy (34 Unseen Resumes) | Weighted Precision | Weighted Recall | Weighted F1-Score | Macro F1-Score | 3-Fold Stratified CV Weighted F1 | Role in Production |
|---|---:|---:|---:|---:|---:|---:|---|
| **Logistic Regression** | **88.24%** (`0.8824`, 30/34) | **85.54%** (`0.8554`) | **88.24%** (`0.8824`) | **85.50%** (`0.8550`) | **82.76%** (`0.8276`) | **86.78% ± 4.56%** (`0.8678 ± 0.0456`) | **Selected Best Holdout Model (by Weighted F1)** & Probability Calibrator |
| **Linear SVM (`LinearSVC`)** | **88.24%** (`0.8824`, 30/34) | **84.56%** (`0.8456`) | **88.24%** (`0.8824`) | **85.01%** (`0.8501`) | **82.10%** (`0.8210`) | **87.16% ± 4.64%** (`0.8716 ± 0.0464`) | **Highest Cross-Validation Generalization Model** |

### 3-Fold Stratified Cross-Validation Breakdown (`n_splits=3`, limited by minimum class cardinality of 3):
- **Fold 1**: Logistic Regression = `0.9037` | Linear SVM = `0.9037`
- **Fold 2**: Logistic Regression = `0.8965` | Linear SVM = `0.9056`
- **Fold 3**: Logistic Regression = `0.8033` | Linear SVM = `0.8056`

---

## 10. Notebook and Application Synchronization

The Google Colab notebook (`Ascend_AI_CE2_Final_Complete.ipynb`, Section 20) and the FastAPI ML service (`ml-service/app/services/resume_parser.py` and `ml-service/training/train_classifier.py`) share **one canonical model-artifact naming convention** stored in `ml-service/artifacts/`:

| Canonical Artifact Filename | Format | Exported By Notebook & `train_classifier.py` | Loaded By `ml-service` | Description |
|---|---|---|---|---|
| `logistic_regression_tfidf.joblib` | Joblib Pipeline | Yes | Yes (`resume_parser.py`) | Trained `TfidfVectorizer` + `LogisticRegression` pipeline |
| `linear_svm_tfidf.joblib` | Joblib Pipeline | Yes | Yes (`resume_parser.py`) | Trained `TfidfVectorizer` + `LinearSVC` pipeline |
| `label_encoder.joblib` | Joblib `LabelEncoder` | Yes | Yes (`resume_parser.py`) | Encodes/decodes the 25 canonical resume category labels |
| `skill_vocabulary.joblib` | Joblib `list[str]` | Yes | Yes (`resume_parser.py`) | Filtered list of 10,697 canonical ESCO skill terms |
| `evaluation_metrics.json` | JSON | Yes | Yes (`main.py`) | Reproducible holdout and 3-fold CV evaluation metrics served to `/api/ml/colab-metrics` and `/api/ml/model-metrics` |

To regenerate all 5 canonical artifacts locally at any time:
```bash
cd ml-service
./venv/bin/python training/train_classifier.py
```

---

## 11. Installation and Setup

### Prerequisites
- **Python**: 3.10+ (3.12 recommended; Tesseract OCR optional for scanned image PDFs)
- **Node.js**: 18+ and `npm`
- **MongoDB**: Local MongoDB on port `27017` (optional — if local MongoDB is not running, the backend automatically boots an embedded `mongodb-memory-server` instance and seeds demo data).

### Step 1: Python ML Microservice Setup
```bash
cd ml-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python training/train_classifier.py
```

### Step 2: Node.js Express Backend Setup
```bash
cd ../backend
npm install
```

### Step 3: React + Vite Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 12. Environment Variables

### `backend/.env`
```env
PORT=5001
JWT_SECRET=ascend_ai_production_jwt_secret_2026_super_secure
MONGO_URI=mongodb://127.0.0.1:27017/ascend_ai
ML_SERVICE_URL=http://127.0.0.1:8000
```

### `frontend/.env` (Optional — defaults to `/api` via Vite proxy or `http://localhost:5001/api`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 13. Running the Application Locally

### Option A: One-Command Startup Script
From the repository root:
```bash
./start.sh
```

### Option B: Starting Each Service Individually
1. **Start the FastAPI ML Microservice (Port 8000)**:
   ```bash
   cd ml-service
   ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. **Start the Express Backend API (Port 5001)**:
   ```bash
   cd backend
   npm start
   ```
3. **Start the React + Vite Frontend (Port 5173)**:
   ```bash
   cd frontend
   npm run dev
   ```

### Demo Accounts (Auto-Seeded on Backend Startup)
| Portal Role | Email | Password |
|---|---|---|
| **Candidate / Student** | `student.demo@ascend.ai` | `AscendDemo2026!` |
| **Recruiter / Hiring Team** | `recruiter.demo@ascend.ai` | `AscendDemo2026!` |

---

## 14. Running the Google Colab Notebook

1. Open `Ascend_AI_CE2_Final_Complete.ipynb` in **Google Colab** or local JupyterLab.
2. Run **Section 1** to load required libraries (`scikit-learn`, `pandas`, `numpy`, `matplotlib`, `joblib`).
3. In **Section 2**, upload the 4 project CSV datasets when prompted (`resumes(2).csv`, `jobs(2).csv`, `skills(3).csv`, `Ascend(2).csv` — or their standard names `resumes.csv`, `jobs.csv`, `skills.csv`, `Ascend.csv`).
4. Run all remaining cells sequentially through **Section 21**:
   - Cleans and deduplicates the datasets (`962` → `166` unique resumes).
   - Trains both `LogisticRegression` and `LinearSVC` TF-IDF pipelines.
   - Outputs the holdout evaluation metrics (`88.24%` accuracy), 3-fold stratified CV curves, confusion matrices, TF-IDF cosine similarity matches, and ESCO skill-gap tables.
   - Exports `logistic_regression_tfidf.joblib`, `linear_svm_tfidf.joblib`, `label_encoder.joblib`, `skill_vocabulary.joblib`, and `evaluation_metrics.json` inside `ascend_ai_artifacts.zip`.

---

## 15. API Endpoints

### Python FastAPI ML Service (`http://localhost:8000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health status and verification of loaded canonical `.joblib` artifacts |
| `POST` | `/api/ml/analyze-resume` | Multipart file (PDF/DOCX/TXT) or raw text parsing, OCR fallback, skill extraction & ML classification |
| `POST` | `/api/ml/classify-resume` | Predicts resume category and top-3 confidence scores from text |
| `POST` | `/api/ml/extract-skills` | Extracts canonical ESCO skills and domain categories from text |
| `POST` | `/api/ml/match-job` | Ranks top matching jobs from `jobs.csv` using TF-IDF cosine similarity and skill overlap |
| `POST` | `/api/ml/ats-score` | Calculates the 5-dimensional ATS-style match score and missing/matched skill breakdown |
| `POST` | `/api/ml/skill-gap` | Computes possessed vs. missing skills and prioritized severity tiers |
| `POST` | `/api/ml/recommend-courses` | Returns deduplicated verified courses (1 per missing skill) |
| `POST` | `/api/ml/career-roadmap` | Generates a personalized 6-stage learning roadmap for a target role |
| `POST` | `/api/ml/interview-questions` | Generates role-specific technical, scenario, and skill-gap interview questions |
| `POST` | `/api/ml/enhance-summary` | Produces 3 ATS-optimized executive summary variations |
| `POST` | `/api/ml/screen-candidates` | Batch screens and ranks multiple candidates against a job description |
| `GET` | `/api/ml/colab-metrics` | Returns the canonical evaluation metrics from `evaluation_metrics.json` |
| `GET` | `/api/ml/model-metrics` | Returns full model comparison metrics and confusion matrices |
| `GET` | `/api/ml/eda` | Returns dataset statistics and category distributions |

### Node.js Express Backend (`http://localhost:5001`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Express backend health status |
| `POST` | `/api/auth/register` | Registers a candidate or recruiter account and returns a JWT |
| `POST` | `/api/auth/login` | Authenticates user credentials and returns a JWT |
| `GET` / `PUT` | `/api/auth/profile` | Retrieves or updates the authenticated user's profile and target role |
| `POST` | `/api/resumes/upload` | Uploads a PDF/DOCX/TXT resume or raw text, forwards to FastAPI, and persists to MongoDB |
| `POST` | `/api/resumes/ats-score` | Evaluates resume against a custom job description and stores `AnalysisResult` |
| `POST` | `/api/jobs/recommend` | Retrieves top TF-IDF cosine similarity job matches |
| `POST` | `/api/career/skill-gap` | Computes skill gap and deduplicated course recommendations |
| `POST` | `/api/career/roadmap` | Generates and persists a 6-stage career roadmap |
| `POST` | `/api/career/interview-prep` | Generates tailored STAR interview questions |
| `POST` | `/api/recruiter/screen-candidates` | Runs batch recruiter candidate screening and ranking |
| `GET` | `/api/analytics/colab-metrics` | Proxies canonical notebook evaluation metrics to the frontend |

---

## 16. Testing and Verification

All automated test suites have been executed and verified:

### 1. Python ML Pipeline & FastAPI Endpoint Tests (`19/19 Passing`)
```bash
cd ml-service
./venv/bin/pytest tests/ -v
```
- `tests/test_ml_pipeline.py`: Verifies technical token preservation (`C++`, `C#`, `.NET`, `Node.js`), contact regex parsing, ESCO skill extraction without irrelevant false positives, presence of all 5 canonical artifact files, resume category prediction, 5-factor ATS scoring, and course recommendations.
- `tests/test_api_endpoints.py`: Verifies `/health` canonical artifact flags and all `/api/ml/*` endpoints.

### 2. Node.js Express Backend Integration Tests (`6/6 Passing`)
```bash
cd backend
npm test
```
- `tests/test_backend_api.js`: Verifies `/health`, user registration, JWT login, profile retrieval, target role persistence, and `/api/analytics/colab-metrics` synchronization (`best_model === 'Logistic Regression'`, `linear_svm_accuracy === 0.8824`, `logistic_regression_accuracy === 0.8824`).

### 3. React + Vite Production Build Verification (`Passing`)
```bash
cd frontend
npm run build
```

---

## 17. Key Engineering Improvements

1. **Unified Notebook & Microservice Artifacts**: Eliminated legacy artifact naming mismatches (`best_svm_pipeline.joblib`, `logistic_regression_pipeline.joblib`, `classifier_best.joblib`) and standardized on the exact 5 files exported by `Ascend_AI_CE2_Final_Complete.ipynb`.
2. **Data Leakage Prevention**: Removed all 796 duplicate resume records prior to train/test splitting and wrapped `TfidfVectorizer` inside each classifier `Pipeline`.
3. **High-Precision ESCO Skill Filtering**: Eliminated comma-splitting on multi-clause ESCO `altLabels` descriptions and filtered generic English nouns/verbs so only genuine technical and professional skills are extracted.
4. **Scanned PDF OCR & PTY Safety**: Added `pytesseract` + `PyMuPDF` page rendering fallback for image-only PDFs and removed unsafe stdout print calls that could fail under backgrounded daemon processes.
5. **Word-Boundary ATS Qualification Matching & True Cosine Similarity**: Fixed substring collisions (e.g., `"ms"` matching `"algorithms"`) using `\b` regex boundaries and ensured batch candidate screening computes real TF-IDF cosine similarity for every candidate.

---

## 18. Limitations

- **Dataset Sample Size After Deduplication**: Because `resumes.csv` contains 166 unique resumes across 25 categories (averaging ~6.6 resumes per class), holdout evaluation is performed on 34 unseen test instances and 3-fold stratified cross-validation.
- **Lexical Representation**: TF-IDF and cosine similarity capture lexical n-gram overlap (`(1, 2)` n-grams) rather than deep contextual embeddings, meaning synonyms not covered by the skill taxonomy may receive lower similarity scores.
- **Heuristic ATS Formula**: Commercial Applicant Tracking Systems use proprietary parsing rules that vary by vendor; ASCEND AI's ATS score is an explainable academic heuristic designed for transparent candidate feedback, not an official vendor score or hiring probability.

---

## 19. Future Scope

- Integrate dense sentence-transformer embeddings (`all-MiniLM-L6-v2` or `BGE`) alongside sparse TF-IDF vectors for hybrid semantic + lexical retrieval.
- Expand the labeled resume corpus with human-annotated resume–job relevance pairs to evaluate ranking using `Precision@K`, `Recall@K`, and `NDCG`.
- Add fine-tuned Named Entity Recognition (NER) for extracting work duration (years of experience per skill) and project impact metrics.
- Introduce interactive mock-interview audio transcription and automated STAR rubric grading.

---

## 20. Conclusion

ASCEND AI delivers a complete, reproducible, and transparent AI career intelligence workflow. Every metric displayed in the web application and reported in this documentation is backed by the actual datasets (`resumes.csv`, `jobs.csv`, `skills.csv`, `Ascend.csv`), the executed Google Colab notebook (`Ascend_AI_CE2_Final_Complete.ipynb`), and the synchronized FastAPI + MERN production codebase.

---

## 21. Author / Academic Project Note

- **Project**: ASCEND AI — End-to-End AI Career Assistant
- **Academic Milestone**: University 5th-Semester Artificial Intelligence & Machine Learning Capstone Project (CE-2 Evaluation)
- **Repository**: [https://github.com/JasleenKaur2508/Ascend-AI.git](https://github.com/JasleenKaur2508/Ascend-AI.git)
