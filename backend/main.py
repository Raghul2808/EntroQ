"""
FastAPI application entrypoint for the Quantum Random Password Generator.
"""
import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router

# Configure clean, structured logging (passwords are never logged)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

app = FastAPI(
    title="Quantum Random Password Generator API",
    description="True quantum randomness backend powered by Qiskit AerSimulator.",
    version="1.0.0",
)

# Enable CORS for local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints
app.include_router(api_router)


@app.get("/health", summary="Health check")
def health_check():
    return {"status": "healthy", "service": "quantum-password-generator"}


# Mount static frontend
from pathlib import Path
from starlette.staticfiles import StaticFiles

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

