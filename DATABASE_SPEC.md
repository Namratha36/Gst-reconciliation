# GraphGST AI Database Spec

Primary relational store: PostgreSQL or Supabase PostgreSQL. Every table should include `id`, `organization_id`, `created_at`, `updated_at` unless noted. Use UUIDs in production; current frontend accepts strings.

## Mock To Table Mapping

| Mock export | Required tables |
| --- | --- |
| `currentUser` | `organizations`, `users`, `auth_sessions` |
| `uploads` | `uploads`, `upload_files`, `pipeline_runs` |
| `buyers` | `buyers` |
| `vendors` | `vendors`, `vendor_monthly_metrics`, `vendor_locations` |
| `invoices` | `invoices` |
| `riskScores` | `risk_scores` |
| `cases` | `cases`, `case_invoice_links`, `case_timeline` |
| `actions` | `actions`, `action_logs` |
| `approvals` | `approvals`, `approval_timeline` |
| `alerts` | `alerts`, `alert_events` |
| `dashboard` | derived from cases/actions/approvals/alerts/reports |
| `graphNodes`, `graphEdges` | Neo4j, with source IDs from PostgreSQL |
| `reports` | `reports`, `report_exports` |
| `reconciliationExceptions` | `reconciliation_runs`, `reconciliation_results` |
| `regionalExposures` | derived from `vendors`, `vendor_locations`, `cases`, `risk_scores` |
| `complianceEvents` | `compliance_events`, `filing_periods` |
| `fraudNetwork` | `fraud_scans`, `fraud_threats`, Neo4j |
| `simulationScenarios` | `simulation_scenarios`, derived result snapshots |
| `conversation` | `copilot_conversations`, `copilot_messages` |

## Core Tables

### `organizations`
- `id`
- `name`
- `gstin`
- `subscription_status`
- `created_at`
- `updated_at`

### `users`
- `id`
- `organization_id`
- `name`
- `email`
- `password_hash`
- `role`: `Admin | CFO | Finance Manager | Analyst`
- `status`: `Active | Suspended`
- `last_login_at`

### `auth_sessions`
- `id`
- `user_id`
- `refresh_token_hash`
- `expires_at`
- `revoked_at`
- `ip_address`
- `user_agent`

### `uploads`
- `id`
- `organization_id`
- `pipeline_run_id`
- `file_name`
- `file_type`: `GSTR-1 | GSTR-2B | GSTR-3B | Invoice Register | Vendor Master`
- `status`: `Uploaded | Parsing | Normalized | Reconciled | Failed`
- `row_count`
- `uploaded_by_user_id`
- `uploaded_at`

### `upload_files`
- `id`
- `upload_id`
- `storage_path`
- `content_type`
- `size_bytes`
- `checksum`

### `pipeline_runs`
- `id`
- `organization_id`
- `status`: `Queued | Running | Completed | Failed`
- `started_at`
- `completed_at`
- `error_message`

### `vendors`
- `id`
- `organization_id`
- `name`
- `gstin`
- `email`
- `state`
- `compliance_score`
- `risk_tier`
- `itc_exposure`
- `pending_case_count`
- `late_filing_frequency`
- `trend`

### `buyers`
- `id`
- `organization_id`
- `name`
- `gstin`

### `invoices`
- `id`
- `organization_id`
- `upload_id`
- `canonical_key`
- `invoice_number`
- `invoice_date`
- `financial_year`
- `doc_type`
- `vendor_id`
- `buyer_id`
- `taxable_value`
- `igst`
- `cgst`
- `sgst`
- `invoice_value`
- `source`
- `reconciliation_status`

Unique index:
- `(organization_id, canonical_key)`

Canonical key:
- `vendor_gstin + buyer_gstin + invoice_number + financial_year + doc_type`

### `reconciliation_runs`
- `id`
- `organization_id`
- `pipeline_run_id`
- `status`
- `period_start`
- `period_end`
- `started_at`
- `completed_at`

### `reconciliation_results`
- `id`
- `organization_id`
- `run_id`
- `invoice_id`
- `vendor_id`
- `exception_type`
- `impacted_amount`
- `risk_grade`
- `case_id`
- `details_json`

### `risk_scores`
- `id`
- `organization_id`
- `entity_id`
- `entity_type`: `Vendor | Case | Invoice`
- `score`
- `tier`
- `reasons_json`
- `calculated_at`

### `cases`
- `id`
- `organization_id`
- `vendor_id`
- `risk_score_id`
- `title`
- `mismatch_type`
- `itc_at_risk`
- `impact`
- `priority`
- `deadline`
- `owner_user_id`
- `owner_label`
- `status`
- `confidence`
- `next_action_id`

### `case_invoice_links`
- `case_id`
- `invoice_id`

### `case_timeline`
- `id`
- `case_id`
- `actor`
- `message`
- `at`

### `actions`
- `id`
- `organization_id`
- `case_id`
- `title`
- `status`
- `progress`
- `owner_user_id`
- `owner_label`
- `sensitive`
- `created_at`
- `updated_at`

### `action_logs`
- `id`
- `action_id`
- `actor`
- `message`
- `at`

### `approvals`
- `id`
- `organization_id`
- `case_id`
- `action_id`
- `requester`
- `status`
- `ai_reasoning`
- `confidence`
- `decision`
- `payload_preview`
- `created_at`
- `decided_at`
- `decided_by_user_id`

### `approval_timeline`
- `id`
- `approval_id`
- `actor`
- `message`
- `at`

### `alerts`
- `id`
- `organization_id`
- `severity`
- `title`
- `message`
- `entity_id`
- `entity_type`
- `read`
- `created_at`

### `reports`
- `id`
- `organization_id`
- `title`
- `period_start`
- `period_end`
- `generated_at`
- `summary`
- `metrics_json`
- `case_ids_json`
- `vendor_ids_json`

### `report_exports`
- `id`
- `report_id`
- `format`
- `storage_path`
- `download_url`
- `expires_at`
- `created_by_user_id`

### `compliance_events`
- `id`
- `organization_id`
- `date`
- `title`
- `type`
- `status`

### `fraud_scans`
- `id`
- `organization_id`
- `period_start`
- `period_end`
- `score`
- `cluster_title`
- `cluster_description`
- `created_at`

### `fraud_threats`
- `id`
- `fraud_scan_id`
- `title`
- `description`
- `severity`

### `simulation_scenarios`
- `id`
- `organization_id`
- `vendor_id`
- `action`
- `invoices_fixed`
- `recovery_amount`
- `compliance_boost`

### `copilot_conversations`
- `id`
- `organization_id`
- `user_id`
- `created_at`
- `updated_at`

### `copilot_messages`
- `id`
- `conversation_id`
- `role`
- `content`
- `source_entity_ids_json`
- `created_at`

### `audit_logs`
- `id`
- `organization_id`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `event_type`
- `before_json`
- `after_json`
- `created_at`

## Supabase Requirements

- Enable RLS on all organization-owned tables.
- Every query must scope by `organization_id`.
- Storage buckets: `gst-uploads`, `report-exports`, future `ocr-documents`.
- Never expose raw storage paths to frontend; return signed URLs when needed.

## Implementation Checklist

- Create migrations for all tables.
- Add foreign keys for organization, user, upload, invoice, vendor, case, action, approval.
- Add indexes on `organization_id`, `vendor_id`, `case_id`, `invoice_id`, `status`, `created_at`.
- Add unique invoice canonical key constraint.
- Add audit log writes for approval decisions and status changes.
- Add RLS policies before connecting production frontend.

## Delete And Archive Rules

Use soft delete/archive for compliance-sensitive records unless the organization explicitly performs permanent deletion.

Recommended columns on mutable business tables:
- `archived_at`
- `archived_by_user_id`
- `archive_reason`

Required cascade/archive behavior:
- Upload archive cascades to upload files, invoices created only by that upload, reconciliation results, generated cases, actions, approvals, alerts, report snapshots, and Neo4j generated nodes/relationships.
- Case archive cascades to case timeline, case/action links, actions, pending approvals, and case alerts. It must not delete canonical invoices or vendors.
- Action archive cascades to action logs and pending approval for that action.
- Alert delete may be hard delete or soft archive depending on audit policy.
- Report delete archives report metadata and report export files.

Every delete/archive operation must write an `audit_logs` row with before/after JSON.
