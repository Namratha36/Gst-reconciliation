import pandas as pd
import numpy as np

def clean_gstin(df: pd.DataFrame, col_name: str):
    """Basic validation for GSTIN (15 chars)"""
    if col_name in df.columns:
        df[col_name] = df[col_name].astype(str).str.strip().str.upper()
        # Drop rows where GSTIN is clearly invalid length
        df = df[df[col_name].str.len() == 15]
    return df

def process_gstr1(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    # Expected cols: Invoice Number, Invoice Date, Invoice Value, GSTIN/UIN of Recipient, Rate, Taxable Value, IGST, CGST, SGST
    df = df.rename(columns=lambda x: x.strip().lower())
    # Normalize names
    rename_map = {
        'invoice number': 'invoice_number',
        'invoice date': 'invoice_date',
        'invoice value': 'invoice_value',
        'gstin/uin of recipient': 'buyer_gstin',
        'rate': 'rate',
        'taxable value': 'taxable_value',
        'igst': 'igst',
        'cgst': 'cgst',
        'sgst': 'sgst'
    }
    df.rename(columns=rename_map, inplace=True)
    df = clean_gstin(df, 'buyer_gstin')
    df.drop_duplicates(subset=['invoice_number', 'buyer_gstin'], inplace=True)
    df.fillna(0, inplace=True)
    return df

def process_gstr2b(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df = df.rename(columns=lambda x: x.strip().lower())
    rename_map = {
        'invoice number': 'invoice_number',
        'invoice date': 'invoice_date',
        'invoice value': 'invoice_value',
        'gstin of supplier': 'vendor_gstin',
        'rate': 'rate',
        'taxable value': 'taxable_value',
        'igst': 'igst',
        'cgst': 'cgst',
        'sgst': 'sgst',
        'itc availability': 'itc_available'
    }
    df.rename(columns=rename_map, inplace=True)
    df = clean_gstin(df, 'vendor_gstin')
    df.drop_duplicates(subset=['invoice_number', 'vendor_gstin'], inplace=True)
    df.fillna(0, inplace=True)
    return df
