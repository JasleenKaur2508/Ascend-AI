#!/bin/bash
set -e

echo "=========================================="
echo "ASCEND AI - Model Training & EDA Pipeline"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_EXEC="$SCRIPT_DIR/ml-service/venv/bin/python"

if [ ! -f "$PYTHON_EXEC" ]; then
    echo "Python venv not found. Creating virtual environment..."
    python3 -m venv "$SCRIPT_DIR/ml-service/venv"
    "$SCRIPT_DIR/ml-service/venv/bin/pip" install -r "$SCRIPT_DIR/ml-service/requirements.txt"
fi

echo "1. Running Exploratory Data Analysis (EDA)..."
"$PYTHON_EXEC" "$SCRIPT_DIR/ml-service/training/eda.py"

echo "2. Training & Evaluating Classifiers (Logistic Regression & Linear SVM)..."
"$PYTHON_EXEC" "$SCRIPT_DIR/ml-service/training/train_classifier.py"

echo "=========================================="
echo "Artifacts and Visualizations Generated in:"
echo "ml-service/artifacts/ and ml-service/results/"
echo "=========================================="
