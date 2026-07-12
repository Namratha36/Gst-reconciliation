# GraphGST AI Architecture Handoff

## Product Model
GraphGST AI is one data pipeline rendered through multiple views:

Upload GST Files -> Parse -> Normalize -> Store -> Knowledge Graph -> Reconciliation -> Risk -> Case -> Action -> Approval -> Dashboard -> Reports -> Copilot.

Frontend pages do not own business truth. Pages consume services. Services consume APIs. Current services use a shared mock repository so the backend team can replace implementations with REST, Supabase, PostgreSQL, Neo4j, Gemini, email, OCR, and Stripe adapters without changing page components.

## Folder Map
- `frontend/src/types`: canonical TypeScript business models.
- `frontend/src/services`: replaceable service interfaces and current mock/API adapters.
- `frontend/src/pages`: route-level views of the same pipeline state.
- `frontend/src/components/ui`: shared design primitives.
- `frontend/src/components/layout`: shell, navigation, protected routing.
- `backend/api`: current FastAPI route modules.
- `backend/services`: parsing, reconciliation, graph, and risk service code.
- `backend/database`: future PostgreSQL and Neo4j connection boundaries.
- `docs`: architecture and backend handoff documentation.

## Key Components
- `AppLayout`: enterprise shell, navigation, user controls, logout.
- `ProtectedRoute`: auth guard using `authenticationService` and token storage abstraction.
- `Dashboard`: Mission Control metrics from `dashboardService`.
- `UploadData`: ingestion entry point through `uploadService`.
- `OperationsBoard`: Kanban workflow columns from `casesService`.
- `Cases`: reconciliation issues from `casesService`.
- `Actions`: case tasks from `actionService`.
- `Approvals`: pending approval queue from `approvalService`.
- `GraphExplorer`: React Flow graph from `graphService`.
- `Vendors`: analytics from `vendorService`.
- `Reports`: PDF/CSV export UI through `reportService`.
- `Alerts`: event notifications from `alertService`.
- `Copilot`: finance compliance assistant using `copilotService` context only.

## Services
- `dashboardService`: aggregated metrics, mission, current actions, recent alerts.
- `casesService`: case list, case detail, Operations Board grouping.
- `vendorService`: vendor risk and compliance analytics.
- `graphService`: graph node and edge dataset.
- `copilotService`: builds invoice/vendor/case/action/approval/graph/risk context and asks AI.
- `uploadService`: GST CSV upload interface.
- `approvalService`: pending approvals and decisions.
- `reportService`: report list, filters, PDF/CSV export contract.
- `alertService`: alert list and read state.
- `actionService`: action list and status updates.
- `authenticationService`: login/register/session/refresh/logout and token storage.

## TypeScript Models
Defined in `frontend/src/types/domain.ts`:
- `User`: authenticated enterprise user.
- `Upload`: uploaded GST source file and ingestion status.
- `Invoice`: normalized invoice with source and reconciliation status.
- `Vendor`: GSTIN, compliance score, exposure, risk tier.
- `Buyer`: purchasing entity.
- `ComplianceCase`: mismatch issue with invoice IDs, vendor ID, risk, owner, timeline.
- `CaseAction`: task linked to one case with progress/logs/timestamps.
- `Approval`: human approval request tied to case/action and AI reasoning.
- `Alert`: event notification tied to pipeline entities.
- `Mission`: executive recovery objective.
- `Dashboard`: aggregate mission metrics and linked entity IDs.
- `GraphNode` / `GraphEdge`: Neo4j-ready graph visualization contracts.
- `RiskScore`: deterministic risk output.
- `Report`: historical report summary and metric bundle.
- `Conversation`: Copilot messages with source entity IDs.

## Required Frontend API Endpoints
- `GET /api/dashboard`
- `GET /api/uploads`
- `POST /api/upload/csv`
- `GET /api/cases`
- `GET /api/cases/{case_id}`
- `PATCH /api/cases/{case_id}/status`
- `GET /api/actions`
- `PATCH /api/actions/{action_id}`
- `GET /api/approvals?status=pending`
- `POST /api/approvals/{approval_id}/decision`
- `GET /api/vendors`
- `GET /api/vendors/{vendor_id}`
- `GET /api/graph`
- `GET /api/reports`
- `POST /api/reports/export`
- `GET /api/alerts`
- `POST /api/alerts/mark-read`
- `POST /api/ai/chat`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## Backend Endpoints Expected
Backend should own parsing, normalization, reconciliation, risk, case creation, action generation, approvals, graph writes, reporting, and Copilot context assembly. The frontend may pass filters and user questions, but backend must return computed facts and entity IDs.

## Database Tables Required
PostgreSQL/Supabase tables:
- `organizations`
- `users`
- `auth_sessions`
- `uploads`
- `upload_files`
- `invoices`
- `vendors`
- `buyers`
- `reconciliation_runs`
- `reconciliation_results`
- `risk_scores`
- `cases`
- `case_invoice_links`
- `actions`
- `action_logs`
- `approvals`
- `approval_timeline`
- `alerts`
- `reports`
- `report_exports`
- `copilot_conversations`
- `copilot_messages`
- `audit_logs`

## Supabase Table Notes
Use UUID primary keys, `organization_id` tenant scoping, RLS policies, `created_at`, `updated_at`, and immutable audit rows for decisions. Store files in Supabase Storage only after database implementation exists. Do not duplicate Neo4j relationships in frontend state.

## Neo4j Nodes
- `Organization`
- `Upload`
- `Invoice`
- `Vendor`
- `Buyer`
- `Case`
- `Action`
- `Approval`
- `Alert`
- `Report`
- `RiskScore`
- `GSTReturn`

## Neo4j Relationships
- `(:Organization)-[:UPLOADED]->(:Upload)`
- `(:Upload)-[:CONTAINS]->(:Invoice)`
- `(:Vendor)-[:ISSUED]->(:Invoice)`
- `(:Invoice)-[:BOUGHT_BY]->(:Buyer)`
- `(:Invoice)-[:CREATES_CASE]->(:Case)`
- `(:Case)-[:HAS_RISK_SCORE]->(:RiskScore)`
- `(:Case)-[:TRIGGERS_ACTION]->(:Action)`
- `(:Action)-[:REQUIRES_APPROVAL]->(:Approval)`
- `(:Approval)-[:RESOLVED_BY]->(:User)`
- `(:Case)-[:GENERATES_ALERT]->(:Alert)`
- `(:Report)-[:SUMMARIZES]->(:Case)`

## Upload File Formats
Supported now:
- GSTR-1 CSV
- GSTR-2B CSV
- GSTR-3B CSV

Future interfaces:
- invoice register CSV
- vendor master CSV
- payment export CSV
- OCR document extraction result JSON

## CSV Schema
Minimum normalized invoice columns:
```csv
invoice_number,invoice_date,financial_year,doc_type,vendor_gstin,buyer_gstin,taxable_value,igst,cgst,sgst,invoice_value,source
INV-001,2026-06-12,2026-27,Invoice,27ABCDE1234F1Z5,07AAGFF2194N1Z1,100000,18000,0,0,118000,GSTR-1
```

Stable invoice key:
`vendor_gstin + buyer_gstin + invoice_number + financial_year + doc_type`

## Expected JSON Payloads
Upload response:
```json
{ "uploadIds": ["UPL-001"], "message": "Files uploaded successfully and processing started." }
```

Case:
```json
{
  "id": "CAS-042",
  "invoiceIds": ["INV-992"],
  "vendorId": "VEN-BETA",
  "status": "Escalated",
  "itcAtRisk": 1200000,
  "nextActionId": "ACT-839"
}
```

Copilot request:
```json
{
  "question": "Which cases need approval?",
  "context": {
    "invoices": [],
    "vendors": [],
    "cases": [],
    "graphSummary": "",
    "riskSummary": "",
    "approvals": [],
    "actions": []
  }
}
```

Approval decision:
```json
{ "decision": "Approve", "comment": "Proceed after finance review." }
```

## Authentication Flow
1. User logs in or registers.
2. Backend returns access token, refresh token, expiry, and user.
3. Frontend stores tokens through `tokenStore`.
4. API client attaches bearer token.
5. On `401`, clear session and redirect to login.
6. Future refresh flow uses `authenticationService.refreshSession()`.

## Application Workflow
1. User uploads GST CSV files.
2. Backend parses and validates schema.
3. Backend normalizes and deduplicates invoices.
4. Backend stores canonical data.
5. Backend writes graph nodes and relationships.
6. Reconciliation creates mismatch results.
7. Case engine creates cases from mismatches.
8. Risk engine scores vendors, invoices, and cases.
9. Action engine creates tasks for cases.
10. Sensitive actions create approvals.
11. Alerts, reports, dashboard, vendors, graph, and Copilot consume shared backend data.

## Future Stripe Integration Points
- `organizations.subscription_status`
- `billing_customers`
- `billing_subscriptions`
- checkout session creation endpoint
- customer portal endpoint
- usage metering by upload count, invoice count, Copilot usage, and report exports

## Future Email Integration Points
- `email_templates`
- `email_outbox`
- `email_delivery_events`
- approval-gated `send_vendor_notice` action
- provider adapter interface for Resend/SendGrid

## Future OCR Integration Points
- `document_uploads`
- `ocr_jobs`
- `ocr_extracted_fields`
- OCR provider adapter interface
- normalized invoice creation after human review

## Current Implementation Notes
The database, Neo4j, Supabase, Stripe, OCR, and email provider are intentionally not implemented. Their boundaries are represented by typed service interfaces and expected endpoint contracts.
