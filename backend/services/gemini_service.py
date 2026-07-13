import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_answer(question: str, context_str: str) -> str:
    if not context_str:
        return (
            "No data found in your workspace yet. Please upload a GSTR1, GSTR2B, or GSTR3B CSV file first "
            "from the Data Ingestion page, then ask your question again."
        )

    # Parse the context for smart simulation answers
    try:
        ctx = json.loads(context_str)
    except Exception:
        ctx = {}

    cases = ctx.get("cases", [])
    vendors = ctx.get("vendors", [])
    actions = ctx.get("actions", [])
    invoices = ctx.get("invoices", [])
    approvals = ctx.get("approvals", [])
    risk_summary = ctx.get("riskSummary", "")
    graph_summary = ctx.get("graphSummary", "")

    # If we have a Gemini API key, use real AI
    if model:
        prompt = f"""You are an expert GST Compliance Copilot for Indian businesses. 
Use ONLY the following JSON context to answer the user's question.
Be specific, cite GSTIN numbers, case IDs, and amounts where relevant.
Format numbers in Indian Rupee format (₹).

CONTEXT:
{context_str}

QUESTION: {question}

Answer in a helpful, concise, professional tone."""
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            pass  # Fall through to simulation

    # Smart simulation based on actual data
    q = question.lower()
    total_itc = sum(float(c.get("itcAtRisk", 0)) for c in cases)
    critical_cases = [c for c in cases if c.get("priority") == "Critical"]
    high_risk_vendors = [v for v in vendors if v.get("riskTier") in ["High", "Critical"]]
    pending_actions = [a for a in actions if a.get("status") in ["Queued", "Needs Approval"]]
    pending_approvals = [a for a in approvals if a.get("status") == "Pending"]

    if any(word in q for word in ["highest risk", "high risk", "riskiest", "risk vendor"]):
        if high_risk_vendors:
            vendor_list = "\n".join([f"• **{v.get('name', v.get('gstin'))}** (GSTIN: {v.get('gstin')}) — Risk: {v.get('riskTier')}, ITC Exposure: ₹{float(v.get('itcExposure', 0)):,.2f}" for v in high_risk_vendors])
            return f"Based on your uploaded data, these vendors have the highest risk:\n\n{vendor_list}\n\n{graph_summary}"
        return "No high-risk vendors found in your current dataset."

    elif any(word in q for word in ["itc", "tax credit", "at risk", "exposure"]):
        return (
            f"**Total ITC at risk: ₹{total_itc:,.2f}**\n\n"
            f"• {len(cases)} open compliance cases\n"
            f"• {len(critical_cases)} critical priority cases requiring immediate action\n"
            f"• {len(high_risk_vendors)} high-risk vendors\n\n"
            f"{risk_summary}"
        )

    elif any(word in q for word in ["cases", "case", "issue", "exception", "mismatch"]):
        if cases:
            case_list = "\n".join([f"• **{c.get('id', '')[:8]}...** — {c.get('title')} (Priority: {c.get('priority')}, ITC: ₹{float(c.get('itcAtRisk', 0)):,.2f})" for c in cases[:5]])
            return f"You have **{len(cases)} open compliance cases**:\n\n{case_list}\n\nTotal ITC at risk: ₹{total_itc:,.2f}"
        return "No open cases found. Upload GST data to start reconciliation."

    elif any(word in q for word in ["action", "task", "todo", "do today", "finance team"]):
        if pending_actions:
            action_list = "\n".join([f"• **{a.get('title')}** (Status: {a.get('status')})" for a in pending_actions[:5]])
            return (
                f"The finance team has **{len(pending_actions)} pending actions**:\n\n{action_list}\n\n"
                f"Also, {len(pending_approvals)} approvals are waiting for human review in the Approval Center."
            )
        return "No pending actions at this time. All tasks are up to date."

    elif any(word in q for word in ["approval", "approve", "pending"]):
        if pending_approvals:
            return (
                f"There are **{len(pending_approvals)} pending approval requests** in the Human Approval Center. "
                f"These require your immediate attention to proceed with compliance actions."
            )
        return "No pending approvals at this time."

    elif any(word in q for word in ["invoice", "filing", "gstr"]):
        return (
            f"Your workspace contains **{len(invoices)} invoices** from uploaded GST filings.\n\n"
            f"• {len(cases)} reconciliation exceptions found\n"
            f"• {risk_summary}"
        )

    else:
        # Generic summary
        return (
            f"**GraphGST AI Compliance Summary**\n\n"
            f"📊 **{len(invoices)}** invoices ingested\n"
            f"⚠️ **{len(cases)}** open compliance cases | ₹{total_itc:,.2f} ITC at risk\n"
            f"🏢 **{len(vendors)}** vendors tracked | {len(high_risk_vendors)} high risk\n"
            f"🔧 **{len(pending_actions)}** pending actions | {len(pending_approvals)} awaiting approval\n\n"
            f"{risk_summary}\n\n"
            f"_Add your GEMINI_API_KEY to the backend .env file to enable full AI-powered analysis._"
        )
