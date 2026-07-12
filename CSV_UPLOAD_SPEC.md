# GraphGST AI CSV Upload Spec

CSV upload starts the whole pipeline. Upload must parse, validate, normalize, deduplicate, store canonical records, update Neo4j, run reconciliation, create cases/actions/approvals/alerts, and refresh dashboard/report/Copilot context.

## Frontend Mock Being Replaced

Current frontend:
- `uploadService.listUploads()` reads mock uploads.
- `uploadService.uploadGstFiles()` posts files to `/api/upload/csv`, but backend response must become richer.
- `mockRepository.uploads`, `invoices`, `vendors`, `buyers` represent expected canonical output.

## Endpoint

### POST `/api/upload/csv`
Content-Type: `multipart/form-data`

Fields:
- `files`: one or more CSV files.
- optional `periodStart`
- optional `periodEnd`

Response:
```json
{
  "uploadIds": ["UPL-001", "UPL-002"],
  "pipelineRunId": "RUN-001",
  "status": "Queued",
  "message": "Files uploaded successfully and processing started."
}
```

### GET `/api/uploads`
Response:
```json
[
  {
    "id": "UPL-001",
    "fileName": "gstr1-june-2026.csv",
    "fileType": "GSTR-1",
    "status": "Reconciled",
    "uploadedAt": "2026-07-12T09:00:00+05:30",
    "rowCount": 14203
  }
]
```

### GET `/api/uploads/{uploadId}/status`
Response:
```json
{
  "uploadId": "UPL-001",
  "pipelineRunId": "RUN-001",
  "status": "Reconciled",
  "steps": [
    { "name": "Parse", "status": "Completed" },
    { "name": "Normalize", "status": "Completed" },
    { "name": "Reconcile", "status": "Completed" }
  ],
  "createdCaseIds": ["CAS-042"]
}
```

## Supported Files

- GSTR-1 CSV
- GSTR-2B CSV
- GSTR-3B CSV
- Future: invoice register CSV
- Future: vendor master CSV
- Future: payment export CSV

Current frontend accepts `.csv` files only. Backend should reject unsupported file schemas with a clear validation error.

## File Naming

Recommended:
- `gstr1-YYYY-MM.csv`
- `gstr2b-YYYY-MM.csv`
- `gstr3b-YYYY-MM.csv`
- `invoice-register-YYYY-MM.csv`
- `vendor-master.csv`

For the current product flow, ask users to upload:
- `gstr1-YYYY-MM.csv`
- `gstr2b-YYYY-MM.csv`
- `gstr3b-YYYY-MM.csv`

Backend should not rely only on filename; validate schema and infer file type where possible.

## Normalized Invoice Schema

Required normalized columns:

```csv
invoice_number,invoice_date,financial_year,doc_type,vendor_gstin,buyer_gstin,taxable_value,igst,cgst,sgst,invoice_value,source
INV-001,2026-06-12,2026-27,Invoice,27ABCDE1234F1Z5,07AAGFF2194N1Z1,100000,18000,0,0,118000,GSTR-1
```

Required backend normalized object:
```json
{
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-06-12",
  "financialYear": "2026-27",
  "docType": "Invoice",
  "vendorGstin": "27ABCDE1234F1Z5",
  "buyerGstin": "07AAGFF2194N1Z1",
  "taxableValue": 100000,
  "igst": 18000,
  "cgst": 0,
  "sgst": 0,
  "invoiceValue": 118000,
  "source": "GSTR-1"
}
```

## Canonical Key

Use:

```text
vendor_gstin + buyer_gstin + invoice_number + financial_year + doc_type
```

Do not dedupe on invoice number alone.

## Validation Rules

- `invoice_number` required.
- `invoice_date` must parse to date.
- `financial_year` required.
- `doc_type` must be one of `Invoice`, `Credit Note`, `Debit Note`.
- `vendor_gstin` and `buyer_gstin` must be valid GSTIN format.
- Numeric tax/value fields must be numbers and non-negative.
- `invoice_value` should equal taxable + igst + cgst + sgst within tolerance.
- Source must be one of `GSTR-1`, `GSTR-2B`, `GSTR-3B`, `Invoice Register`.

## Pipeline Steps

1. Store upload metadata.
2. Store raw file in storage.
3. Parse CSV.
4. Validate schema.
5. Normalize column names and values.
6. Upsert vendors and buyers.
7. Upsert invoices by canonical key.
8. Write Neo4j nodes and relationships.
9. Run reconciliation.
10. Create reconciliation results.
11. Create cases for mismatches.
12. Calculate risk scores.
13. Generate actions.
14. Create approvals for sensitive actions.
15. Emit alerts.
16. Refresh dashboard/report/Copilot context.

## Database Entities Required

- `uploads`
- `upload_files`
- `pipeline_runs`
- `vendors`
- `buyers`
- `invoices`
- `reconciliation_runs`
- `reconciliation_results`
- `cases`
- `risk_scores`
- `actions`
- `approvals`
- `alerts`

## Implementation Checklist

- Implement multipart upload.
- Validate CSV schemas per file type.
- Return structured upload/pipeline status.
- Persist raw file and normalized rows.
- Add dedupe by canonical key.
- Trigger reconciliation after successful normalization.
- Return backend-generated upload IDs and pipeline run ID.
- Implement `DELETE /api/uploads/{uploadId}` and archive/delete downstream generated records.
