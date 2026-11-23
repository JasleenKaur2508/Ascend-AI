import os
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
RESULTS_DIR = os.path.join(BASE_DIR, "results")

os.makedirs(RESULTS_DIR, exist_ok=True)

def run_eda():
    print("--- Starting Exploratory Data Analysis (EDA) ---")
    
    # 1. Load Datasets
    resumes_path = os.path.join(RAW_DATA_DIR, "resumes.csv")
    ascend_path = os.path.join(RAW_DATA_DIR, "Ascend.csv")
    jobs_path = os.path.join(RAW_DATA_DIR, "jobs.csv")
    skills_path = os.path.join(RAW_DATA_DIR, "skills.csv")
    
    df_resumes = pd.read_csv(resumes_path)
    df_ascend = pd.read_csv(ascend_path)
    df_jobs = pd.read_csv(jobs_path)
    df_skills = pd.read_csv(skills_path)
    
    # Clean jobs dataset index column
    if '' in df_jobs.columns or 'Unnamed: 0' in df_jobs.columns:
        first_col = df_jobs.columns[0]
        df_jobs = df_jobs.drop(columns=[first_col])
    
    eda_summary = {
        "datasets": {
            "resumes": {
                "rows": int(len(df_resumes)),
                "columns": df_resumes.columns.tolist(),
                "missing_values": {k: int(v) for k, v in df_resumes.isnull().sum().items()},
                "unique_resumes": int(df_resumes["Resume"].nunique()),
                "total_categories": int(df_resumes["Category"].nunique()),
                "category_counts": df_resumes["Category"].value_counts().to_dict()
            },
            "ascend": {
                "rows": int(len(df_ascend)),
                "columns": df_ascend.columns.tolist(),
                "missing_values": {k: int(v) for k, v in df_ascend.isnull().sum().items()},
                "unique_resumes": int(df_ascend["Resume"].nunique()),
                "total_categories": int(df_ascend["Category"].nunique()),
                "category_counts": df_ascend["Category"].value_counts().to_dict(),
                "stats": {
                    "resume_length": {
                        "mean": float(round(df_ascend["resume_length"].mean(), 2)),
                        "median": float(round(df_ascend["resume_length"].median(), 2)),
                        "min": int(df_ascend["resume_length"].min()),
                        "max": int(df_ascend["resume_length"].max())
                    },
                    "word_count": {
                        "mean": float(round(df_ascend["word_count"].mean(), 2)),
                        "median": float(round(df_ascend["word_count"].median(), 2)),
                        "min": int(df_ascend["word_count"].min()),
                        "max": int(df_ascend["word_count"].max())
                    },
                    "skill_count": {
                        "mean": float(round(df_ascend["skill_count"].mean(), 2)),
                        "median": float(round(df_ascend["skill_count"].median(), 2)),
                        "min": int(df_ascend["skill_count"].min()),
                        "max": int(df_ascend["skill_count"].max())
                    }
                }
            },
            "jobs": {
                "rows": int(len(df_jobs)),
                "columns": df_jobs.columns.tolist(),
                "missing_values": {k: int(v) for k, v in df_jobs.isnull().sum().items()},
                "unique_titles": int(df_jobs["Job Title"].nunique()),
                "unique_descriptions": int(df_jobs["Job Description"].nunique()),
                "top_titles": df_jobs["Job Title"].value_counts().head(10).to_dict()
            },
            "skills": {
                "rows": int(len(df_skills)),
                "columns": df_skills.columns.tolist(),
                "missing_values": {k: int(v) for k, v in df_skills.isnull().sum().items()}
            }
        },
        "data_leakage_investigation": {
            "resumes_total": int(len(df_resumes)),
            "resumes_unique": int(df_resumes["Resume"].nunique()),
            "ascend_unique": int(df_ascend["Resume"].nunique()),
            "finding": "resumes.csv contains 962 records representing repeated instances of 166 unique resumes across 25 categories. Ascend.csv contains exactly the 166 unique resumes with engineered features (length, word count, skill count). To avoid data leakage, ML cross-validation and splits must respect resume uniqueness."
        }
    }
    
    # Visualizations
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    
    # 1. Category Distribution Plot
    fig, ax = plt.subplots(figsize=(12, 8))
    cat_order = df_resumes["Category"].value_counts().index
    sns.countplot(data=df_resumes, y="Category", order=cat_order, palette="viridis", ax=ax)
    ax.set_title("Resume Distribution across 25 Categories (resumes.csv - 962 records)", fontsize=14, fontweight="bold")
    ax.set_xlabel("Number of Resumes", fontsize=12)
    ax.set_ylabel("Professional Category", fontsize=12)
    plt.tight_layout()
    cat_dist_path = os.path.join(RESULTS_DIR, "category_distribution.png")
    fig.savefig(cat_dist_path, dpi=200)
    plt.close(fig)
    eda_summary["charts"] = {"category_distribution": "category_distribution.png"}
    
    # 2. Ascend Unique Resumes Feature Distribution
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(16, 5))
    
    sns.histplot(df_ascend["resume_length"], kde=True, color="#4f46e5", ax=ax1)
    ax1.set_title("Resume Character Length Distribution", fontsize=12, fontweight="bold")
    ax1.set_xlabel("Character Count")
    
    sns.histplot(df_ascend["word_count"], kde=True, color="#06b6d4", ax=ax2)
    ax2.set_title("Resume Word Count Distribution", fontsize=12, fontweight="bold")
    ax2.set_xlabel("Word Count")
    
    sns.histplot(df_ascend["skill_count"], kde=True, color="#10b981", ax=ax3)
    ax3.set_title("Resume Extracted Skill Count Distribution", fontsize=12, fontweight="bold")
    ax3.set_xlabel("Skill Count")
    
    plt.tight_layout()
    features_dist_path = os.path.join(RESULTS_DIR, "feature_distributions.png")
    fig.savefig(features_dist_path, dpi=200)
    plt.close(fig)
    eda_summary["charts"]["feature_distributions"] = "feature_distributions.png"
    
    # 3. Correlation Heatmap for Engineered Features in Ascend.csv
    fig, ax = plt.subplots(figsize=(8, 6))
    num_cols = ["Category_encoded", "resume_length", "word_count", "skill_count"]
    corr = df_ascend[num_cols].corr()
    sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", linewidths=1, ax=ax)
    ax.set_title("Correlation Heatmap of Engineered Features (Ascend.csv)", fontsize=13, fontweight="bold")
    plt.tight_layout()
    corr_path = os.path.join(RESULTS_DIR, "correlation_heatmap.png")
    fig.savefig(corr_path, dpi=200)
    plt.close(fig)
    eda_summary["charts"]["correlation_heatmap"] = "correlation_heatmap.png"
    
    # Save eda summary to json
    summary_path = os.path.join(RESULTS_DIR, "eda_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(eda_summary, f, indent=2)
    
    print(f"EDA completed successfully. Results saved to {RESULTS_DIR}")
    return eda_summary

if __name__ == "__main__":
    run_eda()
