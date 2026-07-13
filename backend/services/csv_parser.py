import pandas as pd
from typing import Tuple, List

def parse_and_validate_csv(file_path: str) -> Tuple[bool, str, List[dict]]:
    try:
        # Read CSV with pandas
        df = pd.read_csv(file_path)
        
        # Map common simplified columns to our expected schema
        column_mapping = {
            'seller_gstin': 'vendor_gstin',
            'taxable_amount': 'taxable_value',
            'total_amount': 'invoice_value'
        }
        df = df.rename(columns=column_mapping)
        
        # Add defaults for missing columns
        if 'financial_year' not in df.columns:
            df['financial_year'] = '2025-26'
        if 'doc_type' not in df.columns:
            df['doc_type'] = 'Invoice'
        if 'source' not in df.columns:
            df['source'] = 'GSTR-1'
        if 'igst' not in df.columns:
            df['igst'] = df.get('gst_amount', 0)
        if 'cgst' not in df.columns:
            df['cgst'] = 0
        if 'sgst' not in df.columns:
            df['sgst'] = 0
            
        # Minimum required columns
        required_cols = [
            'invoice_number', 'invoice_date', 'financial_year', 'doc_type',
            'vendor_gstin', 'buyer_gstin', 'taxable_value', 'igst', 'cgst', 'sgst',
            'invoice_value', 'source'
        ]
        
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            return False, f"Missing required columns: {', '.join(missing)}", []
            
        # Basic normalization (fill NaNs with 0 for numerics)
        numeric_cols = ['taxable_value', 'igst', 'cgst', 'sgst', 'invoice_value']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
        # Convert to list of dicts for DB insertion
        records = df.to_dict('records')
        return True, "Valid", records
        
    except Exception as e:
        return False, f"CSV parsing error: {str(e)}", []
