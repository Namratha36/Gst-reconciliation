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
