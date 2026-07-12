# GraphGST AI API Spec

This file is the frontend/backend contract for replacing the current frontend mock implementations. All IDs are backend-generated strings or UUIDs. All authenticated endpoints require `Authorization: Bearer <accessToken>`.

## Mock Implementation Audit

| Frontend file | Current mock behavior | Backend replacement |
| --- | --- | --- |
| `frontend/src/services/mockRepository.ts` | Single in-memory source for users, uploads, vendors, invoices, cases, actions, approvals, alerts, dashboard, graph, reports, reconciliation exceptions, regional exposure, calendar, fraud, simulations, conversation | Replace with real API calls from each service |
| `authenticationService.ts` | Creates `demo-access-token`, `demo-refresh-token`, returns `currentUser` | `/api/auth/*` JWT endpoints |
| `dashboardService.ts` | Returns mock dashboard aggregates | `GET /api/dashboard` |
| `uploadService.ts` | `listUploads()` returns mock uploads; upload posts real file but response is minimally adapted | `GET /api/uploads`, `POST /api/upload/csv` |
| `casesService.ts` | Reads mock cases/vendors and enriches locally | `GET /api/cases`, `GET /api/cases/{id}` with backend enrichment |
| `actionService.ts` | Mutates in-memory action status/logs | `GET /api/actions`, `PATCH /api/actions/{id}` |
| `approvalService.ts` | Filters/mutates in-memory approvals | `GET /api/approvals`, `POST /api/approvals/{id}/decision` |
| `vendorService.ts` | Returns mock vendor analytics | `GET /api/vendors`, `GET /api/vendors/{id}` |
| `alertService.ts` | Returns/mutates in-memory alert read state | `GET /api/alerts`, `POST /api/alerts/mark-read` |
| `graphService.ts` | Returns mock graph nodes/edges | `GET /api/graph` |
| `reportService.ts` | Returns mock reports and confirms export locally | `GET /api/reports`, `POST /api/reports/export` |
| `copilotService.ts` | Builds context from mock repository and falls back to `localAnswer()` | `POST /api/ai/context`, `POST /api/ai/chat`, optional stream endpoint |
| `reconciliationService.ts` | Returns mock exceptions derived from cases | `GET /api/reconciliation/exceptions`, `POST /api/reconciliation/run` |
| `regionalExposureService.ts` | Returns mock state exposure | `GET /api/analytics/regional-exposure` |
| `calendarService.ts` | Returns mock compliance calendar events | `GET /api/calendar/compliance-events` |
| `fraudService.ts` | Returns mock fraud network and threats | `GET /api/fraud/network`, `POST /api/fraud/scan` |
| `simulationService.ts` | Returns static scenario results | `GET /api/simulations`, `POST /api/simulations/{id}/run` |

## Standard Envelope

Success responses should return the resource directly unless pagination is needed.

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 120
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File type is not supported",
    "details": {}
  }
}
```

## Auth

### POST `/api/auth/login`
Request:
```json
{ "email": "jane@acme.example", "password": "secret" }
```

Response:
```json
{
  "user": {
    "id": "USR-001",
    "name": "Jane Doe",
    "email": "jane@acme.example",
    "role": "CFO",
    "organizationId": "ORG-ACME",
    "organizationName": "Acme Corp"
  },
  "accessToken": "jwt",
  "refreshToken": "refresh-token",
  "expiresAt": "2026-07-12T15:30:00+05:30"
}
```

### POST `/api/auth/register`
Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@acme.example",
  "password": "secret",
  "organizationName": "Acme Corp"
}
```
Response: same as login.

### POST `/api/auth/refresh`
Request:
```json
{ "refreshToken": "refresh-token" }
```
Response:
```json
{ "accessToken": "jwt", "refreshToken": "new-refresh-token", "expiresAt": "2026-07-12T16:30:00+05:30" }
```

### POST `/api/auth/logout`
Request:
```json
{ "refreshToken": "refresh-token" }
```
Response:
```json
{ "ok": true }
```

## Dashboard

### GET `/api/dashboard`
Response:
```json
{
  "mission": {
    "id": "MIS-001",
    "title": "Recover blocked ITC before July 20 filing",
    "targetDate": "2026-07-20",
    "itcTarget": 1860000,
    "recoveredToday": 320000
  },
  "metrics": [
    { "id": "MET-CASES", "title": "Active Cases", "value": "4", "trend": "2 critical priority", "severity": "warning" }
  ],
  "currentActionIds": ["ACT-842"],
  "recentAlertIds": ["ALT-001"]
}
```

Required DB entities: `missions`, `cases`, `actions`, `approvals`, `alerts`, `risk_scores`, `reports`.

## Uploads

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

### POST `/api/upload/csv`
Content-Type: `multipart/form-data`

Fields:
- `files`: one or more CSV files.
- optional `periodStart`: `YYYY-MM-DD`
- optional `periodEnd`: `YYYY-MM-DD`

Response:
```json
{
  "uploadIds": ["UPL-001", "UPL-002"],
  "message": "Files uploaded successfully and processing started.",
  "pipelineRunId": "RUN-001"
}
```

Required DB entities: `uploads`, `upload_files`, `pipeline_runs`, `invoices`, `vendors`, `buyers`, `reconciliation_runs`.

## Cases

### GET `/api/cases`
Query params: `status`, `vendorId`, `priority`, `search`, `page`, `pageSize`.

Response:
```json
[
  {
    "id": "CAS-042",
    "invoiceIds": ["INV-992"],
    "vendorId": "VEN-BETA",
    "vendorName": "Beta Industries",
    "vendorGstin": "27BETAI1234F1Z7",
    "riskScoreId": "RSK-BETA",
    "title": "GSTR-1 filing missing",
    "mismatchType": "Missing",
    "itcAtRisk": 1200000,
    "impact": "Severe Exposure",
    "priority": "Critical",
    "deadline": "2026-07-12",
    "owner": "JD (Human)",
    "status": "Escalated",
    "confidence": 99,
    "nextActionId": "ACT-839",
    "timeline": [],
    "createdAt": "2026-07-12T09:30:00+05:30",
    "updatedAt": "2026-07-12T09:30:00+05:30"
  }
]
```

### GET `/api/cases/{caseId}`
Response: one case object.

### PATCH `/api/cases/{caseId}/status`
Request:
```json
{ "status": "Resolved", "comment": "Vendor corrected GSTR-1 filing." }
```
Response: updated case.

Required DB entities: `cases`, `case_invoice_links`, `case_timeline`, `invoices`, `vendors`, `risk_scores`, `actions`.

## Reconciliation

### GET `/api/reconciliation/exceptions`
Query params: `runId`, `vendorId`, `exceptionType`, `riskGrade`, `search`.

Response:
```json
[
  {
    "id": "REC-CAS-042",
    "vendorId": "VEN-BETA",
    "vendorName": "Beta Industries",
    "vendorGstin": "27BETAI1234F1Z7",
    "exceptionType": "Missing",
    "impactedAmount": 1200000,
    "riskGrade": "Critical",
    "mismatchCount": 1,
    "caseId": "CAS-042"
  }
]
```

### GET `/api/reconciliation/summary`
Response:
```json
{ "missingInvoices": 1, "valueMismatches": 1, "duplicateEntries": 1 }
```

### POST `/api/reconciliation/run`
Request:
```json
{ "uploadIds": ["UPL-001", "UPL-002"], "periodStart": "2026-06-01", "periodEnd": "2026-06-30" }
```
Response:
```json
{ "runId": "RUN-001", "status": "Completed", "exceptionCount": 4, "caseIds": ["CAS-042"] }
```

Required DB entities: `reconciliation_runs`, `reconciliation_results`, `cases`, `invoices`.

## Actions

### GET `/api/actions`
Query params: `caseId`, `status`, `owner`.

Response:
```json
[
  {
    "id": "ACT-839",
    "caseId": "CAS-042",
    "title": "Escalate to Finance Manager",
    "status": "Needs Approval",
    "progress": 10,
    "owner": "Human (JD)",
    "logs": [],
    "createdAt": "2026-07-12T09:30:00+05:30",
    "updatedAt": "2026-07-12T09:30:00+05:30",
    "sensitive": true
  }
]
```

### PATCH `/api/actions/{actionId}`
Request:
```json
{ "status": "Running", "progress": 50, "comment": "Started by user." }
```
Response: updated action.

Required DB entities: `actions`, `action_logs`, `cases`, `approvals`.

## Approvals

### GET `/api/approvals`
Query params: `status=Pending`, `caseId`, `actionId`.

Response:
```json
[
  {
    "id": "REQ-992",
    "caseId": "CAS-042",
    "actionId": "ACT-839",
    "requester": "AI",
    "status": "Pending",
    "aiReasoning": "Rs. 12.0L ITC at risk.",
    "confidence": 96,
    "payloadPreview": "Escalate Case CAS-042.",
    "timeline": [],
    "createdAt": "2026-07-12T09:30:00+05:30"
  }
]
```

### POST `/api/approvals/{approvalId}/decision`
Request:
```json
{ "decision": "Approve", "comment": "Approved by CFO." }
```
Response: updated approval and linked action state.

Required DB entities: `approvals`, `approval_timeline`, `actions`, `cases`, `audit_logs`.

## Vendors

### GET `/api/vendors`
Query params: `riskTier`, `search`, `page`, `pageSize`.

Response:
```json
[
  {
    "id": "VEN-BETA",
    "name": "Beta Industries",
    "gstin": "27BETAI1234F1Z7",
    "email": "tax@beta.example",
    "complianceScore": 38,
    "riskTier": "Critical",
    "itcExposure": 1200000,
    "pendingCaseCount": 1,
    "lateFilingFrequency": 62,
    "trend": "down"
  }
]
```

### GET `/api/vendors/{vendorId}`
Response: vendor object plus linked invoices/cases/actions summary.

Required DB entities: `vendors`, `invoices`, `cases`, `risk_scores`, `vendor_monthly_metrics`.

## Graph

### GET `/api/graph`
Query params: `vendorId`, `caseId`, `depth`, `nodeTypes`.

Response:
```json
{
  "nodes": [
    {
      "id": "GN-VEN-BETA",
      "type": "Vendor",
      "label": "Vendor: Beta Industries",
      "entityId": "VEN-BETA",
      "riskTier": "Critical",
      "metadata": { "gstin": "27BETAI1234F1Z7", "score": 38 }
    }
  ],
  "edges": [
    {
      "id": "GE-1",
      "source": "GN-VEN-BETA",
      "target": "GN-INV-992",
      "relationship": "ISSUED",
      "animated": true
    }
  ]
}
```

Required DB entities: Neo4j nodes/relationships plus PostgreSQL source IDs.

## Alerts

### GET `/api/alerts`
Query params: `read`, `severity`, `entityId`.

Response:
```json
[
  {
    "id": "ALT-001",
    "severity": "critical",
    "title": "Approval overdue risk",
    "message": "Case CAS-042 requires approval.",
    "entityId": "CAS-042",
    "entityType": "Case",
    "read": false,
    "createdAt": "2026-07-12T09:12:00+05:30"
  }
]
```

### POST `/api/alerts/mark-read`
Request:
```json
{ "alertIds": ["ALT-001"] }
```
Response:
```json
{ "updated": 1 }
```

Required DB entities: `alerts`, `alert_events`.

## Reports

### GET `/api/reports`
Query params: `periodStart`, `periodEnd`, `vendorId`, `caseStatus`.

Response:
```json
[
  {
    "id": "RPT-2026-06",
    "title": "June 2026 GST Compliance Report",
    "periodStart": "2026-06-01",
    "periodEnd": "2026-06-30",
    "generatedAt": "2026-07-12T09:30:00+05:30",
    "metrics": [],
    "summary": "Compliance summary text.",
    "caseIds": ["CAS-042"],
    "vendorIds": ["VEN-BETA"]
  }
]
```

### POST `/api/reports/export`
Request:
```json
{ "reportId": "RPT-2026-06", "format": "pdf" }
```
Response:
```json
{ "downloadUrl": "https://...", "expiresAt": "2026-07-12T10:30:00+05:30" }
```

Required DB entities: `reports`, `report_exports`, `cases`, `vendors`, `actions`, `audit_logs`.

## Regional Exposure

### GET `/api/analytics/regional-exposure`
Response:
```json
[
  {
    "id": "REG-MH",
    "state": "Maharashtra",
    "vendorCount": 2,
    "riskTier": "Critical",
    "itcExposure": 1740000,
    "complianceScore": 55
  }
]
```

Required DB entities: `vendors`, `vendor_locations`, `cases`, `risk_scores`.

## Calendar

### GET `/api/calendar/compliance-events`
Response:
```json
[
  {
    "id": "EVT-GSTR3B-2026-07",
    "date": "2026-07-20",
    "title": "GSTR-3B Due Date",
    "type": "Filing",
    "status": "Upcoming"
  }
]
```

Required DB entities: `compliance_events`, `filing_periods`.

## Fraud

### GET `/api/fraud/network`
Response:
```json
{
  "id": "FRD-001",
  "clusterTitle": "High-Risk Cluster Detected",
  "clusterDescription": "Suspicious vendor cluster.",
  "involvedGstins": [
    { "gstin": "27BETAI1234F1Z7", "label": "Beta Industries", "severity": "critical" }
  ],
  "threats": [
    { "id": "THR-001", "title": "Circular Trading", "description": "Detected loop.", "severity": "critical" }
  ],
  "score": 8.4
}
```

### POST `/api/fraud/scan`
Request:
```json
{ "periodStart": "2026-06-01", "periodEnd": "2026-06-30" }
```
Response: fraud network object.

Required DB entities: `fraud_scans`, `fraud_threats`, Neo4j graph.

## Simulations

### GET `/api/simulations`
Response:
```json
[
  {
    "id": "SIM-BETA-FILE",
    "vendorId": "VEN-BETA",
    "vendorName": "Beta Industries",
    "action": "File Missing GSTR-1",
    "invoicesFixed": 2,
    "recoveryAmount": 1200000,
    "complianceBoost": 18
  }
]
```

### POST `/api/simulations/{simulationId}/run`
Response: scenario result.

Required DB entities: `simulation_scenarios`, `vendors`, `cases`, `invoices`, `risk_scores`.

## AI

See `AI_CONTEXT_SPEC.md`.

## Implementation Checklist

- Replace each service import from `mockRepository.ts` with API calls. The frontend no longer ships active business mocks.
- Keep page components unchanged by preserving response shapes.
- Backend must generate every ID and relationship.
- Backend must enrich cases with `vendorName` and `vendorGstin`.
- Backend must own risk, reconciliation, case, action, approval, report, and Copilot logic.
- Frontend may keep UI-only state: filters, search text, loading flags, selected rows/nodes.
- Empty arrays/null responses are valid while no data exists; the frontend will show empty states.

## Delete And Action Endpoints Required By Hardened Frontend

These endpoints are now called by visible UI controls and must be implemented by backend.

### DELETE `/api/uploads/{uploadId}`
Deletes or archives an upload and its downstream generated records.

Response:
```json
{ "deleted": true, "uploadId": "UPL-001", "archived": true }
```

Backend behavior:
- Archive/delete upload file metadata.
- Remove or archive invoices created by that upload.
- Remove or archive reconciliation results, cases, actions, approvals, alerts, reports, and graph nodes that exist only because of that upload.
- Write audit log.

### DELETE `/api/cases/{caseId}`
Response:
```json
{ "deleted": true, "caseId": "CAS-042", "archived": true }
```

Backend behavior:
- Archive/delete case.
- Archive/delete linked actions and pending approvals.
- Keep invoices/vendors.
- Update dashboard, reports, alerts, and Neo4j relationships.

### DELETE `/api/actions/{actionId}`
Response:
```json
{ "deleted": true, "actionId": "ACT-839", "archived": true }
```

Backend behavior:
- Archive/delete action and logs.
- Archive/delete pending approval if approval only exists for this action.
- Recompute case next action if needed.

### DELETE `/api/alerts/{alertId}`
Response:
```json
{ "deleted": true, "alertId": "ALT-001" }
```

### POST `/api/alerts/delete`
Request:
```json
{ "alertIds": ["ALT-001", "ALT-002"] }
```
Response:
```json
{ "deleted": 2 }
```

### DELETE `/api/reports/{reportId}`
Response:
```json
{ "deleted": true, "reportId": "RPT-2026-06" }
```

### POST `/api/vendors/{vendorId}/notice-approval`
Creates an approval-backed action for a vendor notice. It must not send email directly.

Response:
```json
{
  "id": "REQ-1001",
  "caseId": "CAS-042",
  "actionId": "ACT-1001",
  "requester": "AI",
  "status": "Pending",
  "aiReasoning": "Vendor notice requires human approval.",
  "confidence": 90,
  "payloadPreview": "Draft vendor notice",
  "timeline": [],
  "createdAt": "2026-07-12T09:30:00+05:30"
}
```

## Frontend Empty-State Contract

If backend is not connected or there is no data, return:
- `[]` for list endpoints.
- `null` for optional aggregate/detail endpoints.
- `401` only for real auth failure.

Frontend will not invent replacement business records.
