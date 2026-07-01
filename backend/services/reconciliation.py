from database.neo4j_conn import neo4j_conn

def get_reconciliation_results(buyer_gstin: str):
    """
    Finds invoices that have discrepancies between GSTR1 (what vendor reported)
    and GSTR2B (what buyer is claiming).
    """
    query = """
    MATCH (b:Buyer {gstin: $buyer_gstin})<-[:BELONGS_TO]-(i:Invoice)<-[:ISSUED]-(v:Vendor)
    
    // Case 1: Missing in GSTR1 (Vendor didn't upload)
    // Here, i.source is not set or i.source <> 'GSTR1', but i.source_2b = 'GSTR2B'
    WITH i, v, b,
         CASE WHEN i.source IS NULL THEN 'Missing in GSTR1'
              WHEN i.source_2b IS NULL THEN 'Missing in GSTR2B'
              WHEN i.value <> i.value_2b THEN 'Value Mismatch'
              ELSE 'Matched' END as status
    
    WHERE status <> 'Matched'
    
    RETURN 
        i.invoice_number as invoice_number,
        v.gstin as vendor_gstin,
        i.value as gstr1_value,
        i.value_2b as gstr2b_value,
        status
    """
    results = neo4j_conn.query(query, {"buyer_gstin": buyer_gstin})
    if results is None:
        return []
    
    return [
        {
            "invoice_number": rec["invoice_number"],
            "vendor_gstin": rec["vendor_gstin"],
            "gstr1_value": rec["gstr1_value"],
            "gstr2b_value": rec["gstr2b_value"],
            "status": rec["status"]
        } for rec in results
    ]
