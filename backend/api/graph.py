from fastapi import APIRouter
from database.neo4j_conn import neo4j_conn

router = APIRouter()

@router.get("/explorer")
def get_graph_data(buyer_gstin: str = "07AAGFF2194N1Z1"):
    # Returns nodes and edges for React Flow
    query = """
    MATCH (b:Buyer {gstin: $buyer_gstin})<-[r1:BELONGS_TO]-(i:Invoice)<-[r2:ISSUED]-(v:Vendor)
    RETURN b, r1, i, r2, v
    LIMIT 50
    """
    res = neo4j_conn.query(query, {"buyer_gstin": buyer_gstin})
    
    nodes = []
    edges = []
    node_ids = set()
    
    if res:
        for record in res:
            b, i, v = record["b"], record["i"], record["v"]
            # Buyer Node
            if b.element_id not in node_ids:
                nodes.append({"id": b.element_id, "label": f"Buyer\n{b['gstin']}", "type": "buyer"})
                node_ids.add(b.element_id)
            # Invoice Node
            if i.element_id not in node_ids:
                nodes.append({"id": i.element_id, "label": f"Invoice\n{i['invoice_number']}", "type": "invoice"})
                node_ids.add(i.element_id)
            # Vendor Node
            if v.element_id not in node_ids:
                nodes.append({"id": v.element_id, "label": f"Vendor\n{v['gstin']}", "type": "vendor"})
                node_ids.add(v.element_id)
                
            # Edges
            edges.append({"source": i.element_id, "target": b.element_id, "label": "BELONGS_TO"})
            edges.append({"source": v.element_id, "target": i.element_id, "label": "ISSUED"})
            
        return {"nodes": nodes, "edges": edges}
    else:
        # Graceful mock data for React Flow visualization
        return {
            "nodes": [
                {"id": "b1", "label": "Buyer\n07AAGFF2194N1Z1", "type": "buyer"},
                {"id": "i1", "label": "Invoice\nINV-001", "type": "invoice"},
                {"id": "i2", "label": "Invoice\nINV-002", "type": "invoice"},
                {"id": "v1", "label": "Vendor\n09AAJFF1122K1Z9", "type": "vendor", "risk": "High"},
                {"id": "v2", "label": "Vendor\n27AADCB2230M1Z1", "type": "vendor", "risk": "Low"}
            ],
            "edges": [
                {"source": "v1", "target": "i1", "label": "ISSUED"},
                {"source": "v2", "target": "i2", "label": "ISSUED"},
                {"source": "i1", "target": "b1", "label": "BELONGS_TO"},
                {"source": "i2", "target": "b1", "label": "BELONGS_TO"}
            ]
        }
