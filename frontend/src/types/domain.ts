export type ID = string;

export type RiskTier = "Low" | "Medium" | "High" | "Critical";
export type CaseStatus = "Queued" | "Planning" | "Executing" | "Waiting" | "Escalated" | "Resolved";
export type ActionStatus = "Queued" | "Running" | "Waiting" | "Needs Approval" | "Completed" | "Failed";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Modified";
export type AlertSeverity = "info" | "success" | "warning" | "critical";
export type GraphNodeType = "Upload" | "Invoice" | "Vendor" | "Buyer" | "Case" | "Action" | "Approval" | "Alert" | "Report" | "RiskScore";

export interface User {
  id: ID;
  name: string;
  email: string;
  role: "Admin" | "CFO" | "Finance Manager" | "Analyst";
  organizationId: ID;
  organizationName: string;
}

export interface Upload {
  id: ID;
  fileName: string;
  fileType: "GSTR-1" | "GSTR-2B" | "GSTR-3B" | "Invoice Register" | "Vendor Master";
  status: "Uploaded" | "Parsing" | "Normalized" | "Reconciled" | "Failed";
  uploadedAt: string;
  rowCount: number;
}

export interface Invoice {
  id: ID;
  uploadId: ID;
  invoiceNumber: string;
  invoiceDate: string;
  financialYear: string;
  docType: "Invoice" | "Credit Note" | "Debit Note";
  vendorId: ID;
  buyerId: ID;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  invoiceValue: number;
  source: "GSTR-1" | "GSTR-2B" | "Invoice Register";
  reconciliationStatus: "Matched" | "Missing" | "Value Mismatch" | "Tax Mismatch" | "Duplicate";
}

export interface Vendor {
  id: ID;
  name: string;
  gstin: string;
  email: string;
  complianceScore: number;
  riskTier: RiskTier;
  itcExposure: number;
  pendingCaseCount: number;
  lateFilingFrequency: number;
  trend: "up" | "down" | "flat";
}

export interface Buyer {
  id: ID;
  name: string;
  gstin: string;
}

export interface RiskScore {
  id: ID;
  entityId: ID;
  entityType: "Vendor" | "Case" | "Invoice";
  score: number;
  tier: RiskTier;
  reasons: string[];
  calculatedAt: string;
}

export interface ComplianceCase {
  id: ID;
  invoiceIds: ID[];
  vendorId: ID;
  riskScoreId: ID;
  title: string;
  mismatchType: Invoice["reconciliationStatus"];
  itcAtRisk: number;
  impact: string;
  priority: RiskTier;
  deadline: string;
  owner: string;
  status: CaseStatus;
  confidence: number;
  nextActionId?: ID;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionLog {
  id: ID;
  at: string;
  message: string;
  actor: "System" | "AI" | "Human";
}

export interface CaseAction {
  id: ID;
  caseId: ID;
  title: string;
  status: ActionStatus;
  progress: number;
  owner: string;
  logs: ActionLog[];
  createdAt: string;
  updatedAt: string;
  sensitive: boolean;
}

export interface Approval {
  id: ID;
  caseId: ID;
  actionId: ID;
  requester: "AI" | "Human";
  status: ApprovalStatus;
  aiReasoning: string;
  confidence: number;
  decision?: "Approve" | "Reject" | "Modify";
  payloadPreview: string;
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface Alert {
  id: ID;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityId?: ID;
  entityType?: GraphNodeType;
  read: boolean;
  createdAt: string;
}

export interface Mission {
  id: ID;
  title: string;
  targetDate: string;
  itcTarget: number;
  recoveredToday: number;
}

export interface DashboardMetric {
  id: ID;
  title: string;
  value: string;
  trend: string;
  severity?: AlertSeverity;
  actionLabel?: string;
}

export interface Dashboard {
  mission: Mission;
  metrics: DashboardMetric[];
  currentActionIds: ID[];
  recentAlertIds: ID[];
}

export interface GraphNode {
  id: ID;
  type: GraphNodeType;
  label: string;
  entityId: ID;
  riskTier?: RiskTier;
  metadata: Record<string, string | number | boolean>;
}

export interface GraphEdge {
  id: ID;
  source: ID;
  target: ID;
  relationship:
    | "UPLOADED"
    | "ISSUED"
    | "BOUGHT_BY"
    | "CREATES_CASE"
    | "REQUIRES_APPROVAL"
    | "TRIGGERS_ACTION"
    | "RESOLVED_BY"
    | "HAS_RISK_SCORE"
    | "GENERATES_ALERT";
  animated?: boolean;
}

export interface Report {
  id: ID;
  title: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  metrics: DashboardMetric[];
  summary: string;
  caseIds: ID[];
  vendorIds: ID[];
}

export interface ConversationMessage {
  id: ID;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sourceEntityIds?: ID[];
}

export interface Conversation {
  id: ID;
  userId: ID;
  messages: ConversationMessage[];
}

export interface CopilotContext {
  invoices: Invoice[];
  vendors: Vendor[];
  cases: ComplianceCase[];
  actions: CaseAction[];
  approvals: Approval[];
  graphSummary: string;
  riskSummary: string;
}

export interface TimelineEvent {
  id: ID;
  at: string;
  actor: "System" | "AI" | "Human";
  message: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ReconciliationException {
  id: ID;
  vendorId: ID;
  vendorName: string;
  vendorGstin: string;
  exceptionType: Invoice["reconciliationStatus"];
  impactedAmount: number;
  riskGrade: Exclude<RiskTier, "Low">;
  mismatchCount: number;
  caseId?: ID;
}

export interface RegionalExposure {
  id: ID;
  state: string;
  vendorCount: number;
  riskTier: RiskTier;
  itcExposure: number;
  complianceScore: number;
}

export interface ComplianceEvent {
  id: ID;
  date: string;
  title: string;
  type: "Filing" | "System" | "Review";
  status: "Upcoming" | "Pending" | "Completed";
}

export interface FraudThreat {
  id: ID;
  title: string;
  description: string;
  severity: AlertSeverity;
}

export interface FraudNetwork {
  id: ID;
  clusterTitle: string;
  clusterDescription: string;
  involvedGstins: Array<{
    gstin: string;
    label: string;
    severity: AlertSeverity;
  }>;
  threats: FraudThreat[];
  score: number;
}

export interface SimulationScenario {
  id: ID;
  vendorId: ID;
  vendorName: string;
  action: "Correct Pending Invoices" | "File Missing GSTR-1" | "Hold Payments";
  invoicesFixed: number;
  recoveryAmount: number;
  complianceBoost: number;
}
