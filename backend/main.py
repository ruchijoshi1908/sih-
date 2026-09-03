import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.config import APP_NAME, VERSION, DEBUG
from backend.database.base import Base
from backend.database.session import engine, get_db
from backend.database.seed_data import seed_database
from backend.routes import (
    courses,
    jobs,
    analysis,
    employer,
    placements,
    student,
    n8n_hooks
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed sample data
    print("[Startup] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        seed_database(db, force=False)
        
    print("[Startup] System is ready and initialized.")
    yield
    # Shutdown
    print("[Shutdown] Cleaning up resources...")

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="AI-powered Labour Market Intelligence & Curriculum Alignment Platform for SIH PS 134.",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(courses.router)
app.include_router(jobs.router)
app.include_router(analysis.router)
app.include_router(employer.router)
app.include_router(placements.router)
app.include_router(student.router)
app.include_router(n8n_hooks.router)

@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "version": VERSION,
        "status": "online",
        "docs_url": "/docs",
        "features": [
            "AI Skill Extraction",
            "Explainable Drift Score (0-100)",
            "Evidence Engine with Real Job Citations",
            "AI Curriculum Recommendations",
            "Employer Validation Portal",
            "Curriculum Versioning v1 -> v2",
            "Placement Feedback Loop",
            "Student Resume Audit & Career Roadmap",
            "n8n Workflow Automation"
        ]
    }

@app.post("/api/seed/reset")
def reset_seed_data(db: Session = Depends(get_db)):
    """Reset and re-seed database with fresh sample data for demonstrations."""
    seed_database(db, force=True)
    return {"message": "Database reset and successfully re-seeded with demo data!"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
