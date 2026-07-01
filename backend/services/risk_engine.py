from database.neo4j_conn import neo4j_conn

def calculate_vendor_risk(buyer_gstin: str):
    """
    Risk Formula:
    Risk Score = (Missing Invoice × 40) + (GST Mismatch × 30) + (Duplicate Invoice × 15) + (Vendor Non-Compliance × 15)
    
    For simplicity in this logic:
    Missing Invoice: i.source IS NULL
    GST Mismatch: i.value <> i.value_2b
    """
    query = """
    MATCH (b:Buyer {gstin: $buyer_gstin})<-[:BELONGS_TO]-(i:Invoice)<-[:ISSUED]-(v:Vendor)
    WITH v,
         SUM(CASE WHEN i.source IS NULL THEN 1 ELSE 0 END) as missing_count,
         SUM(CASE WHEN i.value <> i.value_2b THEN 1 ELSE 0 END) as mismatch_count,
         SUM(CASE WHEN i.source IS NULL THEN i.value_2b ELSE 0 END) as itc_at_risk
    
    // Calculate Risk Score based on counts (simplified formula application)
    WITH v, missing_count, mismatch_count, itc_at_risk,
         (missing_count * 40) + (mismatch_count * 30) as risk_score
         
    RETURN v.gstin as vendor_gstin, risk_score, itc_at_risk, missing_count, mismatch_count
    ORDER BY risk_score DESC
    """
    results = neo4j_conn.query(query, {"buyer_gstin": buyer_gstin})
    if results is None:
        return []
        
    return [
        {
            "vendor_gstin": rec["vendor_gstin"],
            "risk_score": rec["risk_score"],
            "itc_at_risk": rec["itc_at_risk"],
            "missing_count": rec["missing_count"],
            "mismatch_count": rec["mismatch_count"],
        } for rec in results
    ]
