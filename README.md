# GraphGST AI Enterprise

**GraphGST AI** is an advanced, enterprise-grade Input Tax Credit (ITC) reconciliation and fraud detection platform. Designed for tax auditors, financial institutions, and government agencies, it leverages Knowledge Graphs and AI to instantly detect anomalies, map structural supply chain risks, and automate compliance workflows.

## Features

- **Structural Risk Mapping**: Built on Neo4j, the platform visualizes complex vendor-invoice-buyer relationships to expose circular trading and non-compliant clusters.
- **Automated Reconciliation**: High-speed processing of GSTR-1, GSTR-2B, and GSTR-3B returns to systematically identify missing invoices and value variances.
- **AI-Powered Explanations**: Integrates with Google Gemini AI to translate complex tax code mismatches into actionable business recommendations.
- **Enterprise Intelligence Dashboard**: A strict, information-dense interface inspired by Palantir and Datadog, optimized for auditors and risk analysts.
- **Audit Compliance Logging**: Maintains an immutable audit trail of all detected anomalies and system interventions.

## Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Shadcn UI
- **Routing**: React Router
- **Visualizations**: Recharts (Analytics), React Flow (Knowledge Graphs)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite / PostgreSQL (Relational), Neo4j (Graph Database)
- **AI Integration**: Google Gemini Pro API
- **Data Processing**: Pandas (CSV Parsing and Validation)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- (Optional) Neo4j Desktop or AuraDB instance for graph features

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Namratha36/Gst-reconciliation.git
   cd Gst-reconciliation
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Start the FastAPI server
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the Vite development server
   npm run dev
   ```

4. **Environment Variables**
   Create a `.env` file in the `backend` directory with the following (mock/local) configurations:
   ```env
   GEMINI_API_KEY=your_api_key_here
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=password
   ```

## License
This project is licensed under the MIT License.
