import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Setup Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "MOCK_KEY_FOR_DEV")
if GEMINI_API_KEY and GEMINI_API_KEY != "MOCK_KEY_FOR_DEV":
    genai.configure(api_key=GEMINI_API_KEY)

class AIExplanationRequest(BaseModel):
    invoice_number: str
    vendor_name: str
    mismatch_type: str
    gst_amount: float
    itc_at_risk: float

@router.post("/explain")
async def explain_mismatch(req: AIExplanationRequest):
    prompt = f"""You are a GST Compliance Assistant.

Given:
- Invoice Number: {req.invoice_number}
- Vendor Name: {req.vendor_name}
- Mismatch Type: {req.mismatch_type}
- GST Amount: ₹{req.gst_amount}
- ITC Amount at Risk: ₹{req.itc_at_risk}

Explain:
1. What went wrong.
2. Financial impact.
3. Recommended actions.
4. Compliance recommendations.

Return the response in simple business language. Use markdown formatting.
"""

    if GEMINI_API_KEY == "MOCK_KEY_FOR_DEV":
        # Fallback if no real API key is provided
        mock_response = f"""### AI Explanation for {req.vendor_name} (Invoice {req.invoice_number})

**1. What went wrong:**
The system detected a {req.mismatch_type}. This means that the invoice details uploaded in your GSTR-2B do not match the vendor's GSTR-1 filing, or the vendor has failed to file their return.

**2. Financial Impact:**
An Input Tax Credit (ITC) of **₹{req.itc_at_risk}** is currently at risk. You cannot claim this amount until the discrepancy is resolved.

**3. Recommended Actions:**
- Contact **{req.vendor_name}** immediately to clarify the discrepancy for Invoice {req.invoice_number}.
- Ask them to file or amend their GSTR-1 in the upcoming cycle.

**4. Compliance Recommendations:**
- Place payments for {req.vendor_name} on hold until the GST mismatch is rectified.
- Monitor this vendor closely in future months to avoid recurring compliance risks.
"""
        return {"explanation": mock_response}

    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt)
        return {"explanation": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessage(BaseModel):
    message: str

@router.post("/chat")
async def copilot_chat(req: ChatMessage):
    if GEMINI_API_KEY == "MOCK_KEY_FOR_DEV":
        # Dynamic fallback responses based on keywords
        msg = req.message.lower()
        if "vendor" in msg:
            mock_response = "Vendor ABC Logistics is your highest risk vendor with a compliance score of 42. They have 12 pending invoices causing ₹24.5L in ITC blockage."
        elif "itc" in msg or "recover" in msg:
            mock_response = "Currently, you have ₹86.5L of ITC at risk. However, ₹22.1L is immediately recoverable if you follow up on pending GSTR-1 filings."
        elif "mismatch" in msg:
            mock_response = "I found 45 GST mismatches. The most common error is 'GSTR-2B Missing', which occurs when your vendor hasn't uploaded their sales invoice."
        elif "hello" in msg or "hi" in msg:
            mock_response = "Hello! I am your GraphGST AI Copilot. I can analyze vendors, identify ITC risks, and explain complex GST mismatches."
        else:
            mock_response = f"I've analyzed your query regarding '{req.message}'. Based on the platform data, there are no immediate critical anomalies, but I recommend checking the Fraud Network for structural risks."
        return {"response": mock_response}
    
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"You are an AI GST Copilot for GraphGST AI, an enterprise fintech SaaS. Answer the following user query professionally and concisely: {req.message}"
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
