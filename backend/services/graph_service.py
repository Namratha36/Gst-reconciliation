from sqlalchemy.orm import Session
from models.vendor import Vendor
from models.case import Case
from models.invoice import Invoice
from database.neo4j_conn import neo4j_conn

def get_graph_data(db: Session, org_id: str):
    nodes = []
    edges = []
    
    # Try Neo4j first
    try:
        if neo4j_conn._Neo4jConnection__driver is not None:
            # We would run Neo4j queries here.
            pass
    except Exception:
        pass
        
    # Fallback / Primary logic using PostgreSQL as source of truth
    vendors = db.query(Vendor).filter(Vendor.organization_id == org_id).all()
    cases = db.query(Case).filter(Case.organization_id == org_id).all()
    
    for v in vendors:
        nodes.append({
            "id": f"GN-VEN-{v.id}",
            "type": "Vendor",
            "label": v.name,
            "entityId": v.id,
            "riskTier": v.risk_tier,
            "metadata": {"gstin": v.gstin, "score": v.compliance_score}
        })
        
    for c in cases:
        nodes.append({
            "id": f"GN-CAS-{c.id}",
            "type": "Case",
            "label": c.title,
            "entityId": c.id,
            "riskTier": c.priority,
            "metadata": {"mismatch": c.mismatch_type}
        })
        
        edges.append({
            "id": f"GE-{c.id}-{c.vendor_id}",
            "source": f"GN-VEN-{c.vendor_id}",
            "target": f"GN-CAS-{c.id}",
            "relationship": "HAS_CASE",
            "animated": True if c.status != "Resolved" else False
        })
        
    return {"nodes": nodes, "edges": edges}
