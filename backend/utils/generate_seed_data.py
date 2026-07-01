import pandas as pd
import random
from datetime import datetime, timedelta

def generate_gstin(state_code):
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return f"{state_code:02d}{''.join(random.choices(chars, k=10))}1Z1"

def generate_data():
    buyer_gstin = "07AAGFF2194N1Z1"
    
    # 20 Vendors
    vendors = [generate_gstin(random.randint(1, 35)) for _ in range(20)]
    
    # Generate 1000 invoices
    gstr1_data = []
    gstr2b_data = []
    
    start_date = datetime(2023, 1, 1)
    
    for i in range(1000):
        vendor = random.choice(vendors)
        inv_no = f"INV-2023-{i:04d}"
        inv_date = start_date + timedelta(days=random.randint(0, 365))
        value = round(random.uniform(5000, 500000), 2)
        
        # GSTR1 (Vendor's perspective -> Buyer is the recipient)
        # Wait, for GSTR1, the user is usually the seller. But in this scenario, the buyer is uploading GSTR2B 
        # and wants to match with Vendor's GSTR1. Actually, GSTR1 is what Vendors upload, and GSTR2B is what Buyer downloads.
        # Let's assume the user has access to Vendor's GSTR1 or their own books vs GSTR2B.
        
        gstr1_data.append({
            "Invoice Number": inv_no,
            "Invoice Date": inv_date.strftime("%Y-%m-%d"),
            "Invoice Value": value,
            "GSTIN/UIN of Recipient": buyer_gstin,
            "Rate": 18,
            "Taxable Value": round(value * 0.82, 2),
            "IGST": round(value * 0.18, 2),
            "CGST": 0,
            "SGST": 0
        })
        
        # Introduce mismatches for some invoices (approx 10-15 mismatches)
        is_mismatch = random.random() < 0.015
        if is_mismatch:
            mismatch_type = random.choice(["missing_in_2b", "value_mismatch"])
            if mismatch_type == "missing_in_2b":
                continue # Skip adding to 2B
            else:
                value = value - random.uniform(100, 5000) # Alter value in 2B
        
        gstr2b_data.append({
            "Invoice Number": inv_no,
            "Invoice Date": inv_date.strftime("%Y-%m-%d"),
            "Invoice Value": value,
            "GSTIN of Supplier": vendor,
            "Rate": 18,
            "Taxable Value": round(value * 0.82, 2),
            "IGST": round(value * 0.18, 2),
            "CGST": 0,
            "SGST": 0,
            "ITC Availability": "Yes"
        })

    pd.DataFrame(gstr1_data).to_csv("gstr1_seed.csv", index=False)
    pd.DataFrame(gstr2b_data).to_csv("gstr2b_seed.csv", index=False)
    print("Seed data generated: gstr1_seed.csv and gstr2b_seed.csv")

if __name__ == "__main__":
    generate_data()
