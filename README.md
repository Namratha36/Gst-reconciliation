# GraphGST AI 🚀

> **The intelligence layer for your supply chain.**

GraphGST AI is an enterprise-grade Fintech SaaS platform built for CFOs, Tax Auditors, and Compliance Teams. It leverages Neo4j Knowledge Graphs and Gemini AI to instantly detect circular trading rings, automate GSTR reconciliation, and automatically recover blocked Input Tax Credit (ITC).

## 🌟 Key Features

*   **Enterprise Design System**: A strict, data-dense Palantir-inspired UI built with TailwindCSS, Shadcn UI, and Framer Motion.
*   **Knowledge Graph Explorer**: Visualize deep supply chain relationships and expose hidden circular trading loops using React Flow.
*   **Automated Reconciliation Engine**: Process GSTR-1, GSTR-2B, and GSTR-3B data to identify value mismatches and missing invoices instantly.
*   **AI GST Copilot**: A context-aware chat assistant powered by Gemini AI. Includes **Voice Recognition** for hands-free queries.
*   **What-If ITC Simulator**: Project the exact financial impact (ITC recovery & risk reduction) of fixing specific vendor compliance issues.
*   **Vendor Intelligence Center**: Automatically score suppliers based on compliance history and utilize an **In-App Mailer** to draft and dispatch compliance notices internally.
*   **Audit Export**: One-click CSV export of your Exception Audit Logs for offline auditor review.

## 🛠️ Technology Stack

*   **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Shadcn UI, Framer Motion, React Router, Recharts, React Flow.
*   **Backend**: FastAPI, Python 3.
*   **Data & AI**: Neo4j (Graph Database), PostgreSQL, Google Gemini AI API.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (3.9+)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Unix:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🔒 License
This project is licensed under the MIT License.
