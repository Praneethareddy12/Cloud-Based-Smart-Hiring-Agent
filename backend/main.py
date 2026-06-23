import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.evaluate import router as evaluate_router

app = FastAPI(title="Hiring Agent Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("FASTAPI_ALLOW_ALL_ORIGINS", "true") == "true" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluate_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
