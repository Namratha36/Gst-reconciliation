from database.neo4j_conn import neo4j_conn
import pandas as pd

def build_graph_from_gstr1(df: pd.DataFrame, seller_gstin: str):
    """
    seller_gstin: the GSTIN of the user uploading their GSTR1.
    They are the Vendor/Seller in this case, and they ISSUE invoices to Buyers.
    """
    # 1. Create the Seller Node
    neo4j_conn.query(
        "MERGE (v:Vendor {gstin: $gstin})",
        {"gstin": seller_gstin}
    )

    # 2. Iterate and create Invoices and Buyers
    for _, row in df.iterrows():
        inv_no = row['invoice_number']
        buyer_gstin = row['buyer_gstin']
        val = row['invoice_value']
        
        # Create Buyer
        neo4j_conn.query(
            "MERGE (b:Buyer {gstin: $gstin})",
            {"gstin": buyer_gstin}
        )
        
        # Create Invoice and link to Seller (ISSUED) and Buyer (BELONGS_TO)
        query = """
        MATCH (v:Vendor {gstin: $seller_gstin})
        MATCH (b:Buyer {gstin: $buyer_gstin})
        MERGE (i:Invoice {invoice_number: $inv_no})
        SET i.value = $val, i.source = 'GSTR1'
        MERGE (v)-[:ISSUED]->(i)
        MERGE (i)-[:BELONGS_TO]->(b)
        """
        neo4j_conn.query(query, {
            "seller_gstin": seller_gstin,
            "buyer_gstin": buyer_gstin,
            "inv_no": inv_no,
            "val": float(val) if val else 0.0
        })

def build_graph_from_gstr2b(df: pd.DataFrame, buyer_gstin: str):
    """
    buyer_gstin: the GSTIN of the user uploading their GSTR2B.
    They are the Buyer. Other entities are Vendors ISSUING invoices.
    """
    neo4j_conn.query(
        "MERGE (b:Buyer {gstin: $gstin})",
        {"gstin": buyer_gstin}
    )
    
    for _, row in df.iterrows():
        inv_no = row['invoice_number']
        vendor_gstin = row['vendor_gstin']
        val = row['invoice_value']
        
        neo4j_conn.query(
            "MERGE (v:Vendor {gstin: $gstin})",
            {"gstin": vendor_gstin}
        )
        
        query = """
        MATCH (v:Vendor {gstin: $vendor_gstin})
        MATCH (b:Buyer {gstin: $buyer_gstin})
        MERGE (i:Invoice {invoice_number: $inv_no})
        // If invoice already exists from GSTR1, this updates or adds property
        SET i.value_2b = $val, i.source_2b = 'GSTR2B'
        MERGE (v)-[:ISSUED]->(i)
        MERGE (i)-[:BELONGS_TO]->(b)
        """
        neo4j_conn.query(query, {
            "vendor_gstin": vendor_gstin,
            "buyer_gstin": buyer_gstin,
            "inv_no": inv_no,
            "val": float(val) if val else 0.0
        })
