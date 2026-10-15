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
# ... (existing imports and setup)


# Mount static frontend
from pathlib import Path
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"

if frontend_dir.exists():
    @app.get("/", include_in_schema=False)
    def serve_landing():
        landing_file = frontend_dir / "landing.html"
        if landing_file.exists():
            return FileResponse(landing_file)
        return FileResponse(frontend_dir / "index.html")

    @app.get("/app", include_in_schema=False)
    def serve_app():
        return FileResponse(frontend_dir / "index.html")

    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")
    app.mount("/", StaticFiles(directory=str(frontend_dir)), name="frontend")
