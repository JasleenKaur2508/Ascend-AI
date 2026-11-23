import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Add parent directory to path for imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from app.preprocessing.text_cleaner import clean_text

RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
RESULTS_DIR = os.path.join(BASE_DIR, "results")

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

def train_and_evaluate():
    print("--- Phase 2: Resume Classifier Training & Evaluation ---")
    
    # 1. Load resumes.csv
    csv_path = os.path.join(RAW_DATA_DIR, "resumes.csv")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records across {df['Category'].nunique()} categories from {csv_path}")
    
    # 2. Preprocess text
    print("Applying text cleaning (preserving technical tokens, removing noise)...")
    df['cleaned_resume'] = df['Resume'].apply(clean_text)
    
    # 3. Encode labels
    label_encoder = LabelEncoder()
    df['encoded_category'] = label_encoder.fit_transform(df['Category'])
    categories = label_encoder.classes_.tolist()
    
    # 4. Stratified Train-Test Split (80% train, 20% test)
    X = df['cleaned_resume']
    y = df['encoded_category']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    print(f"Dataset split: Train samples = {len(X_train)}, Test samples = {len(X_test)}")
    
    # 5. TF-IDF Feature Extraction (Fit ONLY on training data to avoid data leakage)
    print("Fitting TF-IDF Vectorizer on training split (ngram_range=(1,2), max_features=5000)...")
    tfidf = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        min_df=2,
        sublinear_tf=True
    )
    X_train_vec = tfidf.fit_transform(X_train)
    X_test_vec = tfidf.transform(X_test)
    print(f"TF-IDF matrix shape: Train {X_train_vec.shape}, Test {X_test_vec.shape}")
    
    # 6. Define Candidate Models
    models = {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Logistic Regression": LogisticRegression(
            C=1.0,
            max_iter=1000,
            solver='lbfgs',
            random_state=42
        ),
        "Linear Support Vector Machine": CalibratedClassifierCV(
            LinearSVC(C=1.0, random_state=42),
            cv=3
        )
    }
    
    results = {}
    best_model_name = None
    best_macro_f1 = -1.0
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_vec, y_train)
        
        y_pred = model.predict(X_test_vec)
        
        acc = float(accuracy_score(y_test, y_pred))
        macro_prec = float(precision_score(y_test, y_pred, average='macro', zero_division=0))
        macro_rec = float(recall_score(y_test, y_pred, average='macro', zero_division=0))
        macro_f1 = float(f1_score(y_test, y_pred, average='macro', zero_division=0))
        weighted_f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        
        report_dict = classification_report(
            y_test, y_pred,
            target_names=categories,
            output_dict=True,
            zero_division=0
        )
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        results[name] = {
            "accuracy": round(acc, 4),
            "macro_precision": round(macro_prec, 4),
            "macro_recall": round(macro_rec, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4),
            "classification_report": report_dict,
            "confusion_matrix": cm
        }
        
        print(f"  Accuracy:    {acc * 100:.2f}%")
        print(f"  Macro F1:    {macro_f1 * 100:.2f}%")
        print(f"  Weighted F1: {weighted_f1 * 100:.2f}%")
        
        if macro_f1 > best_macro_f1:
            best_macro_f1 = macro_f1
            best_model_name = name
    
    print(f"\n>>> Best Model Selected: {best_model_name} (Macro F1 = {best_macro_f1 * 100:.2f}%) <<<")
    best_model = models[best_model_name]
    
    # 7. Save Artifacts with Joblib
    best_model_path = os.path.join(ARTIFACTS_DIR, "classifier_best.joblib")
    tfidf_path = os.path.join(ARTIFACTS_DIR, "tfidf_vectorizer.joblib")
    le_path = os.path.join(ARTIFACTS_DIR, "label_encoder.joblib")
    
    joblib.dump(best_model, best_model_path)
    joblib.dump(tfidf, tfidf_path)
    joblib.dump(label_encoder, le_path)
    
    metadata = {
        "best_model": best_model_name,
        "classes": categories,
        "num_classes": len(categories),
        "num_train_samples": len(X_train),
        "num_test_samples": len(X_test),
        "num_features": X_train_vec.shape[1],
        "metrics": results[best_model_name]
    }
    with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    
    # 8. Save Metrics JSON for the Dashboard
    model_comparison_summary = {
        "best_model": best_model_name,
        "selection_rationale": (
            f"{best_model_name} achieved the highest Macro F1-score ({best_macro_f1 * 100:.2f}%), "
            "providing superior balance between precision and recall across both high-frequency "
            "and low-frequency resume categories without overfitting."
        ),
        "models": results,
        "categories": categories
    }
    with open(os.path.join(RESULTS_DIR, "model_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(model_comparison_summary, f, indent=2)
        
    # 9. Plot Model Comparison Chart
    fig, ax = plt.subplots(figsize=(10, 5))
    metrics_names = ["Accuracy", "Macro Precision", "Macro Recall", "Macro F1", "Weighted F1"]
    
    x = np.arange(len(metrics_names))
    width = 0.25
    
    colors = ["#3b82f6", "#10b981", "#8b5cf6"]
    for i, (m_name, m_res) in enumerate(results.items()):
        vals = [
            m_res["accuracy"],
            m_res["macro_precision"],
            m_res["macro_recall"],
            m_res["macro_f1"],
            m_res["weighted_f1"]
        ]
        ax.bar(x + (i - 1) * width, vals, width, label=m_name, color=colors[i % len(colors)], alpha=0.85)
    
    ax.set_ylabel("Score (0.0 to 1.0)", fontsize=11)
    ax.set_title("Experimental Model Comparison on Stratified Test Split", fontsize=13, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(metrics_names, fontsize=10)
    ax.set_ylim([0.8, 1.05])
    ax.legend(loc="lower right")
    plt.tight_layout()
    comp_fig_path = os.path.join(RESULTS_DIR, "model_comparison.png")
    fig.savefig(comp_fig_path, dpi=200)
    plt.close(fig)
    
    # 10. Plot Confusion Matrix for Best Model
    fig, ax = plt.subplots(figsize=(14, 12))
    best_cm = np.array(results[best_model_name]["confusion_matrix"])
    sns.heatmap(
        best_cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=categories,
        yticklabels=categories,
        ax=ax
    )
    ax.set_title(f"Confusion Matrix: {best_model_name}", fontsize=14, fontweight="bold")
    ax.set_xlabel("Predicted Category", fontsize=11)
    ax.set_ylabel("True Category", fontsize=11)
    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()
    cm_fig_path = os.path.join(RESULTS_DIR, "confusion_matrix.png")
    fig.savefig(cm_fig_path, dpi=200)
    plt.close(fig)
    
    print("\nModel training and artifact generation completed successfully!")
    print(f"Artifacts: {ARTIFACTS_DIR}")
    print(f"Results: {RESULTS_DIR}")
    return results

if __name__ == "__main__":
    train_and_evaluate()
