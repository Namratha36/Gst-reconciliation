from fastapi import APIRouter
from database.neo4j_conn import neo4j_conn
import random

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(buyer_gstin: str = "07AAGFF2194N1Z1"):
    # Try querying Neo4j. If it fails (or no data), return intelligent mock data
    query = """
    MATCH (b:Buyer {gstin: $buyer_gstin})<-[:BELONGS_TO]-(i:Invoice)<-[:ISSUED]-(v:Vendor)
    WITH count(i) as total_invoices,
         SUM(CASE WHEN i.source IS NULL OR i.value <> i.value_2b THEN 1 ELSE 0 END) as mismatched,
         SUM(CASE WHEN i.source IS NULL OR i.value <> i.value_2b THEN i.value_2b ELSE 0 END) as itc_at_risk
    RETURN total_invoices, mismatched, itc_at_risk, total_invoices - mismatched as matched
    """
    res = neo4j_conn.query(query, {"buyer_gstin": buyer_gstin})
    
    if res and res[0]["total_invoices"] > 0:
        data = res[0]
        # Quick fallback if query returned None values
        return {
            "total_invoices": data.get("total_invoices") or 0,
            "matched_invoices": data.get("matched") or 0,
            "mismatched_invoices": data.get("mismatched") or 0,
            "itc_at_risk": data.get("itc_at_risk") or 0,
            "high_risk_vendors": 0 # This would be calculated via risk_engine
        }
    else:
        # Graceful fallback mock data for UI showcasing
        return {
            "total_invoices": 1245,
            "matched_invoices": 1100,
            "mismatched_invoices": 145,
            "itc_at_risk": 240500,
            "high_risk_vendors": 12
        }

@router.get("/risk-trends")
def get_risk_trends():
    # Returns data for Monthly Mismatch Trend chart
    return [
        {"month": "Jan", "matched": 100, "mismatched": 10},
        {"month": "Feb", "matched": 120, "mismatched": 15},
        {"month": "Mar", "matched": 115, "mismatched": 5},
        {"month": "Apr", "matched": 140, "mismatched": 25},
        {"month": "May", "matched": 150, "mismatched": 8},
        {"month": "Jun", "matched": 180, "mismatched": 30},
    ]

@router.get("/vendor-analytics")
def get_vendor_analytics():
    # Returns data for Top Risky Vendors chart
    return [
        {"name": "Vendor A", "risk_score": 85, "mismatch_count": 12},
        {"name": "Vendor B", "risk_score": 70, "mismatch_count": 8},
        {"name": "Vendor C", "risk_score": 65, "mismatch_count": 7},
        {"name": "Vendor D", "risk_score": 40, "mismatch_count": 3},
        {"name": "Vendor E", "risk_score": 20, "mismatch_count": 1},
    ]
