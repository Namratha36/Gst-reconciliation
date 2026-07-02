import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Network, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-secondary" />
            GraphGST Enterprise
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground font-medium">Log In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary text-primary-foreground">Contact Sales</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-24 px-6 border-b bg-card">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Auditor Approved
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Enterprise GST Reconciliation & Intelligence
              </h1>
              <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
                GraphGST AI provides government agencies and financial institutions with a structural overview of supply chain risks, detecting ITC anomalies instantly via Knowledge Graphs.
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <Link to="/dashboard">
                  <Button className="h-10 px-6 bg-secondary text-white hover:bg-secondary/90">
                    Launch Platform <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="h-10 px-6">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full bg-muted rounded-md border p-6 flex flex-col justify-center items-center h-[300px] shadow-sm">
              <Network className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Interactive System Architecture Visualization</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs text-center">Graph nodes map vendors, invoices, and buyers to expose circular trading and non-compliant clusters.</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Network,
                  title: "Structural Risk Mapping",
                  desc: "Utilize Neo4j graph databases to traverse deep supply chain layers and expose hidden vendor linkages."
                },
                {
                  icon: Activity,
                  title: "Automated Reconciliation",
                  desc: "Ingest GSTR-1, 2B, and 3B returns to systematically identify missing invoices and value variances."
                },
                {
                  icon: ShieldCheck,
                  title: "Audit Compliance Logging",
                  desc: "Maintain a strict, immutable audit trail of all detected anomalies and system interventions."
                }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-md border bg-card shadow-sm">
                  <f.icon className="w-5 h-5 text-secondary mb-4" />
                  <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
