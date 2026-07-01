from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.postgres import engine, Base
from api import auth, upload, reconciliation, dashboard, ai, graph, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GraphGST AI API",
    description="AI-powered GST Reconciliation and ITC Risk Intelligence",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(reconciliation.router, prefix="/api/reconciliation", tags=["Reconciliation"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Explanation"])
app.include_router(graph.router, prefix="/api/graph", tags=["Graph Explorer"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def root():
    return {"message": "Welcome to GraphGST AI API"}
