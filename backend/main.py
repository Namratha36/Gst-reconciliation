from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.postgres import engine, Base
from api import auth, upload, reconciliation, dashboard, ai, graph, reports, cases, actions, approvals, alerts, vendors
import models # Register all SQLAlchemy models

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
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(reconciliation.router, prefix="/api/reconciliation", tags=["Reconciliation"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(actions.router, prefix="/api/actions", tags=["Actions"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["Approvals"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(vendors.router, prefix="/api/vendors", tags=["Vendors"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Explanation"])
app.include_router(graph.router, prefix="/api/graph", tags=["Graph Explorer"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def root():
    return {"message": "Welcome to GraphGST AI API"}
