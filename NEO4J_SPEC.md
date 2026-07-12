# GraphGST AI Neo4j Spec

Neo4j powers graph traversal, fraud network detection, Copilot relationship context, and the Knowledge Graph page. PostgreSQL remains the canonical source for transactional state. Neo4j nodes must carry PostgreSQL source IDs.

## Frontend Mock Being Replaced

Current mock exports:
- `graphNodes`
- `graphEdges`
- `fraudNetwork`
- Copilot `graphSummary`

Backend APIs:
- `GET /api/graph`
- `GET /api/fraud/network`
- `POST /api/fraud/scan`
- `POST /api/ai/context`

## Node Labels

### `Organization`
Properties:
- `id`
- `name`
- `gstin`

### `Upload`
Properties:
- `id`
- `fileName`
- `fileType`
- `status`
- `uploadedAt`

### `Vendor`
Properties:
- `id`
- `name`
- `gstin`
- `riskTier`
- `complianceScore`
- `state`

### `Buyer`
Properties:
- `id`
- `name`
- `gstin`

### `Invoice`
Properties:
- `id`
- `invoiceNumber`
- `invoiceDate`
- `financialYear`
- `docType`
- `invoiceValue`
- `taxableValue`
- `source`
- `reconciliationStatus`

### `Case`
Properties:
- `id`
- `title`
- `status`
- `priority`
- `itcAtRisk`
- `confidence`

### `Action`
Properties:
- `id`
- `title`
- `status`
- `progress`
- `sensitive`

### `Approval`
Properties:
- `id`
- `status`
- `confidence`
- `requester`

### `Alert`
Properties:
- `id`
- `severity`
- `title`
- `read`

### `RiskScore`
Properties:
- `id`
- `entityId`
- `entityType`
- `score`
- `tier`
- `calculatedAt`

### `Report`
Properties:
- `id`
- `title`
- `periodStart`
- `periodEnd`
- `generatedAt`

### `GSTReturn`
Properties:
- `id`
- `returnType`: `GSTR-1 | GSTR-2B | GSTR-3B`
- `periodStart`
- `periodEnd`
- `filingStatus`

## Relationships

- `(Organization)-[:UPLOADED]->(Upload)`
- `(Upload)-[:CONTAINS]->(Invoice)`
- `(Vendor)-[:ISSUED]->(Invoice)`
- `(Invoice)-[:BOUGHT_BY]->(Buyer)`
- `(Invoice)-[:FILED_IN]->(GSTReturn)`
- `(Invoice)-[:MATCHES]->(Invoice)`
- `(Invoice)-[:CREATES_CASE]->(Case)`
- `(Case)-[:HAS_RISK_SCORE]->(RiskScore)`
- `(Vendor)-[:HAS_RISK_SCORE]->(RiskScore)`
- `(Case)-[:TRIGGERS_ACTION]->(Action)`
- `(Action)-[:REQUIRES_APPROVAL]->(Approval)`
- `(Approval)-[:RESOLVED_BY]->(User)` if user nodes are added
- `(Case)-[:GENERATES_ALERT]->(Alert)`
- `(Report)-[:SUMMARIZES]->(Case)`
- `(Vendor)-[:RELATED_TO]->(Vendor)` for fraud/familiarity patterns

## Graph API Shape

`GET /api/graph?vendorId=VEN-BETA&depth=2`

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
      "metadata": {
        "gstin": "27BETAI1234F1Z7",
        "score": 38
      }
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

## Fraud Scan Contract

`POST /api/fraud/scan`

Request:
```json
{
  "periodStart": "2026-06-01",
  "periodEnd": "2026-06-30",
  "organizationId": "ORG-ACME"
}
```

Response:
```json
{
  "id": "FRD-001",
  "clusterTitle": "High-Risk Cluster Detected",
  "clusterDescription": "Graph analysis identified repeated invoice patterns.",
  "involvedGstins": [
    { "gstin": "27BETAI1234F1Z7", "label": "Beta Industries", "severity": "critical" }
  ],
  "threats": [
    { "id": "THR-001", "title": "Circular Trading", "description": "Detected loop.", "severity": "critical" }
  ],
  "score": 8.4
}
```

## Cypher Implementation Checklist

- Add uniqueness constraints for `id` on every label.
- Upsert graph nodes after upload normalization.
- Upsert relationships after reconciliation and case/action/approval creation.
- Store PostgreSQL IDs as Neo4j `id` or `entityId` properties.
- Build graph response from traversals, not from frontend shape assumptions.
- Add fraud traversal queries for cycles, repeated exact values, related GSTIN clusters, and high-risk vendor neighborhoods.
- Keep Neo4j derived. PostgreSQL remains transactional source of truth.

## Graph Cleanup Rules

When PostgreSQL records are archived or deleted, Neo4j must be updated in the same backend workflow:
- Upload delete/archive removes `Upload` nodes and relationships, plus generated `Invoice` nodes that are not referenced by any remaining upload.
- Case delete/archive removes or marks archived `Case` nodes and removes `CREATES_CASE`, `TRIGGERS_ACTION`, `REQUIRES_APPROVAL`, and `GENERATES_ALERT` relationships for archived downstream records.
- Action delete/archive removes or marks archived `Action` nodes and related approval relationships.
- Alert delete removes or marks archived `Alert` nodes.
- Report delete removes `Report` nodes and `SUMMARIZES` relationships.

Preferred production behavior: set `archivedAt` on nodes and filter archived nodes from `GET /api/graph`, unless permanent deletion is required.
