#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_EXEC="$SCRIPT_DIR/ml-service/venv/bin/python"
UVICORN_EXEC="$SCRIPT_DIR/ml-service/venv/bin/uvicorn"

echo "=========================================="
echo "Starting ASCEND AI Services"
echo "=========================================="

# Check if model artifacts exist; if not, train them
if [ ! -f "$SCRIPT_DIR/ml-service/artifacts/best_svm_pipeline.joblib" ]; then
    echo "Model artifacts not detected. Running training first..."
    bash "$SCRIPT_DIR/train.sh"
fi

echo "1. Launching Python FastAPI ML Microservice on port 8000..."
cd "$SCRIPT_DIR/ml-service"
"$UVICORN_EXEC" app.main:app --host 0.0.0.0 --port 8000 &
ML_PID=$!

echo "2. Launching Node.js Express Backend on port 5001..."
cd "$SCRIPT_DIR/backend"
node src/server.js &
BACKEND_PID=$!

echo "3. Launching React + Vite Frontend on port 5173..."
cd "$SCRIPT_DIR/frontend"
npm run dev -- --host &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "Shutting down ASCEND AI services..."
    kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "=========================================="
echo "ASCEND AI is Live!"
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:5001"
echo "ML API:    http://localhost:8000/docs"
echo "=========================================="
echo "Press Ctrl+C to stop all services."

wait
