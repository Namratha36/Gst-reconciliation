# GraphGST AI Copilot Context Spec

AI Copilot is not a generic chatbot. It is a finance compliance assistant. It must answer only from backend-provided context about invoices, vendors, reconciliation, cases, actions, approvals, graph relationships, reports, alerts, and risk.

## Frontend Mock Being Replaced

Current behavior:
- `copilotService.buildContext()` reads `mockRepository`.
- `copilotService.ask()` calls `/api/ai/chat`.
- If the API fails, `localAnswer()` generates deterministic fallback text.
- `conversation` is a mock initial assistant message.

Backend must replace:
- Context assembly.
- Gemini/system prompt construction.
- Streaming response generation.
- Conversation persistence.
- Source attribution.

## Endpoints

### POST `/api/ai/context`
Request:
```json
{
  "scope": {
    "vendorId": "VEN-BETA",
    "caseId": "CAS-042",
    "periodStart": "2026-06-01",
    "periodEnd": "2026-06-30"
  }
}
```

Response:
```json
{
  "invoices": [],
  "vendors": [],
  "cases": [],
  "actions": [],
  "approvals": [],
  "alerts": [],
  "reports": [],
  "graphSummary": "7 nodes and 6 relationships across vendors, invoices, cases, actions, approvals, and alerts.",
  "riskSummary": "VEN-BETA: Critical (96)",
  "sourceEntityIds": ["VEN-BETA", "CAS-042", "INV-992"]
}
```

### POST `/api/ai/chat`
Request:
```json
{
  "conversationId": "CONV-001",
  "question": "Which cases need approval?",
  "context": {
    "invoices": [],
    "vendors": [],
    "cases": [],
    "actions": [],
    "approvals": [],
    "alerts": [],
    "reports": [],
    "graphSummary": "",
    "riskSummary": "",
    "sourceEntityIds": []
  }
}
```

Response:
```json
{
  "message": {
    "id": "MSG-002",
    "role": "assistant",
    "content": "There are 2 pending approvals: REQ-992 for CAS-042 and REQ-991 for CAS-098.",
    "createdAt": "2026-07-12T09:45:00+05:30",
    "sourceEntityIds": ["REQ-992", "CAS-042", "REQ-991", "CAS-098"]
  }
}
```

### POST `/api/ai/chat/stream`
Transport: Server-Sent Events or fetch stream.

Request: same as `/api/ai/chat`.

Stream events:
```text
event: token
data: {"content":"There"}

event: token
data: {"content":"There are"}

event: done
data: {"messageId":"MSG-002","sourceEntityIds":["REQ-992"]}
```

## Required Context Shape

```ts
interface CopilotContext {
  invoices: Invoice[];
  vendors: Vendor[];
  cases: ComplianceCase[];
  actions: CaseAction[];
  approvals: Approval[];
  alerts: Alert[];
  reports: Report[];
  graphSummary: string;
  riskSummary: string;
  sourceEntityIds: string[];
}
```

## System Prompt Requirements

Backend should enforce:
- Answer only using provided context.
- If context is insufficient, say what data is missing.
- Never invent invoice IDs, vendor GSTINs, risk scores, approvals, or actions.
- Cite relevant entity IDs in the answer.
- Do not give legal advice; provide compliance workflow guidance.
- Sensitive recommendations must mention approval requirements.

Frontend behavior:
- If `/api/ai/context` returns no invoice/vendor/case/action/approval/graph/risk context, Copilot must not answer.
- If `/api/ai/chat` is unavailable, Copilot must show: "Copilot backend is not connected."
- No local fallback finance answers are allowed.

## Gemini Payload

Backend sends Gemini:
```json
{
  "systemInstruction": "You are GraphGST AI, a finance compliance assistant...",
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Question: Which cases need approval?\nContext: {...}"
        }
      ]
    }
  ]
}
```

## Database Entities Required

- `copilot_conversations`
- `copilot_messages`
- `vendors`
- `invoices`
- `cases`
- `actions`
- `approvals`
- `alerts`
- `reports`
- `risk_scores`
- Neo4j graph traversal output

## Implementation Checklist

- Implement `/api/ai/context`.
- Implement `/api/ai/chat`.
- Implement streaming endpoint.
- Persist user and assistant messages.
- Store source entity IDs per assistant answer.
- Remove frontend `localAnswer()` fallback after backend stream is stable.
- Add tests that AI refuses to answer when context is missing.
